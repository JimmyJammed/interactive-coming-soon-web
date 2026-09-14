/**
 * Builds the config-driven pieces of the page markup at build time.
 *
 * Everything produced here is plain static HTML, so the headline, status text,
 * contact affordance and social links are present in the served document even
 * with JavaScript disabled.
 *
 * You do not normally need to edit this file — edit src/config/site.ts.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import type { BuiltInIcon, ResponsiveImage, SiteConfig, SocialLink } from "./types.ts";
import { escapeHtml } from "./theme.ts";

const ICONS: Record<BuiltInIcon, string> = {
  github:
    '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
  linkedin:
    '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.02-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9z"/>',
  x: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.83L1.25 2.25h6.82l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.11z"/>',
  instagram:
    '<path d="M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.35 3.96 3.86 2.42 7.15 2.27 8.42 2.21 8.8 2.2 12 2.2Zm0 3.13a6.67 6.67 0 1 0 0 13.34 6.67 6.67 0 0 0 0-13.34Zm0 11a4.33 4.33 0 1 1 0-8.66 4.33 4.33 0 0 1 0 8.66Zm6.93-11.27a1.56 1.56 0 1 0 0 3.12 1.56 1.56 0 0 0 0-3.12Z"/>',
  mail: '<path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5zm2.4.5 7.6 5.6L19.6 6z"/>',
  globe:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-2.95a15.6 15.6 0 0 0-1.4-3.72A8.03 8.03 0 0 1 18.9 8ZM12 4.14c.72 1.05 1.3 2.36 1.7 3.86h-3.4c.4-1.5.98-2.81 1.7-3.86ZM4.26 14A8.06 8.06 0 0 1 4 12c0-.7.09-1.36.26-2h3.38a17.7 17.7 0 0 0 0 4Zm.84 2h2.95c.33 1.36.8 2.62 1.4 3.72A8.03 8.03 0 0 1 5.1 16Zm2.95-8H5.1a8.03 8.03 0 0 1 4.35-3.72A15.6 15.6 0 0 0 8.05 8ZM12 19.86c-.72-1.05-1.3-2.36-1.7-3.86h3.4c-.4 1.5-.98 2.81-1.7 3.86ZM14.1 14H9.9a15.6 15.6 0 0 1 0-4h4.2a15.6 15.6 0 0 1 0 4Zm.45 5.72c.6-1.1 1.07-2.36 1.4-3.72h2.95a8.03 8.03 0 0 1-4.35 3.72ZM16.36 14a17.7 17.7 0 0 0 0-4h3.38c.17.64.26 1.3.26 2s-.09 1.36-.26 2Z"/>',
  dribbble:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.6 4.6a8 8 0 0 1 1.83 5 19.4 19.4 0 0 0-5.63-.28 32 32 0 0 0-.85-1.9c2.2-.9 3.7-2.05 4.65-2.82ZM12 4a8 8 0 0 1 5.28 1.98c-.86.7-2.22 1.76-4.28 2.57A41 41 0 0 0 9.9 4.35 8 8 0 0 1 12 4ZM7.95 5.16a47 47 0 0 1 3.13 4.24 30 30 0 0 1-7 .93 8.03 8.03 0 0 1 3.87-5.17ZM4 12l.01-.28a32.6 32.6 0 0 0 8.05-1.15c.26.5.5 1.02.72 1.54a13.4 13.4 0 0 0-6.6 5.15A7.97 7.97 0 0 1 4 12Zm8 8a7.96 7.96 0 0 1-4.55-1.42 11.4 11.4 0 0 1 6.11-4.72 33 33 0 0 1 1.62 5.7A7.9 7.9 0 0 1 12 20Zm4.98-1.42a34.9 34.9 0 0 0-1.5-5.42c1.72-.24 3.42-.03 4.44.16a8.03 8.03 0 0 1-2.94 5.26Z"/>',
  youtube:
    '<path d="M21.58 7.19a2.51 2.51 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77A26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .42 4.81 2.51 2.51 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.42-4.81ZM10 15.02V8.98L15.2 12z"/>',
};

function iconMarkup(icon: SocialLink["icon"]): string {
  if (!icon) return "";
  if (typeof icon === "object") {
    // A raw SVG string supplied by the site owner in their own config.
    return icon.svg;
  }
  const path = ICONS[icon];
  if (!path) return "";
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${path}</svg>`;
}

/** Only allow link targets that cannot execute script. */
function safeHref(href: string): string | null {
  const value = href.trim();
  if (/^(https?:|mailto:|tel:|\/|#|\.)/i.test(value)) return value;
  return null;
}

export function buildSocialMarkup(config: SiteConfig): string {
  const links = (config.social ?? []).filter((link) => safeHref(link.href));
  if (links.length === 0) return "";
  const items = links
    .map((link) => {
      const href = safeHref(link.href)!;
      const external = /^https?:/i.test(href);
      const rel = external ? ' rel="noopener noreferrer" target="_blank"' : "";
      return `        <li><a class="social-link" href="${escapeHtml(href)}"${rel}>${iconMarkup(
        link.icon,
      )}<span>${escapeHtml(link.label)}</span></a></li>`;
    })
    .join("\n");
  return `      <nav class="social" aria-label="Elsewhere">\n        <ul>\n${items}\n        </ul>\n      </nav>`;
}

export function buildLaunchMarkup(config: SiteConfig): string {
  const { launch } = config;
  if (!launch.date) return "";
  const timestamp = Date.parse(launch.date);
  if (Number.isNaN(timestamp)) {
    throw new Error(
      `site.ts: launch.date is not a valid ISO 8601 date: ${JSON.stringify(launch.date)}. ` +
        'Use a value such as "2026-12-01T09:00:00Z", or null to disable launch messaging.',
    );
  }
  const iso = new Date(timestamp).toISOString();
  if (!launch.showCountdown) {
    return `      <p class="launch-date">${escapeHtml(launch.countdownLabel)} <time datetime="${iso}">${escapeHtml(
      new Date(timestamp).toISOString().slice(0, 10),
    )}</time></p>`;
  }
  return [
    `      <div class="countdown" id="countdown" data-launch="${iso}" data-after=${JSON.stringify(
      launch.afterLaunchText,
    )}>`,
    `        <p class="countdown-label">${escapeHtml(launch.countdownLabel)}</p>`,
    `        <p class="countdown-value" id="countdown-value" role="status" aria-live="polite"><time datetime="${iso}">${escapeHtml(
      new Date(timestamp).toISOString().slice(0, 10),
    )}</time></p>`,
    "      </div>",
  ].join("\n");
}

export function buildContactMarkup(config: SiteConfig): string {
  const { contact } = config;
  if (contact.mode === "none") return "";
  const mailto = contact.email ? `mailto:${contact.email}` : "#";
  const interactive = contact.mode !== "mailto";
  const dialogAttrs = interactive ? ' aria-haspopup="dialog" aria-controls="contact-dialog"' : "";
  return [
    '      <div class="contact">',
    contact.prompt ? `        <span class="contact-prompt">${escapeHtml(contact.prompt)}</span>` : "",
    `        <a class="contact-trigger" id="contact-open" href="${escapeHtml(mailto)}"${dialogAttrs}>`,
    `          ${escapeHtml(contact.buttonLabel)}`,
    '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">',
    '            <path d="M5 12h14M13 6l6 6-6 6" />',
    "          </svg>",
    "        </a>",
    "      </div>",
  ]
    .filter(Boolean)
    .join("\n");
}

function picture(className: string, image: ResponsiveImage, sizes: string): string {
  const widest = image.sources[image.sources.length - 1];
  const srcset = (key: "webp" | "avif") =>
    image.sources
      .map((source) => (source[key] ? `${source[key]} ${source.width}w` : ""))
      .filter(Boolean)
      .join(", ");
  const avif = srcset("avif");
  const avifSource = avif
    ? `        <source type="image/avif" srcset="${escapeHtml(avif)}" sizes="${sizes}" />\n`
    : "";
  return (
    `      <picture class="${className}">\n${avifSource}` +
    `        <img src="${escapeHtml(widest.webp)}" srcset="${escapeHtml(srcset("webp"))}" sizes="${sizes}" ` +
    `alt="" width="${image.width}" height="${image.height}" decoding="async" />\n` +
    "      </picture>"
  );
}

export function buildSurfaceMarkup(config: SiteConfig): string {
  const { cracks, treads } = config.background;
  const parts: string[] = [];
  const crackSizes = "(max-width: 650px) min(86vw, 340px), clamp(260px, 30vw, 512px)";
  const treadSizes = "(max-width: 650px) 280px, 400px";
  if (cracks.enabled) {
    parts.push(picture("crack-edge crack-left", cracks.left, crackSizes));
    parts.push(picture("crack-edge crack-right", cracks.right, crackSizes));
  }
  if (treads.enabled) {
    parts.push(picture("tread tread-left", treads.image, treadSizes));
    parts.push(picture("tread tread-right", treads.image, treadSizes));
  }
  if (parts.length === 0) return "";
  return `    <div class="surface" aria-hidden="true">\n${parts.join("\n")}\n    </div>`;
}

export function buildTapeMarkup(config: SiteConfig): string {
  if (!config.background.tape.enabled) return "";
  return [
    '    <div class="tape tape-top" aria-hidden="true"></div>',
    '    <div class="tape tape-bottom" aria-hidden="true"></div>',
  ].join("\n");
}

export function buildAvatarMarkup(config: SiteConfig): string {
  const { avatar } = config;
  const canvas = avatar.enabled ? '\n        <div id="avatar-canvas" aria-hidden="true"></div>' : "";
  return [
    '      <div class="portrait" id="portrait" role="img" aria-label="' + escapeHtml(avatar.alt) + '">',
    `        <img class="portrait-still" src="${escapeHtml(avatar.still)}" alt="" width="${
      Number(avatar.stillWidth) || 608
    }" height="${Number(avatar.stillHeight) || 912}" fetchpriority="high" />${canvas}`,
    "      </div>",
  ].join("\n");
}

export function buildMotionToggleMarkup(config: SiteConfig): string {
  if (!config.avatar.enabled || !config.animation.enabled || !config.animation.showMotionToggle) return "";
  return [
    '    <button class="motion-toggle" id="motion-toggle" type="button" aria-label="Pause avatar animation" aria-pressed="false" hidden>',
    '      <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>',
    '      <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>',
    '      <span class="motion-label">Pause animation</span>',
    "    </button>",
  ].join("\n");
}

/**
 * The contact dialog. Rendered only when a real delivery mode is configured;
 * "mailto" and "none" ship no dialog markup and no dialog JavaScript at all.
 */
export function buildDialogMarkup(config: SiteConfig): string {
  const { contact } = config;
  if (contact.mode === "none" || contact.mode === "mailto") return "";
  const verification = contact.turnstileSiteKey
    ? [
        '          <div class="verification-slot" id="contact-turnstile" aria-label="Human verification">',
        '            <div class="verification-placeholder" id="contact-verification-placeholder">',
        '              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">',
        '                <path d="m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Z" /><path d="m9 12 2 2 4-4" />',
        "              </svg>",
        "              <span><strong>Human verification</strong><small>Loading…</small></span>",
        "            </div>",
        "          </div>",
      ].join("\n")
    : "";
  return [
    '    <dialog class="contact-dialog" id="contact-dialog" aria-labelledby="contact-title" aria-describedby="contact-intro">',
    '      <div class="contact-panel">',
    '        <button class="contact-close" id="contact-close" type="button" aria-label="Close contact form">',
    '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>',
    "        </button>",
    '        <header class="contact-heading">',
    `          <p class="contact-eyebrow">${escapeHtml(contact.dialogEyebrow)}</p>`,
    `          <h2 id="contact-title" tabindex="-1">${escapeHtml(contact.dialogTitle)}</h2>`,
    `          <p id="contact-intro">${escapeHtml(contact.dialogIntro)}</p>`,
    "        </header>",
    '        <form id="contact-form" method="dialog" novalidate>',
    '          <fieldset class="contact-fields" id="contact-fields">',
    '            <legend class="sr-only">Your contact details and message</legend>',
    '            <div class="contact-input-row">',
    '              <div class="contact-field">',
    '                <label for="contact-name">Name</label>',
    '                <input id="contact-name" name="name" type="text" autocomplete="name" placeholder="Your name" maxlength="100" required aria-describedby="contact-name-error" />',
    '                <p class="field-error" id="contact-name-error" hidden></p>',
    "              </div>",
    '              <div class="contact-field">',
    '                <label for="contact-email">Email</label>',
    '                <input id="contact-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="you@example.com" maxlength="254" required aria-describedby="contact-email-error" />',
    '                <p class="field-error" id="contact-email-error" hidden></p>',
    "              </div>",
    "            </div>",
    '            <div class="contact-field">',
    '              <label for="contact-message">What’s on your mind?</label>',
    '              <textarea id="contact-message" name="message" rows="3" placeholder="Give me the short version…" maxlength="1500" required aria-describedby="contact-message-error contact-message-hint"></textarea>',
    '              <div class="message-meta">',
    '                <span id="contact-message-hint">A few sentences will do.</span>',
    '                <span id="contact-message-count" aria-hidden="true">0 / 1,500</span>',
    "              </div>",
    '              <p class="field-error" id="contact-message-error" hidden></p>',
    "            </div>",
    "          </fieldset>",
    `        <div class="contact-footer${verification ? "" : " contact-footer-plain"}" id="contact-footer">`,
    verification,
    '            <button class="contact-send" id="contact-send" type="submit" aria-describedby="contact-status">',
    '              <span id="contact-send-label">Send message</span>',
    '              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>',
    "            </button>",
    "          </div>",
    '          <p class="contact-status" id="contact-status" role="status" aria-live="polite" aria-atomic="true"></p>',
    "        </form>",
    "      </div>",
    "    </dialog>",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function buildFooterMarkup(config: SiteConfig): string {
  const text = config.content.footerText?.trim();
  if (!text) return "";
  return `      <p class="site-footer">${escapeHtml(text)}</p>`;
}
