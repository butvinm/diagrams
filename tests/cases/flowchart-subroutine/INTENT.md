# flowchart-subroutine

Our rendering of Mermaid's subroutine-shape flowchart (every node a predefined
process). The `ref.mmd` is copied verbatim from the Mermaid repo
(`demos/flowchart.html`, the `flowchart LR` "subroutine shape test" sample,
develop branch; rendered with mermaid@11.15.0). Layout is ours.

Left to right:

1. A chain along the middle row: **Start** →|**Get money**| **Go shopping** →
   **Decide** — all **subroutine** boxes (a rectangle with a vertical rule just
   inside each side).
2. **Decide** fans out to three outcomes stacked in the last column — **Laptop**,
   **iPhone**, **Car** — via the labelled branches **One**, **Two**, **Three**.

Documented divergences: Mermaid's node text are shape-test placeholders / long
stress strings — we use short labels (Start, Decide). Mermaid's `click`,
`classDef`, and `class` directives (link handlers + an orange fill) are styling
/ interactivity we ignore. Direction and layout are ours. All edge heads are
filled triangles. No line crosses a box.
