/**
 * Eye-only character choreography. Time is in seconds; rotations are radians.
 *
 * The controller is deliberately free of DOM and Three.js references so it can
 * be unit-tested in plain Node — see tests/avatar-performance.test.mjs.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

export type LifeFrame = {
  attention: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  eyeYaw: number;
  eyePitch: number;
  breath: number;
  idle: number;
  mode: "idle" | "tracking" | "rest";
  stateName: string;
  stateIndex: number;
  stateProgress: number;
  stateElapsed: number;
  stateDuration: number;
  cycle: number;
};

type Pose = { yaw: number; pitch: number; roll: number; eyeX: number; eyeY: number };
type IdleState = { name: string; pose: Pose; gesture?: "scan" | "nod" | "tilt" };
/** Default seconds of pointer stillness before idle motion resumes. */
export const IDLE_AFTER_SECONDS = 3;
const RETURN_DURATION = 1.1;
const NEUTRAL: Pose = { yaw: 0, pitch: 0, roll: 0, eyeX: 0, eyeY: 0 };

// Every beat is visible on the actual rig: no unsupported facial expressions.
// A shuffled deck visits all sixteen before repeating, with fresh timing each pass.
export const IDLE_STATES: readonly IdleState[] = [
  { name: "checking the left edge", pose: { yaw: -0.23, pitch: 0.01, roll: 0.015, eyeX: -0.07, eyeY: 0 } },
  { name: "reading the headline", pose: { yaw: 0.025, pitch: -0.115, roll: -0.018, eyeX: 0.01, eyeY: -0.065 }, gesture: "scan" },
  { name: "a curious right tilt", pose: { yaw: 0.14, pitch: -0.035, roll: -0.065, eyeX: 0.07, eyeY: -0.02 }, gesture: "tilt" },
  { name: "looking at the message", pose: { yaw: -0.03, pitch: 0.115, roll: 0.01, eyeX: 0.025, eyeY: 0.06 }, gesture: "scan" },
  { name: "checking the right edge", pose: { yaw: 0.24, pitch: 0.015, roll: -0.01, eyeX: 0.075, eyeY: 0 } },
  { name: "a small acknowledging nod", pose: { yaw: 0.035, pitch: -0.015, roll: 0.015, eyeX: -0.025, eyeY: 0 }, gesture: "nod" },
  { name: "up toward the left", pose: { yaw: -0.17, pitch: -0.10, roll: 0.035, eyeX: -0.07, eyeY: -0.055 } },
  { name: "checking the lower right", pose: { yaw: 0.185, pitch: 0.10, roll: -0.025, eyeX: 0.075, eyeY: 0.045 }, gesture: "scan" },
  { name: "a thoughtful left tilt", pose: { yaw: -0.11, pitch: -0.035, roll: 0.065, eyeX: -0.055, eyeY: -0.03 }, gesture: "tilt" },
  { name: "up toward the right", pose: { yaw: 0.18, pitch: -0.095, roll: -0.025, eyeX: 0.065, eyeY: -0.05 } },
  { name: "checking the lower left", pose: { yaw: -0.19, pitch: 0.095, roll: 0.025, eyeX: -0.07, eyeY: 0.045 }, gesture: "scan" },
  { name: "back to the visitor", pose: { yaw: -0.035, pitch: -0.025, roll: -0.025, eyeX: 0.035, eyeY: 0.015 }, gesture: "nod" },
  { name: "a slow left survey", pose: { yaw: -0.16, pitch: 0.025, roll: -0.025, eyeX: -0.04, eyeY: 0.015 }, gesture: "scan" },
  { name: "one more look above", pose: { yaw: -0.065, pitch: -0.125, roll: 0.02, eyeX: 0.035, eyeY: -0.05 } },
  { name: "a slow right survey", pose: { yaw: 0.17, pitch: -0.015, roll: 0.03, eyeX: 0.045, eyeY: 0.025 }, gesture: "scan" },
  { name: "a glance below and a nod", pose: { yaw: 0.065, pitch: 0.07, roll: -0.015, eyeX: -0.03, eyeY: 0.025 }, gesture: "nod" },
];

/** Tuning applied from `animation` in src/config/site.ts. */
export interface PerformanceOptions {
  /** Scales how far the head and eyes travel. 0 is still, 1 is the default. */
  intensity?: number;
  /** Multiplies the pace of the idle choreography. 1 is the default. */
  speed?: number;
  /** Seconds of pointer stillness before autonomous motion resumes. */
  idleAfterSeconds?: number;
  /** When false, a fine pointer never captures gaze. */
  pointerTracking?: boolean;
}

