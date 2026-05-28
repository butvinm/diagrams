# flowchart-loop

A feature case: a counting loop, exercising a **manual back-edge** (there is no
auto-routing) and the **`.preparation`** hexagon (the loop-setup / initialization
symbol). Like `sequence-math`, it has **no `ref.mmd`** — Mermaid would auto-route
the back-edge, so a side-by-side is not meaningful; this case is about our
hand-drawn loop.

Top to bottom, a single column:

1. **Start** (terminal) → **i = 0** (a `.preparation` **hexagon**, pointed left and
   right — the loop init).
2. **i = 0** → **process item i** (step) → **i = i + 1** (step) → the decision
   **i < n?** (diamond).
3. The decision's **no** branch goes straight down to **End** (terminal).
4. The decision's **yes** branch is the **loop**: a back-edge from the diamond's
   left vertex up to the left side of **process item i**, bowed LEFT (a `spline`
   with negative `curvature`) into reserved left padding so it clears the
   increment box without crossing it.

All edge heads are filled triangles. The point of the case: the loop is a plain
`<arrow>` whose curve is hand-tuned (anchor + curvature sign + padding) to clear
the boxes — the kit never routes around anything. No line crosses a box.
