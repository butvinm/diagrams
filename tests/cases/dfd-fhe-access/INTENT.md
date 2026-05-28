# dfd-fhe-access

A real-world **threat-model data flow diagram** of an FHE-based access-control system, translated from a Graphviz source (`designed-system-dfd.dot`) and rendered with English labels. There is **no Mermaid equivalent**, so this case has no `ref.mmd` and this file is the only oracle.

The diagram is three **trust zones** drawn as dashed labelled regions in a row, each with its label in the top-left notch. Ranks align horizontally across the zones (the entities row, the P2/P7 row, the P1/P4/P8 row, and so on).

## Zone 1 — User device (left)

- **E1 / Access subject** — external entity (sharp rectangle), top of the zone.
- **P2 / Image encryption** — process (ellipse).
- **P1 / Key generation** — process (ellipse).
- **S6 / Public key, client secret-key share** — data store (open two-line rectangle with the `S6` tag).
- **P3 / Partial decryption** — process (ellipse).

## Zone 2 — Access-object infrastructure (middle)

- **E3 / Access-object operator** — external entity, top of the zone.
- **P4 / Key generation** — process.
- **S3 / Agent secret-key share, authentication keys** — data store.
- **P5 / Decryption & authenticity check** — process.
- **P6 / Access control** — process.
- **S4 / Session, verdict** and **S5 / Logs and metadata** — two data stores side by side at the bottom.

## Zone 3 — Verifier infrastructure (right)

- **E2 / Verifying-party operator** — external entity, top of the zone.
- **P7 / Attribute evaluation (FHE inference)** — process.
- **P8 / Key derivation** — process.
- **S1 / Evaluation keys** and **S2 / Logs and metadata** — two data stores side by side.

## Data flows

All flows are thin arrows with **open** arrowheads, labelled. Bidirectional flows carry an arrowhead at **both** ends. Numbered flows show the `DF…` tag above the data.

Numbered inter-process flows:

- **DF1 / image**: E1 → P2.
- **DF2 / access request / response**: E1 ↔ P6 (bidirectional; a long diagonal from the top-left entity down to P6 in the middle zone).
- **DF3 / key shares**: P1 ↔ P4 (bidirectional).
- **DF4 / master keys**: P4 → P8.
- **DF5 / image ciphertext**: P2 → P7 (a long horizontal flow spanning all three zones, threading through the empty top band of the middle zone).
- **DF6 / result ciphertext**: P7 → P5 (diagonal, right zone to middle zone).
- **DF7 / auth. result, partial decryption**: P5 ↔ P3 (bidirectional).
- **DF8 / verdict**: P5 → P6.

Store read/write flows:

- **public key**: S6 → P2 (bows along the left, clearing P1).
- **public key, secret-key share**: P1 → S6.
- **secret-key share**: S6 → P3.
- **secret-key share, authentication keys**: P4 → S3, and again S3 → P5.
- **session, verdict**: P6 ↔ S4 (bidirectional).
- **log**: P6 → S5.
- **evaluation keys**: P8 → S1 (write), and S1 → P7 (read).
- **log**: P7 → S2.

Every node and flow above is present and legible, processes read as ellipses, stores as two parallel rules with a tag, arrowheads land on box/ellipse edges (never inside), and the three dashed trust zones each enclose their listed elements. Some flows necessarily cross zone borders and a few cross each other — that is expected for this dense diagram — but no flow passes through the body of a process or store box.
