# flowchart-database

Our rendering of Mermaid's cylinder-shape flowchart (every node a data store),
exercising fan-out and fan-in convergence. The `ref.mmd` is copied verbatim from
the Mermaid repo (`demos/flowchart.html`, the `flowchart LR` "cylindrical shape
test" sample, develop branch; rendered with mermaid@11.15.0). Layout is ours.

Left to right, three stages, all nodes **cylinders** (`.database`):

1. **Fan-out:** **Source** replicates to three caches — **Cache 1**, **Cache 2**,
   **Cache 3** — each edge labelled **Get money**.
2. **Fan-in:** the three caches converge on **Warehouse** (three edges meeting its
   left side).
3. **Fan-out:** **Warehouse** serves three reports — **Laptop**, **iPhone**,
   **Car** — via the labelled branches **One**, **Two**, **Three**.

Documented divergences: the demo's node labels are placeholders ("cylindrical
shape test", "Go shopping 1/2/3", a long decision string) — we use simplified
labels (Source, Cache 1-3, Warehouse, …); the 1→3→1→3 structure matches. The
`click`, `classDef`, and `class` directives are ignored. All edge heads are
filled triangles. No line crosses a box.
