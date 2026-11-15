# RL Learning Web Guidelines

## Scope and boundaries

`rl-learning-web/` is the standalone Chinese/English educational website. Each registered locale must provide complete learning, research and interactive content. It uses Vite, strict TypeScript, semantic HTML/CSS, local numerical experiments, KaTeX and original generated WebP concept plates. It is not the production kiln environment or a training backend. Follow the existing algorithm, environment and experiment contracts when discussing the industrial case; never invent data, baseline outcomes or field performance.

## Content contracts

- Canonical chapter and source data live in `src/content/`; keep stable chapter IDs `01`–`24`, populated module mappings, prerequisites and source IDs.
- Explain the motivating problem, intuition, definitions, worked examples, implementation boundaries and exercise answers. Cite primary papers or official documentation.
- Numerical demonstrations must calculate their displayed values. Fixed seeds should reproduce results. Describe simplified models explicitly.
- Keep project-specific quality and safety thresholds separate from universal scientific claims. PPO clipping and bounded actions are not safety guarantees.
- After changing content, run `npm run export:book`. Generate both complete language editions under `docs/` and `public/`, plus both standalone research reviews under `public/code/` (six files). Keep the source content authoritative; do not edit generated long-form files directly. `npm run build` alone does not refresh exports.
- Chapter guides live separately from the original chapters and keep the same `01`–`24` IDs. Each step needs an explanation, a worked example and a reason; every checkpoint option needs feedback. Answering a checkpoint must not mark a chapter complete.
- Export all guide steps and feedback, including collapsed content, plus the mathematical primer, research, glossary and full kiln model appendix. In Markdown symbol tables, convert TeX norm/absolute-value pipes to named `\Vert` / `\vert` delimiters before table escaping; check the resulting parsed table columns.
- Distinguish a reward received at step H (`gamma^(H-1)` under the first-reward convention) from the tail value after H steps (`gamma^H`). Display approximations honestly and avoid substituting rounded intermediate numbers into an apparent exact equality.
- Research articles live in `src/research/` with full bilingual bodies and stable IDs. Separate primary theory, simulation, first-party operational reports and proposed research; names of existing models do not establish the performance of a new combination.
- Figure records use the typed `src/concept-plates.ts` registry for 21 generated academic plates, plus seven preserved original illustrations. Keep stable IDs and standard authored Markdown image references. Translate titles, alt text, panel explanations and exact relationship guides; all 21 concept plates have separate Chinese and English rasters. Chinese (`zh`/`zh-*`) uses `images/diagrams/zh-CN/`; every other image locale uses English originals. The journey scene has a Chinese title variant; six text-free scenes remain language-neutral. Use `src/image-locales.ts` consistently in reading, gallery, viewer, downloads and exports; captions alone are not image localization. Do not interpret illustrative curves or node counts as measured performance or exact architecture. The original Mermaid inventory is provenance only, never live content or a download control.
- Resource URLs may be deduplicated, but every source ID and its chapter/research relationships must survive. Translate explanatory notes while retaining searchable bibliographic identities.

## Locales and persistence

- `src/i18n.ts` registers complete locales; `src/content/localized.ts` activates their content bundles. Use active content queries in views. Adding a locale requires complete chapters, guides, primer, glossary, sources, research bodies, interactive feedback, UI/accessibility text and exports before exposing its selector option.
- Keep chapter, module, lab, research and source IDs stable across locales. Existing chapter-level and glossary-group enum keys may remain Chinese internally; localize their visible labels. Preserve mathematical assumptions and numerical examples when translating.
- The current `text(zh, en)` and edition filename helpers are explicitly bilingual. A third locale requires extending these interfaces and their callers, not only the locale registry. See `rl-learning-web/docs/i18n.md`.
- Language switching remounts the current route and attempts scroll restoration. Do not claim that experiment parameters, simulation histories or workbench clocks persist across that remount.
- Store only version 2 chapter completion, theme, text size and locale under `rl-atlas-preferences-v2`. When falling back to `rl-atlas-learning-v1`, extract supported preferences only; do not delete the old key or restore, display or rewrite notes, bookmarks or last-read fields. Notes/bookmarks/resume controls and study-data import/export are removed; content downloads remain supported.
- A saved theme preference is `system`, `light` or `dark`; its resolved appearance is only `light` or `dark`. New preferences default to `system`, while existing explicit choices survive parsing. Use `src/theme.ts` to resolve system changes. Theme changes update appearance without remounting the current page or resetting its calculations, experiments or workbench.

