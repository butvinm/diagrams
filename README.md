# diagrams

> UML diagrams you lay out yourself with CSS — manual, but adaptive: no auto-routing, no hardcoded coordinates. Claude writes the markup.

`diagrams` sits between two frustrations. Mermaid and PlantUML **auto-layout and auto-route** — and when they drop a box on the wrong side, there is no clean way to overrule them. Drawing tools give you control but make you nail down **pixel coordinates** that break the moment a label changes. This is neither: you declare _structure_ with plain **HTML and CSS** (grid, flex, relative positioning), connect boxes with `<arrow>`, and render to a crisp **PNG**.

So the layout is **manual but adaptive**. You decide the arrangement, not a guessing engine — but you write _no coordinates_. Boxes size to their content, the grid reflows predictably, and because connectors are measured _after_ layout, arrows follow the boxes wherever CSS puts them. Change the structure, re-render, everything re-attaches.

The usual cost of writing layout by hand is verbosity. The answer: **you don't write it — Claude does.** This ships as a Claude Code plugin; you describe the diagram, Claude emits the HTML, you nudge a value, re-render.

## Quickstart

Install the plugin in Claude Code:

```
/plugin marketplace add butvinm/diagrams
/plugin install diagrams@diagrams
```

Then describe the diagram — _"draw a login sequence: Alice → auth service → DB, returning a token"_ — and Claude authors the HTML, renders it to PNG, inspects the result, and iterates until it matches. The first render auto-installs a headless browser (or reuses system Chrome/Edge).

## Examples

**Sequence** · [source](tests/cases/sequence-basic/ours.html)

<img src="tests/cases/sequence-basic/golden.png" height="360" alt="sequence diagram" />

**State / FSM** · [source](tests/cases/state-basic/ours.html)

<img src="tests/cases/state-basic/golden.png" height="360" alt="state machine" />

**Class** · [source](tests/cases/class-basic/ours.html)

<img src="tests/cases/class-basic/golden.png" height="360" alt="class diagram" />

**Deployment** · [source](tests/cases/deployment-basic/ours.html)

<img src="tests/cases/deployment-basic/golden.png" height="360" alt="deployment diagram" />

**Data Flow** · [source](tests/cases/dfd-basic/ours.html)

<img src="tests/cases/dfd-basic/golden.png" height="360" alt="data flow diagram" />

**Flowchart** · [source](tests/cases/flowchart-basic/ours.html)

<img src="tests/cases/flowchart-basic/golden.png" height="360" alt="flowchart" />

**Math (LaTeX via KaTeX)** · [source](tests/cases/sequence-math/ours.html)

<img src="tests/cases/sequence-math/golden.png" height="360" alt="sequence diagram with LaTeX math labels" />

**Responsive / embeddable** · [source](tests/cases/class-responsive/ours.html)

<img src="tests/cases/class-responsive/golden.png" height="360" alt="responsive class diagram that reflows from four columns to two" />

## Embed in a page

A diagram doesn't have to stay a PNG. Emit a **self-contained HTML** file and embed it live — text stays selectable, it's crisp at any zoom, and a `fluid` diagram reflows with its container:

```bash
node diagrams/render/render.mjs diagram.html diagram.embed.html --html
```

```html
<iframe src="diagram.embed.html" style="width:100%;border:0"></iframe>
```

The file is fully self-contained (kit + KaTeX inlined when needed), so it works offline. See the [embedding guide](diagrams/skills/diagrams/references/EMBED.md) and the **[live gallery](https://butvinm.github.io/diagrams/)** (the hero is a resizable embed you can drag to watch it reflow).

## Documentation

- [Authoring guide](docs/GUIDE.md) — how it works, and writing a diagram by example.
- [Component reference](diagrams/skills/diagrams/references/COMPONENTS.md) — every component, attribute, and style.
- [Embedding](diagrams/skills/diagrams/references/EMBED.md) — `fluid` responsive diagrams and self-contained HTML output.
- [Development](docs/DEVELOPMENT.md) — the test harness, goldens, the comparison gallery, and the published GitHub Pages gallery.

## Credits

[KaTeX](https://katex.org/) (MIT) is vendored to typeset LaTeX math in labels. Mermaid (MIT) is used only to render reference images for side-by-side comparison. Both are noted in [`THIRD_PARTY.md`](THIRD_PARTY.md).

## License

MIT — see [LICENSE](LICENSE).
