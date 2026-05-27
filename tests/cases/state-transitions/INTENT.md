# state-transitions

Our rendering of Mermaid's "you can label the relationships" state demo. The
`ref.mmd` is copied verbatim from the Mermaid repo (`demos/state.html`) at tag
`mermaid@11.15.0`. Layout is ours; only the semantics must match.

- An initial pseudo-state (filled dot) at top → **State1**.
- **State1** has three labelled outgoing transitions fanning downward to three
  separate states, each a solid line with a filled triangle head:
  - State1 → **State2**, labelled `Transition 1`.
  - State1 → **State3**, labelled `Transition 2`.
  - State1 → **State4**, labelled `Transition 3`.
- **State1 →** a final pseudo-state (ringed bullseye), sitting in the **same
  bottom row** as State2/State3/State4, to the right of State4.

No overlap, no clipping, no line crossing a box; the three transition labels are
legible and do not overlap.
