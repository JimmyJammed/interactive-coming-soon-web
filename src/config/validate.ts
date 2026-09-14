/**
 * Config sanity checks. These run at build time (see vite.config.ts) so a typo
 * in src/config/site.ts fails the build with a readable message instead of
 * producing a subtly broken page.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import type { SiteConfig } from "./types.ts";

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Accept hex, rgb()/rgba(), hsl()/hsla() and CSS named colours. */
function looksLikeColor(value: unknown): boolean {
  if (typeof value !== "string" || value.trim() === "") return false;
  const v = value.trim();
  return HEX.test(v) || /^(rgb|hsl|oklch|lab|color)a?\(/i.test(v) || /^[a-z]+$/i.test(v);
}

export interface ValidationResult {
  /** Non-fatal notes printed during the build. */
  warnings: string[];
}

export function validateSiteConfig(config: SiteConfig): ValidationResult {
  const problems: string[] = [];
  const warnings: string[] = [];
  const fail = (message: string) => problems.push(message);
  const warn = (message: string) => warnings.push(message);

  // ── contact ──────────────────────────────────────────────────────────────
  const { contact } = config;
  const modes = ["none", "mailto", "formspree", "endpoint"];
  if (!modes.includes(contact.mode)) {
    fail(`contact.mode must be one of ${modes.join(" | ")} — got ${JSON.stringify(contact.mode)}.`);
  }
  if (contact.mode === "formspree" && !contact.formspreeId?.trim()) {
    fail('contact.mode is "formspree" but contact.formspreeId is empty. Set it to your Formspree form id.');
  }
  if (contact.mode === "endpoint" && !contact.endpoint?.trim()) {
    fail('contact.mode is "endpoint" but contact.endpoint is empty. Set it to the URL that receives the message.');
  }
  if (contact.mode !== "none" && !contact.email?.includes("@")) {
    fail("contact.email should be a real address — it is the no-JavaScript fallback for every mode.");
  }
  if (contact.email === "hello@example.com" && contact.mode !== "none") {
    warn('contact.email is still the placeholder "hello@example.com" — set your own address before you deploy.');
  }

  // ── launch ───────────────────────────────────────────────────────────────
  if (config.launch.date !== null && Number.isNaN(Date.parse(config.launch.date))) {
    fail(`launch.date is not a valid ISO 8601 date: ${JSON.stringify(config.launch.date)}.`);
  }

  // ── theme ────────────────────────────────────────────────────────────────
  for (const [name, value] of Object.entries(config.theme.colors)) {
    if (!looksLikeColor(value)) fail(`theme.colors.${name} is not a usable CSS colour: ${JSON.stringify(value)}.`);
  }
  for (const [name, font] of Object.entries(config.theme.fonts)) {
    if (!font.family?.trim()) fail(`theme.fonts.${name}.family must not be empty.`);
    if (!font.stack?.trim()) fail(`theme.fonts.${name}.stack must not be empty — it is the fallback if the font fails.`);
    if (font.file !== null && !font.file.startsWith("/")) {
      fail(`theme.fonts.${name}.file must be a path under public/ starting with "/", or null. Got ${font.file}.`);
    }
  }

  // ── avatar ───────────────────────────────────────────────────────────────
  const { avatar } = config;
  if (avatar.enabled && !avatar.model?.startsWith("/")) {
    fail(`avatar.model must be a path under public/ starting with "/". Got ${JSON.stringify(avatar.model)}.`);
  }
  if (!avatar.still?.startsWith("/")) {
    fail(`avatar.still must be a path under public/ starting with "/". Got ${JSON.stringify(avatar.still)}.`);
  }
  if (!(avatar.scale > 0)) fail(`avatar.scale must be greater than 0. Got ${avatar.scale}.`);
  if (!avatar.alt?.trim()) fail("avatar.alt must describe the avatar for screen-reader users.");
  if (avatar.requireEyes && (!avatar.eyeNodes.left?.trim() || !avatar.eyeNodes.right?.trim())) {
    fail("avatar.requireEyes is true, so avatar.eyeNodes.left and .right must both name a node in the model.");
  }

  // ── animation ────────────────────────────────────────────────────────────
  const { animation } = config;
  if (animation.intensity < 0 || animation.intensity > 3) {
    fail(`animation.intensity should be between 0 and 3. Got ${animation.intensity}.`);
  }
  if (!(animation.speed > 0) || animation.speed > 5) {
    fail(`animation.speed should be greater than 0 and at most 5. Got ${animation.speed}.`);
  }
  if (!(animation.idleAfterSeconds >= 0)) {
    fail(`animation.idleAfterSeconds must be 0 or more. Got ${animation.idleAfterSeconds}.`);
  }
  for (const key of ["desktop", "mobile"] as const) {
    const fps = animation.maxFps[key];
    if (!(fps >= 10 && fps <= 240)) fail(`animation.maxFps.${key} should be between 10 and 240. Got ${fps}.`);
  }

  // ── background ───────────────────────────────────────────────────────────
  const { texture } = config.background;
  if (texture.enabled) {
    if (!(texture.tileSize > 0)) fail(`background.texture.tileSize must be greater than 0. Got ${texture.tileSize}.`);
    if (texture.sources.length === 0) {
      fail("background.texture is enabled but has no sources. Add at least one, or set enabled: false.");
    }
  }

  // ── seo ──────────────────────────────────────────────────────────────────
  const { seo } = config;
  if (!seo.title?.trim()) fail("seo.title must not be empty — it is the browser tab and search result title.");
  if (!seo.description?.trim()) fail("seo.description must not be empty.");
  if (!seo.canonicalUrl) {
    warn("seo.canonicalUrl is empty — set it to your live URL so search engines and social previews resolve correctly.");
  }
  if (!seo.ogImage) {
    warn("seo.ogImage is empty — links shared on social networks will have no preview image.");
  }
  if (seo.canonicalUrl && !/^https?:\/\//i.test(seo.canonicalUrl)) {
    fail(`seo.canonicalUrl must be an absolute http(s) URL or an empty string. Got ${JSON.stringify(seo.canonicalUrl)}.`);
  }
  if (seo.ogImage && !/^https?:\/\//i.test(seo.ogImage)) {
    fail("seo.ogImage must be an absolute URL — social networks cannot resolve a relative path.");
  }
  if (!looksLikeColor(seo.themeColor)) fail(`seo.themeColor is not a usable CSS colour: ${JSON.stringify(seo.themeColor)}.`);

  // ── social ───────────────────────────────────────────────────────────────
  (config.social ?? []).forEach((link, index) => {
    if (!link.label?.trim()) fail(`social[${index}].label must not be empty.`);
    if (!/^(https?:|mailto:|tel:|\/|#|\.)/i.test((link.href ?? "").trim())) {
      fail(`social[${index}].href must be an http(s), mailto:, tel: or site-relative URL. Got ${JSON.stringify(link.href)}.`);
    }
  });

  if (problems.length) {
    throw new Error(
      `Invalid src/config/site.ts:\n\n` +
        problems.map((problem) => `  • ${problem}`).join("\n") +
        `\n\nSee docs/CUSTOMIZATION.md for the full field reference.\n`,
    );
  }
  return { warnings };
}
