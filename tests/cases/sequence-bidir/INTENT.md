# sequence-bidir

Our rendering of Mermaid's bidirectional-arrows sequence demo. The `ref.mmd` is
copied verbatim from the Mermaid repo (`demos/sequence.html`) at tag
`mermaid@11.15.0`. Layout is ours; only the semantics must match.

Two participants, **Alice** and **Bob**, each with a dashed lifeline. Three
**bidirectional** messages between them, each drawn as a horizontal line with an
**open arrowhead at BOTH ends**, top to bottom:

1. `Hello!` — solid line.
2. `Wow, we said that at the same time!` — solid line.
3. `Bidirectional Arrows are so cool` — **dashed** line.

All three connect Alice's and Bob's lifelines. Labels centered above each line,
legible, not overlapping. Layout is ours.
