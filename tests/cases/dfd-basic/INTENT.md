# dfd-basic

A level-0 **data flow diagram** of a login. There is **no Mermaid equivalent** (Mermaid has no DFD type), so this case has no `ref.mmd` and this file is the only oracle.

Three elements in a left-to-right row, vertically centered:

1. **User** — an external entity, drawn as a **sharp-cornered rectangle**.
2. **1.0 Validate Login** — a process, drawn as a **circle**, with the number `1.0` above the name.
3. **D1 Credentials** — a data store, drawn as an **open-ended rectangle** (a top rule and a bottom rule only, no left/right sides), with the tag `D1` left of the label.

Four **data flows**, each a thin arrow with an **open arrowhead** and a label naming the data. They form two request/response pairs that bow apart so labels do not collide:

- User → process, labelled **credentials**.
- process → User, labelled **token**.
- process → store, labelled **lookup**.
- store → process, labelled **result**.

Every element is present and legible, the process reads as a circle and the store as two parallel lines, no arrowhead lands inside a box, and no flow crosses through a box.
