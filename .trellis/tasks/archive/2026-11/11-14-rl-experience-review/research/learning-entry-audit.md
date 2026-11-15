# Learning entry audit

Baseline: `ca36ca3`, website `rl-learning-web/`. Reviewed against the supplied single-screenshot critique.

## Verified current behavior

- `src/main.ts::renderChapter` already exposes each chapter's duration, difficulty, learning objectives and prerequisite links. `chapterRow`, `moduleCard`, `renderCurriculum` and the chapter completion action use the existing manual completion state. This is a discoverability gap on the overview, not missing functionality.
- `renderRoadmap` contains a six/eight-week selector, an outcome for each week, a concept image and a checklist download. It has no alternative entry session based on previous knowledge.
- The checklist download always says six to eight weeks even when a specific schedule has been selected. Preserve the chosen schedule in revised export metadata.
- Eight mathematics units, 24 chapters, ten formula cases, fourteen algorithm experiments and one multi-step kiln workbench are distinct resource types. They complement each other and must be explained rather than merged into an ambiguous count.
- All original overview entry cards are anchors. Their complete surface is already clickable.
- Prior user instructions deliberately removed notes, bookmarks and resume-learning UI. Role paths should introduce no last-read or profile storage and should preserve manual chapter completion.

## Proposed entry sessions

These are starting sessions, not replacements for the full course or permission to bypass chapter prerequisites. Time estimates are planning guidance, not completion guarantees.

| Role ID | Background | Initial route sequence | Outcome |
| --- | --- | --- | --- |
| `ml` | Familiar with neural networks; new to RL and probability | `#/primer/probability` → `#/primer/expectation` → `#/cases/return-bootstrap` | Calculate an expected outcome and explain a discounted return |
| `control` | Familiar with process control, SP/PV and feedback | `#/primer/language` → `#/cases/setpoint-response` → `#/kiln` | Distinguish requested action, executed SP increment, lagging PV and delayed assay |
| `rl` | Familiar with Bellman, Actor–Critic and continuous-action RL | `#/research/history` → `#/research/objectives` → `#/research/sequential` | Formulate an initial industrial decision problem with explicit objectives, constraints and information timing |

The first two sessions use visibly labelled approximate reading/practice budgets (45 and 50 minutes). The research entry uses existing article reading estimates (24 + 29 + 32 = 85 minutes). None of these times include mastering the whole subject.

For further learning, the ML and control entries lead through ordered RL foundations (chapters 01–08). The experienced-RL entry leads through modelling, evaluation, the case study, offline RL, model-based reasoning and constrained research (chapters 19–24), assuming the prior RL material. Each recommended chapter should expose its original prerequisites and reading estimate. Course completion counts are derived only from manually marked chapter IDs.

## Integration boundaries

- Reuse the same typed path registry for the overview and `#/roadmap/<role>`.
- Keep the existing `#/roadmap` route and six/eight-week schedule.
- Keep chapter and resource IDs unchanged.
- Show an observable outcome, prior knowledge, introductory difficulty and first-session estimate for each path.
- No new dependencies, account features, automatic completion or persistent profile state.
- Verify both languages, every route target, prerequisite links and manual-completion counts.
