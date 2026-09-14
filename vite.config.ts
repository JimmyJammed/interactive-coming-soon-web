/**
 * Vite configuration for Interactive Under Construction.
 *
 * The `siteConfigPlugin` below renders index.html from src/config/site.ts at
 * build time, so the served document contains real copy, metadata and theme
 * tokens rather than placeholders filled in by client-side JavaScript.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import { defineConfig, type Plugin } from "vite";
import { siteConfig } from "./src/config/site.ts";
import { buildHeadTags, buildPreloadTags, buildThemeCss, escapeHtml } from "./src/config/theme.ts";
import {
  buildAvatarMarkup,
  buildContactMarkup,
  buildDialogMarkup,
  buildFooterMarkup,
  buildLaunchMarkup,
  buildMotionToggleMarkup,
  buildSocialMarkup,
  buildSurfaceMarkup,
  buildTapeMarkup,
} from "./src/config/markup.ts";
import { validateSiteConfig } from "./src/config/validate.ts";

function siteConfigPlugin(): Plugin {
  return {
    name: "under-construction:site-config",
    enforce: "pre",
    config() {
      // Fail loudly and early on a malformed config rather than shipping a
      // broken page. Soft issues (placeholders you have not filled in yet) are
      // printed as reminders and never block the build.
      const { warnings } = validateSiteConfig(siteConfig);
      for (const warning of warnings) {
        console.warn(`\u001b[33m[under-construction]\u001b[0m ${warning}`);
      }
      return {};
    },
    transformIndexHtml: {
      order: "pre",
      handler(html: string) {
        const replacements: Record<string, string> = {
          "<!--@head-->": buildHeadTags(siteConfig),
          "<!--@preload-->": buildPreloadTags(siteConfig),
          "<!--@theme-->": `\n${buildThemeCss(siteConfig)}    `,
          "<!--@surface-->": buildSurfaceMarkup(siteConfig),
          "<!--@avatar-->": buildAvatarMarkup(siteConfig),
          "<!--@headline-->": escapeHtml(siteConfig.content.headline),
          "<!--@subheadline-->": escapeHtml(siteConfig.content.subheadline),
          "<!--@statusText-->": escapeHtml(siteConfig.content.statusText),
          "<!--@launch-->": buildLaunchMarkup(siteConfig),
          "<!--@contact-->": buildContactMarkup(siteConfig),
          "<!--@social-->": buildSocialMarkup(siteConfig),
          "<!--@footer-->": buildFooterMarkup(siteConfig),
          "<!--@tape-->": buildTapeMarkup(siteConfig),
          "<!--@motionToggle-->": buildMotionToggleMarkup(siteConfig),
          "<!--@dialog-->": buildDialogMarkup(siteConfig),
          "%%LANG%%": escapeHtml(siteConfig.seo.language || "en"),
        };
        let output = html;
        for (const [token, value] of Object.entries(replacements)) {
          output = output.split(token).join(value);
        }
        // Collapse the blank lines left behind by disabled sections.
        return output.replace(/\n[ \t]*\n(?=[ \t]*\n)/g, "\n");
      },
    },
  };
}

export default defineConfig({
  plugins: [siteConfigPlugin()],
  build: {
    target: "es2022",
    // Three.js is loaded lazily; a slightly higher warning limit keeps the
    // build output quiet for the one intentionally large chunk.
    chunkSizeWarningLimit: 700,
  },
  server: {
    host: "127.0.0.1",
  },
  preview: {
    host: "127.0.0.1",
  },
});
