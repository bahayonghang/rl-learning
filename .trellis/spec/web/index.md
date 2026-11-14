# RL Learning Web Guidelines

## Scope and boundaries

`rl-learning-web/` is the standalone Chinese educational website. It uses Vite, strict TypeScript, semantic HTML/CSS, local numerical experiments, KaTeX and Mermaid. It is not the production kiln environment or a training backend. Follow the existing algorithm, environment and experiment contracts when discussing the industrial case; never invent data, baseline outcomes or field performance.

## Content contracts

- Canonical chapter and source data live in `src/content/`; keep stable chapter IDs `01`–`24`, populated module mappings, prerequisites and source IDs.
- Explain the motivating problem, intuition, definitions, worked examples, implementation boundaries and exercise answers. Cite primary papers or official documentation.
- Numerical demonstrations must calculate their displayed values. Fixed seeds should reproduce results. Describe simplified models explicitly.
- Keep project-specific quality and safety thresholds separate from universal scientific claims. PPO clipping and bounded actions are not safety guarantees.
- After changing content, run `npm run export:book`. The two complete Markdown books are generated from the same canonical chapters.

## Rendering and interaction

- Protect both backtick and tilde code fences before processing math. Sanitize authored Markdown HTML; keep KaTeX `trust: false` and Mermaid strict security.
- Use relative assets and hash routes so static subpath hosting works. Downloadable examples must exist in `public/code/`.
- Keep mobile sidebar links inert while hidden. Preserve visible focus, dialog labels, reduced-motion behavior and readable narrow layouts.
- `saveState` can fail. Never overwrite failure feedback with a success message; keep unsaved note text available for copying/export.
- Search results must reflect the visible query when a dialog reopens. Import limits must admit the application's maximum valid export, including UTF-8 size and JSON escaping.
- Learning state stays in the current browser. Do not imply cross-device sync or cloud storage.

## Quality checks

From `rl-learning-web/`, run `npm run export:book`, `npm test`, and `npm run build`. Tests cover curriculum integrity, all authored formulas and diagrams, local resource links and actual numerical behavior. Use a supported browser preview for interaction/layout checks; unit checks alone do not establish browser compatibility.

Read `rl-learning-web/docs/verification.md` for the recorded acceptance scope and `docs/labs.md` for experiment limitations. Preserve original illustration provenance in `docs/illustrations.md`. Do not commit `node_modules/`, `dist/`, temporary QA fixtures or generated caches.
