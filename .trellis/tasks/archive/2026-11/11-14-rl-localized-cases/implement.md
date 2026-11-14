# Implementation

1. Inventory image text and existing calculations; preserve source baseline and agree on independent file ownership.
2. Generate and visually verify Chinese image variants in two independent asset groups while implementing reusable formula cases.
3. Integrate centralized asset selection into reading/catalogue/viewer/download/export; integrate formula cases into chapters, research links, search and navigation.
4. Add meaningful regression coverage for locale asset selection, fallback, exported URLs, math boundaries and input validation; run full checks.
5. Inspect actual bilingual browser views and interactions, both themes and narrow layouts; fix concrete defects.
6. Update source specs/docs, commit implementation, archive task, record session, synchronize GitHub with expected-head protection and verify remote source tree.

## Completed implementation and acceptance

- Added 21 Chinese concept plates and one Chinese journey illustration, preserving all English originals. Both catalogue editions resolve 50 distinct assets through one Chinese/English language rule.
- Integrated locale-aware reading, gallery, roadmap, viewer, original-image/download links and all exports. Fixed inline/multi-image export handling while preserving code examples.
- Added 10 bilingual formula cases and 30 presets, contextual chapter/research mounts, navigation/search, current-input snapshots, validation and atomic rendering failure recovery.
- Independent reviews caught and corrected greedy image matching, inline image edition mismatch, scientific-notation exponent rendering and ambiguous default-versus-edited export backgrounds.
- Ran the complete `check` recipe through npm because `just` is unavailable: export, 67 passing tests, strict TypeScript and successful production build (2,133 modules). Checked 2,279 expressions across 225 documents and unchanged 67 body / three kernel fingerprints.
- Completed actual managed Chromium QA of cases, bilingual image/gallery/roadmap flows, downloads, Escape/focus, chapter/research integration, light/dark themes and 16 responsive case/viewport combinations. The temporary frame harness was removed.
- Full rationale and evidence: `rl-learning-web/docs/localized-figures-and-cases.md`; numerical contract: `rl-learning-web/docs/formula-cases.md`; image prompts and visual reviews: `rl-learning-web/docs/diagram-assets/chinese-*-generation.json`.
