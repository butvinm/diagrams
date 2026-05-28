# Data flow diagrams (`.external` / `.process` / `.store`) + threat model

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

A data flow diagram (DFD) shows how data moves between **external entities**, **processes**, and **data stores**, connected by labelled **data flows**. The **threat-model** flavor adds **trust zones** (regions) and **trust boundaries** (lines) so you can see where data crosses a trust edge.

DFDs have **no layout preset** — place the elements yourself with your own CSS (a flex row or grid is usually enough), then connect them with `<arrow>`. Notation is Yourdon–DeMarco: process = circle, store = open two-line rectangle, external entity = sharp rectangle.

> Like deployment diagrams, DFDs have **no Mermaid equivalent** (Mermaid has no DFD type), so cases carry no `ref.mmd` and the comparison gallery shows `(none)` for the Mermaid column.

## Core components

```html
<div class="external" id="user">User</div>

<div class="process" id="validate">
  <span class="process-id">1.0</span>
  <span>Validate Login</span>
</div>

<div class="store" id="creds"><span class="store-id">D1</span> Credentials</div>
```

- `.external` — an external entity (a source or sink of data outside the system), drawn as a **sharp-cornered rectangle**. Give it an `id` so connectors can reference it.
- `.process` — a process that transforms data, drawn as a **circle**. Put the process number in a `.process-id` line above the name. Keep labels short (a number + a verb phrase) so the circle stays compact — the circle grows with its content.
- `.store` — a data store, drawn as an **open-ended rectangle** (a top rule and a bottom rule only, no sides). Put the store tag (e.g. `D1`) in a `.store-id` span before the label. Edge anchors still come from the full box, so arrows attach to `left`/`right` normally.

## Data flows

A data flow is a plain `<arrow>` (full table in [`COMPONENTS.md`](COMPONENTS.md)) labelled with the data it carries. The DFD convention is a thin **open** arrowhead:

| Relationship | `<arrow>` attributes | Looks like                                                       |
| ------------ | -------------------- | ---------------------------------------------------------------- |
| Data flow    | `head="open"`        | a thin arrow labelled with the data, e.g. `credentials`, `token` |

For a request/response pair between the same two elements, bow the two arrows apart with `path="spline"` (their bows flip with direction, so the labels separate) or with fractional anchors like `anchor="bottom:0.32 top:0.32"` — see [`COMPONENTS.md`](COMPONENTS.md).

## Threat model: trust zones & boundaries

```html
<!-- A trust zone: a dashed labelled region that encloses elements. -->
<div class="zone" id="z-internal">
  <div class="zone-label">Internal Network</div>
  <!-- lay out the enclosed elements with your own CSS -->
  <div class="process" id="app">…</div>
  <div class="store" id="orders">…</div>
</div>

<!-- A free trust boundary line that data flows cross. -->
<div class="boundary" id="tb">
  <div class="boundary-label">Internet&nbsp;|&nbsp;Trusted</div>
</div>
```

- `.zone` — a **trust zone**: a dashed labelled region that encloses elements. Like the diagram itself it has no layout of its own, so lay out its children with your own CSS (e.g. make a specific zone `display:flex; flex-direction:column`). `.zone-label` is the zone name, drawn in the top-left notch. Flows that run from inside to outside visibly cross the dashed border.
- `.boundary` — a free **trust boundary line** you place (typically as a flex item between two columns) to mark where data crosses a trust edge. It is **vertical** by default (give it a height, or let it stretch to the row); add `.horizontal` for a horizontal rule. `.boundary-label` labels it. It is drawn over the flows it crosses, so data flows passing through read as crossing the boundary.

Both representations stay **monochrome** (dashed gray), distinguished from ordinary dashed connectors by their dash and label rather than color.

## Worked example

This is `tests/cases/dfd-basic/ours.html` — a render-verified golden, so the markup is known to produce a correct diagram.

<!-- prettier-ignore -->
```html
<style>
  /* No layout preset — a left-to-right flow as a centered flex row. */
  diagram.dfd {
    display: flex;
    align-items: center;
    gap: 104px;
    padding: 52px 64px;
  }
</style>

<diagram class="dfd">
  <div class="external" id="user">User</div>

  <div class="process" id="validate">
    <span class="process-id">1.0</span>
    <span>Validate Login</span>
  </div>

  <div class="store" id="creds"><span class="store-id">D1</span> Credentials</div>

  <!-- User and process: request carries credentials, reply carries a token. -->
  <arrow from="user" to="validate" anchor="right left" path="spline" curvature="0.22" head="open">credentials</arrow>
  <arrow from="validate" to="user" anchor="left right" path="spline" curvature="0.22" head="open">token</arrow>

  <!-- Process and store: look the user up, get the stored record back. -->
  <arrow from="validate" to="creds" anchor="right left" path="spline" curvature="0.22" head="open">lookup</arrow>
  <arrow from="creds" to="validate" anchor="left right" path="spline" curvature="0.22" head="open">result</arrow>
</diagram>
```

For the threat-model flavor in context, see the render-verified cases `tests/cases/dfd-trust-zones/ours.html` (two `.zone` regions with cross-zone flows) and `tests/cases/dfd-trust-boundary/ours.html` (a `.boundary` line that flows cross).
