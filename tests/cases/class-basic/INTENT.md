# class-basic

Our rendering of Mermaid's canonical class-diagram demo. The `ref.mmd` is copied
verbatim from the Mermaid repo (`demos/classchart.html`, the "Demo Class Diagram"
example) at tag `mermaid@11.15.0`. Layout is ours — only the semantics must match.

A title **Demo Class Diagram** sits centered at the top.

Four class boxes, each bordered with divider-separated compartments (name /
attributes / methods):

- **Animal** (parent, top center): attributes `+int age`, `+String gender`;
  methods `+isMammal()`, `+mate()`.
- **Duck** (bottom left): `+String beakColor`; `+swim()`, `+quack()`.
- **Fish** (bottom center): `-Listint sizeInFeet`; `-canEat()`.
- **Zebra** (bottom right): `+bool is_wild`; `+run(List<T>, List<OT>)`,
  `+run-nested(List<List<OT>>)` (Mermaid renders the `~T~` generics as `<...>`).

Three **generalization** edges — Duck → Animal, Fish → Animal, Zebra → Animal —
each a solid line ending in a **hollow** (white, outlined) triangle at Animal's
bottom edge, arriving at three distinct points so the heads sit side by side.

Documented divergences from the Mermaid render: layout is ours (Mermaid
auto-places); the `%%`-commented `run-composite` line is a comment and does not
appear. No overlap, clipping, or line crossing a box.
