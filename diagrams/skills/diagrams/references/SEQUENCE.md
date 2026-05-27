# Sequence diagrams (`class="sequence"`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

Declare participants in order; the `sequence` class builds the grid columns. Each participant is a `<lifeline>` (a header box with a dashed vertical beneath it). A message is an `<arrow>` between two `<point>`s placed in the same time `row`.

This is `tests/cases/sequence-basic/ours.html` — a render-verified golden (our rendering of a Mermaid `sequenceDiagram` demo).

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
</diagram>
```

- `<lifeline col="...">` — a participant box; a dashed vertical drops from it.
- `<point id col row>` — an invisible anchor at the center of column `col`, time step `row` (1-based). Put both endpoints of a message in the **same `row`** for a horizontal arrow; message order follows row order.
- A message is an `<arrow>` between two points. Synchronous calls use `head="triangle"`; a dashed `line="dashed"` marks a return; `head="open"` is an async/open arrow. (These mirror Mermaid's `->>`, `-->>`, and `-)`.)

> Avoid `-->` inside HTML comments — it closes the comment early and leaks text into the diagram.
