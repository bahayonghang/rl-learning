# Implementation plan

1. Fast-forward to the user's latest commit and inspect scope, references and attachments.
2. Split full English content and scholarly research across independent owners; implement locale contracts and shell redesign.
3. Generate identity/concept illustrations, integrate research pages, classified references and figure library.
4. Remove notes/bookmarks/resume UI and local state flows; localize interactive pages and export both languages.
5. Validate content coverage, research sources, formula/diagram parsing, numeric behavior, package build and real browser interactions in both themes/locales.
6. Update maintenance guidance and verification evidence, commit work, archive task, record session and deliver through GitHub.

## Acceptance results

- All six implementation stages completed; repository delivery follows the work/archive/journal sequence.
- Preserved user dependency upgrade at `2904fa2`; no package or lock-file edits.
- Final `just check`: 44/44 tests; 2,185 formulas over 205 documents; 40 Mermaid instances; strict type check and production build passed.
- Actual Chrome verification covered both themes/locales, nine research routes, SVG download, guide feedback, math calculator, workbench timing, catalogue filtering and 375/768 CSS px layouts.
- Corrected mobile calculation grid overflow; retained local table scrolling.
- Evidence and limits: `rl-learning-web/docs/verification-v2.md`; scholarly source access log: `rl-learning-web/docs/research-review-v2.md`; original image prompts: `rl-learning-web/docs/illustrations-v2.md`.
