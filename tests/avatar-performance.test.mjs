import test from "node:test";
import assert from "node:assert/strict";
import { AvatarPerformance, IDLE_AFTER_SECONDS, IDLE_STATES } from "../src/avatar-performance.ts";

function seededRandom(seed = 12345) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const createLife = (seed = 12345) => new AvatarPerformance(0, seededRandom(seed));

function advance(life, seconds, step = 1 / 60) {
  let frame;
  const count = Math.round(seconds / step);
  for (let i = 0; i < count; i++) frame = life.update(i * step, step, true);
  return frame;
}

const limits = {
  headYaw: 0.34,
  headPitch: 0.2,
  headRoll: 0.09,
  eyeYaw: 0.24,
  eyePitch: 0.1,
  breath: 0.003,
};

function assertSafe(frame) {
  for (const [key, value] of Object.entries(frame)) {
    if (typeof value === "number") assert.ok(Number.isFinite(value), `${key} must be finite`);
  }
  for (const [key, limit] of Object.entries(limits)) {
    assert.ok(Math.abs(frame[key]) <= limit + 1e-9, `${key} exceeds its model-safe limit`);
  }
  assert.ok(Math.abs(frame.headPitch + frame.breath) <= 0.21, "pitch stays within avatar framing");
}

test("the avatar starts looking around on its own, and touch input leaves that motion alone", () => {
  const untouched = createLife();
  const touch = createLife();
  let frame;
  let largestHeadMovement = 0;
  for (let i = 0; i < 12 * 60; i++) {
    touch.pointer(Math.sin(i), Math.cos(i), i / 60, false);
    const expected = untouched.update(i / 60, 1 / 60, true);
    frame = touch.update(i / 60, 1 / 60, true);
    assert.deepEqual(frame, expected, "touch scrolls and taps must not interrupt self-animation");
    assert.equal(frame.mode, "idle");
    assert.equal(frame.attention, 0);
    largestHeadMovement = Math.max(largestHeadMovement, Math.abs(frame.headYaw), Math.abs(frame.headPitch));
  }
  assert.ok(frame.idle > 0.99);
  assert.ok(largestHeadMovement > 0.09, "idle movement must be visible on the eyes-only model");
});

test("a stationary cursor returns to autonomous motion after a few seconds, despite repeated events", () => {
  assert.equal(IDLE_AFTER_SECONDS, 3);
  const life = createLife();
  life.pointer(0.8, 0.4, 0);
  const attentive = advance(life, IDLE_AFTER_SECONDS - 0.2);
  assert.equal(attentive.mode, "tracking");
  assert.ok(attentive.attention > 0.9);
  let frame;
  for (let i = 0; i < 3 * 60; i++) {
    life.pointer(0.8, 0.4, i / 60);
    frame = life.update(i / 60, 1 / 60, true);
  }
  assert.ok(frame.attention < 0.01);
  assert.ok(frame.idle > 0.99);
  assert.equal(frame.mode, "idle");
});

test("continued mouse movement remains active even beyond the clamped gaze region", () => {
  const life = createLife();
  let frame;
  for (let i = 0; i < 6 * 60; i++) {
    life.pointer(1.1 + i / 10000, 0.4, i / 60);
    frame = life.update(i / 60, 1 / 60, true);
    assertSafe(frame);
  }
  assert.equal(frame.mode, "tracking");
  assert.ok(frame.attention > 0.99, "raw cursor movement still counts when gaze is clamped");
});

test("pointer takeover is smooth, with faster eyes leading the head", () => {
  const life = createLife();
  life.update(0, 0, false);
  life.pointer(1, 0.8, 0);
  const initial = advance(life, 0.1);
  assert.ok(initial.eyeYaw > initial.headYaw * 1.5);
  assert.ok(initial.eyePitch > initial.headPitch * 1.5);
  const settled = advance(life, 1);
  assert.ok(settled.headYaw > initial.headYaw);
  assert.equal(settled.mode, "tracking");
  life.pointer(-1, -0.8, 1.1);
  const reversal = advance(life, 0.1);
  assert.ok(reversal.eyeYaw < 0, "eyes change direction before the head");
  assert.ok(reversal.headYaw > 0, "head turn eases through the reversal");
  assertSafe(reversal);
  life.leave();
  const afterLeave = life.update(1.22, 1 / 60, true);
  assert.ok(Math.abs(afterLeave.headYaw - reversal.headYaw) < 0.03);
  assert.equal(advance(life, 5).mode, "idle");
});

test("tracking pauses the current look-around sequence instead of restarting its first pose", () => {
  const life = createLife();
  const before = advance(life, 18);
  let tracking;
  for (let i = 0; i < 2 * 60; i++) {
    life.pointer(0.5 + Math.sin(i / 10) * 0.1, -0.2, i / 60);
    tracking = life.update(i / 60, 1 / 60, true);
  }
  assert.equal(tracking.mode, "tracking");
  assert.equal(tracking.stateIndex, before.stateIndex);
  assert.ok(Math.abs(tracking.stateElapsed - before.stateElapsed) < 0.1);
  const resumed = advance(life, 5);
  assert.equal(resumed.mode, "idle");
  assert.ok(resumed.cycle >= before.cycle);
  // Only the idle portion after the three-second pointer hold advances the sequence.
  assert.ok(
    resumed.stateIndex !== before.stateIndex || resumed.stateElapsed > before.stateElapsed,
    "the same sequence resumes after the pointer rests",
  );
});

