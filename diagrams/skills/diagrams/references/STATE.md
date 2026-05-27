# State machines (`class="stack"`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

`class="stack"` is a ready-made vertical centered column (also handy for simple flows). State components: `.state` (rounded box), `.initial` (filled dot), `.final` (ringed bullseye).

<!-- prettier-ignore -->
```html
<diagram class="stack">
  <div class="initial" id="start"></div>
  <div class="state" id="idle" style="margin-bottom: 28px">Idle</div>
  <div class="state" id="running">Running</div>
  <div class="final" id="end"></div>

  <arrow from="start" to="idle" anchor="bottom top"></arrow>
  <arrow from="idle" to="running" anchor="bottom:0.3 top:0.3" path="spline" curvature="0.45">start</arrow>
  <arrow from="running" to="idle" anchor="top:0.7 bottom:0.7" path="spline" curvature="0.45">stop</arrow>
  <arrow from="running" to="end" anchor="bottom top">done</arrow>
</diagram>
```

A back-and-forth pair (`idle`⇄`running`) reads cleanly when each connector uses `spline` plus **different** fractional anchors, so the two curves bow apart into a lens and their labels land on opposite sides. The extra `margin-bottom` on `idle` gives the lens vertical room.
