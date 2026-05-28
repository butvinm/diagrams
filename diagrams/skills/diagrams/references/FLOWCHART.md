# Flowcharts (`.terminal` / `.step` / `.decision` / `.io` / `.subroutine` / `.database` / `.preparation`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

## What it is

A **flowchart** models a process as a sequence of **steps** connected by directed
**flow** arrows: it starts and ends at **terminals**, runs through **process
steps**, and **branches** at **decisions**. It is the classic process-flow
notation (ANSI / ISO 5807), not a UML diagram. The shape of a node carries
meaning — a diamond is a decision, a parallelogram is input/output, a cylinder is
a data store — so flowcharts are really a small vocabulary of **node shapes** plus
ordinary arrows.

Flowcharts have **no layout preset**: place the nodes yourself with your own CSS
(a **grid** is usually best for a branching flow — columns/rows give you the
fan-out; the `stack` preset works for a purely linear one), then connect them with
`<arrow>`. The kit only draws the connectors.

## Supported

- **Seven node shapes**, all pure CSS, sized to their content:
  - `.terminal` — a **stadium / pill** (start & end).
  - `.step` — a **process step** (rounded rectangle); the default node.
  - `.decision` — a **diamond / rhombus**; its `top`/`bottom`/`left`/`right`
    anchors land on the four vertices, so branches leave the points.
  - `.io` — a **parallelogram** (input / output / data).
  - `.subroutine` — a **predefined process** (rectangle with a rule just inside
    each side).
  - `.database` — a **cylinder** (data store).
  - `.preparation` — a **hexagon** (pointed left & right); the loop-setup /
    initialization symbol.
- **Flow arrows** as ordinary `<arrow>`s (default filled triangle head), with
  optional edge labels (e.g. branch conditions `Yes` / `No`).
- **Branching** (decision fan-out) and **convergence** (fan-in / merge), in any
  direction — top-down or left-to-right — laid out on your own CSS grid. See the
  render-verified cases `tests/cases/flowchart-basic` (TD decision fan-out),
  `flowchart-io` (parallelograms), `flowchart-subroutine`, and
  `flowchart-database` (LR fan-out + fan-in).
- **Loops / back-edges** — a loop is a plain `<arrow>` returning to an earlier
  node. With no routing, you hand-bow it with `path="spline"`, side anchors, the
  right `curvature` **sign**, and reserved padding so it clears the boxes in
  between. See `tests/cases/flowchart-loop` (a counting loop with a
  `.preparation` init).

**Not built-in / done by hand:** there is no auto-layout and no edge routing — you
place every node and pick each arrow's anchors (if a line would cross a box, move
the box or choose different anchors). There is no **subgraph / group** container
(reach for the DFD `.zone` if you need an enclosing region) and no **thick** edge
style. Keep `.decision` labels short — the diamond pinches at its tips; use `<br>`
or more padding for longer text.

## Node shapes

<!-- prettier-ignore -->
```html
<div class="terminal"   id="start">Start</div>
<div class="step"       id="work">Process step</div>
<div class="decision"   id="ok">Approved?</div>
<div class="io"         id="read">Read input</div>
<div class="subroutine" id="val">Validate</div>
<div class="database"   id="db">Users DB</div>
<div class="preparation" id="setup">i = 0</div>
```

Give every node an `id` so `<arrow>` can reference it. The label is the element's
content (text or HTML). Edge anchors come from each node's bounding box, so arrows
attach to `top` / `bottom` / `left` / `right` as usual — and for the diamond and
parallelogram those points sit on the shape's vertices/edge, exactly where a
flowchart link should meet them.

## Flow arrows

A flow is a plain `<arrow>` (full attribute table in [`COMPONENTS.md`](COMPONENTS.md)),
by default a solid line with a filled triangle head. Label it with the branch
condition where it matters:

| Relationship    | `<arrow>` attributes        | Looks like                               |
| --------------- | --------------------------- | ---------------------------------------- |
| Flow / next     | _(defaults)_                | a solid arrow                            |
| Decision branch | label text, e.g. `Yes`/`No` | a labelled arrow leaving a diamond point |
| Optional flow   | `line="dashed"`             | a dashed arrow                           |

To fan a decision out to several outcomes, leave the diamond from its `left`,
`bottom`, and `right` vertices (`anchor="left top"`, `anchor="bottom top"`,
`anchor="right top"`). To merge several flows, point them all at one side of the
target (e.g. `anchor="right left"` into the target's left).

## Worked example

This is `tests/cases/flowchart-basic/ours.html` — a render-verified golden, so the
markup is known to produce a correct diagram (our rendering of a Mermaid
`flowchart` demo).

<!-- prettier-ignore -->
```html
<style>
  /* No layout preset: a top-down flow as a 3-column grid. Equal-width columns so
     the single nodes (which span all three) center over the middle outcome and
     the decision fan is symmetric. */
  diagram.flow {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    justify-items: center;
    align-items: center;
    gap: 44px 36px;
    padding: 40px 60px;
  }
  diagram.flow .span { grid-column: 1 / -1; }
</style>

<diagram class="flow">
  <div class="step span" id="xmas">Christmas</div>
  <div class="terminal span" id="shop">Go shopping</div>
  <div class="decision span" id="think">Let me think?</div>
  <div class="step" id="laptop">Laptop</div>
  <div class="step" id="phone">iPhone</div>
  <div class="step" id="car">Car</div>

  <arrow from="xmas" to="shop" anchor="bottom top">Get money</arrow>
  <arrow from="shop" to="think" anchor="bottom top"></arrow>
  <!-- The decision fans to three outcomes from its left/bottom/right vertices. -->
  <arrow from="think" to="laptop" anchor="left top">One</arrow>
  <arrow from="think" to="phone" anchor="bottom top">Two</arrow>
  <arrow from="think" to="car" anchor="right top">Three</arrow>
</diagram>
```

For the other shapes in context, see the render-verified cases
`tests/cases/flowchart-io/ours.html` (I/O parallelograms),
`tests/cases/flowchart-subroutine/ours.html` (subroutine boxes, left-to-right),
and `tests/cases/flowchart-database/ours.html` (cylinders, with fan-out and
fan-in).
