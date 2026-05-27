# Authoring guide

How diagrams are built, and how to author one. For the exhaustive list of components, attributes, and styles, see the [component reference](../diagrams/skills/diagrams/references/COMPONENTS.md).

## How it works

1. You author an HTML file with one `<diagram>` and place boxes with CSS.
2. A small in-browser kit runs _after_ layout, measures every box, and draws lifelines and `<arrow>` connectors as an in-page SVG overlay.
3. Headless Chromium screenshots the `<diagram>` element to PNG.

The browser is the layout engine — grid, flex, and text wrapping just work, and the tool only ever computes connector geometry. There is no SVG-export pipeline: the SVG overlay exists only as live DOM, composited with the HTML boxes and rasterized by the screenshot.

## A diagram is just markup

A diagram is one `<diagram>` holding boxes (any HTML, given an `id`) connected by `<arrow>`. For example, a small state machine:

<!-- prettier-ignore -->
```html
<diagram class="stack">
  <div class="initial" id="start"></div>
  <div class="state" id="idle">Idle</div>
  <div class="state" id="running">Running</div>
  <div class="final" id="end"></div>

  <arrow from="start" to="idle" anchor="bottom top"></arrow>
  <arrow from="idle" to="running" anchor="bottom:0.3 top:0.3" path="spline" curvature="0.45">start</arrow>
  <arrow from="running" to="idle" anchor="top:0.7 bottom:0.7" path="spline" curvature="0.45">stop</arrow>
  <arrow from="running" to="end" anchor="bottom top">done</arrow>
</diagram>
```

You stay in control because the output is plain, tweakable markup. Move a box by changing its CSS, separate two arrows with different fractional anchors, fatten a curve with `curvature` — then re-render. Nothing is auto-placed, so the result is exactly what you wrote.

## Reference

Every component, attribute, and style: [`COMPONENTS.md`](../diagrams/skills/diagrams/references/COMPONENTS.md).