test("idle cycles visit all sixteen looks, with varied holds and no repeated pose at the cycle seam", () => {
  assert.equal(IDLE_STATES.length, 16);
  assert.equal(new Set(IDLE_STATES.map((state) => state.name)).size, 16);
  const life = createLife(87);
  const completed = [];
  let previous;
  let minimumYaw = Infinity;
  let maximumYaw = -Infinity;
  let minimumPitch = Infinity;
  let maximumPitch = -Infinity;
  for (let i = 0; i < 330 * 60 && completed.length < 33; i++) {
    const frame = life.update(i / 60, 1 / 60, true);
    if (previous && (frame.stateIndex !== previous.stateIndex || frame.cycle !== previous.cycle)) {
      completed.push(previous);
    }
    assert.ok(frame.stateDuration >= 6.2 && frame.stateDuration <= 9.4);
    minimumYaw = Math.min(minimumYaw, frame.headYaw);
    maximumYaw = Math.max(maximumYaw, frame.headYaw);
    minimumPitch = Math.min(minimumPitch, frame.headPitch);
    maximumPitch = Math.max(maximumPitch, frame.headPitch);
    previous = frame;
  }
  assert.ok(completed.length >= 32, "the simulation should cover two complete cycles");
  for (const offset of [0, 16]) {
    assert.equal(new Set(completed.slice(offset, offset + 16).map((frame) => frame.stateIndex)).size, 16);
  }
  for (let i = 1; i < completed.length; i++) {
    assert.notEqual(completed[i].stateIndex, completed[i - 1].stateIndex, "adjacent looks must differ");
  }
  assert.ok(new Set(completed.slice(0, 16).map((frame) => frame.stateDuration.toFixed(1))).size >= 4);
  assert.notDeepEqual(
    completed.slice(0, 16).map((frame) => frame.stateIndex),
    completed.slice(16, 32).map((frame) => frame.stateIndex),
    "subsequent cycles should mix up the order",
  );
  assert.ok(maximumYaw - minimumYaw > 0.3, "look-around includes readable left and right turns");
  assert.ok(maximumPitch - minimumPitch > 0.14, "look-around includes readable up and down glances");
});

test("long idle runs remain smooth and inside the rig limits at desktop and mobile frame rates", () => {
  for (const fps of [30, 60]) {
    const life = createLife();
    let previous;
    for (let i = 0; i < 270 * fps; i++) {
      const frame = life.update(i / fps, 1 / fps, true);
      assertSafe(frame);
      if (previous) {
        for (const key of ["headYaw", "headPitch", "headRoll", "eyeYaw", "eyePitch"]) {
          const maxSpeed = key.startsWith("head") ? 0.9 : 1.8;
          assert.ok(Math.abs(frame[key] - previous[key]) < maxSpeed / fps, `${key} transition at ${fps}fps`);
        }
      }
      previous = frame;
    }
  }
});

test("hidden suspension freezes animation time and ignores wall-clock jumps", () => {
  const life = createLife();
  const frame = advance(life, 18);
  assert.deepEqual(life.update(3600, 0, true), frame);
  const resumed = life.update(3600.016, 1 / 60, true);
  assert.equal(resumed.stateIndex, frame.stateIndex);
  assert.ok(Math.abs(resumed.stateElapsed - frame.stateElapsed - 1 / 60) < 1e-8);
});

test("upward idle looks compensate with the eyes to keep pupils clear of the fixed lids", () => {
  const life = createLife();
  let upwardSamples = 0;
  for (let i = 0; i < 150 * 60; i++) {
    const frame = life.update(i / 60, 1 / 60, true);
    if (frame.stateElapsed > 2.5 && frame.headPitch < -0.03) {
      upwardSamples++;
      assert.ok(frame.headPitch >= -0.066, "upward head tilt stays gentle");
      assert.ok(frame.headPitch + frame.eyePitch > -0.035, "combined gaze keeps pupils visible");
    }
  }
  assert.ok(upwardSamples > 60, "exercise held upward looks, not just a transition");
});

test("motion off gives a stable resting portrait and resumes without stale cursor attention", () => {
  const life = createLife();
  life.pointer(1, -1, 0);
  advance(life, 1);
  const rest = life.update(1, 1 / 60, false);
  assert.equal(rest.mode, "rest");
  for (const key of ["attention", "idle", ...Object.keys(limits)]) assert.equal(rest[key], 0, key);
  assert.deepEqual(life.update(9999, 0.1, false), rest);
  const resumed = life.update(10000, 1 / 60, true);
  assert.equal(resumed.attention, 0);
  assertSafe(resumed);
});

test("invalid input cannot poison motion, and extreme cursor positions remain bounded", () => {
  const life = createLife();
  life.pointer(NaN, Infinity, 0);
  advance(life, 0.1);
  life.pointer(100, -100, 0.1);
  const frame = advance(life, 1);
  assertSafe(frame);
  assert.deepEqual(life.update(Infinity, NaN, true), frame);
  assertSafe(life.update(100, 100, true, NaN, Infinity));
});
