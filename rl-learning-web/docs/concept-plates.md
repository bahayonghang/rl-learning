# Localized academic concept plates

The site uses **21 original generated WebP concept plates, each with Chinese and English image editions**. Chinese readers receive Chinese text inside the raster, in addition to Chinese captions and reading guides. The seven existing illustrations remain in the visual library: `journey` has Chinese and English editions, while the other six contain only pictures and numbered regions and share one language-neutral file each. This gives **50 distinct image files for 28 catalogue entries**: 42 concept-plate files, two journey files and six shared illustrations. The identity icon remains separate. Exact equations continue to use KaTeX; numerical laboratory and kiln charts continue to plot calculated values. A conceptual raster is never substituted for a numerical chart.

The image generation and visual review records live under [diagram-assets](diagram-assets/), including the [Chinese course and journey record](diagram-assets/chinese-course-generation.json) and [Chinese research and roadmap record](diagram-assets/chinese-research-generation.json). English originals are retained. The [original inventory](diagram-assets/original-inventory.json) is an archived source of identity and relationship provenance. It is not imported by the application, rendered, or offered as current diagram source. The combined localization and interactive-case upgrade is described in [localized-figures-and-cases.md](localized-figures-and-cases.md).

## Coverage and stable identities

| Stable asset ID | Context |
|---|---|
| `chapter-01-diagram-1` | Interaction, feedback and trajectory learning |
| `chapter-04-diagram-1` | MDP/POMDP information and representation |
| `chapter-09-diagram-1` | Value-learning instability and mitigations |
| `chapter-12-diagram-1` | REINFORCE, reward-to-go and baselines |
| `chapter-13-diagram-1` | Actor–critic, TD residuals and GAE |
| `chapter-15-diagram-1` | PPO collection and update loops |
| `chapter-17-diagram-1` | SAC, replay, critics and temperature |
| `chapter-18-diagram-1` | Algorithm-selection questions |
| `chapter-21-diagram-1` | Five ordered execution gates |
| `chapter-22-diagram-1` | Offline data construction and evaluation |
| `chapter-23-diagram-1` | Short model branches from real states |
| `research-history-diagram-1` | Supervisory objectives and control hierarchy |
| `research-indicators-diagram-1` | Indicators and causal confounding |
| `research-objectives-diagram-1` | Accounting, feasibility and Pareto preference |
| `research-evolution-diagram-1` | Evolutionary search and rolling execution |
| `research-sequential-diagram-1` | Information, proposals, reward and separate costs |
| `research-architecture-diagram-1` | Information permissions and agent data paths |
| `research-evidence-diagram-1` | Claim-specific evidence classification |
| `research-open-problems-diagram-1` | Calibration, short rollouts and failure analysis |
| `research-agenda-diagram-1` | Common interfaces and falsifiable research |
| `roadmap-learning` | Learning dependencies and research preparation |

The 11 chapter and nine research plates replace **40 authored occurrences across the two languages**. The roadmap plate has an edition for each of the two locale views, giving **42 active locale occurrences**. The retired `src/content/research.ts` drawing is also replaced with the agenda plate, for **43 covered occurrences in total**. Chapter and research gallery URLs preserve the original inventory IDs.

## Typed data and portable references

`src/concept-plates.ts` owns the 21 stable IDs, figure topics, context routes, bilingual titles, alt text, explanations, panel guides and exact relationship descriptions. Every plate has three short guide regions plus a relationship/boundary paragraph. Region headings identify concepts; their ordering must not be interpreted as a claim about image-panel placement or an engineering execution sequence.

`src/image-locales.ts` owns the image-language contract. `imageLanguage(locale)` maps case-insensitive `zh` and `zh-*` values, such as `zh-CN`, `zh-Hans` and `zh-TW`, to the Chinese image edition; every other value selects English. An explicit locale takes precedence over the active UI locale. This is an image fallback rule, not registration of additional translated UI editions.

| Asset group | Chinese source path | English or shared source path | Distinct files |
|---|---|---|---|
| 21 concept-plate IDs | `public/images/diagrams/zh-CN/ID.webp` | `public/images/diagrams/ID.webp` | 42 |
| Journey illustration | `public/images/zh-CN/journey.webp` | `public/images/journey.webp` | 2 |
| Six language-neutral illustrations | `public/images/ID.webp` | `public/images/ID.webp` | 6 |

The six shared IDs are `foundations`, `industry`, `operations-stack`, `evolution-search`, `safe-agent` and `world-model`. Each Chinese concept plate contains translated titles and explanatory labels; customary algorithm acronyms and mathematical symbols remain unchanged. The journey book title reads “强化学习图谱” in Chinese and “RL ATLAS” in English. Selectable captions, alt text and reading guides still follow the UI locale. All 42 concept-plate files have an intrinsic size of **1536 × 1024** and a compact **3:2** ratio; both journey files are **1672 × 941**. Tests inspect actual WebP headers rather than trusting filenames or declared metadata.

Authored content uses a normal Markdown image:

