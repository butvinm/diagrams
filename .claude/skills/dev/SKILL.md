---
name: dev
description: Development workflow for THIS repo (the diagrams framework). Use when adding or changing diagram primitives, the kit runtime, the renderer, or test cases; and whenever golden snapshots need to be created or updated. Covers project structure and the mandatory visual-verification protocol before blessing goldens.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# diagrams — internal dev workflow

This skill is for developing the framework itself. It is **not** shipped; the
user-facing skill lives in `diagrams/skills/diagrams/`.

## Project map

```
diagrams/                      the plugin (shipped)
  kit/primitives.css           component + layout styles
  kit/kit.mjs                  in-browser runtime: measure + draw connectors
  render/render.mjs            Playwright CLI: html -> png
  skills/diagrams/             public authoring skill + references
  commands/render.md           /diagrams:render
tests/
  cases/<name>/INTENT.md       what the diagram should show (the oracle)
  cases/<name>/ours.html       the diagram authored in our framework
  cases/<name>/ref.mmd         (optional) the equivalent Mermaid source
  cases/<name>/golden.png      blessed reference render (committed, visible)
  cases/<name>/ours.png        last render (regenerated, gitignored)
  cases/<name>/ref.png         Mermaid reference render (regenerated, gitignored)
  cases/<name>/diff.png        pixel diff on failure (regenerated, gitignored)
  gallery.html                 visual comparison page (regenerated)
  run.mjs                      the harness
```

## Adding a diagram type / primitive

1. Add CSS to `kit/primitives.css` and any layout pass to `kit.mjs` (`applyXxxLayout` + extend `drawOverlay` if needed). Keep the rule: connectors are pure functions of anchors; never route around things.
2. Add **at least three** `tests/cases/<name>/`, each with `INTENT.md` + `ours.html`, covering distinct features of the type (not trivial variants). **Get the reference diagrams from the Mermaid repo:** copy a real example verbatim from its [`demos/`](https://github.com/mermaid-js/mermaid/tree/develop/demos) (e.g. `sequence.html`, `state.html`, `classchart.html`, `er.html` — each holds several `<pre class="mermaid">` sources) or the docs, save it as that case's `ref.mmd`, note where it came from, then replicate it as `ours.html`. Do **not** hand-write `ref.mmd` to match your own diagram — the comparison is only meaningful against canonical Mermaid examples. Render the Mermaid source with `tests/lib/render-mermaid.mjs`; the gallery shows it beside ours. Author originals (no `ref.mmd`) only where Mermaid has no equivalent diagram type — e.g. deployment. Attribution lives in `THIRD_PARTY.md`.
3. Run the harness and follow the verification protocol below.
4. Document the type in its own reference file `diagrams/skills/diagrams/references/<TYPE>.md` (capitalized), and link it from `COMPONENTS.md` and `SKILL.md`. The skill reads the core `COMPONENTS.md` plus one type file, so keep types separate.
5. The worked example in a type's reference must be **copied from a golden-tested case** (e.g. `SEQUENCE.md`'s example mirrors `tests/cases/sequence-basic/ours.html`). Keep them in sync — the reference example is only trustworthy because the case is render-verified.

## Test harness

```bash
npm run test:docker         # render all cases, diff against goldens, rebuild gallery.html
npm run test:docker:update  # bless current renders as goldens (ONLY after sign-off)
```

Both wrap `compose.yaml` (`mcr.microsoft.com/playwright:v1.60.0-noble`), which pins Chromium **and** the system font set — so renders match CI and the committed goldens bit-for-bit.
The bare `npm test` / `npm run test:update` run the harness directly against your host's Chromium and fonts; that is only correct _inside_ that image (which is exactly what CI does).
**Never render or bless on bare metal** — the host's fonts differ and every case drifts (see the caveat below).

`npm run test:docker` exits non-zero on pixel-diff failures.
New cases (no golden yet) are reported as `new` and are **not** auto-blessed.

## Mandatory visual verification before blessing a golden

Snapshot diffing only proves _stability_, not _correctness_ — a wrong golden
gets frozen forever. So a golden may be created or updated **only after a vision
pass confirms the render is actually correct.**

When a case is `new`, or an intentional change makes `npm run test:docker` fail (the diff is expected), do this before `npm run test:docker:update`:

1. Render is at `tests/cases/<name>/ours.png`; intent at `tests/cases/<name>/INTENT.md`.
2. **Launch a subagent** (Agent tool, general-purpose) whose job is to _look_:
   give it the PNG path and the intent, and have it Read the image and report,
   per `INTENT.md`: are all elements present? do arrows connect the right boxes
   with the right heads/line styles? any overlap, clipping, or stray text? does
   the layout match the description? Return a clear PASS/FAIL + specific issues.
3. If FAIL, fix the HTML/CSS/kit and re-render; repeat. Only on PASS run `npm run test:docker:update` to bless.

The vision judge is advisory (LLMs are fallible) — you may overrule it, but never
bless a golden you have not visually confirmed.

## Caveat: goldens are environment-sensitive — so they live in Docker

Renders depend on the Chromium build **and** the installed fonts.
The CSS font stack (`-apple-system, "Segoe UI", Roboto, …`) resolves to whatever fonts the host happens to have, so the same markup renders at different glyph widths on different machines — boxes resize, connectors land elsewhere, and the diff blows past `MAX_DIFF_RATIO`.
(Measured: moving from bare-metal Manjaro into the container shifted all 13 cases — most by enough to change the diagram's pixel dimensions — purely on fonts, with the Chromium revision held constant.)

The fix is to pin the environment: `compose.yaml` uses `mcr.microsoft.com/playwright:v1.60.0-noble`, whose tag locks both the bundled Chromium and a fixed font set.
**Goldens are rendered and blessed only in that image** (`npm run test:docker[:update]`), and CI (`.github/workflows/test.yml`) runs the identical image, so local, golden, and CI agree bit-for-bit.
Keep the image tag in lockstep with the `playwright` version in `package.json`.
The `MAX_DIFF_RATIO` tolerance in `tests/run.mjs` (0.01%) then only has to guard against a stray pixel — in the pinned image every case diffs exactly 0 pixels, so it's effectively zero, not drift tolerance.
