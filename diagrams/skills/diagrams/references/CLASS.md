# Class diagrams (`.class` boxes)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

A class diagram has **no layout preset** — you place the boxes yourself with your own CSS (grid is usually easiest), then connect them with `<arrow>`. The class box is a ready-made multi-compartment component; the UML relationship lines are ordinary connectors.

## The class box

```html
<div class="class" id="shape">
  <div class="class-name abstract">
    <div class="stereotype">«abstract»</div>
    Shape
  </div>
  <div class="class-section">
    <div># x: int</div>
    <div># y: int</div>
  </div>
  <div class="class-section">
    <div>+ move(dx, dy): void</div>
    <div class="abstract">+ draw(): void</div>
  </div>
</div>
```

- `.class` — the box: a bordered, content-sized vertical stack of compartments. Give it an `id` so arrows can reference it.
- `.class-name` — the **name compartment** (required, first): bold and centered, with a divider below. May contain a `.stereotype` line.
- `.class-section` — a **member compartment**: one child `<div>` per row (attribute or method). Repeat the element for as many compartments as you need (attributes, then methods, …); successive compartments get a divider between them. Rows are monospaced so visibility markers (`+ - #`) and types line up.
- `.stereotype` — a small, non-bold line inside `.class-name`, e.g. `«interface»` or `«abstract»` (type the guillemets yourself).
- Modifiers (on a `.class-name` or any member `<div>`): `.abstract` → _italic_ (abstract class or method); `.static` → underline (static member).

## Relationships

Class relationships are plain `<arrow>`s — pick the head/line to match the UML notation (full table in [`COMPONENTS.md`](COMPONENTS.md)):

| Relationship   | `<arrow>` attributes                   | Marker                        |
| -------------- | -------------------------------------- | ----------------------------- |
| Generalization | `head="hollow"`                        | hollow triangle at the parent |
| Realization    | `head="hollow" line="dashed"`          | hollow triangle, dashed       |
| Association    | `head="open"` (or `head="none"`)       | open arrow / plain line       |
| Dependency     | `head="open" line="dashed"`            | open arrow, dashed            |
| Aggregation    | `head="diamond"` (or `tail="diamond"`) | hollow diamond at the whole   |
| Composition    | `head="filled"` (or `tail="filled"`)   | filled diamond at the whole   |

The diamond sits at the **whole** (the aggregate/owner), so point the arrow _at_ the whole with `head`, or _from_ the whole with `tail`.

## Worked example

This is `tests/cases/class-basic/ours.html` — a render-verified golden, so the markup is known to produce a correct diagram.

<!-- prettier-ignore -->
```html
<style>
  /* No layout preset — place the class boxes on a 3×3 grid ourselves. */
  diagram.classes {
    display: grid;
    grid-template-columns: repeat(3, auto);
    justify-items: center;
    align-items: start;
    gap: 56px 64px;
    padding: 32px 48px;
  }
</style>

<diagram class="classes">
  <div class="class" id="drawable" style="grid-column: 2; grid-row: 1">
    <div class="class-name">
      <div class="stereotype">«interface»</div>
      Drawable
    </div>
    <div class="class-section">
      <div class="abstract">+ draw(): void</div>
    </div>
  </div>

  <div class="class" id="canvas" style="grid-column: 1; grid-row: 2">
    <div class="class-name">Canvas</div>
    <div class="class-section">
      <div>- shapes: List</div>
    </div>
    <div class="class-section">
      <div>+ add(s: Shape): void</div>
    </div>
  </div>

  <div class="class" id="shape" style="grid-column: 2; grid-row: 2">
    <div class="class-name abstract">
      <div class="stereotype">«abstract»</div>
      Shape
    </div>
    <div class="class-section">
      <div># x: int</div>
      <div># y: int</div>
    </div>
    <div class="class-section">
      <div>+ move(dx, dy): void</div>
      <div class="abstract">+ draw(): void</div>
    </div>
  </div>

  <div class="class" id="circle" style="grid-column: 1; grid-row: 3">
    <div class="class-name">Circle</div>
    <div class="class-section">
      <div>+ radius: float</div>
    </div>
    <div class="class-section">
      <div>+ area(): float</div>
    </div>
  </div>

  <div class="class" id="rectangle" style="grid-column: 3; grid-row: 3">
    <div class="class-name">Rectangle</div>
    <div class="class-section">
      <div>+ w: float</div>
      <div>+ h: float</div>
    </div>
    <div class="class-section">
      <div>+ area(): float</div>
    </div>
  </div>

  <!-- Shape realizes Drawable: dashed line, hollow triangle -->
  <arrow from="shape" to="drawable" anchor="top bottom" line="dashed" head="hollow"></arrow>
  <!-- Circle and Rectangle inherit Shape: solid line, hollow triangle -->
  <arrow from="circle" to="shape" anchor="top bottom:0.3" head="hollow"></arrow>
  <arrow from="rectangle" to="shape" anchor="top bottom:0.7" head="hollow"></arrow>
  <!-- Canvas is composed of Shapes: filled diamond at the whole (Canvas) -->
  <arrow from="shape" to="canvas" anchor="left right" head="filled">shapes</arrow>
</diagram>
```

The two generalization arrows land on Shape's bottom edge at `bottom:0.3` and `bottom:0.7` so their hollow triangles sit side by side instead of piling onto one point — the same fractional-anchor trick used for back-and-forth transitions in [`STATE.md`](STATE.md).
