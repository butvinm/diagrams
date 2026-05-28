# sequence-protocol

Our rendering of a verification-protocol sequence diagram. The reference is the
author's own PlantUML (`ref.puml`), adapted from
`/home/butvinm/Dev/ITMO/thesis/thesis/diagrams/protocol-simple.puml` — not a
Mermaid demo, so there is no `ref.mmd` and no Mermaid comparison render. The
original labels were in Russian; both `ref.puml` and `ours.html` have been
translated to English here (message content, ordering, and structure preserved).
This case exercises sequence features beyond the basic cases: many participants,
section dividers, self-calls, and an `alt`/`else` frame.

Six participants, left to right, each a header box over a dashed lifeline and
labelled again in a footer row at the bottom:
**User**, **RClient**, **VClient**, **RService**, **VAgent**, **VService**.

The flow is split into five labelled **section dividers** (a centered chip on a
full-width rule), top to bottom:

1. **Verification session start** — User → RClient → RService → VAgent → VService
   (`SessionOpen`), then dashed returns back to User (`VerificationSession`,
   `Redirect with sid`); then User → VClient (`Verification request (sid)`),
   `RequestManifest` forwarded to VService and `Manifest` returned.
2. **Collaborative key generation** — VClient/VAgent exchange `VClientPKShare` /
   `VAgentPKShare`, `VClientRLKRound1` / `VAgentRLKRound1`, `VClientRLKRound2` /
   `Acknowledgement`, `VClientGaloisShares`. VAgent has a **self-call**
   `Hierarchical key derivation`, then `InferEvalKeys` to VService, which has its
   own **self-call** `Hierarchical key derivation`, then dashed `Acknowledgement`
   returns.
3. **Image transfer and inference** — User → VClient `Image`,
   `EncryptedImage` forwarded to VService, VService **self-call** `Inference`,
   dashed `InferenceResult` returned.
4. **Result decryption with integrity protection** — VAgent **self-call**
   `Result authentication`, dashed `AuthenticatedResult` to VClient, then
   `PartialDecryption` to VAgent.
5. **Verification session completion** — `VerdictNotification` to RService and
   dashed `Acknowledgement` back; redirect chain `Redirect to resource` back
   to User; `Return to resource page` to RClient, `Resource request` to
   RService; then an **`alt` frame** (spanning User…RService) with two branches:
   `[Positive verdict]` → `Resource` / `Display resource`, and
   `[Negative verdict]` (a dashed separator) → `Access denied` /
   `Denial message`.

Expected rendering details:

- Forward (request) messages are solid lines; return messages are dashed. Every
  arrowhead is a filled triangle (the PlantUML source uses only synchronous and
  reply arrows, both drawn filled).
- Each self-call is a small loop bowing to the right of its lifeline with the
  label pinned to its left so it stays inside the canvas.
- **Activation bars** mark when each participant is busy: opaque boxes on the
  lifelines spanning the rows derived from the PlantUML `++`/`--` markers (e.g.
  User is active for the whole exchange; VClient from the verification request to
  the final redirect; VAgent/VService over their request/response brackets).
- Section dividers are full-width rules with a centered label chip; they read as
  bands across all six lifelines.
- The `alt` fragment is a rectangle spanning User…RService (hugging those outer
  lifelines, not extending a half-column past RService), with an `alt` tab in the
  top-left corner, the first guard `[Positive verdict]` beside the tab, and a
  dashed mid-line carrying the `[Negative verdict]` guard between the two
  branches.

Documented divergences from the PlantUML: the actor stick figure becomes a plain
`User` header box. Message content, ordering, line/head styles, and activation
spans are preserved.
