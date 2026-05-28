# flowchart-basic

Our rendering of Mermaid's canonical "What to buy" flowchart. The `ref.mmd` is
copied verbatim from the Mermaid repo (`demos/flowchart.html`, the `flowchart TD`
"What to buy" sample, develop branch; rendered with mermaid@11.15.0). Layout is
ours; only the semantics must match.

Top to bottom:

1. **Christmas** (a process step, rectangle) →|**Get money**| **Go shopping**.
2. **Go shopping** → the decision **Let me think?** (a diamond).
3. The decision fans to three outcomes — **Laptop**, **iPhone**, **Car** (steps in
   a row) — via the labelled branches **One**, **Two**, **Three**, leaving the
   diamond's left / bottom / right vertices.

All edge heads are filled triangles. Documented divergences: Mermaid's decision
carries a long stress-test string — we label it "Let me think?"; Mermaid's "Go
shopping" is a round-edge node `( )` — we render it as a `.terminal` stadium;
Christmas `[ ]` is a `.step`. Layout is ours. No line crosses a box.
