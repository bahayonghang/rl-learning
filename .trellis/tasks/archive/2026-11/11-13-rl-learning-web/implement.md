# Implementation plan

1. Read article text and all images; record pedagogy, visual analysis and technical corrections.
2. Research primary sources and author 24 original chapters with exercises and source links.
3. Implement 14 real numerical browser experiments and verification of key mathematical behavior.
4. Generate original introductory artwork and copy project assets into `public/images`.
5. Build responsive web experience, rendering, routing, reading tools and persistence.
6. Run typecheck/build, curriculum/lab checks and browser smoke checks including mobile and Mermaid.
7. Record verified scope, known limitations and setup/deployment instructions; commit and push the reviewed result.

Rollback: all new website artifacts are isolated under `rl-learning-web`. Existing project contracts remain untouched.

## Completed verification

- Read all 16 article images and documented the pedagogical/visual analysis and technical corrections.
- Delivered 24 chapters, 14 working labs, 355 mathematical expressions, 12 Mermaid diagrams including the roadmap, 35 distinct source URLs and 3 original illustrations.
- Exported the complete Markdown book from canonical content.
- All 19 numerical/content tests passed; strict type checking, production build and standard-library Python examples passed. The optional Gymnasium toy environment passed its contract and seed checks.
- Checked all 24 readers and 14 laboratories in Chrome; verified narrow mobile layout, navigation, note/progress persistence, search, theme and reading size.
- Independent review corrected search reopen behavior, failed-storage feedback and self-export import-size compatibility. Detailed evidence and screenshots are in `rl-learning-web/docs/verification.md`.
- Added `.trellis/spec/web/index.md` to preserve rendering, storage and educational-boundary decisions.
