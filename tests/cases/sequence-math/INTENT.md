# sequence-math

Exercises **KaTeX math** typeset into a sequence diagram. This is a feature case,
not a new diagram type, so it has no `ref.mmd`: math rendering is a cross-cutting
capability and the Mermaid repo has no canonical math-in-sequence demo to copy.
The scenario is a Diffie–Hellman key exchange between Alice and Bob.

Two participants, **Alice** (left) and **Bob** (right), each labelled at top and
bottom with dashed lifelines between.

Top to bottom:

1. A full-width section divider with a centered chip reading **public:** followed
   by _inline_ math — italic \(p\) and \(g\).
2. **Alice → Bob**, solid line, filled triangle head, label _inline_ math
   \(A = g^{a} \bmod p\) (superscript \(a\), upright "mod").
3. **Bob → Alice**, dashed line, filled triangle head, label _inline_ math
   \(B = g^{b} \bmod p\).
4. A full-width section divider whose chip reads **shared secret** followed by a
   larger _display_ equation \(s = A^{b} = B^{a} = g^{ab} \bmod p\) centered on
   its own line.

Pass criteria: every formula is rendered as real math (italic variables, raised
superscripts, upright \(\bmod\)) — not literal `\(...\)` / `$$...$$` source text.
Inline math sits on the message/divider baseline; the display equation is
centered and visibly larger. No clipping, no overlap of labels with lifelines.
