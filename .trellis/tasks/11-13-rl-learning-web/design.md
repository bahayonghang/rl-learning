# Technical design

Use Vite + strict TypeScript and native semantic HTML/CSS. Reuse Mermaid for exact flowcharts, KaTeX for mathematics, Marked for Markdown, DOMPurify for sanitization and Lucide for icons. No application server, paid API, external runtime CDN, account or database is needed. This avoids introducing a heavy application framework.

Content is structured TypeScript containing original Markdown. Shared `Chapter`/`Module`/`Source` contracts enable static navigation, search and references. Hash routing works on repository subpaths and static hosting. Local storage uses a versioned, validated data model. Markdown rendering preserves mathematics and Mermaid blocks before sanitization; Mermaid uses strict security. Code and math have copy/download functionality.

Home, curriculum, chapter reader, laboratory, roadmap, references, notes and illustration gallery are real views. Browser experiments use seeded pseudo-randomness and deterministic numerical kernels; stochastic simulation results are explicitly labeled. Industry illustrations are conceptual; no operational claims or physical device connectivity. Source references and illustration provenance are recorded.

Parallel ownership: foundations content (chapters 1–12), advanced content (13–24), interactive laboratories, main app/design/integration. Shared files are owned by main integrator.
