# Customization

Everything below is edited in **`src/config/site.ts`**. Field types and inline
documentation live in `src/config/types.ts`; your editor reads them, so
autocomplete will show you the valid values as you type.

The config is checked when you build. A genuine mistake — an unusable colour, a
model path that cannot resolve, an out-of-range animation value — stops the
build and tells you which field and why. Unfilled placeholders only print a
yellow reminder.

**Contents**
[Branding](#branding) · [Typography](#typography) · [Content](#content) ·
[Launch countdown](#launch-countdown) · [Icons](#icons) ·
[3D avatar](#3d-avatar) · [Lighting](#lighting) · [Animations](#animations) ·
[Contact](#contact) · [Social links](#social-links) · [SEO](#seo) ·
[Responsive design](#responsive-design) · [Beyond the config](#beyond-the-config)

---

## Branding

### Colours

All colours live in `theme.colors`. Each becomes a CSS custom property named
`--uc-<kebab-case-name>`, generated into the page `<head>` at build time.

Any CSS colour works: hex (`#f4c332`), 8-digit hex with alpha (`#f5f2eb80`),
`rgb()`, `hsl()`, `oklch()`, or a named colour.

| Field | Controls |
| --- | --- |
| `background` | The page background |
| `backgroundWash` | A translucent wash over the concrete texture. **Use 8-digit hex** — the alpha is what softens the texture. |
| `text` | Default body text, and the send button fill |
| `headline` | The big stencil headline |
| `subheadline` | The line under the avatar |
| `muted` | Secondary text: the invitation, social links, footnotes |
| `accent` | The call-to-action fill and the dialog's top stripe |
| `accentHover` | Call-to-action on hover |
| `accentContrast` | Text drawn on `accent` — **this is the one to get right for contrast** |
| `accentBorder` | Border and drop shadow under the call to action |
| `focusRing` | Keyboard focus outline. Must be clearly visible against `background`. |
| `tapeDark` / `tapeBright` | The diagonal stripes on the dialog header |
| `dialogSurface`, `dialogBorder`, `dialogBackdrop` | The contact dialog |
| `inputSurface`, `inputBorder` | Form fields |
| `error` | Validation messages and invalid field borders |
| `successSurface`, `successText` | The "message sent" banner |

The dialog's smaller greys are derived from these with `color-mix()`, so a
recoloured palette stays coherent without your editing them individually.

**Going dark.** Swap the light values for dark ones and keep the relationships:

```ts
background: "#0f1115",
backgroundWash: "#0f1115cc",   // heavier wash — the texture is light artwork
text: "#e8e6e1",
headline: "#ffffff",
subheadline: "#d6d3cc",
muted: "#9c988e",
accent: "#4ade80",
accentHover: "#6ee7a0",
accentContrast: "#06210f",
accentBorder: "#2f7a4d90",
focusRing: "#7dd3a0",
dialogSurface: "#171a20",
dialogBorder: "#2c313a",
dialogBackdrop: "#05070ad9",
inputSurface: "#10131a",
inputBorder: "#333944",
```

The background texture is pale, so on a dark theme either raise the wash alpha
or turn the texture off (`background.texture.enabled: false`).

> **Check your contrast.** Body text should hit 4.5:1 against its background,
> large headline text 3:1. Paste your pair into
> [WebAIM's contrast checker](https://webaim.org/resources/contrastchecker/).
> The shipped palette passes; a careless recolour may not.

### Background layers

Four independent layers under `background`. Each can be switched off on its own.

```ts
background: {
  texture: { enabled: true, tileSize: 418, sources: [ /* 1x, 2x, 3x */ ] },
  cracks:  { enabled: true, opacity: 0.55, left: { … }, right: { … } },
  treads:  { enabled: true, opacity: 0.35, image: { … } },
  tape:    { enabled: true, opacity: 1, image: "…", avif: "…" },
},
```

- **A clean, plain background:** set `enabled: false` on all four. The layout,
  typography and avatar are unaffected.
- **Softer decoration:** lower `opacity` on `cracks` and `treads`.
- **Your own texture:** drop the file in `public/images/wallpaper/`, point
  `sources` at it, and set `tileSize` to the **1× intrinsic width in CSS
  pixels** — that is what makes it tile at the right scale. Provide 2× and 3×
  variants if you have them; each entry may supply `avif`, `webp` or both, and
  the browser downloads exactly one file.
- **Crack and tread decals** take a `sources` array of `{ webp, avif?, width }`
  ordered smallest first, plus the artwork's intrinsic `width` and `height`.
  Those two reserve layout space and prevent shift while the image loads.

### Logo

There is no logo slot by default — the headline is the brand. To add one, put
the file in `public/`, then add an `<img>` above the `<h1>` in `index.html` and
style it in `src/style.css`. Keep it inside `.composition` so it inherits the
centred grid.

---

## Typography

Four roles under `theme.fonts`:

| Role | Used for |
| --- | --- |
| `display` | Headline, subheadline, dialog heading |
| `ui` | Buttons, labels, form chrome, social links, countdown label |
| `body` | Body copy and form inputs |
| `accentSerif` | The italic invitation above the contact button |

Each takes:

```ts
display: {
  family: "Display",                          // the name you refer to it by
  file: "/fonts/black-ops-one-latin.woff2",   // or null for a system stack
  format: "woff2",
  weight: 400,
  style: "normal",
  stack: 'Impact, "Arial Black", sans-serif', // fallback if the file fails
  preload: true,                              // only for immediately visible text
},
```

### Using your own font

1. Put the file in `public/fonts/`. **WOFF2** — it is 30–50% smaller than TTF.
2. Point `file` at it and set `format`, `weight` and `style` to match.
3. Give it a sensible `stack` — that is what renders if the download fails.
4. Delete the font you replaced, **and its `OFL.txt`** if nothing else uses it.
5. Record the new font's licence in `THIRD_PARTY_LICENSES.md`.

### Using a system font (no download at all)

```ts
body: {
  family: "Body",
  file: null,
  stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
},
```

`file: null` emits no `@font-face` rule and downloads nothing.

### Using Google Fonts from their CDN

Self-hosting is faster and avoids a third-party request, which is why the
template ships that way. If you would rather link the CDN, add the `<link>` tags
to `index.html`, then set `file: null` and put the font first in `stack`.

### Sizes and weights

Sizes are fluid `clamp()` values in `src/style.css` — they scale with the
viewport, so there are no size fields in the config. To change them, edit the
`font-size` on `h1`, `.details .subtitle`, `.contact-prompt` and
`.contact-heading h2`. The pattern is
`clamp(minimum, preferred-vw, maximum)`.

> The headline is `white-space: nowrap` and sized to stay on one line. A much
> longer headline will shrink hard on narrow screens. If yours is long, either
> shorten it or remove the `white-space: nowrap` from `h1`.

---

## Content

```ts
content: {
  headline: "Under Construction",       // short — it stays on one line
  subheadline: "Big ideas. A little dust. We're building something seriously cool.",
  statusText: "Check back soon!",       // its own line under the subheadline
  footerText: "",                       // empty hides the footer entirely
},
```

All of it is escaped and rendered into the HTML at build time, so it is present
for search engines and readable with JavaScript off. You cannot inject markup
through these fields — that is deliberate.

Dialog copy lives in `contact` (`dialogEyebrow`, `dialogTitle`, `dialogIntro`,
`successMessage`), and the button and invitation in `contact.prompt` and
`contact.buttonLabel`.

---

## Launch countdown

Off by default. Set a date to turn it on:

```ts
launch: {
  date: "2026-12-01T09:00:00Z",   // ISO 8601. null hides all launch messaging.
  showCountdown: true,
  countdownLabel: "Launching in",
  afterLaunchText: "We're live.",
},
```

- Reads "3 days, 4 hours, 12 minutes" and updates once a minute — no per-second
  repaint, nothing to throttle.
- Announced politely to screen readers via `aria-live`, and the target is
  emitted as a machine-readable `<time datetime>`.
- Once the date passes it shows `afterLaunchText` and stops.
- `showCountdown: false` with a date set shows the date alone.
- **The countdown reflects the visitor's own clock.** Use a UTC (`Z`) timestamp
  or an explicit offset so it means the same thing everywhere.

---

## Icons

### Favicons

```ts
favicon: {
  ico: "/favicon.ico",
  png: [
    { href: "/icons/construction-avatar-32.png", size: 32 },
    { href: "/icons/construction-avatar-96.png", size: 96 },
  ],
  appleTouchIcon: "/apple-touch-icon.png",   // 180 × 180, opaque
  svg: "/favicon.svg",
},
```

Replace the files in `public/` and `public/icons/`, keeping the same names, and
nothing else needs to change. Different names are fine — just update the paths.
Generating a full set from one square image with a tool like
[RealFaviconGenerator](https://realfavicongenerator.net) is the least painful
route.

Remove any line whose file you delete — a missing icon is a 404 on every page
load.

### Interface icons

The arrow, close, pause and play glyphs are inline SVG paths in
`src/config/markup.ts`. They inherit `currentColor`, so they follow your
palette automatically. To change one, swap its `<path d="…">` for a 24 × 24
viewBox path.

### Social icons

Eight are built in: `github`, `linkedin`, `x`, `instagram`, `mail`, `globe`,
`dribbble`, `youtube`. For anything else, pass raw SVG — see
[Social links](#social-links).

**Licensing:** every icon in the template was drawn for it and carries no
attribution requirement. If you paste in icons from Font Awesome, Feather,
Simple Icons or similar, check that set's licence and record it in
`THIRD_PARTY_LICENSES.md`. Brand marks (GitHub, X, LinkedIn…) also carry the
brand owner's own usage guidelines.

---

## 3D avatar

### Where it lives

| File | What it is |
| --- | --- |
| `public/avatar/construction-worker.glb` | The model — glTF binary, Meshopt-compressed, WebP textures, ~4.1 MB |
| `public/avatar/construction-worker.webp` | The static portrait shown before it loads and whenever 3D is unavailable — 608 × 912, ~49 KB |

### Configuration

```ts
avatar: {
  enabled: true,                       // false = still image only, no three.js at all
  model: "/avatar/construction-worker.glb",
  still: "/avatar/construction-worker.webp",
  stillWidth: 608,
  stillHeight: 912,
  alt: "A 3D construction worker wearing a yellow hardhat and safety glasses",
  scale: 1,                            // multiplier on the auto-fit size
  position: { x: 0, y: 0, z: 0 },      // world units, applied after centring
  rotation: { x: 0, y: 0, z: 0 },      // radians
  eyeNodes: { left: "Eye_Left", right: "Eye_Right" },
  requireEyes: true,
},
```

**How framing works.** The model is auto-centred and uniformly scaled so its
longest axis is a fixed size, then `scale` is applied. So `scale` is a nudge,
not an absolute size — a model twice as large in its source file still arrives
at the same on-screen size. Start at `1`; `0.9` and `1.1` are meaningful moves.

- `position.y` positive moves the model **up**.
- `rotation.y` of `0.3` turns it slightly to its left. Radians, not degrees —
  `Math.PI / 4` is 45°.

### Replacing the model

1. Export or download a **`.glb`** (glTF binary). Separate `.gltf` + `.bin` +
   textures is not supported.
2. Put it in `public/avatar/` and point `model` at it.
3. **Decide about the eye rig.** Gaze animation needs two named pivot objects,
   one per eye, each parented above the eye mesh so rotating the pivot rotates
   the eye.
   - Your model has them under different names → set
     `eyeNodes: { left: "…", right: "…" }`.
   - Your model has no eye rig → set `requireEyes: false`. The head still turns,
     surveys and nods; only the independent eye movement is lost. This looks
     fine, and is the right choice for a stylized or non-humanoid model.
   - Leaving `requireEyes: true` with a model that lacks the pivots is a
     deliberate hard failure: the build succeeds, but at runtime the page falls
     back to the still image and logs which node names it could not find.
4. **Replace the still image too.** Render your model on a transparent
   background at roughly 608 × 912, save as WebP, and update `still`,
   `stillWidth` and `stillHeight`. This is what visitors without WebGL see — a
   mismatch here is the most visible way to get this wrong.
5. Update `alt` to describe the new model.
6. Adjust `scale`, `position` and `rotation` until the framing looks right.
7. Record the model's licence in `THIRD_PARTY_LICENSES.md`.

### Keeping it fast

The shipped model is ~4.1 MB, which is on the large side; it loads lazily, after
the page is already complete and readable. If yours is larger, run it through
[gltf-transform](https://gltf-transform.dev):

```bash
npx @gltf-transform/cli optimize input.glb output.glb --texture-size 2048
```

Meshopt compression and WebP textures typically cut a raw export by 60–80%.

> **Camera framing metadata.** The shipped model carries measured framing bounds
> in `scene.extras.avatarFraming`, which lets the camera fit it tightly on any
> aspect ratio. A model without that metadata falls back to a slightly more
> conservative bounding-box calculation — everything still works, the framing is
> just marginally looser.

### Turning 3D off entirely

```ts
avatar: { enabled: false, /* … */ }
```

The still image becomes the finished page, three.js is never downloaded, and the
pause control disappears. This is a legitimate, much lighter configuration.

---

## Lighting

Three directional lights plus a neutral room environment.

```ts
lighting: {
  exposure: 0.9,               // tone-mapping exposure — overall brightness
  environmentIntensity: 0.45,  // soft ambient reflection, 0–1+
  key:  { color: "#ffe5c9", intensity: 1.6,  position: { x: -3, y: 4, z: 5 } },
  fill: { color: "#e0edff", intensity: 0.75, position: { x: 4, y: 1, z: 4 } },
  rim:  { color: "#ffedce", intensity: 1.3,  position: { x: 2, y: 3, z: -3 } },
},
```

- **key** — the main light. Warm, upper-left.
- **fill** — softens the shadow side. Cool, right. Deliberately weaker.
- **rim** — behind the subject; separates it from the background.

Positions are directions, not distances: a directional light shines from that
point toward the origin. Moving it further out changes nothing but the angle.

Recipes:

- **Brighter overall** — raise `exposure` to `1.0–1.1` before touching
  individual lights.
- **Cooler / more clinical** — make `key` neutral (`#ffffff`) and raise
  `environmentIntensity` to `0.7`.
- **More dramatic** — drop `fill.intensity` to `0.3` and raise
  `rim.intensity` to `1.8`.
- **Flat, even, no drama** — raise `environmentIntensity` to `1.0` and lower all
  three intensities to about `0.5`.

A different model, with different materials, will want different values. Change
one at a time and watch.

---

## Animations

### What is actually animating

There is no animation library. The choreography is a small hand-written state
machine in `src/avatar-performance.ts`, driven by three.js's render loop:

- **Pointer tracking.** A fine pointer (mouse or pen) is followed: eyes acquire
  the target quickly, the head follows more slowly. Touch never drives gaze —
  taps and scrolling would make it twitch.
- **Idle choreography.** After `idleAfterSeconds` without pointer movement, it
  eases into autonomous motion: **sixteen** distinct looks — edge checks,
  diagonal glances, surveys, nods and tilts — dealt from a shuffled deck so all
  sixteen play before any repeats, with the order and timing varied each pass.
  Each holds 6.2–9.4 seconds. Interacting does not restart the sequence.
- **Micro-motion.** A slow breathing oscillation, always present.
- **CSS transitions** for the crossfade from still image to canvas, and for the
  button hover states.

### Tuning it

```ts
animation: {
  enabled: true,
  intensity: 1,               // 0 = still, 1 = default, 1.5 = livelier
  speed: 1,                   // pace of the idle sequence
  pointerTracking: true,
  idleAfterSeconds: 3,
  showMotionToggle: true,
  respectReducedMotion: true,
  respectSaveData: true,
  maxFps: { desktop: 60, mobile: 30 },
},
```

- **`intensity`** scales how far the head and eyes travel. The internal safety
  clamps are fixed, so even a high value cannot push the rig past its verified
  range — the eyes stay inside their lids. `0.5` is subtle; `1.5` is animated;
  above `2` mostly hits the clamps.
- **`speed`** multiplies the pace of the idle sequence. `0.7` is contemplative,
  `1.4` is restless.
- **`pointerTracking: false`** leaves it performing on its own and ignoring the
  cursor. Useful for a kiosk or a page you expect to be watched, not used.
- **`idleAfterSeconds`** — lower feels independent, higher feels attentive.
- **`maxFps.mobile: 30`** halves GPU work on phones. Raise it to 60 only if you
  have measured that you can afford it.

### Switching things off

| Goal | Setting |
| --- | --- |
| No motion, keep the 3D render | `animation.enabled: false` |
| No 3D at all, still image only | `avatar.enabled: false` |
| Keep motion, remove the pause button | `animation.showMotionToggle: false` |
| Ignore the cursor, keep idle motion | `animation.pointerTracking: false` |

### Reduced motion

`respectReducedMotion: true` (the default) means visitors whose OS reports
`prefers-reduced-motion: reduce` get the **static portrait**, not the animation.
The pause control is hidden for them, all CSS transitions are disabled, and if
they later turn the preference off the page picks it up live.

Visitors who choose to pause have that remembered in `localStorage` across
visits.

> Please leave `respectReducedMotion` on. Motion-sensitive visitors can
> experience vestibular symptoms from continuous movement, and this page's whole
> point is that it degrades beautifully. Turning it off is the one change in
> this document we would ask you not to make.

`respectSaveData: true` similarly starts paused for visitors whose browser
reports Save-Data, avoiding a multi-megabyte download on a metered connection.

---

## Contact

Four modes. **None of them route through Falcon Forged** — nothing in this
template contacts us, ever.

### `"none"` — no contact affordance

```ts
contact: { mode: "none", /* … */ }
```

No button, no dialog, no contact JavaScript. Everything else still renders.

### `"mailto"` — the default, zero infrastructure

```ts
contact: { mode: "mailto", email: "you@yourdomain.com", /* … */ }
```

The button is an ordinary mail link. No dialog, no backend, no JavaScript, no
spam-filtering service. It works everywhere and costs nothing.

**Trade-off:** the address is visible in the page source and will be scraped.
Use an address you can filter, or an alias you can retire.

### `"formspree"` — a real form, no server to run

1. Create a free form at [formspree.io](https://formspree.io).
2. Copy the id — the last segment of your endpoint, `https://formspree.io/f/**xyzabcd**`.

```ts
contact: {
  mode: "formspree",
  formspreeId: "xyzabcd",
  email: "you@yourdomain.com",   // still the no-JavaScript fallback
  // …
},
```

Submissions go to your Formspree account and are forwarded to you. Their free
tier has a monthly submission limit; check their current pricing. Any service
that accepts a JSON POST works the same way — Getform, Basin, Web3Forms — via
`"endpoint"` mode below.

### `"endpoint"` — your own backend

```ts
contact: {
  mode: "endpoint",
  endpoint: "/api/contact",     // or an absolute URL
  email: "you@yourdomain.com",
  // …
},
```

Your endpoint receives a JSON `POST`:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "Hello!",
  "verificationToken": "",
  "submissionId": "b0c1…"
}
```

Reply with `2xx` for success. On failure, reply with a non-2xx status and
optionally `{ "error": "…" }` — the message is logged, and the visitor sees a
friendly retry prompt with their text preserved.

A minimal Vercel serverless function:

```ts
// api/contact.ts
export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { name, email, message } = await request.json();
  if (!name?.trim() || !email?.includes("@") || !message?.trim()) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  // …send the mail with your provider of choice…
  return Response.json({ ok: true });
}
```

> **Validate on the server.** The browser checks are for the visitor's benefit,
> not for security. Never trust the payload, and never put an API key anywhere
> in `src/` — it would be compiled straight into the public bundle.

### Optional human verification

```ts
contact: { turnstileSiteKey: "0x4AAA…", /* … */ }
```

With a [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
site key set, the dialog reserves space for the widget, loads it lazily when the
dialog first opens, and refuses to send until it is solved. The token is sent as
`verificationToken` (Formspree receives it as `cf-turnstile-response`).

**You must verify that token server-side** against Turnstile's `siteverify`
endpoint using your **secret** key. The secret key belongs on your server and
must never appear in `src/config/site.ts`. A token that nobody verifies is
decoration.

Leave `turnstileSiteKey` empty and no captcha loads at all.

### The dialog itself

Regardless of mode, the dialog gives you a native `<dialog>` with focus
trapping, Escape and backdrop-click to close, focus returned to the trigger on
close, inline validation announced to screen readers, a live character counter,
retained text after a failed send, and a 20-second request timeout.

The email address in `contact.email` is always rendered as the `href` of the
button, so a visitor with JavaScript disabled can still reach you in every mode.

---

## Social links

An optional row under the contact button. An empty array renders nothing.

```ts
social: [
  { label: "GitHub", href: "https://github.com/your-handle", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/your-handle", icon: "linkedin" },
  { label: "Email", href: "mailto:you@yourdomain.com", icon: "mail" },
],
```

Built-in icons: `github`, `linkedin`, `x`, `instagram`, `mail`, `globe`,
`dribbble`, `youtube`. Omit `icon` for a text-only link, or supply your own:

```ts
{ label: "Mastodon", href: "https://mastodon.social/@you", icon: { svg: "<svg viewBox='0 0 24 24' fill='currentColor'><path d='…'/></svg>" } },
```

External links get `rel="noopener noreferrer"` and `target="_blank"`
automatically. Only `http(s):`, `mailto:`, `tel:` and site-relative URLs are
accepted — anything else is rejected at build time.

---

## SEO

```ts
seo: {
  title: "Your Company — Coming Soon",
  description: "One clear sentence. This is your search-result snippet.",
  canonicalUrl: "https://yourdomain.com/",
  language: "en",                      // sets <html lang>
  themeColor: "#f5f2eb",               // mobile browser UI colour
  ogImage: "https://yourdomain.com/og-image.png",   // must be ABSOLUTE
  ogImageAlt: "Your Company — coming soon",
  ogSiteName: "Your Company",
  twitterCard: "summary_large_image",
  twitterSite: "@yourhandle",          // optional
  robots: "index, follow",
},
```

All of it is rendered into `<head>` at build time, so crawlers and link
unfurlers see it without executing JavaScript.

- **`ogImage` must be an absolute URL.** Social networks cannot resolve a
  relative path. 1200 × 630 is the standard size. The build refuses a relative
  value.
- **`robots`** — use `"noindex, nofollow"` if you would rather the placeholder
  stayed out of search until you launch, then flip it when the real site ships.
- **`language`** — set it correctly. Screen readers use it to choose a
  pronunciation.

There is no `robots.txt` or `sitemap.xml` in the template. For a single-page
placeholder neither is necessary; the `robots` meta tag is sufficient. Add them
to `public/` if you want them.

---

## Responsive design

The layout is a single centred column at every size — heading, then avatar, then
details — so there is no separate mobile design to maintain.

### Breakpoints

| Breakpoint | What changes |
| --- | --- |
| `max-width: 650px` | Tighter padding, narrower text column, smaller and repositioned crack/tread decals, wider bottom tape, motion button moves in |
| `max-width: 560px` | Contact dialog footer stacks; send button goes full width |
| `max-width: 479px` | Dialog padding tightens; name and email stack |
| `max-width: 389px` | Verification widget switches to its compact layout |
| `max-height: 520px` and landscape | Avatar shrinks so heading, avatar and details all fit without scrolling |

### How sizing works

- **`svh`, not `vh`.** Mobile browser chrome that appears and disappears does not
  cause the layout to jump.
- **Fluid `clamp()` type.** Sizes scale continuously, so there is no step change
  at a breakpoint.
- **The avatar** is capped at `min(68svh, 660px, 90vw)` wide and
  `min(58svh, 700px)` tall — it grows into the space available and never
  overwhelms short viewports.
- **Short viewports scroll naturally** while keeping the heading → avatar →
  details order.

### Mobile-specific behaviour

- Touch never drives gaze — the avatar performs its idle sequence instead, so
  phones and tablets get continuous motion with no cursor.
- Frame rate is capped at `animation.maxFps.mobile` (30 by default).
- Device pixel ratio is capped at 1.5 below 700px wide, 1.75 above — this is a
  significant GPU saving on high-DPI phones with no visible cost.
- Save-Data visitors start on the still image.
- Every interactive control is at least 44 × 44 px.

Test with your browser's device toolbar at 320 × 568 (small phone),
390 × 844 (modern phone), 768 × 1024 (tablet) and 844 × 390 (landscape phone) —
those four catch nearly everything.

---

## Beyond the config

Some changes need actual code. In rough order of how often people want them:

| Change | Where |
| --- | --- |
| Font sizes, spacing, breakpoints | `src/style.css` |
| Page structure, adding a section | `src/config/markup.ts` — it generates the HTML |
| New `<head>` tags | `src/config/theme.ts`, `buildHeadTags()` |
| Interface icon shapes | `src/config/markup.ts` |
| The idle poses themselves | `IDLE_STATES` in `src/avatar-performance.ts` |
| Camera type or framing | `src/avatar.ts` |
| A new contact backend | `createSender()` in `src/contact-integration.ts` |
| A new config field | Add to `src/config/types.ts`, then `site.ts`, then use it |

Run `npm run check` after any of these. The type checker catches most mistakes
before the browser does.
