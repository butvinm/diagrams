# dfd-trust-boundary

A **threat-model DFD** that marks a single **trust boundary** as a free dashed line that data flows cross. There is **no Mermaid equivalent**, so this case has no `ref.mmd` and this file is the only oracle.

Left to right, vertically centered:

1. **User** — an external entity (sharp-cornered rectangle), on the untrusted (Internet) side.
2. A vertical **dashed boundary line**, taller than the boxes, labelled **Internet | Trusted** near its top. It is the trust boundary.
3. **1.0 API** — a process (circle), on the trusted side.
4. **D1 Sessions** — a data store (open two-line rectangle), on the trusted side.

**Data flows** (thin arrows, open arrowheads, labelled), each request/response pair bowed apart so labels do not collide:

- User → API, labelled **login** — crosses the boundary line left to right.
- API → User, labelled **session id** — crosses the boundary line right to left.
- API → Sessions, labelled **store**, and Sessions → API, labelled **fetch** — entirely on the trusted side.

The two User↔API flows visibly **cross** the dashed boundary line (the line is drawn over them), the boundary separates User from API + Sessions, no element overlaps another, and no arrowhead lands inside a box.
