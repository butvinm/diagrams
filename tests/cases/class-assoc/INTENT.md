# class-assoc

A UML class diagram exercising the relationship styles **not** covered by
`class-basic` (which showed generalization, realization, composition). Our
render of the Mermaid `classDiagram` in `ref.mmd`; only semantics must match.

Four class boxes, each bordered with divider-separated compartments:

- **Member** (left): `+ id: int`.
- **Library** (center): `- name: string`; `+ addBook(b: Book): void`.
- **Book** (right): `+ title: string`.
- **Logger** (below Library): `+ log(msg): void`.

Relationships:

1. **Member → Library** — association, labelled `borrows`: a solid line with an
   **open** (V-shaped) arrowhead at Library's left side.
2. **Book — Library** — aggregation, labelled `books`: a solid line ending in a
   **hollow** (white, outlined) diamond at Library's right side (Library is the
   whole). No other arrowhead.
3. **Library ⇢ Logger** — dependency, labelled `«use»`: a **dashed** line with an
   **open** arrowhead at Logger, below Library.

No overlapping boxes, and no line crosses through a box.
