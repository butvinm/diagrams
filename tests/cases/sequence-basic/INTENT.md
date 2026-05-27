# sequence-basic

Our rendering of a Mermaid sequence demo. The `ref.mmd` is copied verbatim from
the Mermaid repo (`demos/sequence.html`, the "With forced menus" example) at tag
`mermaid@11.15.0`. Layout is ours; only the semantics must match.

Two participants, **Alice** and **John**, each a header box with a dashed
lifeline hanging below it. Three messages, top to bottom:

1. Alice → John: `Hello John, how are you?` — solid line, filled triangle head.
2. John ⇢ Alice: `Great!` — dashed line, filled triangle head (a return).
3. Alice → John: `See you later!` — solid line, **open** head (an async message,
   Mermaid's `-)`).

Documented divergences: the Mermaid source attaches `link`/`forceMenus` dropdown
menus to the participants — those are interactive affordances with no static
equivalent, so we omit them. Layout is ours.
