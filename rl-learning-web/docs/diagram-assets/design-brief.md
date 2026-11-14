# Compact academic concept plates

The user explicitly requested replacement of every Mermaid drawing with original image-generated figures. There are 21 active concepts: 11 chapter figures, 9 research figures and the learning roadmap. Reuse each stable figure ID as its asset basename; the roadmap is `roadmap-learning`. Preserve the seven prior illustrations.

## Visual contract

- Use built-in imagegen, one call per asset. No SVG/CSS/redrawn graph stand-ins.
- Academic editorial concept illustration, clean two-dimensional vector-like raster, opaque warm-white background (`#fffaf2`), charcoal labels, restrained terracotta (`#b56746`), pale taupe and muted slate accents. Flat shapes, fine consistent rules, no ornamental gradients or photorealistic people.
- Landscape 3:2 or near-square 4:3. Ask for a high-resolution image. Every module must have comfortable padding and readable labels; no tall poster or long single-row chain. Use compact cycles, two-lane comparisons, grouped grids or balanced branching depending on the subject.
- A short English academic heading and short English module labels are shared across the two language editions; complete Chinese and English terminology, image descriptions and scientific relations are typeset outside the image.
- These are conceptual teaching plates. Do not generate exact mathematical formulas, measured data plots, numeric axes, performance values, tensor dimensions or purported engineering wiring. Keep precise scientific content in the paired HTML/Markdown reading guide and existing formulas. Abstract curves or node textures must have no quantitative interpretation.
- Arrows, if used, must be sparse and communicate a broad information/learning loop only. Do not add unexplained return arrows, suggest all branches always run together, or imply physical control authority/safety guarantees. Use grouping rather than dense crossing wires. Number conceptual regions when this makes reading order clearer.
- No generic cover art, robots, decorative plants, logos, watermark or paragraphs of text. Each figure must communicate the actual named mechanism, not merely an attractive scene.

## Scientific invariants

Distinguish observation from hidden state; available assays from future releases; requested actions from gated execution; current process response from setpoint targets; real logs from imagined model rollouts; expected cost constraints from per-step boundaries. Policy clipping, entropy and uncertainty estimates do not establish physical safety. Upper-level policies propose bounded CV setpoint increments and do not directly command MVs. Exact gate order is data, current state, model/OOD, rate/curvature, absolute bounds and authorization. No simulation or conceptual panel is field evidence.

## Production and review

Save the accepted generated asset as `public/images/diagrams/ID.webp`. Convert the generated PNG with ImageMagick, quality 88 and webp method 6, without redrawing or altering its content. Preserve the whole composition, do not crop away labels. Inspect every output with the image tool. Keep a per-worker JSON record under this folder containing ID, exact prompt, generated source path, committed asset path, dimensions and concrete inspection notes. If a text/semantic/layout defect appears, request a targeted image edit and inspect again. Do not invent that an image was visually checked.

The original Mermaid inventory is archived in `original-inventory.json` solely for traceability, never rendered or offered as current figure content. Full relationship descriptions and bilingual panel explanations remain selectable, searchable and available to assistive technology outside raster assets.
