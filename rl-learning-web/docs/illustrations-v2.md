# Research illustrations and identity — November 2026

These five original raster assets were generated with the session's built-in image generation tool on 2026-11-14. The assets use a warm paper, charcoal and terracotta palette. They are conceptual teaching illustrations, not measured plots, precise network specifications, industrial evidence or an Anthropic/Claude identity.

The existing three course-orientation images and their original provenance remain documented in [illustrations.md](illustrations.md). The site identity is not counted among the 27 figures in the visual library.

## Assets and interpretation

| Asset | Purpose | Exact content lives in |
|---|---|---|
| `public/images/atlas-mark.webp` | Transparent kiln/flame and feedback-loop emblem, used in the header, sidebar and favicon | Original identity only; no scientific claim |
| `public/images/operations-stack.webp` | Process, measurements, supervisory decisions and regulatory control | Research history chapter and its Mermaid diagram |
| `public/images/evolution-search.webp` | Candidate trajectories, surrogate evaluation, feasibility and preference selection | Evolutionary optimization chapter, objective and constraint definitions |
| `public/images/safe-agent.webp` | Available history, encoder, policy/evaluation networks and execution gates | Network chapter, candidate/executed action equations and precise gate order |
| `public/images/world-model.webp` | Observed state, learned models, short imagined rollouts and conservative selection | Research agenda, model error propagation and evaluation protocol |

Each of the four research illustrations has four bilingual numbered explanations in `src/figures.ts`. Network node counts and connections in the artwork are illustrative. The three policy sliders show the teaching subset; the full research contract has six controlled-variable setpoints. Mermaid diagrams, rendered equations and surrounding prose specify the actual relationships, dimensions and losses.

Images were generated as PNG and converted without compositional edits to WebP with ImageMagick (`-quality 86 -define webp:method=6`). Only the five optimized WebP assets are committed. They total approximately 0.87 MiB. The identity preserves transparency; the four explanatory illustrations use opaque warm paper backgrounds.

## Exact identity prompt

Transparency: `true`.

```text
Use case: logo-brand. Create an original compact app identity icon for RL Atlas, an educational website about reinforcement learning for cement process operations. A single distinctive rounded symbol combines a small terracotta kiln/flame core with an orbiting decision loop, expressed as a warm, thoughtful engineering emblem. Clean softly sculpted flat raster illustration, legible at 32 by 32 pixels, simple bold silhouette and very few internal details. Warm burnt orange #C26645 and pale cream highlights, a little dark warm brown for definition, no green. Centered square composition with generous transparent padding, genuinely transparent background. No letters, no words, no badge text, no Claude or Anthropic logo, no generic robot face, no mockup, no shadows cast onto a backdrop. This will replace a text avatar in the navigation header; polished and restrained.
```

## Research image prompts

Transparency: `false`. Each exact prompt consists of the common prefix, the corresponding scene and the common suffix below.

### Common prefix

```text
Use case: scientific-educational. Asset for a serious bilingual research tutorial, landscape 16:10 composition, warm off-white paper background #F7F3EA, burnt orange #C26645, warm charcoal, taupe, muted slate accents; no green. Editorial technical illustration with crisp shapes, subtle paper texture and soft isometric depth, generous clean margins, four distinct components easy to inspect.
```

### Operational hierarchy

```text
An information-rich educational cutaway scene of cement operational decision-making, a warm terracotta rotary kiln and preheater/cooler plant at the bottom; above it a separate low-level control console, then a supervisory decision desk, then observation/quality-sensing cards. Four clearly differentiated zones numbered 01 02 03 04, no words, no other text. Show a material conveyor, thermometer, pressure dial, delayed laboratory vial with clock, and three small setpoint dials, so the illustration communicates process, measurements, decisions and control. Do not draw precise wiring or impose scientific arrows; the accompanying editable diagram will specify exact connections. No numeric plots or fictional performance metrics.
```

### Evolutionary search

```text
An information-rich conceptual illustration of constrained evolutionary optimization for cement setpoint trajectories. Left: a stack of distinct candidate trajectory cards represented by smooth terracotta curves WITHOUT axes or numbers. Center: a small kiln surrogate-model testing bench with a quality vial and energy dial, and a clear screening frame that filters some candidate cards. Right: a small diverse shortlist of three cards with balanced fuel/quality/stability icons, and a selected card beside a supervisory control dial. Four zones numbered 01 02 03 04, no words, no other text. Show search, model evaluation, feasibility and preference selection through objects. This is an explanatory conceptual scene, not a measured Pareto chart or exact algorithm wiring.
```

### Policy and execution architecture

```text
An educational conceptual exploded view of a history-based reinforcement-learning decision system for a cement kiln. Four clearly separated regions, numbered 01 02 03 04: (01) timestamped industrial signal strips and a delayed assay vial plus clock; (02) a compact neural feature encoder shown as layered amber/terracotta nodes; (03) one action-generation module with three bounded slider outputs alongside two smaller evaluation-network modules; (04) a five-part translucent screening barrier and a low-level control console beside a miniature rotary kiln. Rich useful components, restrained scientific illustration. No equations, no dimensional claims, no detailed wiring, no words beyond zone numbers. Exact tensor paths and losses are defined in an adjacent Mermaid diagram, so this art is conceptual, not a formal architecture specification.
```

### Short model rollouts

```text
An information-rich conceptual illustration of short-horizon model-based industrial decision-making. Four distinct zones numbered 01 02 03 04: a current kiln-state snapshot represented by sensor cards; a cluster of three compact surrogate-model boxes with amber neural motifs; three alternative short imagined sequences of translucent miniature kiln states, each stopping after a few steps with uncertainty shown by progressively softer transparent boundaries; and a conservative selection desk that returns a bounded setpoint card to a real opaque kiln control console. Show the distinction between observed process, imagined futures and selected suggestion. No words, no numbers beyond zone IDs, no measured data charts, no safety guarantee or exact computation schematic.
```

### Common suffix

```text
Avoid cover art, hero slogans, decorative robots, logos, watermark, busy text, fabricated evidence. Make objects useful for explaining the topic, with high contrast and accessible visual separation.
```

## Review

All five outputs were visually inspected before integration. The gallery separates course orientation artwork from instructional illustrations and editable diagrams. The four numbered reading guides are included in both language editions and the complete offline books. There are no generated scientific data plots, performance claims or equations baked into these assets.
