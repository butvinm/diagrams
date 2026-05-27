# deployment-nested

A deployment diagram exercising the two features **not** covered by
`deployment-basic`: a **node nested inside a node**, and an explicit
**`«deploy»` dependency** for an artifact drawn outside its node. Deployment has
no Mermaid equivalent, so there is no `ref.mmd`; this file is the only oracle.

Two things side by side, left and right:

- **Left:** a standalone **artifact** box (not inside any node), with a
  `«artifact»` stereotype above the name **config.yml**.
- **Right:** a **node** `«device»` **AppServer**. Inside its body is a **second,
  nested node** `«executionEnvironment»` **JVM**, and inside _that_ JVM node's
  body is an **artifact** `«artifact»` **app.jar**. So the nesting is three deep:
  AppServer ▸ JVM ▸ app.jar.

One connector: a **`«deploy»` dependency** from config.yml to AppServer — a
**dashed** line with an **open** (V-shaped) arrowhead pointing at AppServer.

No overlap, no clipping, and the nested node and artifact are clearly contained
within their parents.
