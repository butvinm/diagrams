# State machines (`class="stack"`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

## What it is

A **state machine (FSM) diagram** models the lifecycle of a single object as a set of **states** and the **transitions** between them. Rules: execution starts at an _initial_ pseudo-state (filled dot), moves between named states along directed transitions whose **label is the triggering event/guard**, and may end at a _final_ state (ringed dot); at most one state is active at a time. See the [UML reference](https://www.uml-diagrams.org/state-machine-diagrams.html). Here states are boxes in a `stack` (or your own layout) and transitions are `<arrow>`s.

## Supported

- **States** (`.state`), the **initial** pseudo-state (`.initial`, a filled dot), and the **final** state (`.final`, a ringed bullseye).
- **Transitions** as `<arrow>`s, with optional event/guard text as the label.
- **Back-and-forth** pairs and **skip** transitions, separated with `spline` + fractional anchors so they bow apart instead of overlapping (there is no auto-routing).
- Arbitrary shapes — chains, **fork/merge fans** — built from the `stack` preset plus your own CSS layout.

**Not built-in:** composite/nested states, fork/join bars, and choice/junction/history pseudo-states have **no dedicated component** — compose them from boxes, dots, and arrows when needed.

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
