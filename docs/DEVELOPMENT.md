# Development

Working on the framework itself (not needed to _use_ it).

## Tests & the comparison gallery

The harness renders every case, pixel-diffs it against a committed `golden.png`, and builds a comparison gallery — including a Mermaid render side-by-side wherever a case carries a `ref.mmd`:

```bash
npm run test:docker         # render + snapshot-diff + build tests/gallery.html
npm run test:docker:update  # bless goldens (only after a visual check)
```

Each case is a self-contained folder under `tests/cases/<name>/`: `INTENT.md` (what it should show), `ours.html` (the diagram), an optional `ref.mmd` (Mermaid equivalent), and the committed `golden.png`. The `ours.png`, `ref.png`, and `diff.png` are regenerated and gitignored.

## Why the suite runs in Docker

Renders depend on the Chromium build **and** the installed fonts. The CSS font stack resolves to whatever fonts the machine has, so identical markup renders at different glyph widths on different hosts — boxes resize, connectors shift, and the diff exceeds tolerance. (In practice, moving the suite from a bare-metal Linux box into the container shifted all 13 cases on fonts alone, even with the Chromium revision unchanged.)

So `compose.yaml` pins both: `mcr.microsoft.com/playwright:v1.60.0-noble` ships a fixed Chromium (matching the `playwright` dependency) and a fixed font set. `npm run test:docker[:update]` wraps it, and CI ([`.github/workflows/test.yml`](../.github/workflows/test.yml)) runs the identical image — so your local renders, the committed goldens, and CI agree bit-for-bit. **Bless goldens only through `test:docker:update`**, never bare-metal `npm test`. When you bump `playwright` in `package.json`, bump the image tag in `compose.yaml` and the workflow to match, then re-bless (goldens may shift if Chromium changed).

## Blessing goldens

Snapshot diffing catches _drift_, not _correctness_ — a wrong golden gets frozen forever. So before creating or updating a golden, verify the render visually (a vision pass that reads the PNG against the case's `INTENT.md`). Only then run `npm run test:update`.

The full vision-verification protocol, the project layout, and "how to add a diagram type" live in the dev skill: [`.claude/skills/dev/SKILL.md`](../.claude/skills/dev/SKILL.md).