```markdown
![Figure title](./images/diagrams/chapter-21-diagram-1.webp)
```

Existing authored references can retain the canonical English path shown above. `conceptPlateReference(id, locale)` and `conceptPlateImage(id, locale)` create a reference to the requested image edition. Browser rendering and exports also resolve canonical authored references to that edition. `conceptPlateFromImage(src)` recognizes only the exact registered path under `./images/diagrams/` or `./images/diagrams/zh-CN/`; an unknown ID, external host, traversal path, other locale directory, repeated locale directory or alternate protocol is not a trusted plate. `localizedConceptPlate(id, locale)` provides presentation data without changing the content edition. `illustrationImage(id, locale)` selects the journey edition and preserves shared paths for the six neutral illustrations.

`src/figures.ts` combines these concept records with the seven preserved illustrations. `FigureRecord` has an explicit `kind: 'concept' | 'illustration'`, a real image, alt text and dimensions. It no longer contains drawing code. The old `kind=diagram` gallery query is mapped to `concept` so bookmarked filters remain useful.

## Rendering, accessibility and security

`src/render.ts` still protects both code-fence syntaxes before math processing, sanitizes Markdown with DOMPurify and renders KaTeX with `trust: false`. Only after sanitization does `decorateConceptPlates` resolve registered concept images to the active edition, including inline images. A standalone registered image also receives trusted figure markup; an inline image stays inline. Text fields are HTML-escaped. Ordinary images and code examples are not interpreted as control markup.

Each standalone chapter/research plate includes a native image, localized alt text, explanatory caption, expandable selectable reading guide, gallery detail link, enlargement control, full-size link and WebP download. Gallery cards display the actual images directly; none waits for a diagram renderer or contains a drawing-source preview. The reading view, gallery, learning roadmap, illustration components, enlargement viewer, full-size link and download use the resolved image path. Download names are `ID.zh-CN.webp` for assets under `zh-CN/` and `ID.en.webp` for English or shared assets. Search includes alt text, regions and exact relationships in addition to titles, keywords and context labels.

The viewer uses an ephemeral native `dialog` with an accessible title and instructions. It supports fit-to-window and actual-size views, an explicit close button, the browser's native Escape handling, and focus restoration to the trigger when it remains connected. Actual-size scrolling stays within the canvas. A route change closes and removes the dialog; its route listener is removed on close. Language switching remounts the route and closes its existing viewer, so reopening uses the newly selected edition rather than retaining a stale image. No viewer dependency, timer or global persistent dialog is added.

Image width/height attributes prevent layout shifts. The warm opaque image surface is retained in both themes. Text and controls use site color variables; preview images use `object-fit: contain` rather than cropping labels. Compact cards, wrapping controls and a bounded viewer support narrow screens. Real browser checks are required for native modal focus trapping, Escape, downloads and responsive geometry; DOM tests do not establish those browser behaviors.

No application code imports or runs Mermaid, and there are no Mermaid source/SVG download controls. Its existing package version is retained to preserve the user's dependency choices. Removing runtime use does not require adding or upgrading dependencies. Numerical SVG plots and UI icons remain valid, separate features.

## Scientific interpretation

The guides explicitly retain boundaries that a compact image cannot fully encode:

- Observations and history need not reveal hidden state or guarantee a Markov representation. Assays enter policy inputs only after release.
- Rewards follow actions; finite teaching windows are not necessarily true termination. GAE bootstrap and trace masks have different roles.
- A REINFORCE state baseline does not depend on the sampled action. The discounted start-state objective retains its time weight.
- PPO clipping shapes the min surrogate differently for positive and negative advantages; it does not impose a hard ratio or physical execution boundary.
- SAC replay, twin critics, target critics, entropy temperature and tanh density correction have distinct purposes. None substitutes for execution gates.
- Requested increments and executed increments differ after gating. Five gates retain the order **data → current state → model/OOD → rate/curvature → absolute bounds/authorization**. Gate 2 checks core CV/PV ranges and oxygen; it does not read hidden current quality. Rejection holds SP while process time and dynamics continue.
- Energy and action smoothness form the stated reward. Quality and oxygen remain separate constraint costs; expected-cost constraints do not guarantee per-step feasibility.
- The policy changes CV setpoints through lower-level control. It never directly commands fuel, feed, air or other manipulated variables.
- Logged association is not an identified intervention effect. Simulated/model-generated experience is not a physical trial or field-performance claim.
- Failure analysis can revise development and calibration. Repeated tuning against a final locked test set followed by reuse is no longer independent testing.

The images are conceptual plates, not exact network dimensions, engineering wiring, measured Pareto fronts or numerical confidence bands. The accompanying equations and prose remain authoritative for precise mathematical content.

## Complete exports and individual downloads

`expandConceptPlateReferences` resolves registered concept-image references and the translated journey illustration to the explicitly requested edition. Inline images and multiple images on one line retain their structure and all images. Only a standalone concept-plate reference expands into an image, localized caption, all panel descriptions, exact relationship and conceptual-boundary notice.

