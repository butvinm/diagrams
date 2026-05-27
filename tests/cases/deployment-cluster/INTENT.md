# deployment-cluster

A deployment diagram showing a load balancer fanning out to two web servers — an
original case (deployment has no Mermaid equivalent, so there is no `ref.mmd`).
This case exercises one node with **multiple communication paths** leaving it.

Three nodes:

- **LoadBalancer** (`«device»`, top, centered) — contains artifact
  `«artifact» nginx.conf`.
- **WebServer 1** (`«device»`, bottom left) — contains artifact `«artifact» store.war`.
- **WebServer 2** (`«device»`, bottom right) — contains artifact `«artifact» store.war`.

Two **communication paths** fan out from the LoadBalancer's bottom edge to the
top of each web server, each a plain solid line with **no arrowhead**, labelled
`«HTTP»`.

Each artifact box sits inside its node's body. No overlap, no clipping, no line
crossing through a box.
