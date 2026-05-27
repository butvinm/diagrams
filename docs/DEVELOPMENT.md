# Development

Working on the framework itself (not needed to _use_ it).

## Tests & the comparison gallery

The harness renders every case, pixel-diffs it against a committed `golden.png`, and builds a comparison gallery — including a Mermaid render side-by-side wherever a case carries a `ref.mmd`:

```bash
npm test             # render + snapshot-diff + build tests/gallery.html
npm run test:update  # bless goldens (only after a visual check)
```

Each case is a self-contained folder under `tests/cases/<name>/`: `INTENT.md` (what it should show), `ours.html` (the diagram), an optional `ref.mmd` (Mermaid equivalent), and the committed `golden.png`. The `ours.png`, `ref.png`, and `diff.png` are regenerated and gitignored.

## Blessing goldens

Snapshot diffing catches _drift_, not _correctness_ — a wrong golden gets frozen forever. So before creating or updating a golden, verify the render visually (a vision pass that reads the PNG against the case's `INTENT.md`). Only then run `npm run test:update`.

The full vision-verification protocol, the project layout, and "how to add a diagram type" live in the dev skill: [`.claude/skills/dev/SKILL.md`](../.claude/skills/dev/SKILL.md).
