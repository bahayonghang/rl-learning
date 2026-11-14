# Advanced English edition review

## Scope

Added complete English editions in `src/content/en/advanced.ts` and `src/content/en/advanced-guides.ts`. The Chinese originals remain unchanged by this task.

- Chapters 13–24: 12 complete chapters, including objectives, tags, body text, worked examples, code, tables, exercises, reference answers, and source mappings.
- 20 source records, retaining source IDs, URLs, and authors.
- 12 guided lessons: all 71 steps, 60 symbol definitions, 12 checkpoints, all 36 choices and their corresponding feedback.
- Existing chapter IDs, module numbers, durations, prerequisites, lab links, and Chinese `level` enum keys remain stable. The interface translates the enum labels.

Exports: `advancedChaptersEn`, `advancedSourcesEn`, and `advancedGuidesEn`.

## Validation performed

The two editions were imported with Node and the existing `tsx` loader. Structured comparisons checked chapter/source/guide counts, all stable metadata and mappings, per-chapter objectives and tag counts, all guide step and symbol counts, checkpoint choices/feedback counts, and correct-answer indices.

All original 133 mathematical expressions in chapter bodies remain unchanged. All guide formula and symbol strings match their Chinese originals exactly. The English Chapter 21 adds one inline occurrence of `a_t` to clarify the already-established execution semantics described below; it changes no equation.

Nine Python blocks were parsed using Python's `ast` module. Their ASTs match the originals exactly, so comment translation introduced no executable changes. Seven Mermaid blocks preserve the original graph syntax and topology after replacing quoted labels with placeholders. This checks structure, not visual line wrapping. All 30 body hyperlinks match, including downloadable code paths. The number of paragraphs, headings, table rows, fenced blocks, and answer disclosures matches chapter by chapter.

A recursive scan found no Han characters in English content leaf strings, excluding the deliberately retained `level` enum values. Source author names, IDs, mathematical symbols, API identifiers, and code variables retain their source forms.

A full `tsc --noEmit` was attempted during parallel integration. It reported missing not-yet-created sibling locale/research/catalogue modules and the pending `getLabs` export, plus dependent call-site errors; neither translated file produced a type error. After the parallel modules landed and the interactive localization was completed, `npx tsc --noEmit --pretty false` passed for the entire project. Root will perform the remaining integrated build and browser acceptance checks.

## Mathematical and evidence boundaries retained

- GAE separates bootstrap masks from trace masks; truncation retains a final-observation value and stops accumulation across reset.
- Finite-trajectory policy-gradient discount weights are not silently equated with a differently sampled practical surrogate.
- PPO takes the minimum after multiplying by signed advantage; clipping is not a hard bound on every probability ratio or a safety guarantee.
- Gaussian/tanh densities retain the change-of-variables Jacobian and stable expression; continuous densities are not event probabilities.
- Assays retain sampling and availability clocks; observations cannot use future assay labels or test-fitted preprocessing.
- Setpoint proposals and executed increments remain distinct. Five gate layers and authorization remain outside an actor's reward claim.
- Coal/electricity/smoothness benefit stays separate from quality and oxygen costs. Project thresholds are identified as project conventions.
- For closed-loop model-error propagation, sensitivity includes the policy's action response (`Lx + La × Lπ`) under matching external disturbances.
- Offline RL, model-generated data, software checks, and simulation scores are not presented as real plant validation. Operator and PG-MOEA/D-IEpsilon comparisons remain pending unless actually run.

## Clarification for the Chinese owner

Chapter 21's original body uses `a_t` in its smoothness reward while its guided lesson explicitly uses executed increments. The English body retains the original equation and adds: “In the physical smoothness term, a_t denotes the increment actually executed after gating; preserve the requested increment separately.” This follows the reviewed guide contract and does not alter the numerical example. Root was notified so the Chinese body can receive the same clarification if needed.

## Limits

This is a translation and semantic alignment review, not a fresh literature review, plant model validation, or a new algorithm implementation. Browser layout, final site locale switching, and rendered math/Mermaid verification belong to the integrated acceptance pass. The original numerical kernels and downloadable Python programs were not modified.


## Follow-on: interactive UI localization

Localized all presentation text in `src/labs/{index,ui,foundations,deep,applied}.ts` and `src/kiln/workbench.ts` using `text(zh, en)` at render time. This includes prompts, metadata, controls, tables, chart labels, notes, accessibility labels, and all post-action feedback. There is no DOM text replacement or numerical localization inside an algorithm.

`getLabs()` returns metadata for the active locale; `findLab()` now uses it. The exported `labs` array keeps the same 14 literal IDs, renderer functions, chapter mappings, and aliases for content-contract checks. Kernel scenario descriptions, gate-reason labels, and branch titles are translated in the kiln rendering layer. Stage/channel/mode metadata is evaluated at mount time so a remount after changing locale uses the new language.

Neither `src/labs/math.ts` nor `src/kiln/math.ts` was changed. Numerical assumptions, data generation, normalized actions, reward/cost separation, gate ordering, assay availability, and the 72-step cap are unchanged.

### UI validation

An ad hoc JSDOM differential harness imported the original UI from `git show HEAD` and compared it with the localized UI in both languages. It exercised 92 render states across all 14 laboratories and 40 kiln states. The Chinese HTML matched the original DOM exactly. English and Chinese numeric cards, SVG curve geometry, input values/disabled states, gate statuses, and branch-comparison numerical cells matched exactly. Scans of visible text and accessibility/title attributes found no remaining Han characters in English states and no undefined text.

Covered lab actions included every button, alternative select values, termination/truncation switches, and boundary controls for discount, signed advantage, and gate inputs. Kiln coverage included all four process stages, all three prediction answers, pulse execution, manual/hold/feedback modes, five scenarios, plotted-channel selection, truth overlay, branch comparisons, the 72-step truncation boundary, reset, rapid action reversal, and listener cleanup. The automated differential run explicitly exercised plotted channel T₂; checking the remaining channel layouts is part of browser acceptance.

The final text-only singular/plural adjustment to the assay status leaves the Chinese sentence and every number unchanged. The complete differential harness was rerun after it.

### Remaining integrated checks

The parent owns browser acceptance for long English labels, responsive tables, SVG text, theme colors, and route switching. These JSDOM checks establish content coverage and unchanged numerical interaction behavior; they do not measure rendered widths or replace a browser layout review.
