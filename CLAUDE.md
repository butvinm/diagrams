# diagrams

Manual-layout UML/technical diagrams: authored as plain **HTML + CSS**, rendered
to **PNG** via headless Chromium. **No auto-layout, no auto-routing** — the
author controls placement; the tool only draws connectors between anchor points.
Built because PlantUML/Mermaid auto-layout doesn't give positional control.

## How it works

1. Author an HTML file with one `<diagram>`; place boxes with CSS
   grid/flex/absolute; connect them with `<arrow from to>`.
2. `diagrams/kit/kit.mjs` runs in the browser _after_ layout: measures element
   geometry and draws lifelines + connectors into an SVG overlay. **A connector
   is a pure function of its two anchor points + path style — it never routes
   around anything. Do not add obstacle avoidance / pathfinding.**
3. `diagrams/render/render.mjs` (Playwright) loads the file, injects the kit,
   waits for `data-dg-ready`, and screenshots the `<diagram>` element @2x.

The browser is the layout engine — which is why this is **Node, not Python**
(an intentional, required deviation from the global Python preference).

## Map

- `diagrams/` — the shippable plugin (kit, render, skills, command, manifest)
- `diagrams/kit/{primitives.css,kit.mjs}` — vocabulary + connector engine
- `diagrams/render/render.mjs` — html → png CLI
- `diagrams/skills/diagrams/references/primitives.md` — the authoring vocabulary;
  **read before authoring or extending diagram types**
- `.claude/skills/dev/SKILL.md` — **dev workflow; read before changing the
  framework or touching goldens**
- `tests/` — `cases/<name>/{intent.md,ours.html}`, `golden/`, `run.mjs`

## Commands

- Render: `node diagrams/render/render.mjs <in.html> <out.png>` (`DG_SCALE=3` = sharper)
- Test: `npm test` (render all → pixel-diff vs golden → build `tests/gallery.html`)
- Bless goldens: `npm run test:update` — **only after visual verification** (below)

## Hard rules

- **Snapshot ≠ correctness.** Before creating/updating any golden, verify the
  render visually — launch a vision subagent that reads the PNG against the
  case's `intent.md`. Never bless an unlooked-at render. Full protocol in
  `.claude/skills/dev/SKILL.md`.
- Keep connectors pure (anchors → path); no routing.
- Default branch is `master`.

## Conventions / gotchas

- `<diagram> <lifeline> <point> <arrow>` are plain _unknown_ HTML elements swept
  post-layout — no custom-element registration.
- `arrow` `anchor` is **space-separated**: `anchor="right left"` (src dst). A
  hyphen would clash with compound names like `top-left`.
- Never put `-->` inside an HTML comment — it closes the comment and leaks text
  into the diagram.
- Goldens are environment-sensitive (Chromium build + fonts); diff tolerance is
  0.5% in `tests/run.mjs`.

## Status

Implemented: **`sequence`** and **state/FSM** (generic `stack` layout +
`.state`/`.initial`/`.final` vocabulary). Engine supports `straight`/`spline`
paths, named + fractional edge anchors, and a `curvature` knob. Mermaid
references render offline (`tests/lib/render-mermaid.mjs`, reusing our Chromium)
and appear in the comparison gallery; cases carry an optional `ref.mmd`.

TODO: deployment, class diagram types; plugin distribution bootstrap (ships Node
code needing playwright + chromium).
