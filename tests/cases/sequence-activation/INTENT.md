# sequence-activation

Our rendering of the Mermaid **Activations** example. The `ref.mmd` is copied
verbatim from the Mermaid docs (`sequenceDiagram` → "Activations", the nested
`->>+` / `-->>-` form). Layout is ours; only the semantics must match.

Two participants, **Alice** and **John**, labelled at **both ends** (footer boxes
at the bottom). John is **activated twice (nested)**:
an outer activation spanning all four messages, and an inner activation over the
second call and its reply. The inner activation bar is nudged to the right of the
outer one, as Mermaid/UML draws nested activations.

Four messages, top to bottom:

1. Alice → John `Hello John, how are you?` — solid, filled triangle (activates the
   outer bar).
2. Alice → John `John, can you hear me?` — solid, filled triangle (activates the
   inner bar).
3. John ⇢ Alice `Hi Alice, I can hear you!` — dashed return (ends the inner bar).
4. John ⇢ Alice `I feel great!` — dashed return (ends the outer bar).

Expected rendering details:

- Two stacked activation bars on John's lifeline. Each bar begins and ends
  **exactly at** its activating/deactivating message (not extending past the
  arrows): the outer bar runs from message 1 to message 4; the inner bar from
  message 2 to message 3, offset slightly right.
- The bars are opaque, covering the dashed lifeline; arrowheads land on/at the
  bar.
- Calls are solid lines; the two replies are dashed. All heads are filled
  triangles.
