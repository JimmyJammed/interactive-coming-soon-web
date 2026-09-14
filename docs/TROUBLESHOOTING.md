# Troubleshooting

Most problems fall into one of the cases below. If yours does not, see
[SUPPORT.md](../SUPPORT.md).

---

## Installation

### `npm install` fails

**Check your Node version first** — this is the cause more often than anything
else:

```bash
node --version
```

You need **v22.18 or newer**. Install the current LTS from
[nodejs.org](https://nodejs.org).

If the version is fine, clear and retry:

```bash
rm -rf node_modules package-lock.json
npm ci
```

Behind a corporate proxy or firewall, npm may not reach the registry. Confirm
with `npm ping`.

### `npm run dev` says the port is in use

Something else is on 5173.

```bash
npm run dev -- --port 3000
```

### "Unknown file extension .ts" when running tests

The tests import TypeScript directly and rely on Node's built-in type
stripping, which needs **Node 22.18+**. Upgrade Node.

---

## The build

### The build fails with "Invalid src/config/site.ts"

Working as intended. The message names the exact field and what is wrong with
it, for example:

```
Invalid src/config/site.ts:

  • theme.colors.accent is not a usable CSS colour: "brand-yellow".
  • avatar.model must be a path under public/ starting with "/". Got "avatar/model.glb".
```

Fix those fields and rebuild. Field-by-field reference:
[CUSTOMIZATION.md](CUSTOMIZATION.md).

### Yellow `[under-construction]` warnings during the build

Reminders, not errors — they never block a build. They appear when
`contact.email` is still the placeholder, or `seo.canonicalUrl` / `seo.ogImage`
are empty. Fill them in before you deploy and the warnings stop.

### A TypeScript error in a file I did not touch

Usually a knock-on from a config edit. Run:

```bash
npm run typecheck
```

The first error is normally the real one; the rest are consequences. If it
points into `src/config/`, compare your `site.ts` against the shapes in
`src/config/types.ts`.

### "chunk is larger than 500 kB"

Expected. That is three.js, which is loaded **lazily** — the page is interactive
and readable before it arrives. The warning limit is already raised in
`vite.config.ts`; if you see it, it means your own additions pushed a chunk over
700 kB.

---

## The 3D avatar

### The avatar area is blank — no model, no still image

Open your browser's DevTools console and network tab and look for a 404.

1. **Does the model file exist?** It must be at the path in `avatar.model`,
   under `public/`. `public/avatar/construction-worker.glb` is served at
   `/avatar/construction-worker.glb`.
2. **Deployed to a subpath?** On `username.github.io/repo-name/`, absolute paths
   break. Set `base: "/repo-name/"` in `vite.config.ts` — see
   [DEPLOYMENT.md § GitHub Pages](DEPLOYMENT.md#github-pages).
3. **Is `.glb` served correctly?** Some servers return `text/html` for unknown
   extensions. Add the `model/gltf-binary` MIME type — see
   [DEPLOYMENT.md](DEPLOYMENT.md#nginx).

### I see the still image, but it never becomes 3D

That is the fallback working. The console will say why. Common causes:

- **`prefers-reduced-motion: reduce` is on** in your OS. This is intended
  behaviour. Test in a profile without it, or temporarily set
  `animation.respectReducedMotion: false` — then turn it back on.
- **Save-Data is on** in your browser or OS. Same idea; controlled by
  `animation.respectSaveData`.
- **You paused it earlier.** The preference is remembered. Click play, or clear
  the site's `localStorage`.
- **No WebGL.** Check [get.webgl.org](https://get.webgl.org). Some virtual
  machines, remote desktops and older devices have no GPU access.
- **The eye pivots are missing.** If you replaced the model, the console will
  name the node names it could not find. Either rename the nodes, set
  `avatar.eyeNodes` to match, or set `avatar.requireEyes: false`. See
  [CUSTOMIZATION.md § 3D avatar](CUSTOMIZATION.md#3d-avatar).

### The avatar looks wrong — too big, off-centre, facing away

Adjust `avatar.scale`, `avatar.position` and `avatar.rotation`. Remember:

- The model is auto-fitted first, so `scale` is a nudge. Try `0.9` or `1.1`
  before anything larger.
- `position.y` positive moves it **up**.
- `rotation` is in **radians**. `Math.PI / 4` is 45°.

If the top of the head or the chin is clipped, your model probably lacks the
baked framing metadata the shipped one has, so the camera is using its more
conservative fallback. Reduce `scale` slightly.

### The model is dark, blown out, or oddly coloured

Adjust `lighting`. Start with `exposure` (overall brightness), then
`environmentIntensity` (ambient), then the individual lights. Recipes are in
[CUSTOMIZATION.md § Lighting](CUSTOMIZATION.md#lighting).

A model exported with unusual materials — emissive, unlit, or a non-PBR
workflow — may not respond as expected. Re-export with a standard PBR
(metallic-roughness) material setup.

### It stutters or the fan spins up

- Lower `animation.maxFps.desktop` to `30`.
- Lower `animation.intensity`.
- Reduce the model's polygon count and texture size — see
  [CUSTOMIZATION.md § Keeping it fast](CUSTOMIZATION.md#keeping-it-fast).
- Confirm hardware acceleration is enabled in the browser.

### It disappears after the laptop wakes from sleep

The GPU context was lost. The template detects this, disposes cleanly and falls
back to the still image rather than showing a broken canvas. Reloading restores
it. This is expected behaviour, not a fault.

---

## Appearance

### My fonts are not applying

1. Is the file actually in `public/fonts/`?
2. Does `theme.fonts.<role>.file` match the filename exactly, **including
   case**? macOS is case-insensitive locally and Linux servers are not, so this
   often only breaks after deploying.
3. Does `format` match the file — `"woff2"` for `.woff2`?
4. Check the network tab for a 404 on the font.

If the fallback `stack` is rendering instead, that is the safety net doing its
job.

### My colour change did nothing

Colours become `--uc-*` custom properties at **build time**. In dev the page
should hot-reload; if not, restart `npm run dev`. Confirm you edited
`theme.colors` and not a value hard-coded elsewhere — a few structural shadows
in `src/style.css` are deliberately literal.

### The headline is tiny on mobile

The headline is `white-space: nowrap` and shrinks to stay on one line. A long
headline shrinks a lot. Either shorten it, or remove `white-space: nowrap` from
`h1` in `src/style.css` and let it wrap.

### The background texture looks blurry or the tiles seam

`background.texture.tileSize` must be the **1× intrinsic width in CSS pixels**
of your texture. If it does not match, the browser scales the tile and you get
blur and visible seams. A seamless tile also has to actually be seamless — edges
that do not continue will show as a grid.

---

## Contact form

### Nothing happens when I click the button

In `contact.mode: "mailto"` — the default — the button is a plain mail link and
there is no dialog. If no mail client is configured, the browser does nothing
visible. That is the OS, not the template.

For a dialog, use `"formspree"` or `"endpoint"`.

### The send button is disabled

Either no delivery target is configured (check the console for a warning naming
the mode), or `contact.turnstileSiteKey` is set and the captcha has not been
solved yet.

### Messages are not arriving

1. **Formspree:** confirm the form id, and check your Formspree dashboard — the
   first submission to a new form usually needs email confirmation.
2. **Endpoint:** open the network tab, submit, and read the actual response
   status and body.
3. **CORS.** If your endpoint is on a different origin, it must return
   `Access-Control-Allow-Origin` for your site. A CORS failure shows in the
   console.
4. **Spam folder.** Genuinely — check it.

### Turnstile does not appear

- Is the **site** key in `contact.turnstileSiteKey` (not the secret key)?
- Is your domain registered in the Turnstile dashboard? Widgets are
  domain-restricted, so `localhost` needs adding for local testing.
- Is a content blocker blocking `challenges.cloudflare.com`?

---

## Deployment

### It works locally but not deployed

The near-universal cause is **path or MIME type**. Open the deployed site's
network tab and look for 404s or wrong content types. Then read
[DEPLOYMENT.md](DEPLOYMENT.md) for your host.

### I deployed but I still see the old version

Browser or CDN cache. Hard-reload (Cmd/Ctrl + Shift + R), and purge the CDN
cache in your host's dashboard.

If it keeps happening, `index.html` is being cached too aggressively. It must
**not** be cached long — it is the file that points at the content-hashed
bundles. See [DEPLOYMENT.md § Caching](DEPLOYMENT.md#caching-in-one-rule).

### Link previews show nothing

`seo.ogImage` must be an **absolute** URL to a real, publicly reachable image —
1200 × 630. Then force a re-scrape with the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/); platforms
cache previews hard.

---

## Still stuck?

Have these ready and see [SUPPORT.md](../SUPPORT.md):

- Your OS and browser, with versions
- `node --version` and `npm --version`
- The **exact** error text, copied — not a screenshot of a paraphrase
- The relevant part of your `src/config/site.ts`
- Whether it happens locally, deployed, or both