## Navigation, overview and learning entry paths

- `src/navigation.ts` is the shared registry for localized navigation names, groups, icons and purposes. Keep existing hash route IDs stable. Distinguish the curriculum and primer from worked calculations, algorithm experiments and the integrated cement decision workbench; research articles and primary-resource lookup serve different purposes.
- The overview has one H1 naming reinforcement learning and process decisions. Explain 880°C as a teaching calciner-outlet setpoint. Keep content counts derived from the active registries, and use the shared path renderer rather than duplicate role descriptions.
- `src/learning-paths.ts` defines the stable URL entry IDs `ml`, `control` and `rl`; `src/learning-path-view.ts` shares cards/detail with `src/home.ts` and `src/roadmap.ts`. Entry sessions include prior knowledge, an observable outcome and clearly labelled time estimates. They introduce the subject without replacing the formal prerequisite sequence. Preserve source chapter prerequisites and explicitly identify the experienced-RL path's assumptions.
- Keep the path choice in `#/roadmap/<id>`, with a safe chooser for unknown IDs. Do not add profile, last-read or resume state. Progress counts only unique, valid, manually marked chapter IDs; choosing a path, viewing content or completing a calculator must not mark a chapter complete. Explain that records belong to the current browser.
- Both six/eight-week schedules cover every chapter exactly once. A checklist export must use the currently selected week count and edition, include the selected entry session when present, and retain existing manual marks. Week choice is temporary page state and returns to the default eight weeks on a remount; do not imply it persists through language changes or later visits.
- Preserve the generated hierarchy illustration and its actual top-to-bottom order: 04 information, 03 decisions, 02 regulatory control, 01 physical process. Use localized, keyboard/touch-operable controls and readable explanations. The homepage disclosure starts collapsed at <=760 CSS px and expanded above that breakpoint; restore focus when a resize would hide the active control. Dispose media-query and page listeners on route/locale changes.
- Source links and citation/reuse guidance must reflect actual repository metadata. An accessible public repository or an “open” learning label is not permission to invent a license. Internal navigation uses right arrows; outbound links are identified separately.
- Review decisions and implementation scope are recorded in `rl-learning-web/docs/experience-review-plan.md`; acceptance scope belongs in `rl-learning-web/docs/experience-review-verification.md`. Keep their claims limited to checks that actually ran.

## Worked formula cases

- Formula cases live in `src/formula-cases.ts` with pure solvers in `src/formula-case-math.ts` and reusable views. Keep the same case IDs, input meanings, presets and calculations across languages. Reuse established numerical kernels without modifying simulator contracts.
- Show the scenario, labelled inputs/units, original equation, numerical substitution, intermediate values and interpretation. Reject blank/nonfinite/out-of-domain inputs explicitly and remove stale successful results. Presets and reset must update controls and computed output together.
- Genuine termination removes bootstrap; an external time limit retains it. A GAE trace must stop at an episode reset. PPO clipping depends on advantage sign. SAC uses the minimum target critic and an explicit entropy term. A discrete CQL illustration is not a continuous-action implementation.
- Keep energy/action regularity and independent quality/oxygen costs separate. Lagrange rankings illustrate average-budget optimization, never permission to skip hard execution gates or a claim of pathwise safety.
- Export complete static worked examples for every chapter/research placement. Case fragments must not introduce duplicate anchors or unresolved application-only routes into Markdown. Test independent hand calculations, boundaries, both language exports and actual input interactions.

