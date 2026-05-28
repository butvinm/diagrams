# class-responsive

Exercises the **`fluid` modifier + responsive authoring**. This is a feature
case, not a new diagram type, so it has no `ref.mmd`: responsiveness is a
cross-cutting capability (a `fluid` diagram fills its container, the author's
grid flexes its gutters, and a media query reflows the columns) and the Mermaid
repo has no canonical responsive demo to copy. The model is a classic `Shape`
generalization hierarchy.

The golden is rendered at the harness's default width, so it captures the
**4-column** layout (above the 780px breakpoint). The responsiveness itself —
gutters flexing, the reflow to 2 columns, connectors redrawing — is a live
browser behavior a single PNG cannot show; this case only locks the rendered
appearance of the fluid diagram at render width.

Layout (top to bottom):

1. An abstract base class **Shape**, centered along the top, spanning the full
   width. Its name compartment shows the stereotype **«abstract»** above an
   _italic_ **Shape**; then a fields compartment (`#origin: Point`,
   `#color: Color`) and a methods compartment (`+area(): float`,
   `+draw(c: Canvas): void`).
2. Four concrete subclasses on the row below, **distributed edge-to-edge** with
   even gutters between them: **Circle**, **Rectangle**, **Triangle**,
   **Ellipse**, each a normal multi-compartment class box.
3. Four **generalization** connectors — solid lines with **hollow triangle**
   heads — one from each subclass, all converging on a **single shared point at
   the center of Shape's bottom edge** (UML tree style), forming a symmetric fan.

Pass criteria: all five class boxes present with correct compartments; Shape is
centered and the four subclasses are spread symmetrically across the full width
with visible gutters (not touching); every connector is a solid line ending in a
hollow (unfilled) triangle at Shape's bottom-center; the fan is symmetric; no
overlap, clipping, or stray `«…»`/literal text.
