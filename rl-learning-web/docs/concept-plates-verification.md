# Generated figure acceptance — 2026-11-14

## Scope and assets

- Replaced 21 unique authored drawings: 11 course figures, nine research figures, one learning roadmap.
- Covered 42 active Chinese/English occurrences and one retired research-body occurrence.
- Preserved the seven existing illustrations; the searchable gallery now has 28 entries.
- All 21 replacements were individually generated using imagegen and visually inspected. Targeted imagegen edits corrected specific wording, arrows and composition defects before acceptance.
- Every final replacement is a 1536 × 1024, 3:2 WebP. Combined size: 2,354,232 bytes (2.35 MB).
- Per-asset prompts, edit prompts, source paths and reviews are recorded in [diagram-assets](diagram-assets/). The original drawing inventory is archived only as provenance.
- Exact equations and calculated laboratory charts remain in their original mathematical/rendered form. No generated image is presented as measured performance or engineering wiring.

## Scientific review

Independent reviews compared the final image groups against bilingual captions and the project interfaces. Corrections included reward versus constraint costs, requested CV setpoint increments versus direct manipulation, five-gate order, training-only fitting, locked final tests, state-baseline variance qualifications and alt text matching the actual actor–critic composition. Gate 2 now explicitly checks core CV/PV and oxygen; it does not read hidden current quality.

## Automated acceptance

The final `just check` completed with exit code 0 after all image, caption and search corrections.

| Check | Result |
|---|---|
| Test suite | 51 passed; zero failed, skipped or cancelled |
| Mathematical rendering | 2,185 expressions across 205 authored documents |
| Course guides | 24 guides, 154 steps |
| Local resource references | 172 validated |
| Actual image headers | All 21 new plates and seven existing illustrations valid |
| Authored-content preservation | 67 bodies unchanged after masking only figure references and normalizing whitespace |
| Numerical kernels | Three original kernel hashes unchanged |
| Exports | Six Chinese/English book/review files regenerated and consistent |
| TypeScript | Strict type check passed |
| Production build | Vite transformed 2,127 modules successfully |
| Retired renderer | No Mermaid import/runtime/chunk in production JavaScript |

The dependency versions were preserved. Generated figure search now matches Latin terms at word starts, so PPO does not match “support” and SAC does not match “transactions”; Chinese substring search and selectable reading-guide search remain supported.

## Actual browser acceptance

Tested in Chromium against the managed local preview. Responsive checks used ordinary same-origin frames with explicit 375 px and 768 px viewport widths; these are responsive layout checks, not claims of testing a physical phone.

| Flow | Observed result |
|---|---|
| Chinese dark gallery | 28 entries; “五层” + concept type returned the three relevant figures |
| English search after correction | PPO + concept returned chapter 15, chapter 18 and the roadmap |
| Full-size image | Loaded at 1536 × 1024; fit and actual-size controls worked |
| Desktop actual-size view | 1536 px image scrolled inside a 1,221 px canvas |
| Escape and focus | Viewer closed and focus returned to the triggering image button |
| WebP download | Browser completed chapter-21 download; file size 106,110 bytes, matching the repository asset |
| Bilingual context | English chapter figure and expandable exact-relationship guide rendered correctly |
| Learning roadmap | New 1536 × 1024 image rendered; map contained no SVG drawing |
| 375 px reading | 360 px document/client width including scrollbar, 360 px scroll width; figure width 326 px with no page overflow |
| 375 px modal | Dialog width 357 px; original image scrolled inside a 312 px canvas; Escape removed viewer and restored focus |
| 768 px reading | 753 px document/client width including scrollbar, 753 px scroll width; architecture image fully contained |

The browser's developer tools were unavailable on the new-tab page. No browser policy was changed; responsive layout was checked using the application's temporary same-origin frame harness. That harness was removed after acceptance. Browser-extension metadata diagnostics were distinguished from application behavior.

Screenshots show the rendered application, not design mockups:

- [Light theme: five execution gates](screenshots/atlas-v3-gates-light.jpg)
- [Dark theme: supervisory architecture](screenshots/atlas-v3-architecture-dark.jpg)
- [375 px Chinese and 768 px English layouts](screenshots/atlas-v3-responsive.jpg)

The final three caption-only refinements were exported and covered by the final automated checks; no further layout changes followed browser acceptance.

## Download semantics

Repository book/review exports use relative asset paths. Complete offline reading requires preserving the associated image and code directories. A browser Markdown download alone does not bundle those files. Individual chapter downloads use canonical online repository asset URLs and require network access to the synchronized main branch. The UI and READMEs explain these distinctions.
