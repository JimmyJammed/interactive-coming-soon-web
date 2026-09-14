# Interactive Coming Soon — 3D Landing Page

[![platform: Web](https://img.shields.io/badge/platform-Web-2563eb)](docs/GETTING_STARTED.md)
[![language: TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6?logo=typescript&logoColor=white)](package.json)
[![integration: Three.js](https://img.shields.io/badge/integration-Three.js-444444?logo=threedotjs&logoColor=white)](docs/ARCHITECTURE.md)
[![Package version](https://img.shields.io/github/package-json/v/JimmyJammed/interactive-coming-soon-web/main?label=package&color=blue)](package.json)
[![Node: 22.18+](https://img.shields.io/badge/Node-22.18%2B-339933?logo=nodedotjs&logoColor=white)](package.json)
[![license: source-available](https://img.shields.io/badge/license-source--available-a16207)](LICENSE.md)
[![demo: view live](https://img.shields.io/badge/demo-view%20live-2563eb)](https://hickman.biz/portfolio/interactive-under-construction)

[![unit tests: 29 passed (local)](https://img.shields.io/badge/unit%20tests-29%20passed%20%28local%29-2e7d32)](https://github.com/JimmyJammed/interactive-coming-soon-web/blob/37862481caaacbac6546555d02b41c7eb15d91a4/docs/VALIDATION.md)
[![UI tests: Chromium smoke (local)](https://img.shields.io/badge/UI%20tests-Chromium%20smoke%20%28local%29-2e7d32)](https://github.com/JimmyJammed/interactive-coming-soon-web/blob/37862481caaacbac6546555d02b41c7eb15d91a4/docs/VALIDATION.md)
[![build: verified locally](https://img.shields.io/badge/build-verified%20locally-2e7d32)](https://github.com/JimmyJammed/interactive-coming-soon-web/blob/37862481caaacbac6546555d02b41c7eb15d91a4/docs/VALIDATION.md)

Test and build badges record local verification on **2026-09-14**, not live CI status. Click them for scope and results; the package badge reads `package.json`, not an npm release.

Configurable TypeScript and Three.js coming-soon page with cursor-aware character motion, static fallbacks, and configurable contact behavior.

**Source-available · Experimental · Web** · [Live demo](https://hickman.biz/portfolio/interactive-under-construction)

![Desktop preview](previews/desktop-1440.webp)

## Run locally

Use Node 22.18 or newer and npm.

```sh
git clone https://github.com/JimmyJammed/interactive-coming-soon-web.git
cd interactive-coming-soon-web
npm ci
npm run dev
```

Open the local URL printed by Vite. Run `npm run build` to generate `dist/`, then `npm run preview` to inspect it. No private registry, sibling checkout, or secrets are required.

## Customize

Edit `src/config/site.ts`: set `content.headline`, your colors and assets, and contact mode. For example, change `content.headline` to `Something new is coming`. Run `npm run build` to validate configuration and render static HTML. Leave contact in its default placeholder mode until you configure your own destination.

## Documentation

- [Accessibility](docs/ACCESSIBILITY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Case Study](docs/CASE_STUDY.md)
- [Customization](docs/CUSTOMIZATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Getting Started](docs/GETTING_STARTED.md)
- [Migration](docs/MIGRATION.md)
- [Product](docs/PRODUCT.md)
- [Releases](docs/RELEASES.md)
- [Testing](docs/TESTING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Validation](docs/VALIDATION.md)

## License and distribution

This is an authorized distribution source for the Falcon Forged Digital Product License. Downloading here grants the existing license rights, including personal and commercial end-product use; no purchase is required. Redistribution as a competing template or component kit remains restricted. This is source-available, not open-source software.

Created by Jimmy Hickman. Copyright Falcon Forged Ventures LLC. [License](LICENSE.md) · [License summary](LICENSE-SUMMARY.md) · [Third-party and asset notices](THIRD_PARTY_LICENSES.md). No public npm publication or stable release is implied.
