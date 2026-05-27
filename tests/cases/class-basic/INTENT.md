# class-basic

A small UML class diagram (our rendering of the Mermaid `classDiagram` in
`ref.mmd`). Layout is ours, not Mermaid's — only the semantics must match.

Five class boxes, each a bordered box with compartments separated by horizontal
divider lines:

- **Drawable** — top center. Name compartment shows a `«interface»` stereotype
  line above the bold name. One method compartment: `+ draw(): void`, in italic
  (abstract).
- **Shape** — center, below Drawable. Name compartment shows a `«abstract»`
  stereotype above the name, and the name **Shape** is italic. Attribute
  compartment: `# x: int`, `# y: int`. Method compartment: `+ move(dx, dy): void`
  and `+ draw(): void` (the latter italic / abstract).
- **Canvas** — left, same row as Shape. Name **Canvas**; attribute `- shapes: List`;
  method `+ add(s: Shape): void`.
- **Circle** — bottom left. Name **Circle**; attribute `+ radius: float`; method
  `+ area(): float`.
- **Rectangle** — bottom right. Name **Rectangle**; attributes `+ w: float`,
  `+ h: float`; method `+ area(): float`.

Relationships (all arrowheads as described, no obstacle crossing):

1. **Shape ⇢ Drawable** — realization: a **dashed** line with a **hollow
   triangle** head pointing up at Drawable.
2. **Circle → Shape** and **Rectangle → Shape** — generalization: **solid**
   lines with **hollow triangle** heads pointing up at Shape, arriving at two
   different points along Shape's bottom edge.
3. **Shape — Canvas** — composition: a line between Shape's left edge and Canvas's
   right edge, ending in a **filled diamond** at Canvas (the whole). Labelled
   `shapes`.
