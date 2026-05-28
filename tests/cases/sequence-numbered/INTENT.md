# sequence-numbered

Our rendering of Mermaid's autonumber sequence demo. The `ref.mmd` is copied
verbatim from the Mermaid repo (`demos/sequence.html`, the `autonumber` example)
at tag `mermaid@11.15.0`. Layout is ours; only the semantics must match.

Two participants, **Alice** and **John**, each with a dashed lifeline and labelled
at **both ends** (a footer box at the bottom). Four
messages, each with a **two-line** label, top to bottom:

1. Alice → John: `Hello John,` / `how are you?` — solid line, filled triangle head.
2. Alice → John: `John,` / `can you hear me?` — solid line, filled triangle head.
3. John ⇢ Alice: `Hi Alice,` / `I can hear you!` — dashed line, filled triangle head.
4. John ⇢ Alice: `I feel great!` — dashed line, filled triangle head.

Documented divergence: the Mermaid source uses `autonumber`, which prefixes
messages with sequence numbers (1, 50, 60) in circles on the lifelines — we have
no autonumber feature, so the numbers are omitted. Layout is ours.
