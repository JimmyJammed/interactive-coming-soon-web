/**
 * Type definitions for the Interactive Under Construction template configuration.
 *
 * You normally do not need to edit this file. Edit `src/config/site.ts` instead —
 * it is the single place where every common customization lives.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

/** A single social or external link rendered under the contact button. */
export interface SocialLink {
  /** Accessible label, e.g. "GitHub". Also used as the visible text. */
  label: string;
  /** Destination URL, e.g. "https://github.com/your-handle". */
  href: string;
  /**
   * Icon to render. Either the name of a built-in icon, or a raw inline SVG
   * string (must be a complete `<svg>…</svg>` element).
   * Built-ins: "github" | "linkedin" | "x" | "instagram" | "mail" | "globe" | "dribbble" | "youtube".
   * Omit for a text-only link.
   */
  icon?: BuiltInIcon | { svg: string };
}

export type BuiltInIcon =
  | "github"
  | "linkedin"
  | "x"
  | "instagram"
  | "mail"
  | "globe"
  | "dribbble"
  | "youtube";

/** How the contact form actually delivers a message. */
export type ContactMode = "none" | "mailto" | "formspree" | "endpoint";

export interface ContactConfig {
  /**
   * "none"      — hide the contact affordance entirely.
   * "mailto"    — the button is a plain mail link; no dialog, no backend, no JS required.
   * "formspree" — POST to a Formspree form (https://formspree.io). Set `formspreeId`.
   * "endpoint"  — POST JSON to your own URL. Set `endpoint`.
   */
  mode: ContactMode;
  /** Address used by "mailto" mode, and as the no-JavaScript fallback in every other mode. */
  email: string;
  /** Formspree form id, the last path segment of your form URL (e.g. "xyzabcd"). */
  formspreeId?: string;
  /** Absolute or relative URL that receives `{ name, email, message, verificationToken }` as JSON. */
  endpoint?: string;
  /**
   * Optional Cloudflare Turnstile site key. When set, the dialog renders a
   * Turnstile widget and will not send until it is solved. Leave empty to skip
   * verification. The matching secret key belongs on your server, never here.
   */
  turnstileSiteKey?: string;
  /** Italic invitation above the button, e.g. "Have something in mind?". */
  prompt: string;
  /** Text on the button itself, e.g. "Let's talk". */
  buttonLabel: string;
  /** Small uppercase line at the top of the dialog. */
  dialogEyebrow: string;
  /** Dialog heading. */
  dialogTitle: string;
  /** One-line dialog introduction. */
  dialogIntro: string;
  /** Shown after a message is delivered successfully. */
  successMessage: string;
}

export interface LaunchConfig {
  /**
   * Target launch moment as an ISO 8601 string, e.g. "2026-12-01T09:00:00Z".
   * Set to `null` to hide launch messaging entirely.
   */
  date: string | null;
  /** Show a live countdown (days / hours / minutes) when `date` is set. */
  showCountdown: boolean;
  /** Label above the countdown, e.g. "Launching in". */
  countdownLabel: string;
  /** Replaces the countdown once `date` has passed. */
  afterLaunchText: string;
}

export interface ThemeColors {
  /** Page background. */
  background: string;
  /** Translucent wash laid over the background texture; use an 8-digit hex for alpha. */
  backgroundWash: string;
  /** Default body text. */
  text: string;
  /** Headline text. */
  headline: string;
  /** Subheadline / status text. */
  subheadline: string;
  /** Muted secondary text (prompt, footnotes). */
  muted: string;
  /** Primary call-to-action fill. */
  accent: string;
  /** Call-to-action fill on hover. */
  accentHover: string;
  /** Text drawn on top of `accent`. */
  accentContrast: string;
  /** Border under the call to action. */
  accentBorder: string;
  /** Focus ring colour. Must contrast against `background`. */
  focusRing: string;
  /** Dark stripe colour in the hazard tape. */
  tapeDark: string;
  /** Bright stripe colour in the hazard tape. */
  tapeBright: string;
  /** Dialog surface. */
  dialogSurface: string;
  /** Dialog border. */
  dialogBorder: string;
  /** Dialog backdrop; use an 8-digit hex for alpha. */
  dialogBackdrop: string;
  /** Form input background. */
  inputSurface: string;
  /** Form input border. */
  inputBorder: string;
  /** Validation error text and borders. */
  error: string;
  /** Success banner background. */
  successSurface: string;
  /** Success banner text. */
  successText: string;
}

