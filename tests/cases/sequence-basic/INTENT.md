# sequence-basic

Our rendering of two Mermaid `sequenceDiagram` demos combined into one case: the
message-arrow styles and the bidirectional arrows. The `ref.mmd` is assembled from
the Mermaid repo (`demos/sequence.html` at tag `mermaid@11.15.0`) — the "With
forced menus" example (the three message lines) plus the bidirectional-arrows
example (the `<<->>` lines) — using Alice/John throughout. Layout is ours; only the
semantics must match.

Two participants, **Alice** and **John**, each a header box with a dashed lifeline
hanging below it; participants are labelled at **both ends** (a matching footer box
at the bottom). Six messages, top to bottom:

1. Alice → John: `Hello John, how are you?` — solid line, filled triangle head.
2. John ⇢ Alice: `Great!` — dashed line, filled triangle head (a return).
3. Alice → John: `See you later!` — solid line, **open** head (an async message,
   Mermaid's `-)`).
4. Alice ↔ John: `Hello!` — solid line, **open arrowheads at BOTH ends**
   (bidirectional, Mermaid's `<<->>`).
5. Alice ↔ John: `Wow, we said that at the same time!` — solid, bidirectional.
6. Alice ↔ John: `Bidirectional Arrows are so cool` — **dashed**, bidirectional.

Documented divergences: the Mermaid source attaches `link`/`forceMenus` dropdown
menus to the participants — those are interactive affordances with no static
equivalent, so we omit them. Layout is ours.