const clamp = (n: number, low: number, high: number) =>
  Math.min(high, Math.max(low, Number.isFinite(n) ? n : 0));
const smooth = (n: number) => {
  const t = clamp(n, 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (a: number, b: number, rate: number, dt: number) => mix(a, b, 1 - Math.exp(-rate * dt));
const rest = (): LifeFrame => ({
  attention: 0, headYaw: 0, headPitch: 0, headRoll: 0, eyeYaw: 0, eyePitch: 0,
  breath: 0, idle: 0, mode: "rest", stateName: "rest", stateIndex: 0,
  stateProgress: 0, stateElapsed: 0, stateDuration: 0, cycle: 0,
});

export class AvatarPerformance {
  private random: () => number;
  private pointerX = 0;
  private pointerY = 0;
  private rawPointerX = 0;
  private rawPointerY = 0;
  private pointerInside = false;
  private pointerAge = IDLE_AFTER_SECONDS + RETURN_DURATION;
  private elapsed = 0;
  private frame = rest();
  private deck: number[] = [];
  private previousPose = { ...NEUTRAL };
  private currentPose = { ...NEUTRAL };
  private index = -1;
  private stateElapsed = 0;
  private stateDuration = 0;
  private cycle = -1;
  private gestureStrength = 1;
  private readonly intensity: number;
  private readonly speed: number;
  private readonly idleAfter: number;
  private readonly pointerTracking: boolean;

  // Delta owns the clock, so background suspension never skips choreography.
  constructor(_now = 0, random: () => number = Math.random, options: PerformanceOptions = {}) {
    this.random = () => clamp(random(), 0, 0.999999999);
    this.intensity = clamp(options.intensity ?? 1, 0, 3);
    this.speed = clamp(options.speed ?? 1, 0.05, 5);
    this.idleAfter = Math.max(0, options.idleAfterSeconds ?? IDLE_AFTER_SECONDS);
    this.pointerTracking = options.pointerTracking !== false;
    this.pointerAge = this.idleAfter + RETURN_DURATION;
    this.nextState();
  }

  private nextState() {
    if (!this.deck.length) {
      this.deck = IDLE_STATES.map((_, index) => index);
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
      // pop() selects the next beat; avoid an immediate repeat at a deck boundary.
      const end = this.deck.length - 1;
      if (this.deck[end] === this.index) [this.deck[0], this.deck[end]] = [this.deck[end], this.deck[0]];
      this.cycle++;
    }
    this.previousPose = { ...this.currentPose };
    this.index = this.deck.pop()!;
    const pose = IDLE_STATES[this.index].pose;
    const scale = 0.9 + this.random() * 0.1;
    this.currentPose = {
      yaw: pose.yaw * scale, pitch: Math.max(-0.065, pose.pitch * scale), roll: pose.roll * scale,
      eyeX: pose.eyeX, eyeY: pose.eyeY,
    };
    this.stateDuration = 6.2 + this.random() * 3.2;
    this.gestureStrength = 0.8 + this.random() * 0.2;
  }

  /** Fine pointer input only; touch taps and scrolling never hold gaze. */
  pointer(x: number, y: number, _now = 0, finePointer = true) {
    if (!this.pointerTracking || !finePointer || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const moved = !this.pointerInside || Math.hypot(x - this.rawPointerX, y - this.rawPointerY) > 0.00001;
    this.rawPointerX = x;
    this.rawPointerY = y;
    this.pointerX = clamp(x, -1, 1);
    this.pointerY = clamp(y, -1, 1);
    this.pointerInside = true;
    if (moved) this.pointerAge = 0;
    // Keep the deck position, so every interaction doesn't restart the same look.
  }

  leave() {
    this.pointerInside = false;
    this.pointerAge = Math.max(this.pointerAge, this.idleAfter);
  }

  update(_now: number, delta: number, enabled: boolean, baseYaw = 0, basePitch = 0): LifeFrame {
    if (!enabled) {
      this.frame = rest();
      this.leave();
      return { ...this.frame };
    }
    const dt = clamp(delta, 0, 0.1);
    if (dt === 0) return { ...this.frame };
    this.elapsed += dt;
    this.pointerAge += dt;
    const f = this.frame;
    const attentionTarget =
      this.pointerInside && this.pointerTracking
        ? 1 - smooth((this.pointerAge - this.idleAfter) / RETURN_DURATION)
        : 0;
    f.attention = damp(f.attention, attentionTarget, attentionTarget > f.attention ? 12 : 6, dt);
    f.idle = 1 - f.attention;
    // Progress only while autonomous motion is visible; preserve variety during tracking.
    if (attentionTarget < 1) {
      this.stateElapsed += dt * this.speed * (1 - attentionTarget);
      if (this.stateElapsed >= this.stateDuration) {
        this.stateElapsed -= this.stateDuration;
        this.nextState();
      }
    }
    const state = IDLE_STATES[this.index];
    const pose = { ...this.currentPose };
    const entrance = smooth(this.stateElapsed / 1.25);
    for (const key of Object.keys(pose) as (keyof Pose)[]) {
      pose[key] = mix(this.previousPose[key], this.currentPose[key], entrance);
    }
    const envelope = smooth((this.stateElapsed - 1.6) / 1.1)
      * smooth((this.stateDuration - this.stateElapsed) / 1.3) * this.gestureStrength;
    const phase = Math.max(0, this.stateElapsed - 1.6);
    if (state.gesture === "scan") {
      pose.yaw += Math.sin(phase * 0.9) * 0.03 * envelope;
      pose.eyeX += Math.sin(phase * 1.35) * 0.035 * envelope;
    }
    if (state.gesture === "nod") {
      // One deliberate down-and-back nod, followed by a quiet hold.
      const nod = Math.sin(Math.PI * clamp((this.stateElapsed - 1.8) / 2.1, 0, 1));
      pose.pitch += nod * nod * 0.065 * this.gestureStrength;
    }
    if (state.gesture === "tilt") pose.roll += Math.sin(phase * 0.8) * 0.012 * envelope;

    // `intensity` scales how far everything travels. The clamps below stay
    // fixed, so a high intensity can never push the rig past its safe range.
    const gain = this.intensity;
    for (const key of Object.keys(pose) as (keyof Pose)[]) pose[key] *= gain;

    const targetYaw = this.pointerX * 0.31 * gain;
    const targetPitch = this.pointerY * 0.18 * gain;
    const safeBaseYaw = clamp(baseYaw, -0.4, 0.4);
    const safeBasePitch = clamp(basePitch, -0.3, 0.3);
    f.headYaw = damp(f.headYaw,
      clamp(mix(pose.yaw, targetYaw - safeBaseYaw * 0.65, f.attention), -0.34, 0.34), 3.6, dt);
    f.headPitch = damp(f.headPitch,
      clamp(mix(pose.pitch, targetPitch - safeBasePitch * 0.65, f.attention), -0.2, 0.2), 3.4, dt);
    f.headRoll = damp(f.headRoll,
      clamp((pose.roll + Math.sin(this.elapsed * 0.57) * 0.003) * f.idle, -0.09, 0.09), 3, dt);

    // Eyes acquire each new point first. They settle as the slower head catches up.
    const eyeEntrance = smooth(this.stateElapsed / 0.48);
    const idleGazeYaw = gain * mix(this.previousPose.yaw + this.previousPose.eyeX,
      this.currentPose.yaw + this.currentPose.eyeX, eyeEntrance)
      + (pose.yaw - mix(this.previousPose.yaw, this.currentPose.yaw, entrance))
      + (pose.eyeX - mix(this.previousPose.eyeX, this.currentPose.eyeX, entrance));
    // Limit the combined vertical sightline, not just local eye rotation: the
    // head's upward tilt otherwise hides pupils behind this model's fixed lids.
    const idleGazePitch = clamp(mix(this.previousPose.pitch + this.previousPose.eyeY,
      this.currentPose.pitch + this.currentPose.eyeY, eyeEntrance) * gain, -0.015, 0.12);
    f.eyeYaw = damp(f.eyeYaw, clamp(mix(idleGazeYaw,
      targetYaw * 1.5 - safeBaseYaw, f.attention) - f.headYaw, -0.24, 0.24), 18, dt);
    f.eyePitch = damp(f.eyePitch, clamp(mix(idleGazePitch,
      targetPitch * 1.4 - safeBasePitch, f.attention) - f.headPitch, -0.10, 0.10), 18, dt);
    f.breath = Math.sin(this.elapsed * 1.22) * 0.003;
    f.mode = f.attention > 0.15 ? "tracking" : "idle";
    f.stateName = f.mode === "tracking" ? "following your cursor" : state.name;
    f.stateIndex = this.index;
    f.stateElapsed = this.stateElapsed;
    f.stateDuration = this.stateDuration;
    f.stateProgress = this.stateElapsed / this.stateDuration;
    f.cycle = this.cycle;
    return { ...f };
  }
}