export interface FontFace {
  /** CSS family name you will refer to, e.g. "Display". */
  family: string;
  /**
   * Path to a self-hosted font file under `public/`, e.g. "/fonts/my-font.woff2".
   * Set to `null` to skip the @font-face rule and use `stack` alone (handy for
   * system fonts or a font you load yourself via a `<link>` in index.html).
   */
  file: string | null;
  /** Format hint for the file. */
  format?: "woff2" | "woff" | "truetype" | "opentype";
  weight?: number | string;
  style?: "normal" | "italic";
  /** Fallback stack appended after `family`, e.g. 'Impact, "Arial Black", sans-serif'. */
  stack: string;
  /** Preload the file in `<head>`. Only do this for fonts visible immediately. */
  preload?: boolean;
}

export interface ThemeFonts {
  /** Headline and subheadline. */
  display: FontFace;
  /** Buttons, labels, form chrome. */
  ui: FontFace;
  /** Body copy and inputs. */
  body: FontFace;
  /** The italic invitation line above the contact button. */
  accentSerif: FontFace;
}

export interface BackgroundLayer {
  /** Render this layer at all. */
  enabled: boolean;
  /** Layer opacity, 0–1. */
  opacity: number;
}

/**
 * A decorative image with responsive candidates. The browser downloads exactly
 * one file per layer, choosing by viewport width and screen density.
 */
export interface ResponsiveImage {
  /**
   * Candidate files with their intrinsic pixel widths. List them smallest
   * first. `avif` is optional; browsers without AVIF support fall back to webp.
   */
  sources: { webp: string; avif?: string; width: number }[];
  /** Intrinsic pixel dimensions of the artwork, used to reserve layout space. */
  width: number;
  height: number;
}

export interface BackgroundConfig {
  /** Repeating surface texture behind everything. */
  texture: {
    enabled: boolean;
    /** Tile size in CSS pixels. Must match the 1x asset's intended density. */
    tileSize: number;
    /** 1x / 2x / 3x sources. Any entry may be omitted. */
    sources: { avif?: string; webp?: string; density: 1 | 2 | 3 }[];
  };
  /** Decorative crack decals anchored to the left and right edges. */
  cracks: BackgroundLayer & { left: ResponsiveImage; right: ResponsiveImage };
  /** Decorative tyre-tread decals in the lower corners. */
  treads: BackgroundLayer & { image: ResponsiveImage };
  /** Diagonal hazard tape across the top-right and bottom edges (a CSS background). */
  tape: BackgroundLayer & { image: string; avif?: string };
}

export interface AvatarConfig {
  /** Render the interactive 3D layer at all. When false only the still image shows. */
  enabled: boolean;
  /** Path to the glTF binary under `public/`, e.g. "/avatar/construction-worker.glb". */
  model: string;
  /** Still image shown before the model loads and whenever 3D is unavailable. */
  still: string;
  /** Intrinsic pixel size of the still image, used to reserve layout space. */
  stillWidth: number;
  stillHeight: number;
  /** Alternative text describing the avatar, for screen readers. */
  alt: string;
  /**
   * The model is uniformly scaled so its longest axis equals this many world
   * units, then this multiplier is applied. 1 keeps the tuned default framing.
   */
  scale: number;
  /** Extra offset in world units after centring. Positive y moves the model up. */
  position: { x: number; y: number; z: number };
  /** Static rotation in radians, applied before any animation. */
  rotation: { x: number; y: number; z: number };
  /**
   * Names of the two eye pivot objects inside the model. Both must exist for
   * gaze animation; if either is missing the template falls back to the still
   * image. Set `requireEyes: false` to render a model that has no eye rig.
   */
  eyeNodes: { left: string; right: string };
  /** Require the eye pivots. Set false when using a model without an eye rig. */
  requireEyes: boolean;
}