## Cement teaching workbench

- Keep the 13-dimensional teaching observation, normalized three-dimensional action, 5-minute cycle, physical RATE, project bounds and five-gate order aligned with the environment contracts. Clearly distinguish this three-CV teaching subset from the full project's six CVs. Its explicit teaching dynamics are not a trained industrial policy.
- Track assay sample time and release time independently. Policies may read only released assays and their sample age; hidden current quality and future assays are evaluation-only. Mark the teaching true-quality overlay as privileged information.
- Keep requested and executed actions separate. Physical SP updates and smoothness terms use executed increments. Rejection holds SP but still advances time, dynamics and measurements; it does not freeze the process.
- Compare branches from the same snapshot with paired exogenous noise without advancing the main simulation. Continuing-task horizon exhaustion is truncation with bootstrap retained, never a physical terminal state.

## Rendering and interaction

- Protect both backtick and tilde code fences before processing math. Sanitize authored Markdown HTML; keep KaTeX `trust: false`. Decorate only exact registered local image paths after sanitization; never import a diagram runtime or interpret authored code as a drawing.
- Use relative assets and hash routes so static subpath hosting works. Downloadable examples must exist in `public/code/`.
- Keep mobile sidebar links inert while hidden. Preserve visible focus, dialog labels, reduced-motion behavior and readable narrow layouts. Image dialogs must close with Escape, restore focus, clean up on route changes and constrain actual-size scrolling inside the dialog. Keep intrinsic image dimensions and compact aspect ratios to avoid layout shifts or long narrow diagrams.
- `saveState` can fail. Never overwrite failure feedback with a success message or imply that a current-session preference has been durably saved.
- Search results must reflect the visible query when a dialog reopens and the active content edition. Resource and figure filtering must preserve meaningful classifications and source-page links.
- Learning state stays in the current browser. Do not imply cross-device sync or cloud storage.
- When a stepper replaces the active control, restore keyboard context by focusing the newly rendered step heading after the render completes. Give fragments unique heading IDs so multiple Markdown sections do not collide.
- Narrow layouts must account for margins in percentage widths. Long formulas/tables may scroll inside their own containers; they must not expand page width. Verify the workbench clock, expanded symbol tables and long derivations at 375 CSS px content width.

## Local startup

- `just dev` is the supported one-command entry from `rl-learning-web/`. Its setup recipe checks Node >= 22.12 and prepares dependencies from the lock file; repeated runs reuse a matching installation.
- Keep the setup script cross-platform and independent of Python, Bash or service credentials. The justfile uses `cmd.exe` on Windows. Do not imply Windows runtime verification when only Linux execution and static recipe review were performed.

## Quality checks

From `rl-learning-web/`, run `just check` (export, tests, strict type check and production build), or the equivalent `npm run export:book`, `npm test`, and `npm run build`. Tests cover curriculum/guide integrity in both locales, authored formulas, every original figure occurrence, bilingual reading guides, actual WebP dimensions, parsed export tables, source-ID relationships, local resource links and actual numerical behavior. Figure replacements must preserve the non-figure prose/equations/code and numerical kernels; update the baseline only for a separately justified content change. Use a supported browser preview for interaction/layout checks, including language switches, both themes, research navigation and catalogue filters; unit checks alone do not establish browser compatibility.

Read [the experience review plan](../../../rl-learning-web/docs/experience-review-plan.md) and [experience verification record](../../../rl-learning-web/docs/experience-review-verification.md) for the current UX iteration. Previous acceptance records remain in `rl-learning-web/docs/verification-v2.md` and `docs/verification.md`; experiment limitations are in `docs/labs.md`. Include URL paths, selected schedule downloads, manual progress, system/explicit theme behavior and responsive hierarchy controls in relevant browser checks. Preserve illustration provenance in `docs/illustrations.md` and `docs/illustrations-v2.md`. Do not commit `node_modules/`, `dist/`, temporary QA fixtures or generated caches.
