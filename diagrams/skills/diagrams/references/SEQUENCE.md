# Sequence diagrams (`class="sequence"`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

Declare participants in order; the `sequence` class builds the grid columns. Each participant is a `<lifeline>` (a header box with a dashed vertical beneath it); the kit automatically clones each header into a **footer row** at the bottom, so participants are labelled at both ends (as Mermaid/PlantUML do). A message is an `<arrow>` between two `<point>`s placed in the same time `row`.

Excerpt from `tests/cases/sequence-basic/ours.html` — a render-verified golden (our rendering of Mermaid `sequenceDiagram` demos).

```html
<diagram class="sequence" participants="alice,john">
  <lifeline col="alice">Alice</lifeline>
  <lifeline col="john">John</lifeline>

  <!-- 1. Alice to John -->
  <point id="m1a" col="alice" row="1"></point>
  <point id="m1b" col="john" row="1"></point>
  <arrow from="m1a" to="m1b" head="triangle">Hello John, how are you?</arrow>

  <!-- 2. John to Alice (return) -->
  <point id="m2a" col="john" row="2"></point>
  <point id="m2b" col="alice" row="2"></point>
  <arrow from="m2a" to="m2b" head="triangle" line="dashed">Great!</arrow>

  <!-- 3. Alice to John (async) -->
  <point id="m3a" col="alice" row="3"></point>
  <point id="m3b" col="john" row="3"></point>
  <arrow from="m3a" to="m3b" head="open">See you later!</arrow>

  <!-- 4. bidirectional -->
  <point id="m4a" col="alice" row="4"></point>
  <point id="m4b" col="john" row="4"></point>
  <arrow from="m4a" to="m4b" tail="open" head="open">Hello!</arrow>
</diagram>
```

- `<lifeline col="...">` — a participant box; a dashed vertical drops from it.
- `<point id col row>` — an invisible anchor at the center of column `col`, time step `row` (1-based). Put both endpoints of a message in the **same `row`** for a horizontal arrow; message order follows row order.
- A message is an `<arrow>` between two points. Synchronous calls use `head="triangle"`; a dashed `line="dashed"` marks a return; `head="open"` is an async/open arrow; an `open` head plus an `open` `tail` is a bidirectional message. (These mirror Mermaid's `->>`, `-->>`, `-)`, and `<<->>`.)

A **self-call** (a participant messaging itself) is two `point`s in the **same column** on adjacent rows joined by a `spline` that bows to the side: `<arrow … path="spline" curvature="-1.0" label-anchor="left">`. A negative `curvature` bows the loop right; `label-anchor="left"` keeps the label inside the canvas.

## Activations

An `<activation>` is the bar that marks when a participant is busy — an opaque box on its lifeline spanning a range of message rows. It covers the dashed lifeline; arrows draw over it, so heads land on the bar.

```html
<activation col="john" from="1" to="4"></activation>
<activation col="john" from="2" to="3" style="margin-left: 7px"></activation>
```

- `col` — the participant.
- `from` / `to` — the first and last message rows (inclusive) the bar covers.
- **Nested** activations (a participant activated again while still active) are two `<activation>`s with overlapping rows; nudge the inner one right with `style="margin-left: …"`, as in `tests/cases/sequence-activation` (a render-verified golden, our rendering of Mermaid's nested-activation demo).

## Combined fragments (`alt` / `opt` / `loop` / `ref` / `par` / …)

A `<fragment>` is the labelled frame around a group of messages; a `<guard>` is an operand label inside it (and, with `sep`, the dashed divider between operands). This is `tests/cases/sequence-alt/ours.html` — a render-verified golden (our rendering of Mermaid's `alt`/`else` + `opt` demo).

```html
<!-- alt: is sick / is well -->
<fragment op="alt" col="alice bob" row="2 5"></fragment>
<guard col="alice bob" row="2">[is sick]</guard>

<point id="m2a" col="bob" row="3"></point>
<point id="m2b" col="alice" row="3"></point>
<arrow from="m2a" to="m2b" head="triangle">Not so good :(</arrow>

<guard col="alice bob" row="4" sep>[is well]</guard>

<point id="m3a" col="bob" row="5"></point>
<point id="m3b" col="alice" row="5"></point>
<arrow from="m3a" to="m3b" head="triangle">Feeling fresh like a daisy</arrow>
```

- `<fragment op col row>` — `op` is the operator shown in the corner tab (`alt`, `opt`, `loop`, `ref`, `par`, …). `col="<left> <right>"` is the leftmost and rightmost participants the frame spans (space-separated names). `row="<start> <end>"` is the message-row range. Reserve the **top row of the range as a header row** (no message there) so the tab and first guard sit above the first message.
- `<guard col row [sep]>` — an operand label spanning the same columns at one row; its text is the guard (write the brackets yourself, e.g. `[is sick]`). The first operand sits beside the tab; add `sep` to every later operand to draw its dashed separator. Guards are **siblings** of the fragment (direct children of `<diagram>`), placed by row/col like points — not nested inside `<fragment>`.

## Section dividers

A `<divider row>` is a full-width band with a centered label chip, used to split a long sequence into phases (PlantUML's `== … ==`).

```html
<divider row="1">1. Начало сессии верификации</divider>
```

For all three in one diagram — activations, an `alt` fragment, dividers, and self-calls — see `tests/cases/sequence-protocol` (a render-verified golden translated from a PlantUML protocol diagram).

> Avoid `-->` inside HTML comments — it closes the comment early and leaks text into the diagram.
