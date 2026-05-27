# Diagram primitives reference

A diagram is a single `<diagram>` element. Inside it you place boxes (any HTML,
laid out by CSS) and connect them with `<arrow>`. After the browser lays
everything out, the kit measures geometry and draws connectors into an SVG
overlay. It never moves a box and never routes around obstacles.

These are **plain HTML elements** (not custom elements) processed by the kit
after layout. They must be styled via the kit CSS, which the renderer injects.

## `<diagram>`

The root. A positioning context for the connector overlay. `class` selects a
layout preset:

- `class="sequence"` — CSS grid; columns are participants, rows are time steps.

Without a preset, `<diagram>` is a plain block — use your own CSS (flex/grid/
absolute) to place children, give each box an `id`, and connect with `<arrow>`.

## `<arrow>` — connectors (works in any diagram)

```html
<arrow from="a" to="b" anchor="right left" head="triangle" line="solid"
  >label</arrow
>
```

| Attribute | Values                                          | Default         | Meaning                              |
| --------- | ----------------------------------------------- | --------------- | ------------------------------------ |
| `from`    | element id                                      | —               | source element                       |
| `to`      | element id                                      | —               | target element                       |
| `anchor`  | `"<src> <dst>"`                                 | `center center` | edge points to connect (see below)   |
| `path`    | `straight`, `spline`                            | `straight`      | line shape (`spline` = bowed Bézier) |
| `head`    | `triangle`, `open`, `diamond`, `filled`, `none` | `triangle`      | arrowhead at `to` end                |
| `tail`    | same as `head`                                  | `none`          | marker at `from` end                 |
| `line`    | `solid`, `dashed`, `dotted`                     | `solid`         | stroke style                         |

**Anchor names:** `top`, `bottom`, `left`, `right`, `center`, `top-left`,
`top-right`, `bottom-left`, `bottom-right`. Space-separated: first token is the
source edge, second is the target edge. A single token applies to both ends.

**Label content** is the arrow's children — plain text or arbitrary HTML
(`<div class="badge">…</div>`, icons, multi-line). It is positioned just above
the connector midpoint.

**UML edge cheatsheet:** inheritance = `head="triangle"`; dependency =
`head="open" line="dashed"`; aggregation = `head="diamond"`; composition =
`head="filled"`.

## Sequence preset (`class="sequence"`)

Declare participants in order; the preset builds the grid columns.

```html
<diagram class="sequence" participants="alice,bob,db">
  <lifeline col="alice">Alice</lifeline>
  <lifeline col="bob">Bob</lifeline>
  <lifeline col="db">DB</lifeline>

  <point id="m1a" col="alice" row="1"></point>
  <point id="m1b" col="bob" row="1"></point>
  <arrow from="m1a" to="m1b" head="triangle">login(user, pass)</arrow>

  <point id="m2a" col="db" row="2"></point>
  <point id="m2b" col="bob" row="2"></point>
  <arrow from="m2a" to="m2b" head="open" line="dashed">row</arrow>
</diagram>
```

- `<lifeline col="...">` — a participant box; a dashed vertical drops from it.
- `<point id col row>` — an invisible anchor at the center of column `col`,
  time step `row` (1-based). Put both endpoints of a message in the **same
  `row`** for a horizontal arrow; the message order is the row order.
- A message is an `<arrow>` between two points. Return messages typically use
  `head="open" line="dashed"`.

> Avoid `-->` inside HTML comments — it closes the comment early and leaks text
> into the diagram.
