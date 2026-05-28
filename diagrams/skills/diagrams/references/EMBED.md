# Embedding diagrams in web pages

## What it is

The renderer's normal output is a **PNG** — drop it in any page with `<img>` and you are done (font-stable, zero JS). This file covers the other path: shipping a diagram as **live HTML** so its text stays selectable, it stays crisp at any zoom, and it can **respond to its container's width**.

Two pieces, independent:

- **`render.mjs --html`** emits one **self-contained** HTML file (authored markup + inlined kit CSS/JS, plus KaTeX inlined only when the diagram uses math). No server, no build step — open it directly or embed it with an `<iframe>`.
- **`fluid`** (a `<diagram>` modifier) makes the diagram fill its container instead of shrink-wrapping, so a CSS-responsive layout can flex its gutters and reflow at breakpoints. The kit redraws the connectors on every resize.

## Supported

- **Self-contained emit** — `node render.mjs in.html out.html --html`. Pure inlining (no browser launched). Non-math diagrams are small (~36 KB); math diagrams inline KaTeX + its woff2 fonts as `data:` URIs so they stay fully offline (~670 KB).
- **iframe embedding with auto-height** — the kit posts its measured size (`postMessage({dg:"size",w,h})`) to the host page after it draws (and again on every resize), so a few lines on the host can size the iframe to fit. The `<iframe>` is also the isolation boundary: the kit's global CSS (`*`, `body`, generic class names) can't leak into your page, and yours can't leak in.
- **Responsive layout** — with `fluid`, an author's grid/flex adapts and the kit re-measures anchors and redraws connectors, coalesced to one redraw per animation frame (smooth during a drag). Two clean patterns:
  - **flex gutters** — `justify-content: space-between` spreads fixed-size boxes; widening the page widens the gaps. Clean at every width.
  - **breakpoint reflow** — an `@media` query swaps the grid (e.g. 4 columns → 2). Design each breakpoint around **one** anchor strategy (anchors are HTML attributes — they can't change per breakpoint).
- **Selectable text + crisp zoom** — it's real DOM + SVG, not a raster.

### Not built-in / done by hand

- **No inline (non-iframe) embedding.** An embed is an iframe — a rectangular box, not text that flows inline with your prose. There is no web-component / shadow-DOM mode.
- **No connector routing — so responsiveness is _size-adaptive_, not _topology-adaptive_.** Connectors follow their boxes but never re-route. When a reflow only changes spacing or scale, the result is clean. When a reflow changes **which boxes are adjacent** (e.g. a left-to-right flow wrapping to a new row), the fixed anchors produce diagonal back-crossings. Keep responsive diagrams to layouts where the connection direction is stable across widths (hierarchies/fans, single-axis flows), or constrain the embed to a no-reflow width range.
- **Math embeds are heavy** (KaTeX is inlined). Fine for one diagram; think twice before putting many math embeds on one page.

## `--html` — emit a self-contained file

```bash
node "${CLAUDE_PLUGIN_ROOT}/render/render.mjs" diagram.html diagram.embed.html --html
```

Produces a standalone file you can open directly or reference from an iframe.

## iframe embed with auto-height

```html
<iframe
  id="dg"
  src="diagram.embed.html"
  style="width:100%;border:0"
  title="…"
></iframe>
<script>
  addEventListener("message", (e) => {
    if (e.data?.dg !== "size") return;
    const f = document.getElementById("dg");
    f.style.height = e.data.h + "px"; // self-fit; iframes have no intrinsic size
    // f.style.width = e.data.w + "px";       // also pin width for a fixed (non-fluid) diagram
  });
</script>
```

## A responsive (fluid) diagram

Mark the diagram `fluid` and let your CSS adapt. This is the `tests/cases/class-responsive` case — a generalization hierarchy whose gutters flex (`space-between`) and that reflows 4 columns → 2 at a breakpoint, with every arrow converging on the base class's bottom-center so one anchor set stays clean in both layouts:

<!-- prettier-ignore -->
```html
<style>
  diagram.classes .uml {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, max-content);
    justify-content: space-between;   /* gutters flex with width */
    column-gap: 24px;                 /* a floor so boxes never touch */
    row-gap: 120px;
  }
  #shape { grid-column: 1 / -1; justify-self: center; }   /* base, centered on top */
  @media (max-width: 780px) {
    diagram.classes .uml { grid-template-columns: repeat(2, max-content); }
    /* re-place the children for two columns here */
  }
</style>

<diagram class="classes fluid">
  <div class="uml">
    <div class="class" id="shape">…abstract base…</div>
    <div class="class" id="circle">…</div>
    <!-- more subclasses -->
  </div>
  <arrow from="circle" to="shape" anchor="top bottom" head="hollow"></arrow>
  <!-- every arrow → shape's bottom-center: one anchor strategy, clean at both widths -->
</diagram>
```

A `fluid` diagram still renders to PNG (it fills the render width — by default 1280px wide), so it can carry a golden like any other case; the responsiveness is a live-browser behavior the PNG cannot show.

> The public gallery (`tests/build-gallery.mjs` → GitHub Pages) is built from exactly these pieces: `--html` embeds for the live, resizable showcase and the committed goldens for the canonical images.
