# Migration validation — 2026-09-14

Local Node 26.7.0, npm 11.19.0. Extracted standalone version 1.0.0. `npm ci`, lint, typecheck, unit tests, production build and product verification passed. 29 unit tests passed. Placeholder contact/SEO warnings are expected for an unconfigured template.

No physical-device or assistive-technology certification is claimed. Historical notes in other documents are not new migration results.

Chromium smoke checks at 390×844 confirmed a live 3D portrait, static reduced-motion presentation, readable heading and no horizontal overflow. The isolated `npm run build:demo` also passed.

## README badge maintenance

The package-version badge reads the main branch package.json. Platform, integration and Node badges describe declared support, not device certification. Test and build badges are dated local snapshots linked to the verification revision. When implementation or dependencies change, rerun relevant checks and update the counts, date and evidence links together; otherwise mark the snapshots as historical. Do not add npm, coverage, uptime or CI-passing badges without the corresponding publication, measured coverage, monitor or workflow. Badge rendering uses [Shields.io](https://shields.io/badges).
