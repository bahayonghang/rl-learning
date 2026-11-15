# Technical design

One integrated UX iteration on the existing Vite/TypeScript frontend. Content registries, hash routes, numerical solvers, KaTeX, artwork and local preferences stay authoritative.

## File ownership and interfaces

- Root: `main.ts`, `navigation.ts`, icon registration, integration, docs and browser QA.
- Home implementer: new `home.ts` and `home.css`; export `renderHomePage(host: HTMLElement): (() => void) | void`. Import the shared `renderLearningPathCards()`; use live content counts, not hardcoded navigation badges. No existing moduleCard dependency required.
- Learning-path implementer: `learning-paths.ts`, `learning-path-view.ts`, `learning-paths.css`, `roadmap.ts`, path tests. IDs `ml`, `control`, `rl`. Export `renderLearningPathCards(): string` and `renderRoadmapPage(host: HTMLElement, pathId: string, completed: readonly string[]): Promise<void>`. Extract and improve old roadmap; preserve schedules/downloads.
- Accessibility implementer: `theme.ts`, `storage.ts`, `shell-accessibility.css`, preference tests. Export `ThemePreference`, `ResolvedTheme`, `isThemePreference()`, `resolveTheme(preference, systemDark)`; root integrates native selector and matchMedia listener.

## Navigation and page contracts

One typed registry drives labels, icons, groups and short purposes. Start/learn: overview, Start here, curriculum, primer. Practice: formula cases, algorithm labs, integrated cement decision workbench. Research/reference: industrial decision research, glossary, sources, figures. Omit decorative counts in navigation; expose labelled live counts in content. Old routes remain valid. Background path choice lives in URL, not storage.

## Home

One H1 plus concise audience/outcome copy and two distinct actions. Keep existing warm generated illustration, controlled size and dark-theme brightness. Label actual top-to-bottom 04→01 layers with buttons and an adjacent live explanation/link; no hover-only interaction. Role cards follow immediately. Genuine first-party source links, clearly distinguished learning modes and content counts complete the page. No arbitrary license is granted.

## Compatibility and rollback

Same version-2 preference key; add only supported `system` theme value and preserve existing explicit light/dark values. Resolve OS appearance separately from saved preference. Theme changes do not rerender the page or reset experiments. Preserve sidebar inert/focus and dialog behavior. No new backend, dependency, numerical change or state migration. Standard Git revert restores the previous UX.
