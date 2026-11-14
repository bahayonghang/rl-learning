# English translation review: foundations, guided derivations, primer, and glossary

Reviewed on 2026-11-14 against the Chinese content currently in this checkout. This is a complete authored English edition of the owned material, rather than an English navigation layer or an outline referring readers back to Chinese chapters.

## Delivered modules

| Module | Exports | Coverage |
| --- | --- | --- |
| `src/content/en/foundations.ts` | `foundationChaptersEn`, `foundationSourcesEn` | Chapters 01–12, all metadata, 92 sections, 12 exercise-and-answer sections, 16 source records |
| `src/content/en/foundations-guides.ts` | `foundationGuidesEn` | 12 guides, all 83 derivation steps, 72 symbols, 12 checkpoints with three options and three individually explained feedback messages each |
| `src/content/en/primer.ts` | `primerIntroductionEn`, `primerUnitsEn` | Introduction and all 8 mathematics units, with all 32 sections, examples, formulas, and calculator/chapter mappings |
| `src/content/en/glossary.ts` | `glossaryEn` | All 36 terms, definitions, kiln interpretations, cautions, original English aliases, symbols, and chapter mappings |

The translated chapter bodies contain 80,279 characters. The guide narrative fields contain 95,473 characters, the primer bodies 24,345, and the glossary's visible text 11,296. These counts include Markdown or mathematical notation where present and single newline separators between entries; they are content-size checks, not a claim about reading time. Together they represent approximately 30,246 whitespace-separated tokens of English text and notation. Exact linguistic word counts vary with the treatment of equations, punctuation, and code.

## Preservation decisions

Stable chapter IDs, sequence numbers, module assignments, prerequisite IDs, laboratory IDs, source IDs, source URLs, durations, answer indices, calculator IDs, and chapter cross-references remain unchanged. The existing level values `入门`, `进阶`, and `实践` and glossary group values remain enum identifiers for the interface to localize. They are the only deliberately retained Chinese labels in the translated data schema.

Every visible narrative field has an English value: body text, headings, exercise answers, code comments, Mermaid labels, guide explanations and worked examples, symbol names and units, checkpoint feedback, source notes, primer content, and glossary cautions. No visible field falls back to a Chinese body.

The guide implementation reuses only the original language-neutral `formula` and `symbol` strings. Its helper checks step and symbol counts before constructing the English object. All scenario, decision, intuition, derivation, explanation, example, rationale, assessment, and takeaway text is explicitly translated. This shares mathematical content without sharing a Chinese narrative fallback. Chapter and primer Markdown bodies use `String.raw` to preserve LaTeX backslashes.

The two chapter-05 mathematical text labels for left/right and the primer's recovery/hard-to-burn labels are translated inside `\text{...}`. All other extracted formulas remain unchanged. Natural English word order changes the order of a few inline expressions, so equivalence is checked as a multiset within each document, preserving duplicate occurrences instead of comparing only unique formulas.

## Verification performed

A scoped TypeScript check passed for all four English modules and their imported type/content dependencies:

```sh
node_modules/.bin/tsc --ignoreConfig --noEmit --skipLibCheck \
  --moduleResolution bundler --module esnext --target es2023 \
  src/content/en/foundations.ts src/content/en/foundations-guides.ts \
  src/content/en/primer.ts src/content/en/glossary.ts
```

The `--ignoreConfig` flag is required by the upgraded TypeScript CLI when source files are supplied directly. This scoped check does not replace the root agent's application-wide build and integration tests.

An executable parity audit imported both language editions through `node --import tsx` and completed with zero errors. It checked:

- All stable metadata listed above, objective/tag counts, section depth sequences, exercise-answer coverage, fenced-block language sequences, and every Markdown link URL.
- Exact mathematical multisets for each of the 12 chapters and 8 primer units, with only the explicitly translated text labels normalized for comparison.
- Byte-for-byte formula and symbol equality across all 12 guided derivations, matching step counts and answer indices, and three options with three feedback messages per checkpoint.
- No Chinese characters in visible English chapter, guide, source, primer, or glossary narrative fields.
- All 12 translated Python examples against the original examples using Python's abstract syntax tree. The executable structures are identical; comment translation does not alter behavior.
- All 4 translated Mermaid diagrams using the real Mermaid parser, a JSDOM document, strict security, and disabled HTML labels. Their graph structures match the original after replacing the translated quoted labels with placeholders.
- Actual KaTeX rendering with `throwOnError: true`, `trust: false`, and `strict: 'ignore'` for every owned formula and mathematical symbol: **564 successful renders**. These comprise 223 chapter expressions, 165 primer expressions, 155 guide formula/symbol fields, and 21 glossary symbols. Code fences and inline code were excluded through the Markdown tokenizer.

| Chapter | Sections | Mathematical expressions | Exercise answer blocks |
| --- | ---: | ---: | ---: |
| 01 | 7 | 25 | 1 |
| 02 | 7 | 27 | 1 |
| 03 | 8 | 20 | 1 |
| 04 | 8 | 14 | 1 |
| 05 | 8 | 23 | 1 |
| 06 | 8 | 14 | 1 |
| 07 | 8 | 24 | 1 |
| 08 | 9 | 17 | 1 |
| 09 | 7 | 15 | 1 |
| 10 | 7 | 16 | 1 |
| 11 | 7 | 10 | 1 |
| 12 | 8 | 18 | 1 |

## Mathematical and teaching details retained

The translation preserves the original reward timing: the first reward is `R_{t+1}` with weight 1; the single reward at `t+12` has weight `gamma^11`, while the return tail after 12 steps has weight `gamma^12`. External truncation retains the final observation for bootstrapping. Finite-horizon tasks and continuing kiln operation remain distinct.

The kiln case retains the upper-level normalized setpoint action, five-minute decision interval, 880°C starting setpoint, 2°C-per-step scaling, lower APC/PID tracking, historical observations, and assay sample/release-time distinction. Requested and executed actions remain separate, and reward remains separate from quality and safety costs. No examples are promoted to plant measurements or operating recommendations.

The UCB guide keeps the internally consistent total of 100 samples, with 95 for hold and 5 for increase. Double DQN retains the precise inequality for the same transition and the same target estimates; it does not claim an ordering between separately trained networks. The REINFORCE derivation retains the discounted finite-task weighting, the conditions under which an action-independent baseline has zero expected score contribution, and the distinction between stopping a gradient and removing statistical dependence.

## Scope and limits

This translation introduces no new sources, plant data, performance claims, or operating thresholds. It preserves the already reviewed teaching material and its qualifications. Formula parsing and structural parity establish that the translated edition retains the technical objects; they are not a substitute for a new empirical validation of algorithms or industrial models.

Application routing, locale switching, search, interface labels, full-book export, and browser layout are integrated and checked separately by the root agent. No shared application files, dependency files, tests, or generated textbook outputs were edited as part of this translation scope. No commit or push was performed by this agent.
