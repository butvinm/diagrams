# state-basic

A simple state machine (our rendering of the Mermaid `stateDiagram-v2` in
`ref.mmd`). Layout is ours, not Mermaid's — only the semantics must match.

Top to bottom:

1. An **initial** pseudo-state (filled dot).
2. Arrow down into state **Idle**.
3. Between **Idle** and **Running**, two curved transitions forming a lens:
   - `start`: Idle → Running (downward).
   - `stop`: Running → Idle (upward).
     The two labels must not overlap.
4. State **Running**.
5. `done`: Running → **final** pseudo-state (ringed dot / bullseye).

All transition arrows have filled triangle heads.
