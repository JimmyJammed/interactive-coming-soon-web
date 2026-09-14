# Third-party notices

**Interactive Under Construction** v1.0.0
Published by Falcon Forged Ventures LLC.

Everything shipped in this product has been reviewed for redistribution inside a
paid commercial template. This file lists each third-party item, its licence and
any attribution requirement.

The product itself is licensed under the
[Falcon Forged Digital Product License v1.0](LICENSE.md). **The licences below
are not overridden by it** — they continue to govern their respective components.

---

## Runtime dependency

| Package | Version | Licence | Notes |
| --- | --- | --- | --- |
| [three](https://github.com/mrdoob/three.js) | 0.183.2 | MIT | The WebGL renderer, glTF loader and Meshopt decoder. Bundled into your production build. |

### three.js — MIT License

```
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> If you redistribute your built site, you are redistributing three.js and must
> keep this notice available. Keeping this file in your project satisfies that.

---

## Build-time dependencies

These run on your machine during development and are **not** shipped in your
production output. They are installed by `npm install` from the public npm
registry.

| Package | Version | Licence |
| --- | --- | --- |
| [vite](https://vite.dev) | 8.0.16 | MIT |
| [typescript](https://www.typescriptlang.org) | 5.9.3 | Apache-2.0 |
| [oxlint](https://oxc.rs) | 1.82.0 | MIT |
| @types/three | 0.183.1 | MIT |
| @types/node | ^26.4.1 | MIT |

Their own transitive dependencies are MIT, Apache-2.0, BSD-3-Clause, ISC or
MPL-2.0 — all permissive, and none of them impose obligations on the site you
build. Run `npm ls --all` or `npx license-checker` at any time to inspect the
installed tree yourself.

---

## Fonts

Both fonts are licensed under the **SIL Open Font License 1.1**, which expressly
permits bundling them with, and selling them as part of, a software product. The
full licence text ships alongside the font files and **must stay with them**.

| Font | Files | Licence | Licence text |
| --- | --- | --- | --- |
| [Black Ops One](https://fonts.google.com/specimen/Black+Ops+One) — © 2022 The Black-Ops Project Authors | `public/fonts/black-ops-one-latin.woff2`, `public/fonts/black-ops-one.ttf` | SIL OFL 1.1 | `public/fonts/OFL.txt` |
| [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) — © 2018 The Chakra Petch Project Authors | `public/fonts/chakra-petch-600-latin.woff2` | SIL OFL 1.1 | `public/fonts/chakra-petch-OFL.txt` |

**What the OFL requires of you:** keep the `OFL.txt` files next to the fonts if
you redistribute your project's source, and do not sell the font files *on their
own*. Using them on your site — commercial or not — is unrestricted.

**If you swap fonts**, delete the unused font files and their `OFL.txt`, and add
your replacement's licence here. See `docs/CUSTOMIZATION.md § Typography`.

---

## Images and textures

| Asset | Files | Origin | Rights |
| --- | --- | --- | --- |
| Concrete surface texture | `public/images/wallpaper/concrete-*.{avif,webp}` | Generated with an AI image-generation tool from a written prompt. No third-party reference image was used. | Falcon Forged Ventures LLC. Included under the product licence. |
| Wall crack decals | `public/images/wallpaper/crack-left-*`, `crack-right-*` | As above. | As above. |
| Tyre-tread decals | `public/images/wallpaper/tread-*` | As above. | As above. |
| Hazard tape strip | `public/images/wallpaper/caution-strip.{avif,webp}` | As above. | As above. |
| Favicons and touch icon | `public/favicon.ico`, `public/favicon.svg`, `public/icons/*`, `public/apple-touch-icon.png` | Derived from the 3D avatar below. | As above. |

No stock-photo, Creative Commons or third-party imagery is included. Every
raster asset was produced for this product.

---

## 3D avatar

| Asset | File | Size |
| --- | --- | --- |
| Construction worker head | `public/avatar/construction-worker.glb` | ~4.1 MB (Meshopt-compressed, WebP textures) |
| Static fallback portrait | `public/avatar/construction-worker.webp` | ~49 KB, 608 × 912 |

**Origin.** The mesh was generated by an AI image-to-3D service
(Higgsfield's Meshy `image_to_3d`) from an AI-generated reference illustration
commissioned by Falcon Forged. It was then re-rigged, optimized and re-textured
in-house: a two-pivot eye rig (`Eye_Left`, `Eye_Right`) was added in Blender,
the mesh was Meshopt-compressed, textures re-encoded to WebP, and camera framing
bounds were baked into `scene.extras.avatarFraming`.

**Rights.** The generating platform's terms do not claim ownership of generated
outputs, permit commercial use including client work and products incorporating
the visuals, and permit transferring or sublicensing those rights to third
parties. The reference illustration was itself generated from a text prompt and
depicts no real, identifiable person. Falcon Forged is therefore entitled to
include this asset in the product and to license it to you under `LICENSE.md`.

**An honest caveat.** Because the underlying mesh is machine-generated, the
strength of copyright protection in the raw geometry is uncertain in some
jurisdictions. Falcon Forged claims rights in the rigging, optimization,
framing metadata and the runtime implementation that drives it, and makes no
broader claim than that. Your rights to *use* the asset in your site are
unaffected.

**If you replace the avatar** with a model from Sketchfab, TurboSquid, Poly
Pizza, Quaternius or anywhere else, that model's own licence governs it. Check
it before you deploy, delete the shipped `.glb` and `.webp`, and record your
replacement here. See `docs/CUSTOMIZATION.md § 3D avatar`.

---

## Optional external services

These are **not** bundled and are **not** contacted unless you configure them in
`src/config/site.ts`.

| Service | When it loads | Terms |
| --- | --- | --- |
| [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | Only when `contact.turnstileSiteKey` is set. Loads `challenges.cloudflare.com` when the contact dialog first opens. | Cloudflare's terms; you supply your own keys. |
| [Formspree](https://formspree.io) | Only when `contact.mode` is `"formspree"`. Submits to your own form endpoint. | Formspree's terms; you supply your own form. |

Out of the box the template makes **no third-party network requests at all** —
fonts, images and the 3D model are all self-hosted from your own origin, and
there is no analytics or tracking of any kind.

---

## Nothing was withheld

Every asset required to run and deploy this template ships inside the package.
No component was excluded for licensing reasons, and there is nothing you need
to obtain separately.

---

*Questions about any entry here? See [SUPPORT.md](SUPPORT.md).*
