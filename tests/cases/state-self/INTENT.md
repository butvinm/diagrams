# state-self

A small state machine exercising a **self-transition**. Our render of the
Mermaid `stateDiagram-v2` in `ref.mmd`; layout is ours, only semantics match.

Top to bottom:

1. Initial pseudo-state (filled dot).
2. Arrow down into **Idle**.
3. `open`: Idle → **Active**.
4. **Active** has a self-transition labelled `tick`: a curved arrow that leaves
   Active's right side and loops back to Active itself, with the arrowhead
   pointing back at the box (filled triangle).
5. `close`: Active → **final** pseudo-state (ringed dot / bullseye).

All transitions have filled triangle heads. The self-loop bulges to the right
of Active; nothing overlaps and no line crosses a box.
