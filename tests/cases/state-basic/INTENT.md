# state-basic

Our rendering of Mermaid's canonical state-machine demo. The `ref.mmd` is copied
verbatim from the Mermaid repo (`demos/state.html`, the Still/Moving/Crash example
using the `:::` style operator) at tag `mermaid@11.15.0`. Layout is ours; only the
semantics must match.

Top to bottom, a vertical chain:

1. Initial pseudo-state (filled dot) → **Still**.
2. **Still** and **Moving** form a back-and-forth lens: `Still → Moving` and
   `Moving → Still`, two curved transitions bowing apart (labels n/a).
3. **Moving → Crash**.
4. **Crash →** final pseudo-state (ringed bullseye).
5. **Still →** the same final pseudo-state, via a long curve that bypasses Moving
   and Crash on the left.

All transition heads are filled triangles. Documented divergences: the Mermaid
source applies `classDef`/`:::` styles (Still white, Moving italic, Crash
red/yellow) — we ignore styling and render plain states. Layout is ours. No line
crosses a box.
