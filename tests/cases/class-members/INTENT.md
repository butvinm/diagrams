# class-members

Our rendering of Mermaid's class member-visibility demo. The `ref.mmd` is from
the Mermaid repo (`demos/classchart.html`, the "Property Access Modifiers" /
`Person` example) at tag `mermaid@11.15.0`, copied verbatim **except** the demo's
trailing `class People List~List~Person~~` line, which is malformed and does not
parse in Mermaid 11.15 — it is omitted. Layout is ours; semantics must match.

A single class box **Person** with one attribute compartment listing seven
properties, one per row, exercising all four UML visibility markers:

- `+ID : Guid`
- `+FirstName : string`
- `+LastName : string`
- `-privateProperty : string`
- `#ProtectedProperty : string`
- `~InternalProperty : string`
- `~AnotherInternalProperty : List<List<string>>` (Mermaid renders the `~…~`
  generics as `<…>`)

Documented divergence: Mermaid draws an empty methods compartment below; we omit
it. No arrows. Text legible, nothing clipped.
