# Implementation plan

- [x] Fetch remote main; confirm clean baseline `ca36ca3`.
- [x] Read review and prior constraints; parallel source audit.
- [x] Write requirements, design and verified priority plan; user authorized plan then implementation.
- [x] Activate task with curated context.
- [x] Implement clear homepage with annotated illustration.
- [x] Implement three entry paths and extract improved roadmap.
- [x] Implement accessible theme preferences/styles.
- [x] Integrate unified navigation, shortcut and source/citation guidance.
- [x] Run exports, tests, typecheck and production build (75/75 tests, 2279 formulas).
- [x] Browser QA: both locales/themes, desktop/mobile, layer controls, system preference, routes, search, calculations and workbench. System appearance transitions are covered by resolver tests and listener review, not a physical OS toggle.
- [x] Fix concrete issues, update spec/README and verification evidence.
- [x] Commit and synchronize the review branch; create draft PR #1. Archive and session bookkeeping follow as separate commits.

Validation: `just check` in `rl-learning-web` (or `npm run export:book`, `npm test`, `npm run build`). Browser checks used the supported managed preview and a temporary responsive frame; that fixture was removed before the final production build. Final screenshots and acceptance evidence are in `rl-learning-web/docs/experience-review-verification.md`.
