/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DEMO CONFIGURATION — public hosted example.
 *
 *  This is the configuration used for the public marketing demo at
 *  hickman.biz/portfolio/interactive-under-construction. scripts/build-demo.sh copies it
 *  over src/config/site.ts in a throwaway build directory.
 *
 *  The customer's copy of this file is products/<slug>/source/src/config/site.ts
 *  and keeps neutral placeholder values.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Original header follows.
 *
 *  EDIT THIS FILE.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  This is the single place where every common customization lives: copy,
 *  colours, fonts, the 3D avatar, lighting, animation, contact delivery, SEO
 *  and icons. You should not need to open any other source file to launch.
 *
 *  Full field-by-field reference: docs/CUSTOMIZATION.md
 *  Type definitions and inline docs: src/config/types.ts
 *
 *  Interactive Under Construction — a Falcon Forged digital product.
 *  Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 *  Licensed, not sold. See LICENSE.md.
 */

import type { SiteConfig } from "./types.ts";

export const siteConfig: SiteConfig = {
  // ───────────────────────────────────────────────────────────── CONTENT ────
  content: {
    headline: "Under Construction",
    subheadline: "Big ideas. A little dust. We're building something seriously cool.",
    statusText: "Check back soon!",
    footerText:
      "Live demo of Interactive Under Construction — a Falcon Forged website template. " +
      "Move your cursor over the character, or leave the page alone and watch him work.",
  },

  // ────────────────────────────────────────────────────────────── LAUNCH ────
  // Set `date` to an ISO 8601 string to show launch messaging, or null to hide it.
  launch: {
    date: null, // e.g. "2026-12-01T09:00:00Z"
    showCountdown: true,
    countdownLabel: "Launching in",
    afterLaunchText: "We're live.",
  },

  // ───────────────────────────────────────────────────────────── CONTACT ────
  // mode: "none" | "mailto" | "formspree" | "endpoint"
  // See docs/CUSTOMIZATION.md § Contact for the trade-offs of each.
  contact: {
    mode: "mailto",
    email: "hello@falconforged.com",
    formspreeId: "", // e.g. "xyzabcd" — used when mode is "formspree"
    endpoint: "", // e.g. "/api/contact" — used when mode is "endpoint"
    turnstileSiteKey: "", // optional Cloudflare Turnstile site key
    prompt: "Want this template?",
    buttonLabel: "Get the template",
    dialogEyebrow: "Open for good ideas",
    dialogTitle: "Let's build something.",
    dialogIntro: "A big idea, a small question, or a simple hello.",
    successMessage: "Message sent. Thanks for reaching out — we'll be in touch soon!",
  },

  // ────────────────────────────────────────────────────────────── SOCIAL ────
  // Rendered as a small row under the contact button. Empty array hides the row.
  social: [
    // { label: "GitHub", href: "https://github.com/your-handle", icon: "github" },
    // { label: "LinkedIn", href: "https://linkedin.com/in/your-handle", icon: "linkedin" },
  ],

  // ─────────────────────────────────────────────────────────────── THEME ────
  theme: {
    colors: {
      background: "#f5f2eb",
      backgroundWash: "#f5f2eb80",
      text: "#22211d",
      headline: "#22211d",
      subheadline: "#302e27",
      muted: "#514c41",
      accent: "#f4c332",
      accentHover: "#ffcf42",
      accentContrast: "#24231e",
      accentBorder: "#a77e1690",
      focusRing: "#a86c00",
      tapeDark: "#26251f",
      tapeBright: "#f4c332",
      dialogSurface: "#f7f4ed",
      dialogBorder: "#b6ae9b",
      dialogBackdrop: "#24221bd1",
      inputSurface: "#fffdf9",
      inputBorder: "#c7c0b0",
      error: "#9c3424",
      successSurface: "#e8eddf",
      successText: "#34532d",
    },
    fonts: {
      display: {
        family: "Display",
        file: "/fonts/black-ops-one-latin.woff2",
        format: "woff2",
        weight: 400,
        style: "normal",
        stack: 'Impact, "Arial Black", sans-serif',
        preload: true,
      },
      ui: {
        family: "UI",
        file: "/fonts/chakra-petch-600-latin.woff2",
        format: "woff2",
        weight: 600,
        style: "normal",
        stack: '"Arial Narrow", sans-serif',
        preload: true,
      },
      body: {
        family: "Body",
        file: null, // system stack; no download
        stack: "Arial, Helvetica, sans-serif",
      },
      accentSerif: {
        family: "AccentSerif",
        file: null, // system stack; no download
        style: "italic",
        stack: 'Georgia, "Times New Roman", serif',
      },
    },
  },

  // ────────────────────────────────────────────────────────── BACKGROUND ────
  background: {
    texture: {
      enabled: true,
      tileSize: 418,
      sources: [
        { avif: "/images/wallpaper/concrete-418.avif", webp: "/images/wallpaper/concrete-418.webp", density: 1 },
        { avif: "/images/wallpaper/concrete-836.avif", webp: "/images/wallpaper/concrete-836.webp", density: 2 },
        { avif: "/images/wallpaper/concrete-1254.avif", webp: "/images/wallpaper/concrete-1254.webp", density: 3 },
      ],
    },
    cracks: {
      enabled: true,
      opacity: 0.55,
      left: {
        width: 1024,
        height: 1536,
        sources: [
          { webp: "/images/wallpaper/crack-left-512.webp", avif: "/images/wallpaper/crack-left-512.avif", width: 512 },
          { webp: "/images/wallpaper/crack-left-1024.webp", avif: "/images/wallpaper/crack-left-1024.avif", width: 1024 },
        ],
      },
      right: {
        width: 1024,
        height: 1536,
        sources: [
          { webp: "/images/wallpaper/crack-right-512.webp", avif: "/images/wallpaper/crack-right-512.avif", width: 512 },
          { webp: "/images/wallpaper/crack-right-1024.webp", avif: "/images/wallpaper/crack-right-1024.avif", width: 1024 },
        ],
      },
    },
    treads: {
      enabled: true,
      opacity: 0.35,
      image: {
        width: 1024,
        height: 1536,
        sources: [
          { webp: "/images/wallpaper/tread-768.webp", avif: "/images/wallpaper/tread-768.avif", width: 768 },
          { webp: "/images/wallpaper/tread-1024.webp", avif: "/images/wallpaper/tread-1024.avif", width: 1024 },
        ],
      },
    },
    tape: {
      enabled: true,
      opacity: 1,
      image: "/images/wallpaper/caution-strip.webp",
      avif: "/images/wallpaper/caution-strip.avif",
    },
  },

  // ────────────────────────────────────────────────────────────── AVATAR ────
  // Replacing the model? See docs/CUSTOMIZATION.md § 3D avatar first — the
  // template expects two named eye pivots for gaze animation.
  avatar: {
    enabled: true,
    model: "/avatar/construction-worker.glb",
    still: "/avatar/construction-worker.webp",
    stillWidth: 608,
    stillHeight: 912,
    alt: "A 3D construction worker wearing a yellow hardhat and safety glasses",
    scale: 1,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    eyeNodes: { left: "Eye_Left", right: "Eye_Right" },
    requireEyes: true,
  },

  // ──────────────────────────────────────────────────────────── LIGHTING ────
  lighting: {
    exposure: 0.9,
    environmentIntensity: 0.45,
    key: { color: "#ffe5c9", intensity: 1.6, position: { x: -3, y: 4, z: 5 } },
    fill: { color: "#e0edff", intensity: 0.75, position: { x: 4, y: 1, z: 4 } },
    rim: { color: "#ffedce", intensity: 1.3, position: { x: 2, y: 3, z: -3 } },
  },

  // ─────────────────────────────────────────────────────────── ANIMATION ────
  animation: {
    enabled: true,
    intensity: 1,
    speed: 1,
    pointerTracking: true,
    idleAfterSeconds: 3,
    showMotionToggle: true,
    respectReducedMotion: true,
    respectSaveData: true,
    maxFps: { desktop: 60, mobile: 30 },
  },

  // ───────────────────────────────────────────────────────────────── SEO ────
  seo: {
    title: "Interactive Under Construction — Live Demo | Falcon Forged",
    description:
      "Live demo of Interactive Under Construction: an animated 3D coming-soon page " +
      "template. A real-time WebGL character tracks your cursor and performs on its own.",
    canonicalUrl: "https://hickman.biz/portfolio/interactive-under-construction/",
    language: "en",
    themeColor: "#f5f2eb",
    ogImage: "https://hickman.biz/portfolio/interactive-under-construction/og-image.png",
    ogImageAlt: "Interactive Under Construction — an animated 3D coming-soon page template",
    ogSiteName: "Falcon Forged",
    twitterCard: "summary_large_image",
    robots: "index, follow",
  },

  // ───────────────────────────────────────────────────────────── FAVICON ────
  favicon: {
    ico: "/favicon.ico",
    png: [
      { href: "/icons/construction-avatar-32.png", size: 32 },
      { href: "/icons/construction-avatar-96.png", size: 96 },
    ],
    appleTouchIcon: "/apple-touch-icon.png",
    svg: "/favicon.svg",
  },
};

export default siteConfig;
