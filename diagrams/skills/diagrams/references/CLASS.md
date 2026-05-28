# Class diagrams (`.class` boxes)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

## What it is

A **class diagram** is UML's static-structure view: **classifiers** (classes, interfaces, abstract classes) and the **relationships** between them. A class is a box of up to three compartments — **name** (optionally a `«stereotype»`), **attributes**, **operations** — with members carrying a visibility marker (`+` public, `-` private, `#` protected, `~` package). Relationships are typed connectors: generalization, realization, association, dependency, aggregation, composition. See the [UML reference](https://www.uml-diagrams.org/class-diagrams-overview.html). Layout is yours (a CSS grid is easiest); the kit only draws the relationship lines.

## Supported

- **Class boxes** (`.class`): a name compartment plus any number of member compartments (`.class-section`).
- **Stereotypes** (`.stereotype`, e.g. `«interface»` / `«abstract»`) and member **modifiers**: `.abstract` (italic), `.static` (underline).
- **Visibility markers** typed into the member text (`+ - # ~`), aligned because rows are monospaced.
- **All six UML relationships** via `<arrow>` head/line: generalization, realization, association, dependency, aggregation, composition (table below).
- **Namespace / package grouping** drawn as your own labelled frame boxes around the classes (see the nested namespace frames in the `class-assoc` case).

**Done by hand:** association **multiplicities** and **role names** are plain text you place near an end (`label-pos`), not a dedicated field.

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
  /* No layout preset — place the class boxes on a grid ourselves. */
  diagram.classes {
    display: grid;
    grid-template-columns: repeat(3, auto);
    justify-items: center;
    align-items: start;
    gap: 56px 64px;
    padding: 24px 48px 32px;
  }
  .diagram-title {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 15px;
    margin-bottom: 4px;
  }
</style>

<diagram class="classes">
  <div class="diagram-title">Demo Class Diagram</div>

  <div class="class" id="animal" style="grid-column: 2; grid-row: 2">
    <div class="class-name">Animal</div>
    <div class="class-section">
      <div>+int age</div>
      <div>+String gender</div>
    </div>
    <div class="class-section">
      <div>+isMammal()</div>
      <div>+mate()</div>
    </div>
  </div>

  <div class="class" id="duck" style="grid-column: 1; grid-row: 3">
    <div class="class-name">Duck</div>
    <div class="class-section">
      <div>+String beakColor</div>
    </div>
    <div class="class-section">
      <div>+swim()</div>
      <div>+quack()</div>
    </div>
  </div>

  <div class="class" id="fish" style="grid-column: 2; grid-row: 3">
    <div class="class-name">Fish</div>
    <div class="class-section">
      <div>-Listint sizeInFeet</div>
    </div>
    <div class="class-section">
      <div>-canEat()</div>
    </div>
  </div>

  <div class="class" id="zebra" style="grid-column: 3; grid-row: 3">
    <div class="class-name">Zebra</div>
    <div class="class-section">
      <div>+bool is_wild</div>
    </div>
    <div class="class-section">
      <div>+run(List&lt;T&gt;, List&lt;OT&gt;)</div>
      <div>+run-nested(List&lt;List&lt;OT&gt;&gt;)</div>
    </div>
  </div>

  <!-- Generalization: each child inherits Animal — solid line, hollow triangle. -->
  <arrow from="duck" to="animal" anchor="top bottom:0.25" head="hollow"></arrow>
  <arrow from="fish" to="animal" anchor="top bottom:0.5" head="hollow"></arrow>
  <arrow from="zebra" to="animal" anchor="top bottom:0.75" head="hollow"></arrow>
</diagram>
```

The three generalization arrows land on Animal's bottom edge at `bottom:0.25`, `0.5`, and `0.75` so their hollow triangles sit side by side instead of piling onto one point — the same fractional-anchor trick used for back-and-forth transitions in [`STATE.md`](STATE.md). For associations see the `class-assoc` case; for aggregation (`head="diamond"`), composition (`head="filled"`), dependency, and bidirectional links see the `class-complex` case; for the full relationship set see the table above.
