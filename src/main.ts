/**
 * Entry point. Wires the configured contact mode, the optional launch
 * countdown, and the lazily loaded 3D avatar.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import "./style.css";
import { siteConfig } from "./config/site.ts";
import { connectContactForm } from "./contact-integration.ts";
import { startCountdown } from "./countdown.ts";

connectContactForm();
startCountdown();

const { avatar: avatarConfig, animation } = siteConfig;
const portrait = document.querySelector<HTMLElement>("#portrait");
const container = document.querySelector<HTMLElement>("#avatar-canvas");
const button = document.querySelector<HTMLButtonElement>("#motion-toggle");

// Nothing to do when the 3D layer is switched off in config: the still image
// rendered by the build is already the finished page.
if (avatarConfig.enabled && animation.enabled && portrait && container) {
  const label = button?.querySelector<HTMLElement>(".motion-label") ?? null;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = animation.respectSaveData
    ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    : false;
  const honoursReducedMotion = () => animation.respectReducedMotion && reducedMotion.matches;

  const STORAGE_KEY = "under-construction:motion";
  let manualPause = false;
  try {
    manualPause = localStorage.getItem(STORAGE_KEY) === "paused";
  } catch {
    // Private browsing or a blocked storage partition: fall back to playing.
  }

  let renderer: { setPaused: (paused: boolean) => void } | undefined;
  let loading = false;

  function syncButton() {
    const paused = manualPause || honoursReducedMotion();
    if (button && label) {
      button.setAttribute("aria-pressed", String(paused));
      const text = paused ? "Play avatar animation" : "Pause avatar animation";
      button.setAttribute("aria-label", text);
      label.textContent = paused ? "Play animation" : "Pause animation";
    }
    renderer?.setPaused(paused);
  }

  async function start() {
    if (loading || renderer || saveData || honoursReducedMotion() || manualPause) return;
    loading = true;
    try {
      const { createAvatar } = await import("./avatar");
      renderer = await createAvatar(container!, portrait!, () => {
        renderer = undefined;
        if (button) button.hidden = true;
      });
      if (button) button.hidden = honoursReducedMotion() || !!saveData;
      syncButton();
    } catch (error) {
      // Any failure — decode error, missing file, no WebGL — leaves the static
      // portrait in place. The page is still complete without the 3D layer.
      portrait!.dataset.status = "fallback";
      if (button) button.hidden = true;
      console.warn("[under-construction] Falling back to the static avatar image.", error);
    } finally {
      loading = false;
    }
  }

  button?.addEventListener("click", () => {
    manualPause = !manualPause;
    try {
      localStorage.setItem(STORAGE_KEY, manualPause ? "paused" : "playing");
    } catch {
      // Preference simply is not remembered.
    }
    syncButton();
    void start();
  });

  reducedMotion.addEventListener("change", () => {
    syncButton();
    if (button) button.hidden = honoursReducedMotion() || !!saveData;
    void start();
  });

  if (button && !saveData && !honoursReducedMotion()) button.hidden = false;
  syncButton();
  void start();
}
