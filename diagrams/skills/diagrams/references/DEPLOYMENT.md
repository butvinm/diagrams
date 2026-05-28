# Deployment diagrams (`.node` / `.artifact`)

Read [`COMPONENTS.md`](COMPONENTS.md) first for boxes, `<arrow>`, and anchors.

## What it is

A **deployment diagram** shows a system's **physical/runtime topology**: **nodes** (devices or execution environments — UML draws them as 3-D boxes, here flat titled boxes) host **artifacts** (deployable pieces such as a `.war`, a binary, a schema). Nodes connect via **communication paths** (plain undirected lines labelled with the protocol); an artifact's placement is shown either by **nesting** it inside a node or with an explicit `«deploy»` dependency. See the [UML reference](https://www.uml-diagrams.org/deployment-diagrams-overview.html). Layout is yours; the kit draws the paths.

## Supported

- **Nodes** (`.node`) with a titled name bar and an optional `«stereotype»` (`«device»`, `«executionEnvironment»`, …).
- **Artifacts** (`.artifact`) nested in a node's `.node-body`.
- **Nested nodes** — a node inside another node's body (see `deployment-nested`).
- **Communication paths** (`head="none"`) labelled with a protocol, including several fanning out of one node (see `deployment-cluster`).
- **Explicit `«deploy»` dependency** (`head="open" line="dashed"`) for an artifact drawn outside its node.

**Not built-in:** there are no dedicated component/port shapes or node multiplicity markers — use boxes and labels.

A deployment diagram has **no layout preset** — place the nodes yourself with your own CSS (a flex row or grid is usually enough), then connect them with `<arrow>`. A node is a ready-made container box that holds nested artifacts.

> Unlike the other types, deployment diagrams have **no Mermaid equivalent** (Mermaid has no UML deployment diagram), so cases carry no `ref.mmd` and the comparison gallery shows `(none)` for the Mermaid column.

## Components

```html
<div class="node" id="web">
  <div class="node-name">
    <div class="stereotype">«executionEnvironment»</div>
    Tomcat
  </div>
  <div class="node-body">
    <div class="artifact" id="war">
      <div class="stereotype">«artifact»</div>
      store.war
    </div>
  </div>
</div>
```

- `.node` — a container (a device or execution environment), drawn as a flat titled box. Give it an `id` so connectors can reference it.
- `.node-name` — the title bar (bold, centered, divider below); holds an optional `.stereotype` line such as `«device»` or `«executionEnvironment»`.
- `.node-body` — the body that holds nested boxes (artifacts, or even sub-nodes), stacked with a gap.
- `.artifact` — a deployed artifact: a lighter (white) box that reads as sitting inside a node. Nest it in a `.node-body`, or place it anywhere and point a `«deploy»` arrow at its node. May carry its own `.stereotype` line.

## Connectors

Deployment relationships are plain `<arrow>`s (full table in [`COMPONENTS.md`](COMPONENTS.md)):

| Relationship       | `<arrow>` attributes        | Looks like                                                                   |
| ------------------ | --------------------------- | ---------------------------------------------------------------------------- |
| Communication path | `head="none"`               | a plain solid line (no arrowhead); label it with the protocol, e.g. `«HTTP»` |
| Deploy dependency  | `head="open" line="dashed"` | a dashed arrow `«deploy»` from an artifact to its node                       |

Deployment onto a node is usually shown by **nesting** the artifact inside the node's body; the explicit `«deploy»` dependency is for when the artifact is drawn outside its node.

## Worked example

This is `tests/cases/deployment-basic/ours.html` — a render-verified golden, so the markup is known to produce a correct diagram.

<!-- prettier-ignore -->
```html
<style>
  /* No layout preset — lay the nodes out in a row ourselves. */
  diagram.deployment {
    display: flex;
    align-items: center;
    gap: 72px;
    padding: 36px 48px;
  }
</style>

<diagram class="deployment">
  <div class="node" id="client">
    <div class="node-name">
      <div class="stereotype">«device»</div>
      Client
    </div>
    <div class="node-body">
      <div class="artifact" id="browser">
        <div class="stereotype">«artifact»</div>
        browser.app
      </div>
    </div>
  </div>

  <div class="node" id="web">
    <div class="node-name">
      <div class="stereotype">«executionEnvironment»</div>
      Tomcat
    </div>
    <div class="node-body">
      <div class="artifact" id="war">
        <div class="stereotype">«artifact»</div>
        store.war
      </div>
    </div>
  </div>

  <div class="node" id="db">
    <div class="node-name">
      <div class="stereotype">«device»</div>
      DBServer
    </div>
    <div class="node-body">
      <div class="artifact" id="schema">
        <div class="stereotype">«artifact»</div>
        schema.sql
      </div>
    </div>
  </div>

  <!-- Communication paths: undirected solid lines labelled with a protocol. -->
  <arrow from="client" to="web" anchor="right left" head="none">«HTTP»</arrow>
  <arrow from="web" to="db" anchor="right left" head="none">«JDBC»</arrow>
</diagram>
```

Because the nodes are laid out with `align-items: center`, the communication paths run horizontally between adjacent nodes (`anchor="right left"`) without crossing anything.
