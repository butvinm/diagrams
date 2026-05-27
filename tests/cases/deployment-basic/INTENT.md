# deployment-basic

A UML deployment diagram of a simple 3-tier web application. There is **no
Mermaid equivalent** (Mermaid has no deployment diagram type), so this case has
no `ref.mmd` and this file is the only oracle.

Three **nodes** in a horizontal row, left to right. Each node is a bordered box
with a title bar (a stereotype line above a bold name) over a body that contains
one nested **artifact** box:

1. «device» **Client** — contains artifact «artifact» **browser.app**.
2. «executionEnvironment» **Tomcat** — contains artifact «artifact» **store.war**.
3. «device» **DBServer** — contains artifact «artifact» **schema.sql**.

Two **communication paths** connect adjacent nodes as plain solid lines with
**no arrowheads**, each labelled with a protocol:

- Client — Tomcat, labelled «HTTP».
- Tomcat — DBServer, labelled «JDBC».

Each artifact box sits visibly **inside** its node's body. No overlap, no
clipping, and no line crosses through a box.
