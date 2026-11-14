# Bilingual offline exports — v2

## Generated deliverables

`npm run export:book` now writes six files from the current authored content:

| File | Scope |
|---|---|
| `docs/rl-atlas-tutorial.md` | Complete Chinese textbook with paths relative to `docs/` |
| `docs/rl-atlas-tutorial.en.md` | Complete English textbook with paths relative to `docs/` |
| `public/rl-atlas-tutorial.md` | Complete Chinese downloadable textbook |
| `public/rl-atlas-tutorial.en.md` | Complete English downloadable textbook |
| `public/code/research-review.md` | All nine Chinese research studies and their primary references |
| `public/code/research-review.en.md` | All nine English research studies and their primary references |

The complete textbook in each language includes 7 modules, all 24 chapter bodies, all 24 case guides and 154 derivation steps, every checkpoint choice and feedback item, 8 mathematics units, 36 glossary entries, the full kiln model appendix, and the nine research studies. The previous single `researchBody` is no longer used as the book's research section.

The four new concept illustrations include the same localized title, full explanation, and four region descriptions as the website's figure catalogue: 16 region descriptions per edition. Their explanation identifies the illustrations as conceptual, not measured data, identified models, or engineering drawings. Exact mechanisms remain in the authored equations and Mermaid sources.

## Source identity and evidence

The full books combine the original 42 source IDs and 35 review IDs, preserving all 77 IDs while grouping them into 59 unique URL records. Every ID has an explicit `source-ID` anchor and an index row. Shared URLs retain the original aliases and reading notes instead of silently dropping one record.

The standalone review includes all 35 review source IDs, the references assigned to every study, publication venues, and each localized reading/evidence-boundary note. It is a research-only document; chapter, primer, glossary, and workbench links point to the same-language complete textbook.

The exporter does not invent or update literature claims. Research bodies and source notes come from the reviewed research modules. Operator/PG-MOEA/D-IEpsilon results, plant claims, model uncertainty, time leakage, and quality/oxygen boundaries remain as authored.

## Public API

Existing imports and the default Chinese call remain valid:

```ts
buildBook(destination: 'docs' | 'public', locale: 'zh-CN' | 'en' = 'zh-CN'): string
buildResearchReview(locale: 'zh-CN' | 'en' = 'zh-CN'): string
getWorkbenchAppendix(locale: 'zh-CN' | 'en' = 'zh-CN'): string
formatBody(
  markdown: string,
  destination: 'docs' | 'public' | 'code',
  locale: 'zh-CN' | 'en' = 'zh-CN',
  headingShift = 2,
): string
groupReferences(records: readonly Source[]): BookReference[]
exportBook(): Promise<void>
```

`workbenchAppendix` remains the Chinese appendix constant. `workbenchAppendixEn` adds its English counterpart. Book building is synchronous and uses the explicitly requested edition, independently of the active UI locale. Localized figure metadata is read synchronously with the caller's locale restored in a `finally` block.

The export command checks that all nine distinct research pages exist and that both language bodies are populated before writing the corresponding edition. It reports content/source counts and file sizes without adding timestamps, so a fresh generation is deterministic for a fixed source snapshot.

## Offline paths and anchors

| Resource | `docs/` textbook | `public/` textbook | `public/code/` review |
|---|---|---|---|
| Teaching code | `../public/code/name.py` | `./code/name.py` | `./name.py` |
| Concept image | `../public/images/name.webp` | `./images/name.webp` | `../images/name.webp` |
| Research route | `#research-id` | `#research-id` | `#research-id` |
| Chapter route | `#chapter-13` | `#chapter-13` | `../rl-atlas-tutorial[.en].md#chapter-13` |
| Kiln route | `#kiln-workbench` | `#kiln-workbench` | `../rl-atlas-tutorial[.en].md#kiln-workbench` |

Math-unit and glossary routes follow the same complete-book rule. Each concept illustration has a stable `figure-ID` anchor. Both tilde and backtick fenced code are protected before heading/link rewriting, so Python comments and literal example routes remain intact. Repository-specification links in the model appendix resolve to their canonical repository URLs from every output location.

Relative asset relationships are documented in each export. Moving a Markdown file alone does not embed its images or code. Preserve the matching `images/` and `code/` paths when copying the offline directory tree. Browser interaction still belongs to the website; the export contains its written derivations and model contract, not an executable browser embedded in Markdown.

## Kiln appendix translation

`docs/kiln-workbench.en.md` is a faithful translation of the complete existing model document: all 10 sections, five suggested experiments, model equations, numerical examples, parameter tables, five gate definitions, delayed publication rules, reward/cost separation, matched-disturbance comparisons, and implementation limits.

Automated comparison verified all 20 displayed equations after normalizing only translated `\\text{...}` labels. All 56 inline-code examples/identifiers match in order, and all 19 heading levels match. No Han characters remain. Numbers written as ordinary English words in prose are translated presentation, not changes to model constants.

## Validation performed

A snapshot-based export check generated all six files and verified exact equality with the corresponding `buildBook`/`buildResearchReview` result. It compared every transformed source chapter, math unit, research body, and the entire model appendix with the output; all guide explanation/example/reason/formula and feedback fields and every glossary explanation were also found.

Across the six files:

- 56 local image/code/document links resolved to existing files, including cross-file chapter/appendix fragments.
- 948 explicit anchors were checked for uniqueness within each document; all internal links resolved.
- 96 chapter-body inclusions, 96 guide inclusions, and 54 research-body inclusions were confirmed across the duplicated destinations/editions.
- 194 fenced code/diagram blocks were parsed by the Markdown lexer.
- Every expected source-ID anchor was present.
- English books and the English research review contained no Han characters.
- A focused fixture verified research/chapter/code/image rewriting from `public/code/`, while preserving a literal route and comment inside a tilde code fence.
- The caller's active locale remained unchanged after each build.
- Strict project TypeScript checking passed after the export changes.

The research author separately reported parsing all 487 formulas, 18 Mermaid diagrams, and 16 tables across the bilingual research bodies. This export pass preserves those sources rather than rerunning an independent literature review. Full site tests, production build, and browser layout acceptance are coordinated by the parent task. Content edits after generation require another `npm run export:book`; do not hand-edit the generated books.
