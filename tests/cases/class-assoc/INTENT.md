# class-assoc

Our rendering of a Mermaid class association demo. The `ref.mmd` is copied
verbatim from the Mermaid repo (`demos/classchart.html`, the three-class
`namespace Company.Project.Module` example with Admin/User/Report) at tag
`mermaid@11.15.0`. Layout is ours; only the semantics must match.

The three classes sit inside **nested namespace frames** — three labelled
rectangles, outermost **Company**, then **Project**, then **Module** (matching
the Mermaid `namespace Company.Project.Module`), each label centered at the top
of its frame. Inside the innermost (Module) frame:

- **Admin** (top, centered): `+addUser(user: User)`, `+removeUser(user: User)`,
  `+generateReport()`.
- **User** (bottom left): `+login(username: String, password: String)`,
  `+logout()`.
- **Report** (bottom right): `+generatePDF(reportData: List)`,
  `+generateCSV(reportData: List)`.

Two **association** edges leave Admin's bottom edge (at two distinct points) and
end in **open** (V-shaped) arrowheads:

- Admin → User, labelled `manages`.
- Admin → Report, labelled `generates`.

Documented divergence: Mermaid draws empty attribute compartments for these
classes, which we omit. No overlap, no clipping, no line crossing a box.
