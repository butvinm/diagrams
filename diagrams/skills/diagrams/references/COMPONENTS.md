# Diagram components reference

A diagram is a single `<diagram>` element. Inside it you place boxes (any HTML, laid out by CSS) and connect them with `<arrow>`. After the browser lays everything out, the kit measures geometry and draws the connectors as an in-page SVG overlay. It never moves a box and never routes around obstacles.

These are **plain HTML elements** (not custom elements) processed by the kit after layout. They are styled by the kit CSS, which the renderer injects.

This file is the **core** — the components used in every diagram. For a specific diagram type, read its reference alongside this one:

- [`SEQUENCE.md`](SEQUENCE.md) — sequence diagrams.
- [`STATE.md`](STATE.md) — state machines / FSM.
- [`CLASS.md`](CLASS.md) — UML class diagrams.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — UML deployment diagrams.

## `<diagram>`

The root, and the positioning context for the connector overlay. `class` selects a layout style:

- `class="sequence"` — CSS grid; columns are participants, rows are time steps (see `SEQUENCE.md`).
- `class="stack"` — a vertical centered column, handy for state machines and simple flows (see `STATE.md`).

Without a class, `<diagram>` is a plain block — use your own CSS (flex/grid/absolute) to place children, give each box an `id`, and connect with `<arrow>`.

## Boxes

A box is **any HTML element** you place inside the `<diagram>` and give an `id` (so `<arrow>` can reference it). It holds any content — text or rich HTML. Style it with your own CSS, or reach for a ready-made box style:

- `.state` — a rounded labelled box (a state-machine state).
- `.initial` — a small filled dot (initial pseudo-state).
- `.final` — a ringed dot / bullseye (final pseudo-state).
- `.class` — a multi-compartment UML class box (`.class-name` + `.class-section` rows; see `CLASS.md`).
- `.node` / `.artifact` — a deployment node container and a nested artifact box (see `DEPLOYMENT.md`).
- `<lifeline col="...">` — a participant header in a `sequence` diagram.

```html
<div class="state" id="idle">Idle</div>
<div id="db" style="padding: 10px; border: 1px solid #333">Postgres</div>
```

Then connect any two boxes by `id`: `<arrow from="idle" to="db">query</arrow>`.

## `<arrow>` — connectors

<!-- prettier-ignore -->
```html
<arrow from="a" to="b" anchor="right left" head="triangle" line="solid">label</arrow>
```

Its attributes:

| Attribute   | Values                                                    | Default         | Meaning                                                                      |
| ----------- | --------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `from`      | element id                                                | —               | source element                                                               |
| `to`        | element id                                                | —               | target element                                                               |
| `anchor`    | `"<src> <dst>"`                                           | `center center` | edge points to connect (see below)                                           |
| `path`      | `straight`, `spline`                                      | `straight`      | line shape (`spline` = bowed Bézier)                                         |
| `curvature` | number                                                    | `0.18`          | spline bow as a fraction of chord length; sign of bow flips with direction   |
| `head`      | `triangle`, `hollow`, `open`, `diamond`, `filled`, `none` | `triangle`      | arrowhead at `to` end (`hollow` = unfilled triangle, for UML generalization) |
| `tail`      | same as `head`                                            | `none`          | marker at `from` end                                                         |
| `line`      | `solid`, `dashed`, `dotted`                               | `solid`         | stroke style                                                                 |

**Anchor names:** `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Space-separated: first token is the source edge, second is the target edge. A single token applies to both ends.

**Fractional edge anchors:** `"<side>:<frac>"` attaches at a point along an edge — e.g. `bottom:0.3` is 30% across the bottom edge, `left:0.5` is mid-left. Use these so multiple connectors leave/arrive at a box without piling onto one point (e.g. a back-and-forth pair of transitions).

**Label content** is the arrow's children — plain text or arbitrary HTML (`<div class="badge">…</div>`, icons, multi-line). It is positioned just above the connector midpoint.

**UML edge cheatsheet:** generalization (inheritance) = `head="hollow"`; realization = `head="hollow" line="dashed"`; dependency = `head="open" line="dashed"`; aggregation = `head="diamond"`; composition = `head="filled"`. (`head="triangle"` is the _filled_ triangle used for sequence messages.) For class boxes and these relationships in context, see [`CLASS.md`](CLASS.md). Deployment communication path = `head="none"` (a plain solid line); see [`DEPLOYMENT.md`](DEPLOYMENT.md).

> Avoid `-->` inside HTML comments — it closes the comment early and leaks text into the diagram.
