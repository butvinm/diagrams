---
name: diagrams
description: Draw diagrams (UML sequence, state, deployment, class; data flow / DFD with threat-model trust zones & boundaries) as hand-placed HTML/CSS, rendered to PNG.
argument-hint: "<what to diagram>"
allowed-tools: Read, Write, Edit, Bash
---

# Diagrams — manual-layout HTML/CSS → PNG

Diagrams are authored as plain HTML using a small set of components and CSS styles for layout (grid / flex / relative). **The browser is the layout engine; nothing is auto-placed or auto-routed.** A headless Chromium renders the file to PNG.

The reference lives in `references/`: read `COMPONENTS.md` for the core (boxes, `<arrow>`, anchors), then read the file for the diagram type you're drawing — `SEQUENCE.md`, `STATE.md`, `CLASS.md`, `DEPLOYMENT.md`, `DFD.md`. Read these before authoring; load only the type you need.

## Workflow

1. **Author** an `.html` file containing one `<diagram>`. Use CSS grid/flex to place boxes; connect them with `<arrow from to>`. Labels are the arrow's child content (text or HTML). See `references/COMPONENTS.md` plus the type's reference.
2. **Render** it:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/render/render.mjs" path/to/diagram.html path/to/out.png
   ```
   First run installs the renderer's dependencies automatically. It uses Playwright's Chromium if present, else falls back to system Chrome/Edge; only if no browser exists at all does it ask you to run `npx playwright install chromium`. Needs Node + npm. Set `DG_SCALE=3` for sharper output.
3. **Verify — do not skip.** Read the produced PNG back and confirm it matches the request: every element present, arrows connect the intended boxes, no overlap or clipping, labels legible, correct heads/line styles. Layout is manual, so the only way to know it is right is to look. Adjust the HTML/CSS and re-render until correct, then show the user.

## Principles

- Verbosity is fine — you (the assistant) write the markup. Favor explicit, regular structure over clever shorthand.
- One connector = a pure function of its two anchor points and its path style. There is no obstacle avoidance; if a line crosses something, move a box or pick different anchors.
- Rich label content (icons, badges, multi-line) is just HTML/CSS inside the `<arrow>` element.
