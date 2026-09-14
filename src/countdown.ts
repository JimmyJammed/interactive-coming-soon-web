/**
 * Optional launch countdown. Renders nothing unless `launch.date` is set and
 * `launch.showCountdown` is true in src/config/site.ts.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import { siteConfig } from "./config/site.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "3 days, 4 hours, 12 minutes" — plural-aware and screen-reader friendly. */
export function formatRemaining(milliseconds: number): string {
  const total = Math.max(0, milliseconds);
  const days = Math.floor(total / DAY);
  const hours = Math.floor((total % DAY) / HOUR);
  const minutes = Math.floor((total % HOUR) / MINUTE);
  const parts: string[] = [];
  if (days) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours || days) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  return parts.join(", ");
}

export function startCountdown() {
  const root = document.querySelector<HTMLElement>("#countdown");
  const value = document.querySelector<HTMLElement>("#countdown-value");
  if (!root || !value) return;

  const target = Date.parse(root.dataset.launch ?? "");
  if (Number.isNaN(target)) return;
  const afterText = root.dataset.after || siteConfig.launch.afterLaunchText;

  let timer: number | undefined;
  const tick = () => {
    const remaining = target - Date.now();
    if (remaining <= 0) {
      value.textContent = afterText;
      root.dataset.state = "launched";
      if (timer !== undefined) clearInterval(timer);
      return;
    }
    value.textContent = formatRemaining(remaining);
    root.dataset.state = "counting";
  };

  tick();
  // Minute resolution: no per-second repaints, and nothing to throttle.
  timer = window.setInterval(tick, MINUTE);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick();
  });
}