The shared `mapMarkdownProse` helper protects backtick and tilde fenced blocks, indented code and backtick code spans, including spans across lines. Image localization and subsequent export link/heading rewriting operate on prose, preserving literal examples. `scripts/export-book.ts` resolves paths for the existing six outputs:

| Destination | Chinese concept-plate path | English concept-plate path | Coverage per language |
|---|---|---|---|
| `docs/rl-atlas-tutorial[.en].md` | `../public/images/diagrams/zh-CN/ID.webp` | `../public/images/diagrams/ID.webp` | 21 plates, plus four existing research illustrations |
| `public/rl-atlas-tutorial[.en].md` | `./images/diagrams/zh-CN/ID.webp` | `./images/diagrams/ID.webp` | 21 plates, plus four existing research illustrations |
| `public/code/research-review[.en].md` | `../images/diagrams/zh-CN/ID.webp` | `../images/diagrams/ID.webp` | Nine research plates, plus four existing research illustrations |

The complete books now include the learning roadmap with its guide. All existing chapters, 154 guide steps, primer, glossary, workbench model, research bodies, code and citation-ID mappings remain included. `buildBook(destination, locale = 'zh-CN')` and `buildResearchReview(locale = 'zh-CN')` retain their existing API.

An individual chapter downloaded by the browser has no accompanying image directory. `src/content-download.ts` therefore resolves the requested image edition, expands the same standalone guides and uses canonical raw repository URLs for image/code assets, plus canonical complete-book anchors for cross-references. Chinese concept URLs end in `images/diagrams/zh-CN/ID.webp`; English URLs end in `images/diagrams/ID.webp`. Inline concepts and journey references use the same locale rule. These canonical links require network access to the synchronized main branch. Full multi-file offline editions continue to use their existing relative-path semantics. A browser download supplies the Markdown file; the download views explain that complete offline image access requires keeping the companion image and code folders from the repository.

## Verification scope

`tests/figures.test.ts` checks original occurrence coverage, stable identities, bilingual semantic fields, untrusted-path rejection, all 50 actual asset files and their WebP dimensions, explicit-locale precedence, English fallback, all six export paths/guides, portable chapter downloads, inline and adjacent image preservation, code-example protection, absence of the retired runtime and DOM interactions. The DOM viewer test explicitly models the native dialog API because JSDOM does not implement it; it does not establish actual browser modal behavior.

`tests/fixtures/figure-migration-baseline.json` preserves hashes for **67 complete authored bodies** after masking only the figure position and normalizing whitespace, plus hashes for the **three numerical kernels**. Matching these establishes that non-figure prose, formulas, worked numbers and code were not rewritten by the migration. The regular mathematical, content, numerical and export-consistency suites remain in force.

Run `just check` after the generated assets and final semantic reviews are complete. It regenerates all six exports, executes the complete tests, performs the strict type check and builds the production app. Generation/visual-review records are independent of code checks; passing code tests alone is not a claim that image labels or composition were visually inspected.

### Original migration code verification, 2026-11-14 — historical snapshot

After all 21 accepted image files arrived, the repository's `just check` completed successfully: **51 tests passed, zero failed/skipped/cancelled**, the strict TypeScript check passed, and Vite 8.3.8 built the production application. The subsequent review also corrected internal hash-link targets, normalized `/code/` downloads before external-link handling, and added explicit accessible names to the shared type filters. The mathematical suite still rendered **2,185 expressions across 205 authored documents**. The figure suite verified the **42 active locale occurrences plus one retired occurrence**, **21 compact plates plus seven existing images**, and unchanged fingerprints for **67 authored bodies and three numerical kernels**. All six generated downloads matched their source data.

The production build transformed 2,127 modules and contained no Mermaid JavaScript chunk or source string. The existing npm environment warning about `http-proxy` did not prevent exports, tests or the build. These counts describe the original image migration before separate Chinese assets and the new formula cases were added.

### Current localization and formula-case verification, 2026-11-14

The coordinating task completed the current export, test, type-check and production-build gate: **67 tests passed**, and the mathematical suite rendered **2,279 expressions across 225 authored documents**. The updated figure checks cover the **50 distinct image assets**, both image editions, the six generated outputs and individual chapter downloads. The original 51-test and 2,185-expression figures above remain historical evidence, not the current totals. See [localized-figures-and-cases.md](localized-figures-and-cases.md) for the combined change and acceptance record.

All Chinese assets were individually inspected; the independent integration review also visually inspected the research objectives, architecture and learning-roadmap editions. The initial executor browser limitation was resolved using the supported managed Chromium desktop with a loopback-only production preview. Actual browser checks then verified bilingual image/gallery/roadmap flows, image and case downloads, modal Escape/focus, contextual calculations, both themes and 16 case/viewport combinations at 375 px and 768 px without page overflow. The downloaded Chinese chapter-01 image matched the repository file byte for byte. Detailed scope, measurements and real screenshots are recorded in [localized-figures-and-cases.md](localized-figures-and-cases.md).
