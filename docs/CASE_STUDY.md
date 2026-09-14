# Case study: a useful page beneath the 3D experience

## Architecture

Configuration supplies content, theme and optional features. The build validates
configuration and renders content and metadata into HTML. A small entry module wires
contact behavior and the optional countdown before deciding whether to load 3D code.
The avatar module owns rendering and model loading; a separate performance controller
handles gaze and idle behavior. The portrait exists before the enhancement loads.

## Failure behavior

Loading and rendering are fallible, especially on mobile devices. The inspected
implementation catches startup failures, handles WebGL context loss, respects
reduced-motion and data-saving preferences, and retains a static portrait. The pause
preference is stored when browser storage is available; storage failure does not block
the page. These are source-level observations, not newly performed browser tests.

## Evidence available here

Three existing product screenshots show desktop, mobile and contact-dialog views.
Their provenance and hashes are in [the asset manifest](../assets/manifest.json).
The import review inspected the configuration, lazy loading, motion preference and
context-loss paths on 2026-09-11. No private implementation or private test results
are published in this entry. Exact source provenance remains with the product owner.

## Live demonstration and verification

Try the [live demo](https://hickman.biz/portfolio/interactive-under-construction).
Production smoke checks on 2026-09-11 confirmed a rendered 3D canvas, keyboard
pause/resume, and a 390 × 844 mobile viewport. A model-loading failure during rollout
retained the static portrait and page content; the model path was corrected before
the live link was added here.

Broader browser compatibility, reduced-motion and context-loss testing remain part
of the private product release process. The published artifact inventory is checked
for unexpected files, missing assets and source-map references.
