# dfd-trust-zones

A **threat-model DFD** that groups elements into **trust zones** (regions). There is **no Mermaid equivalent**, so this case has no `ref.mmd` and this file is the only oracle.

Left to right, vertically centered:

1. **User** — an external entity (sharp-cornered rectangle), outside every zone.
2. A trust zone labelled **DMZ** — a dashed rounded rectangle with the label in its top-left notch, containing one process: **1.0 Web Frontend** (a circle).
3. A trust zone labelled **INTERNAL NETWORK** — a second dashed region containing two stacked elements: a process **2.0 App Logic** (circle) above a data store **D1 Orders** (open two-line rectangle).

Both zone labels read as uppercase tags sitting on the dashed border.

**Data flows** (thin arrows, open arrowheads, labelled):

- User → Web Frontend, labelled **request** — crosses into the DMZ zone.
- Web Frontend → App Logic, labelled **order** — crosses from the DMZ zone into the Internal Network zone.
- App Logic → Orders, labelled **write**, and Orders → App Logic, labelled **read** — a request/response pair running vertically **inside** the Internal Network zone, bowed apart so the labels do not collide.

Each zone visibly encloses its elements, the cross-zone flows pass through the dashed borders, no element overlaps another, and no arrowhead lands inside a box.
