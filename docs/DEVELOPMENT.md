# Development

Working on the framework itself (not needed to _use_ it).

## Tests & the comparison gallery

The harness renders every case, pixel-diffs it against a committed `golden.png`, and builds a comparison gallery — including a Mermaid render side-by-side wherever a case carries a `ref.mmd`:

```bash
npm run test:docker         # render + snapshot-diff + build tests/gallery.html
npm run test:docker:update  # bless goldens (only after a visual check)
```

Each case is a self-contained folder under `tests/cases/<name>/`: `INTENT.md` (what it should show), `ours.html` (the diagram), an optional `ref.mmd` (Mermaid equivalent), and the committed `golden.png`. The `ours.png`, `ref.png`, and `diff.png` are regenerated and gitignored.

## Published gallery (GitHub Pages)

`tests/gallery.html` above is the **dev** comparison view (intent / Mermaid / ours / golden, regenerated, gitignored). The **public** showcase is separate:

```bash
npm run gallery   # node tests/build-gallery.mjs -> ./site
```

`build-gallery.mjs` writes `./site` (gitignored): a live, user-resizable hero embed of the `class-responsive` diagram, plus one card per diagram type (the committed golden + links to the case source and a live embed). It needs **no browser** — it copies the Docker-blessed goldens for images and reuses `render.mjs --html` (pure inlining) for the embeds. So a lightweight Node-only workflow, [`.github/workflows/pages.yml`](../.github/workflows/pages.yml), builds and deploys it to GitHub Pages on every push to `master` — independent of the Docker test workflow. (Enable Pages → "GitHub Actions" in the repo settings once.)

`render.mjs --html` itself emits a self-contained, embeddable copy of any diagram; see the [embedding reference](../diagrams/skills/diagrams/references/EMBED.md).

## Why the suite runs in Docker

Renders depend on the Chromium build **and** the installed fonts. The CSS font stack resolves to whatever fonts the machine has, so identical markup renders at different glyph widths on different hosts — boxes resize, connectors shift, and the diff exceeds tolerance. (In practice, moving the suite from a bare-metal Linux box into the container shifted all 13 cases on fonts alone, even with the Chromium revision unchanged.)

So `compose.yaml` pins both: `mcr.microsoft.com/playwright:v1.60.0-noble` ships a fixed Chromium (matching the `playwright` dependency) and a fixed font set. `npm run test:docker[:update]` wraps it, and CI ([`.github/workflows/test.yml`](../.github/workflows/test.yml)) runs the identical image — so your local renders, the committed goldens, and CI agree bit-for-bit. **Bless goldens only through `test:docker:update`**, never bare-metal `npm test`. When you bump `playwright` in `package.json`, bump the image tag in `compose.yaml` and the workflow to match, then re-bless (goldens may shift if Chromium changed).

**Math is the one font-stable part.** LaTeX is typeset by KaTeX, whose woff2 fonts are **vendored in the plugin** (`diagrams/kit/vendor/katex/`) and ship with it, so the math glyphs are identical on every host. The surrounding labels still use the system font stack, so the Docker rule above is unchanged — bless math cases the same way. To update KaTeX, `npm install katex@<ver>` and re-copy `dist/{katex.min.css,katex.min.js,contrib/auto-render.min.js,fonts/*.woff2}` into the vendor dir.

## Blessing goldens

Snapshot diffing catches _drift_, not _correctness_ — a wrong golden gets frozen forever. So before creating or updating a golden, verify the render visually (a vision pass that reads the PNG against the case's `INTENT.md`). Only then run `npm run test:update`.

The full vision-verification protocol, the project layout, and "how to add a diagram type" live in the dev skill: [`.claude/skills/dev/SKILL.md`](../.claude/skills/dev/SKILL.md).
