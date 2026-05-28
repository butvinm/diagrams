# flowchart-io

Our rendering of Mermaid's slanted-node "What to buy" flowchart, exercising the
I/O parallelogram. The `ref.mmd` is copied verbatim from the Mermaid repo
(`demos/flowchart.html`, the `flowchart TD` trapezoid/parallelogram sample,
develop branch; rendered with mermaid@11.15.0). Layout is ours.

Top to bottom (same skeleton as flowchart-basic, different shapes):

1. **Christmas** (I/O parallelogram) →|**Get money**| **Go shopping** (I/O
   parallelogram).
2. **Go shopping** → the decision **Let me think?** (a diamond).
3. The decision fans symmetrically to **Laptop**, **iPhone**, and **Car** (all I/O
   parallelograms) via the labelled branches **One**, **Two**, **Three**.

Documented divergences: Mermaid's source uses several node shapes — **trapezoid**
slants (Christmas `[/ \]`, Go shopping `[\ /]`), **parallelogram** slants (Laptop
`[/ /]`, iPhone `[\ \]`), and a plain **rectangle** (Car `[ ]`). We provide a
single I/O shape (`.io`, a parallelogram) and render every node with it, for a
uniform symmetric fan (the plain rectangle is exercised in flowchart-basic). The
decision's long stress-test label is shortened to "Let me think?". All edge heads
are filled triangles. No line crosses a box.
