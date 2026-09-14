import test from "node:test";
import assert from "node:assert/strict";
import { formatRemaining } from "../src/countdown.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

test("the countdown reads naturally and uses singular units correctly", () => {
  assert.equal(formatRemaining(3 * DAY + 4 * HOUR + 12 * MINUTE), "3 days, 4 hours, 12 minutes");
  assert.equal(formatRemaining(DAY + HOUR + MINUTE), "1 day, 1 hour, 1 minute");
  assert.equal(formatRemaining(90 * MINUTE), "1 hour, 30 minutes");
  assert.equal(formatRemaining(5 * MINUTE), "5 minutes");
});

test("hours are kept once days are shown, so the value never jumps oddly", () => {
  assert.equal(formatRemaining(2 * DAY + 30 * MINUTE), "2 days, 0 hours, 30 minutes");
});

test("a past or invalid launch time clamps to zero instead of going negative", () => {
  assert.equal(formatRemaining(-1000), "0 minutes");
  assert.equal(formatRemaining(0), "0 minutes");
});
