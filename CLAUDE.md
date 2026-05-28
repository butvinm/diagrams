# diagrams

UML/technical diagrams authored as plain **HTML + CSS**, rendered to **PNG** via headless Chromium. Layout is **manual but adaptive**: no auto-layout/auto-routing engine _and_ no hardcoded coordinates — you declare structure with CSS (grid/flex/relative), boxes size to content, and connectors are measured after layout so they follow the boxes. The tool only computes connector geometry; it never routes. Built because PlantUML/Mermaid auto-layout doesn't give positional control — but pixel-coordinate drawing tools are the opposite extreme.

## How it works

1. Author an HTML file with one `<diagram>`; place boxes with CSS grid/flex/absolute; connect them with `<arrow from to>`.
2. `diagrams/kit/kit.mjs` runs in the browser _after_ layout: measures element geometry and draws lifelines + connectors into an SVG overlay. **A connector is a pure function of its two anchor points + path style — it never routes around anything. Do not add obstacle avoidance / pathfinding.**
3. `diagrams/render/render.mjs` (Playwright) loads the file, injects the kit, waits for `data-dg-ready`, and screenshots the `<diagram>` element @2x.

The browser is the layout engine — which is why this is **Node, not Python** (an intentional, required deviation from the global Python preference).

## Map

- `diagrams/` — the shippable plugin (kit, render, skills, command, manifest)
- `diagrams/kit/{primitives.css,kit.mjs}` — components & styles + connector engine
- `diagrams/render/render.mjs` — html → png CLI
- `diagrams/skills/diagrams/references/COMPONENTS.md` — the components, attributes, and styles (core), with one file per type (`SEQUENCE.md`, `STATE.md`, `CLASS.md`, `DEPLOYMENT.md`); **read before authoring or extending diagram types**
- `.claude/skills/dev/SKILL.md` — **dev workflow; read before changing the framework or touching goldens**
- `tests/` — self-contained cases: `cases/<name>/{INTENT.md, ours.html, golden.png, ref.mmd?}` (golden committed; `ours/ref/diff.png` regenerated + gitignored) and `run.mjs`
- `compose.yaml` + `.github/workflows/test.yml` — the pinned-image test environment (local) and CI; goldens are rendered/blessed here, not on bare metal
- `README.md` + `docs/` — human docs: lean landing page, then `docs/GUIDE.md` (authoring) and `docs/DEVELOPMENT.md` (harness/tests). Keep these in sync with the plugin's `COMPONENTS.md` and dev skill, which are authoritative.

## Commands

- Render: `node diagrams/render/render.mjs <in.html> <out.png>` (`DG_SCALE=3` = sharper)
- Test: `npm run test:docker` (render all → pixel-diff vs golden → build `tests/gallery.html`) — runs in the pinned Playwright image (`compose.yaml`), identical to CI. Bare-metal `npm test` drifts on fonts; do not use it for golden comparison.
- Bless goldens: `npm run test:docker:update` — **only after visual verification** (below); blesses container renders so they match CI.

## Hard rules

- **Snapshot ≠ correctness.** Before creating/updating any golden, verify the render visually — launch a vision subagent that reads the PNG against the case's `INTENT.md`. Never bless an unlooked-at render. Full protocol in `.claude/skills/dev/SKILL.md`.
- Keep connectors pure (anchors → path); no routing.
- **Keep docs in sync.** Whenever a new diagram type lands, rendering/engine behavior changes, authoring syntax changes (elements, attributes, styles, defaults), or anything else user-facing changes, update every affected surface in the same change — don't defer it:
  - `diagrams/skills/diagrams/references/COMPONENTS.md` + the per-type `<TYPE>.md` (authoring reference; a new type gets its own file, linked from `COMPONENTS.md`).
  - `diagrams/skills/diagrams/SKILL.md` (workflow; which type files exist).
  - `docs/GUIDE.md` (how it works, authoring walkthrough) and `docs/DEVELOPMENT.md` (harness/goldens).
  - `README.md` (the **Diagram types** table, quickstart, doc links).
  - this `CLAUDE.md` (Map, Status, Conventions).
- **≥3 test cases per diagram type; reference diagrams come from the Mermaid repo.** Every diagram type must have at least three `tests/cases/` exercising distinct features. Each case's `ref.mmd` is a real example diagram **taken from the Mermaid repository** ([`demos/*.html`](https://github.com/mermaid-js/mermaid/tree/develop/demos) — e.g. `sequence.html`, `state.html`, `classchart.html` — or the docs), copied as-is (record the source), **not hand-authored**; we then build our equivalent `ours.html` and compare in the gallery. This is the point of the suite: validate our rendering against canonical Mermaid examples. Author originals only where Mermaid has no such diagram type — e.g. deployment, whose cases have no `ref.mmd`. Attribution: `THIRD_PARTY.md` (Mermaid is MIT).
- Default branch is `master`.

## Conventions / gotchas

- `<diagram> <lifeline> <point> <arrow>` are plain _unknown_ HTML elements swept post-layout — no custom-element registration.
- `arrow` `anchor` is **space-separated**: `anchor="right left"` (src dst). A hyphen would clash with compound names like `top-left`.
- Never put `-->` inside an HTML comment — it closes the comment and leaks text into the diagram.
- Goldens are environment-sensitive (Chromium build + fonts), so they are rendered and blessed **only** in the pinned Docker image (`compose.yaml`, `mcr.microsoft.com/playwright:v1.60.0-noble`) — never on bare metal, where the host's fonts differ and every case drifts. CI (`.github/workflows/test.yml`) uses the same image. Keep the image tag in lockstep with the `playwright` version in `package.json`. `DG_NO_SANDBOX=1` (set by the Docker env) lets Chromium launch as root in the container. Diff tolerance is 0.5% in `tests/run.mjs`.

## Status

Implemented: **`sequence`**, **state/FSM** (generic `stack` layout + `.state`/`.initial`/`.final` components), **`class`** (multi-compartment `.class` boxes on your own CSS grid; `head="hollow"` for UML generalization), and **`deployment`** (`.node` containers holding nested `.artifact` boxes; communication paths via `head="none"`). Engine supports `straight`/`spline` paths, named + fractional edge anchors, and a `curvature` knob. Markers: `triangle`/`hollow`/`open`/`diamond`/`filled`. Mermaid references render offline (`tests/lib/render-mermaid.mjs`, reusing our Chromium) and appear in the comparison gallery; cases carry an optional `ref.mmd` — except deployment, which has no Mermaid equivalent.

Distribution: `render/render.mjs` self-bootstraps — if `playwright` is missing it `npm install`s into `${CLAUDE_PLUGIN_ROOT}` (plugin has its own `diagrams/package.json`) on first use, and launches Playwright's Chromium or falls back to system Chrome/Edge. Verified from a clean copy with no `node_modules` and no browser download. `node_modules/` is gitignored, so the marketplace clone ships clean.

Testing/CI: the suite renders and blesses goldens **only** inside the pinned Playwright Docker image (`compose.yaml`, `mcr.microsoft.com/playwright:v1.60.0-noble`) — `npm run test:docker` and `npm run test:docker:update` locally, `.github/workflows/test.yml` (push/PR) in CI, all the same image. The goldens were re-blessed in this image and verified bit-for-bit reproducible (0.000% diff). The bare-metal `npm test` path still works but drifts on host fonts and is not authoritative. Renderers honor `DG_NO_SANDBOX=1` to launch Chromium as root in a container. No git remote yet, so CI is wired but not running until one is added.

Roadmap: the four planned UML types (sequence, state, class, deployment) are all shipped. No type work queued.
