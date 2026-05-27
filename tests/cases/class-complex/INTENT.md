# class-complex

Our rendering of Mermaid's dense class-relationships demo. The `ref.mmd` is
copied verbatim from the Mermaid repo (`demos/classchart.html`, the second
example — "Class01…Class10") at tag `mermaid@11.15.0`, with the HTML entities
`&lt;&lt;…&gt;&gt;` decoded back to `<<…>>`. This case exists to exercise the
relationship markers the other class cases don't. Layout is ours; semantics match.

Twelve class boxes. Three carry members:

- **Class01** — `«interface»`; attributes `-int chimp`, `+int gorilla`; method `#size()`.
- **Class10** — `«service»`; `int id`; `size()`. (Isolated — no relationships.)
- **Class07** — `Object[] elementData`; `equals()`.

The rest (Class03, Class04, Class05, Class06, Class09, C2, C3, AveryLongClass)
are empty boxes.

Relationships and their markers:

1. **AveryLongClass → Class01** — generalization, solid line, **hollow triangle**
   at Class01, labelled `Cool`.
2. **Class04 → Class03** — composition, solid line, **filled diamond** at Class03
   (the whole).
3. **Class06 → Class05** — aggregation, solid line, **hollow diamond** at Class05.
4. **Class09 → C3** — composition, solid line, **filled diamond** at C3.
5. **Class09 → Class07** — generalization, solid line, **hollow triangle** at Class07.
6. **Class09 → C2** — association, solid line, **open** arrowhead at C2, labelled
   `Where am i?`.
7. **Class07 → Class08** — dependency, **dotted** line, **no** arrowhead.
8. **Class08 ↔ C2** — bidirectional association, **open** arrowheads at **both**
   ends, labelled `Cool label`.

Documented divergences: Mermaid attaches multiplicity labels (`0`, `0..n`, `1`,
`many`, `1..n`) at the **edge ends** — our connectors carry a single midpoint
label only, so the end-multiplicities are omitted. Layout is ours (chosen so no
connector crosses a box). Mermaid also draws empty compartments for member-less
classes; we show those classes as a name with a single empty compartment.
