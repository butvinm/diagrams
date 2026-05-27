# State machines (`class="stack"`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

`class="stack"` is a ready-made vertical centered column (also handy for simple flows). State components: `.state` (rounded box), `.initial` (filled dot), `.final` (ringed bullseye).

This is `tests/cases/state-basic/ours.html` — a render-verified golden (our rendering of a Mermaid `stateDiagram` demo).

<!-- prettier-ignore -->
```html
<diagram class="stack" style="padding-left: 120px">
  <div class="initial" id="start"></div>
  <div class="state" id="still">Still</div>
  <div class="state" id="moving" style="margin: 10px 0">Moving</div>
  <div class="state" id="crash">Crash</div>
  <div class="final" id="end"></div>

  <arrow from="start" to="still" anchor="bottom top"></arrow>
  <!-- Still and Moving form a back-and-forth lens. -->
  <arrow from="still" to="moving" anchor="bottom:0.35 top:0.35" path="spline" curvature="0.5"></arrow>
  <arrow from="moving" to="still" anchor="top:0.65 bottom:0.65" path="spline" curvature="0.5"></arrow>
  <arrow from="moving" to="crash" anchor="bottom top"></arrow>
  <arrow from="crash" to="end" anchor="bottom top"></arrow>
  <!-- Still also goes straight to the final, bypassing Moving/Crash on the left. -->
  <arrow from="still" to="end" anchor="left left" path="spline" curvature="0.5"></arrow>
</diagram>
```

A back-and-forth pair (`still`⇄`moving`) reads cleanly when each connector uses `spline` plus **different** fractional anchors (`0.35` vs `0.65`), so the two curves bow apart into a lens instead of crossing. The `still → end` connector skips two states: with no routing, you give it a `spline` and anchor it on the boxes' `left` edges so it bows out around them — and `padding-left` reserves the room for that bow.
