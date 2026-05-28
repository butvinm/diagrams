# sequence-protocol

Our rendering of a verification-protocol sequence diagram. The reference is the
author's own PlantUML (`ref.puml`), copied verbatim from
`/home/butvinm/Dev/ITMO/thesis/thesis/diagrams/protocol-simple.puml` — not a
Mermaid demo, so there is no `ref.mmd` and no Mermaid comparison render. This case
exercises sequence features beyond the basic cases: many participants, section
dividers, self-calls, and an `alt`/`else` frame.

Six participants, left to right, each a header box over a dashed lifeline and
labelled again in a footer row at the bottom:
**User**, **RClient**, **VClient**, **RService**, **VAgent**, **VService**.

The flow is split into five labelled **section dividers** (a centered chip on a
full-width rule), top to bottom:

1. **Начало сессии верификации** — User → RClient → RService → VAgent → VService
   (`SessionOpen`), then dashed returns back to User (`VerificationSession`,
   `Перенаправление с sid`); then User → VClient (`Запрос верификации (sid)`),
   `RequestManifest` forwarded to VService and `Manifest` returned.
2. **Совместная генерация ключей** — VClient/VAgent exchange `VClientPKShare` /
   `VAgentPKShare`, `VClientRLKRound1` / `VAgentRLKRound1`, `VClientRLKRound2` /
   `Подтверждение`, `VClientGaloisShares`. VAgent has a **self-call**
   `Иерархический вывод ключей`, then `InferEvalKeys` to VService, which has its
   own **self-call** `Иерархический вывод ключей`, then dashed `Подтверждение`
   returns.
3. **Передача изображения и инференс** — User → VClient `Изображение`,
   `EncryptedImage` forwarded to VService, VService **self-call** `Инференс`,
   dashed `InferenceResult` returned.
4. **Расшифрование результата с имитозащитой** — VAgent **self-call**
   `Аутентификация результата`, dashed `AuthenticatedResult` to VClient, then
   `PartialDecryption` to VAgent.
5. **Завершение сессии верификации** — `VerdictNotification` to RService and
   dashed `Подтверждение` back; redirect chain `Перенаправление на ресурс` back
   to User; `Возврат на страницу ресурса` to RClient, `Запрос ресурса` to
   RService; then an **`alt` frame** (spanning User…RService) with two branches:
   `[Положительный вердикт]` → `Ресурс` / `Отображение ресурса`, and
   `[Отрицательный вердикт]` (a dashed separator) → `Отказ в доступе` /
   `Сообщение об отказе`.

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
  top-left corner, the first guard `[Положительный вердикт]` beside the tab, and a
  dashed mid-line carrying the `[Отрицательный вердикт]` guard between the two
  branches.

Documented divergences from the PlantUML: the actor stick figure becomes a plain
`User` header box. Message content, ordering, line/head styles, and activation
spans are preserved.
