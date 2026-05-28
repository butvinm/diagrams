# sequence-alt

Our rendering of the Mermaid combined-fragment example. The `ref.mmd` is copied
verbatim from the Mermaid docs (`sequenceDiagram` → "Alternative paths" / "Optional
paths", the `alt`/`else` + `opt` example). Layout is ours; only the semantics must
match.

Two participants, **Alice** and **Bob**, labelled at **both ends** (footer boxes
at the bottom).

1. Alice → Bob `Hello Bob, how are you?` — solid, filled triangle.
2. An **`alt` fragment** with two operands:
   - `[is sick]` → Bob → Alice `Not so good :(`
   - `[is well]` (after a dashed operand separator) → Bob → Alice
     `Feeling fresh like a daisy`
3. An **`opt` fragment**:
   - `[Extra response]` → Bob → Alice `Thanks for asking`

Expected rendering details:

- The `alt` fragment is a rectangle hugging the two lifelines (a small margin
  outside each, not a full half-column of slack), with an `alt` tab in the
  top-left corner, the first guard `[is sick]` beside the tab, and a dashed
  mid-separator carrying `[is well]` between the two operands.
- The `opt` fragment is a separate rectangle below it with an `opt` tab and a single
  guard `[Extra response]`.
- All three replies are solid lines with filled triangle heads (Mermaid `->>`).