export interface LightingConfig {
  /** Tone-mapping exposure. Higher is brighter. */
  exposure: number;
  /** Strength of the neutral room environment reflection, 0–1+. */
  environmentIntensity: number;
  key: { color: string; intensity: number; position: { x: number; y: number; z: number } };
  fill: { color: string; intensity: number; position: { x: number; y: number; z: number } };
  rim: { color: string; intensity: number; position: { x: number; y: number; z: number } };
}

export interface AnimationConfig {
  /** Master switch for all avatar motion. */
  enabled: boolean;
  /**
   * Scales how far the head and eyes travel. 0 is perfectly still,
   * 1 is the tuned default, 1.5 is noticeably livelier.
   */
  intensity: number;
  /** Multiplies the pace of the idle choreography. 1 is the tuned default. */
  speed: number;
  /** Follow a fine pointer (mouse/pen). Touch never drives gaze. */
  pointerTracking: boolean;
  /** Seconds of pointer stillness before autonomous idle motion resumes. */
  idleAfterSeconds: number;
  /** Show the floating pause / play control. */
  showMotionToggle: boolean;
  /**
   * Honour `prefers-reduced-motion: reduce` by starting paused. Leave this on:
   * turning it off degrades accessibility for motion-sensitive visitors.
   */
  respectReducedMotion: boolean;
  /** Start paused for visitors whose browser reports Save-Data. */
  respectSaveData: boolean;
  /** Frame cap on wide viewports and on narrow viewports. */
  maxFps: { desktop: number; mobile: number };
}

export interface SeoConfig {
  /** `<title>`. Also used as the Open Graph title unless `ogTitle` is set. */
  title: string;
  /** `<meta name="description">`. */
  description: string;
  /** Absolute canonical URL, e.g. "https://example.com/". Empty string omits the tag. */
  canonicalUrl: string;
  /** Document language for `<html lang>`. */
  language: string;
  /** Browser UI theme colour. */
  themeColor: string;
  /** Override the Open Graph title. Defaults to `title`. */
  ogTitle?: string;
  /** Override the Open Graph description. Defaults to `description`. */
  ogDescription?: string;
  /** Absolute URL of the social share image (1200×630 recommended). */
  ogImage: string;
  /** Alt text for the share image. */
  ogImageAlt: string;
  /** Site name in Open Graph output. */
  ogSiteName: string;
  /** Twitter card style. */
  twitterCard: "summary" | "summary_large_image";
  /** Optional @handle for Twitter/X attribution. */
  twitterSite?: string;
  /**
   * `<meta name="robots">`. "index, follow" is normal.
   * Use "noindex, nofollow" while the placeholder should stay out of search.
   */
  robots: string;
}

export interface FaviconConfig {
  /** Classic multi-size .ico. */
  ico: string;
  /** PNG icons with their pixel sizes. */
  png: { href: string; size: number }[];
  /** 180×180 Apple touch icon. */
  appleTouchIcon: string;
  /** Optional SVG icon. */
  svg?: string;
}

export interface SiteConfig {
  content: {
    /** The big stencil headline. Keep it short — it is sized to stay on one line. */
    headline: string;
    /** The line under the avatar. */
    subheadline: string;
    /** A short reassurance shown on its own line under the subheadline. */
    statusText: string;
    /** Optional small footer line. Empty string hides it. */
    footerText: string;
  };
  launch: LaunchConfig;
  contact: ContactConfig;
  social: SocialLink[];
  theme: { colors: ThemeColors; fonts: ThemeFonts };
  background: BackgroundConfig;
  avatar: AvatarConfig;
  lighting: LightingConfig;
  animation: AnimationConfig;
  seo: SeoConfig;
  favicon: FaviconConfig;
}
