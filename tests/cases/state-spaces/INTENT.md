# state-spaces

Our rendering of Mermaid's "states with spaces in them" demo. The `ref.mmd` is
copied verbatim from the Mermaid repo (`demos/state.html`) at tag
`mermaid@11.15.0`. Layout is ours; only the semantics must match.

A fork-then-merge shape, top to bottom:

1. An initial pseudo-state (filled dot) with **two** outgoing transitions:
   - → **SomeOtherState** (left).
   - → a state labelled **Your state with spaces in it** (right) — a multi-word
     label that wraps across lines inside the box.
2. Both states transition into **YetAnotherState** (the two arrows merge on it).
3. **YetAnotherState →** a final pseudo-state (ringed bullseye).

All heads are filled triangles. Documented divergences: the Mermaid source styles
the spaced state with `classDef yourState` (italic/bold) — we ignore styling.
Layout is ours. No overlap, clipping, or line crossing a box.
