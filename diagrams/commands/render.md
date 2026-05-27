---
description: Render a diagram HTML file to PNG via headless Chromium
argument-hint: <input.html> [output.png]
allowed-tools: Bash, Read
---

Render the diagram file `$1` to PNG.

- If `$2` is given, write there; otherwise write next to the input with a `.png`
  extension.
- Then **Read the produced PNG** and confirm it matches what was requested
  (elements present, arrows connect correctly, no overlap/clipping, labels
  legible). Report what you see; re-render if something is off.

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/render/render.mjs" "$1" "${2:-${1%.html}.png}"
```

(`DG_SCALE=3` for sharper output. Requires `playwright` + a Chromium browser;
`npx playwright install chromium` once if missing.)
