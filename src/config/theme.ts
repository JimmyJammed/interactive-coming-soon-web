/**
 * Turns `siteConfig` into the CSS custom properties, @font-face rules and
 * `<head>` tags that the template renders. Everything here runs at build time
 * inside the Vite plugin (see vite.config.ts), so the generated HTML is fully
 * static: no flash of unstyled content, and search engines see real metadata.
 *
 * You do not normally need to edit this file — edit src/config/site.ts.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import type { FontFace, SiteConfig } from "./types.ts";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Escape a value that will sit inside a CSS declaration. */
const cssValue = (value: string) => String(value).replace(/[;{}<]/g, "");

const fontFormat = (font: FontFace) => font.format ?? "woff2";

function fontFaceRule(font: FontFace): string {
  if (!font.file) return "";
  return [
    "@font-face {",
    `  font-family: ${JSON.stringify(font.family)};`,
    `  src: url(${JSON.stringify(font.file)}) format(${JSON.stringify(fontFormat(font))});`,
    `  font-weight: ${font.weight ?? 400};`,
    `  font-style: ${font.style ?? "normal"};`,
    "  font-display: swap;",
    "}",
  ].join("\n");
}

const fontStack = (font: FontFace) => `${JSON.stringify(font.family)}, ${font.stack}`;

function textureBackground(config: SiteConfig): string {
  const { texture } = config.background;
  if (!texture.enabled || texture.sources.length === 0) return "none";
  const wash = cssValue(config.theme.colors.backgroundWash);
  const entries = texture.sources.flatMap((source) => {
    const parts: string[] = [];
    if (source.avif) parts.push(`url(${JSON.stringify(source.avif)}) type("image/avif") ${source.density}x`);
    if (source.webp) parts.push(`url(${JSON.stringify(source.webp)}) type("image/webp") ${source.density}x`);
    return parts;
  });
  return `linear-gradient(${wash}, ${wash}), image-set(\n    ${entries.join(",\n    ")}\n  )`;
}

function fallbackTexture(config: SiteConfig): string {
  const { texture } = config.background;
  if (!texture.enabled || texture.sources.length === 0) return "none";
  const preferred = texture.sources.find((source) => source.webp) ?? texture.sources[0];
  const wash = cssValue(config.theme.colors.backgroundWash);
  const url = preferred.webp ?? preferred.avif;
  return url ? `linear-gradient(${wash}, ${wash}), url(${JSON.stringify(url)})` : "none";
}

function tapeBackground(config: SiteConfig): string {
  const { tape } = config.background;
  const parts: string[] = [];
  if (tape.avif) parts.push(`url(${JSON.stringify(tape.avif)}) type("image/avif")`);
  if (tape.image) parts.push(`url(${JSON.stringify(tape.image)}) type("image/webp")`);
  return parts.length ? `image-set(${parts.join(", ")})` : "none";
}

/** The generated `<style>` block: @font-face rules plus every theme token. */
export function buildThemeCss(config: SiteConfig): string {
  const { colors, fonts } = config.theme;
  const faces = [fonts.display, fonts.ui, fonts.body, fonts.accentSerif]
    .map(fontFaceRule)
    .filter(Boolean)
    .join("\n");

  const tokens: Record<string, string> = {
    "--uc-background": colors.background,
    "--uc-background-wash": colors.backgroundWash,
    "--uc-text": colors.text,
    "--uc-headline": colors.headline,
    "--uc-subheadline": colors.subheadline,
    "--uc-muted": colors.muted,
    "--uc-accent": colors.accent,
    "--uc-accent-hover": colors.accentHover,
    "--uc-accent-contrast": colors.accentContrast,
    "--uc-accent-border": colors.accentBorder,
    "--uc-focus-ring": colors.focusRing,
    "--uc-tape-dark": colors.tapeDark,
    "--uc-tape-bright": colors.tapeBright,
    "--uc-dialog-surface": colors.dialogSurface,
    "--uc-dialog-border": colors.dialogBorder,
    "--uc-dialog-backdrop": colors.dialogBackdrop,
    "--uc-input-surface": colors.inputSurface,
    "--uc-input-border": colors.inputBorder,
    "--uc-error": colors.error,
    "--uc-success-surface": colors.successSurface,
    "--uc-success-text": colors.successText,
    "--uc-font-display": fontStack(fonts.display),
    "--uc-font-ui": fontStack(fonts.ui),
    "--uc-font-body": fontStack(fonts.body),
    "--uc-font-accent-serif": fontStack(fonts.accentSerif),
    "--uc-accent-serif-style": fonts.accentSerif.style ?? "italic",
    "--uc-texture-fallback": fallbackTexture(config),
    "--uc-texture": textureBackground(config),
    "--uc-texture-size": `${Number(config.background.texture.tileSize) || 418}px`,
    "--uc-crack-opacity": String(config.background.cracks.enabled ? config.background.cracks.opacity : 0),
    "--uc-tread-opacity": String(config.background.treads.enabled ? config.background.treads.opacity : 0),
    "--uc-tape-opacity": String(config.background.tape.enabled ? config.background.tape.opacity : 0),
    "--uc-tape-image": tapeBackground(config),
  };

  const declarations = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${cssValue(value)};`)
    .join("\n");

  return `${faces}\n:root {\n${declarations}\n}\n`;
}

/** Font files worth preloading, in `<head>` order. */
export function buildPreloadTags(config: SiteConfig): string {
  const { fonts } = config.theme;
  return [fonts.display, fonts.ui, fonts.body, fonts.accentSerif]
    .filter((font) => font.preload && font.file)
    .map(
      (font) =>
        `<link rel="preload" href="${escapeHtml(font.file!)}" as="font" type="font/${fontFormat(font)}" crossorigin />`,
    )
    .join("\n    ");
}

/** Every `<head>` tag derived from config: SEO, Open Graph, icons. */
export function buildHeadTags(config: SiteConfig): string {
  const { seo, favicon } = config;
  const tags: string[] = [
    `<meta name="theme-color" content="${escapeHtml(seo.themeColor)}" />`,
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
  ];

  if (seo.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`);
  }

  tags.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(seo.ogSiteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.ogTitle ?? seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.ogDescription ?? seo.description)}" />`,
  );

  if (seo.ogImage) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(seo.ogImageAlt)}" />`,
    );
  }

  tags.push(`<meta name="twitter:card" content="${escapeHtml(seo.twitterCard)}" />`);
  if (seo.twitterSite) tags.push(`<meta name="twitter:site" content="${escapeHtml(seo.twitterSite)}" />`);

  if (favicon.ico) {
    tags.push(`<link rel="icon" type="image/x-icon" href="${escapeHtml(favicon.ico)}" sizes="16x16 32x32 48x48" />`);
  }
  for (const icon of favicon.png ?? []) {
    tags.push(
      `<link rel="icon" type="image/png" href="${escapeHtml(icon.href)}" sizes="${icon.size}x${icon.size}" />`,
    );
  }
  if (favicon.svg) tags.push(`<link rel="icon" type="image/svg+xml" href="${escapeHtml(favicon.svg)}" />`);
  if (favicon.appleTouchIcon) {
    tags.push(`<link rel="apple-touch-icon" href="${escapeHtml(favicon.appleTouchIcon)}" sizes="180x180" />`);
  }

  return tags.join("\n    ");
}

export { escapeHtml };
