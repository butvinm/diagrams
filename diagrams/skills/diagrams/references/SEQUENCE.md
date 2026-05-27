# Sequence diagrams (`class="sequence"`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

Declare participants in order; the `sequence` class builds the grid columns. Each participant is a `<lifeline>` (a header box with a dashed vertical beneath it). A message is an `<arrow>` between two `<point>`s placed in the same time `row`.

```html
<diagram class="sequence" participants="alice,bob,db">
  <lifeline col="alice">Alice</lifeline>
  <lifeline col="bob">Bob</lifeline>
  <lifeline col="db">DB</lifeline>

  <!-- 1. Alice to Bob: login -->
  <point id="m1a" col="alice" row="1"></point>
  <point id="m1b" col="bob" row="1"></point>
  <arrow from="m1a" to="m1b" head="triangle">login(user, pass)</arrow>

  <!-- 2. Bob to DB: query -->
  <point id="m2a" col="bob" row="2"></point>
  <point id="m2b" col="db" row="2"></point>
  <arrow from="m2a" to="m2b" head="triangle">SELECT * FROM users</arrow>

  <!-- 3. DB to Bob: return row -->
  <point id="m3a" col="db" row="3"></point>
  <point id="m3b" col="bob" row="3"></point>
  <arrow from="m3a" to="m3b" head="open" line="dashed">row</arrow>

  <!-- 4. Bob to Alice: return token -->
  <point id="m4a" col="bob" row="4"></point>
  <point id="m4b" col="alice" row="4"></point>
  <arrow from="m4a" to="m4b" head="open" line="dashed">token</arrow>
</diagram>
```

- `<lifeline col="...">` — a participant box; a dashed vertical drops from it.
- `<point id col row>` — an invisible anchor at the center of column `col`, time step `row` (1-based). Put both endpoints of a message in the **same `row`** for a horizontal arrow; message order follows row order.
- A message is an `<arrow>` between two points. Calls usually use `head="triangle"`; returns usually use `head="open" line="dashed"`.

> Avoid `-->` inside HTML comments — it closes the comment early and leaks text into the diagram.
