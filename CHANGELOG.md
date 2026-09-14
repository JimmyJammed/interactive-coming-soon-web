# Changelog

All notable changes to **Interactive Under Construction** are recorded here.

This project follows [Semantic Versioning](https://semver.org):
**1.0.x** is bug fixes, **1.x.0** adds features compatibly, **2.0.0** would be a
breaking change requiring you to adjust your configuration.

---

## [1.0.0] — 2026-09-07

Initial release.

### Features

- **Real-time 3D avatar** — a glTF model rendered with three.js, with an
  eye-and-head gaze rig.
- **Cursor tracking** — a fine pointer (mouse or pen) is followed; eyes acquire
  the target quickly and the head follows more slowly. Touch never drives gaze.
- **Autonomous idle choreography** — sixteen distinct page-directed looks
  (edge checks, diagonal glances, surveys, nods, tilts) dealt from a shuffled
  deck so all sixteen play before any repeats, with order, timing and intensity
  varied each pass. Each holds 6.2–9.4 seconds.
- **Layered jobsite background** — repeating concrete texture, left/right crack
  decals, tyre-tread decals and hazard tape, each independently switchable, all
  served as AVIF with WebP fallbacks at multiple densities.
- **Single-file configuration** — `src/config/site.ts` drives content, launch
  countdown, contact delivery, social links, colours, fonts, background layers,
  avatar transform, lighting, animation, SEO and favicons.
- **Build-time config validation** — genuine mistakes fail the build with a
  message naming the field and the fix; unfilled placeholders warn only.
- **Static, crawlable output** — copy and metadata are rendered into the HTML at
  build time, not injected by JavaScript. The page reads correctly with
  JavaScript disabled.
- **Four contact modes** — `none`, `mailto`, Formspree, or your own endpoint,
  with optional Cloudflare Turnstile. No dependency on the publisher's
  infrastructure.
- **Optional launch countdown** — driven by one ISO 8601 date, updating once a
  minute and announced politely to screen readers.
- **Optional social row** — eight built-in icons plus support for custom SVG.
- **Visitor pause control** — remembered across visits in `localStorage`.
- **No tracking** — zero analytics and zero third-party requests out of the box.
  Fonts, images and the model are all self-hosted.

### Accessibility

- Semantic landmarks and heading structure; decorative layers are
  `aria-hidden` and carry empty `alt`.
- `prefers-reduced-motion: reduce` starts on the static portrait, hides the
  motion control and disables CSS transitions — and responds live if the
  preference changes.
- Save-Data visitors start on the static portrait, avoiding a multi-megabyte
  download on a metered connection.
- Contact dialog: focus moves to the heading on open and returns to the trigger
  on close; Escape and backdrop click close it; validation errors are wired with
  `aria-describedby` and announced via a polite live region.
- All interactive controls are at least 44 × 44 px with a visible focus ring.
- The shipped palette meets WCAG AA contrast for body and large text.

### Performance

- three.js is code-split and loaded **lazily**, after the page is interactive.
- Device pixel ratio capped at 1.5 below 700 px wide, 1.75 above.
- Frame rate capped at 30 fps on narrow viewports, 60 fps otherwise — both
  configurable.
- Rendering and the animation clock both suspend while the document is hidden.
- The 3D model is Meshopt-compressed with WebP textures, with camera framing
  bounds baked into `scene.extras.avatarFraming` so no per-frame vertex scan is
  needed.
- WebGL context loss is detected and disposed cleanly, falling back to the
  static portrait rather than a broken canvas.
- Initial render needs only the HTML, CSS, two fonts, one background tile and
  the ~49 KB still portrait.

### Included

- Full source, all assets, and 29 unit tests.
- Deployment configuration for Vercel (`vercel.json`) and Netlify
  (`netlify.toml`).
- Documentation: README, Getting Started, Customization, Deployment,
  Troubleshooting, Support, full licence, plain-English licence summary, and
  third-party notices.

### Tested in this release

Stating what was actually exercised, rather than implying broader certification:

- `npm install` from a clean extraction of the distributed ZIP, followed by
  lint, type-check, the full test suite, a production build, and a local
  production preview — all passing.
- **Chromium 141** at 1440 × 900, 1280 × 720, 768 × 1024, 390 × 844 and
  320 × 568.
- Verified in a real browser: the 3D model loads and renders, the idle
  choreography advances through named looks, cursor tracking engages, the pause
  control works and persists, the contact dialog opens with working validation
  and focus management, and the console is free of errors and warnings.
- Verified that the built HTML contains the configured copy and metadata as
  static markup.

**Not tested:** Safari, Firefox, physical mobile devices, or live deployment to
Vercel or Netlify. Every API used is supported in current Safari and Firefox and
both are expected to work, but no claim is made beyond what was run.
