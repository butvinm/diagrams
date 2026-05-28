/* diagrams kit — in-browser runtime.
 *
 * Runs after the browser has laid out the HTML/CSS. It:
 *   1. applies friendly layout attributes (col/row) for known diagram types,
 *   2. measures element geometry,
 *   3. draws lifelines and <arrow> connectors into one SVG overlay per diagram,
 *   4. positions each arrow's label content at the connector midpoint.
 *
 * It never moves boxes and never routes around anything: a connector is a pure
 * function of its two anchor points and its chosen path style.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const ANCHORS = {
  top: (b) => [b.x + b.w / 2, b.y],
  bottom: (b) => [b.x + b.w / 2, b.y + b.h],
  left: (b) => [b.x, b.y + b.h / 2],
  right: (b) => [b.x + b.w, b.y + b.h / 2],
  center: (b) => [b.x + b.w / 2, b.y + b.h / 2],
  "top-left": (b) => [b.x, b.y],
  "top-right": (b) => [b.x + b.w, b.y],
  "bottom-left": (b) => [b.x, b.y + b.h],
  "bottom-right": (b) => [b.x + b.w, b.y + b.h],
};

// "right left" -> ["right","left"]; single token -> same for both ends;
// omitted -> ["center","center"].
function parseAnchor(attr) {
  if (!attr) return ["center", "center"];
  const parts = attr.trim().split(/\s+/);
  return parts.length === 1 ? [parts[0], parts[0]] : [parts[0], parts[1]];
}

// Geometry of `el` in coordinates relative to the diagram's top-left.
function boxIn(el, origin) {
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
}

// Anchor name is either a named point ("top", "bottom-left", ...) or a
// fractional edge position "<side>:<frac>" (e.g. "bottom:0.3" = 30% across the
// bottom edge), which lets several connectors attach to one box without piling
// onto the same point.
function anchorPoint(box, name) {
  if (name && name.includes(":")) {
    const [side, raw] = name.split(":");
    const f = Math.min(1, Math.max(0, parseFloat(raw)));
    if (side === "top") return [box.x + f * box.w, box.y];
    if (side === "bottom") return [box.x + f * box.w, box.y + box.h];
    if (side === "left") return [box.x, box.y + f * box.h];
    if (side === "right") return [box.x + box.w, box.y + f * box.h];
  }
  return (ANCHORS[name] || ANCHORS.center)(box);
}

// Returns the SVG path `d` plus the data needed to sample a point along it
// (`pathPoint` below). A `spline` is a quadratic Bézier bowed perpendicular to
// the chord by `k * length`; because the bow flips when the endpoints swap, two
// opposite connectors between the same pair separate into a symmetric lens, and
// (with `label-pos` left at center) their labels land on opposite sides instead
// of colliding at the chord midpoint. For a straight line the control `c` is
// null; for a spline it is the Bézier control point.
function connectorGeometry(p1, p2, shape, k = 0.18) {
  if (shape !== "spline") {
    return { d: `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`, p1, p2, c: null };
  }
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1;
  const off = k * len;
  const cx = (p1[0] + p2[0]) / 2 + (-dy / len) * off;
  const cy = (p1[1] + p2[1]) / 2 + (dx / len) * off;
  return { d: `M ${p1[0]} ${p1[1]} Q ${cx} ${cy} ${p2[0]} ${p2[1]}`, p1, p2, c: [cx, cy] };
}

// Point on the connector at parameter t in [0,1] (0 = from end, 1 = to end).
// Straight: linear interpolation. Spline: the quadratic Bézier at t — at t=0.5
// this is `0.25*p1 + 0.5*c + 0.25*p2`, the curve midpoint pulled toward the bow.
function pathPoint({ p1, p2, c }, t) {
  if (!c) return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
  const mt = 1 - t;
  return [
    mt * mt * p1[0] + 2 * mt * t * c[0] + t * t * p2[0],
    mt * mt * p1[1] + 2 * mt * t * c[1] + t * t * p2[1],
  ];
}

// label-pos: where along the connector the label's anchor point sits. Keyword
// or an explicit fraction (e.g. "0.7"). label-anchor: which point of the label
// box is pinned there — "center" (default) puts the label on the line; the
// others place it above/below/beside the point with no offset.
const LABEL_POS = { tail: 0.18, center: 0.5, head: 0.82 };
// transform pins a side of the label box to the point; dx/dy nudge the off-center
// anchors a few px clear of the stroke so the label doesn't touch it (center sits
// exactly on the line).
const LABEL_GAP = 6;
const LABEL_ANCHOR = {
  center: { transform: "translate(-50%, -50%)", dx: 0, dy: 0 },
  top: { transform: "translate(-50%, -100%)", dx: 0, dy: -LABEL_GAP },
  bottom: { transform: "translate(-50%, 0)", dx: 0, dy: LABEL_GAP },
  left: { transform: "translate(-100%, -50%)", dx: -LABEL_GAP, dy: 0 },
  right: { transform: "translate(0, -50%)", dx: LABEL_GAP, dy: 0 },
};
function labelT(attr) {
  if (!attr) return 0.5;
  const n = parseFloat(attr);
  if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  return LABEL_POS[attr] ?? 0.5;
}

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Markers (arrowheads/tails) shared across one overlay's connectors.
function defineMarkers(defs) {
  const mk = (id, body, attrs) => {
    const m = el("marker", {
      id,
      markerWidth: 14,
      markerHeight: 14,
      orient: "auto-start-reverse",
      markerUnits: "userSpaceOnUse",
      ...attrs,
    });
    m.appendChild(body);
    defs.appendChild(m);
  };
  mk("dg-triangle", el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--dg-line)" }), { refX: 9, refY: 5 });
  mk("dg-hollow", el("path", { d: "M0,0 L12,6 L0,12 z", fill: "#fff", stroke: "var(--dg-line)", "stroke-width": 1.4 }), { refX: 11, refY: 6 });
  mk("dg-open", el("path", { d: "M0,0 L10,5 L0,10", fill: "none", stroke: "var(--dg-line)", "stroke-width": 1.6 }), { refX: 9, refY: 5 });
  mk("dg-diamond", el("path", { d: "M0,5 L6,0 L12,5 L6,10 z", fill: "#fff", stroke: "var(--dg-line)", "stroke-width": 1.4 }), { refX: 11, refY: 5 });
  mk("dg-filled", el("path", { d: "M0,5 L6,0 L12,5 L6,10 z", fill: "var(--dg-line)" }), { refX: 11, refY: 5 });
}

const HEADS = { triangle: "dg-triangle", hollow: "dg-hollow", open: "dg-open", diamond: "dg-diamond", filled: "dg-filled", none: null };

function applySequenceLayout(diagram) {
  const parts = (diagram.getAttribute("participants") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const col = Object.fromEntries(parts.map((p, i) => [p, i + 1]));
  const ci = (name) => col[name] ?? 1;
  diagram.style.gridTemplateColumns = `repeat(${parts.length}, minmax(120px, 1fr))`;

  // Grid coordinates: column = participant index (1-based), row = time step.
  // Grid row 1 is the lifeline header, so message row R lives in grid row R+1.
  diagram.querySelectorAll("lifeline").forEach((l) => {
    l.style.gridColumn = ci(l.getAttribute("col"));
    l.style.gridRow = 1;
  });
  diagram.querySelectorAll("point").forEach((p) => {
    const r = parseInt(p.getAttribute("row") || "1", 10);
    p.style.gridColumn = ci(p.getAttribute("col"));
    p.style.gridRow = r + 1;
  });

  // Activation bar: a box on one lifeline spanning message rows [from, to].
  diagram.querySelectorAll("activation").forEach((a) => {
    const from = parseInt(a.getAttribute("from") || "1", 10);
    const to = parseInt(a.getAttribute("to") || String(from), 10);
    a.style.gridColumn = ci(a.getAttribute("col"));
    a.style.gridRow = `${from + 1} / ${to + 2}`;
  });

  // Combined fragment: a labelled frame spanning columns [a, b] (the leftmost
  // and rightmost participants it covers) and message rows [s, e]. The operator
  // (alt/opt/loop/ref/par/…) is shown in a corner tab.
  diagram.querySelectorAll("fragment").forEach((f) => {
    const [a, b] = (f.getAttribute("col") || "").trim().split(/\s+/);
    const [s, e] = (f.getAttribute("row") || "").trim().split(/\s+/).map((n) => parseInt(n, 10));
    f.style.gridColumn = `${ci(a)} / ${ci(b) + 1}`;
    f.style.gridRow = `${s + 1} / ${e + 2}`;
    const op = f.getAttribute("op");
    if (op && !f.querySelector(":scope > .dg-op")) {
      const tab = document.createElement("span");
      tab.className = "dg-op";
      tab.textContent = op;
      f.insertBefore(tab, f.firstChild);
    }
  });

  // Guard: an operand label inside a fragment, spanning columns [a, b] at one
  // row. `sep` draws the dashed operand divider (every operand but the first).
  // Its content is wrapped so the label gets a white knockout over the lifelines.
  diagram.querySelectorAll("guard").forEach((g) => {
    const [a, b] = (g.getAttribute("col") || "").trim().split(/\s+/);
    const r = parseInt(g.getAttribute("row") || "1", 10);
    g.style.gridColumn = `${ci(a)} / ${ci(b) + 1}`;
    g.style.gridRow = r + 1;
    if (g.childNodes.length && !g.querySelector(":scope > .dg-guard-label")) {
      const label = document.createElement("span");
      label.className = "dg-guard-label";
      while (g.firstChild) label.appendChild(g.firstChild);
      g.appendChild(label);
    }
  });

  // Section divider: a full-width band with a centered label chip at one row.
  diagram.querySelectorAll("divider").forEach((d) => {
    const r = parseInt(d.getAttribute("row") || "1", 10);
    d.style.gridColumn = "1 / -1";
    d.style.gridRow = r + 1;
    if (d.childNodes.length && !d.querySelector(":scope > .dg-divider-label")) {
      const label = document.createElement("span");
      label.className = "dg-divider-label";
      while (d.firstChild) label.appendChild(d.firstChild);
      d.appendChild(label);
    }
  });

  // Footer participants: clone each header lifeline to a row below the last
  // message, so participants are labelled at both ends (as Mermaid/PlantUML do).
  if (!diagram.querySelector("lifeline.dg-foot")) {
    let maxRow = 1;
    const bump = (v) => { if (Number.isFinite(v)) maxRow = Math.max(maxRow, v); };
    diagram.querySelectorAll("point").forEach((p) => bump(parseInt(p.getAttribute("row"), 10)));
    diagram.querySelectorAll("activation").forEach((a) => bump(parseInt(a.getAttribute("to") || a.getAttribute("from"), 10)));
    diagram.querySelectorAll("fragment").forEach((f) => bump(parseInt((f.getAttribute("row") || "").trim().split(/\s+/)[1], 10)));
    diagram.querySelectorAll("divider").forEach((d) => bump(parseInt(d.getAttribute("row"), 10)));
    const footRow = maxRow + 2;
    diagram.querySelectorAll("lifeline:not(.dg-foot)").forEach((l) => {
      const foot = l.cloneNode(true);
      foot.classList.add("dg-foot");
      foot.style.gridColumn = ci(l.getAttribute("col"));
      foot.style.gridRow = footRow;
      diagram.appendChild(foot);
    });
  }
}

// Combined fragments and their guards span columns by whole grid cells, which
// leaves half a column of slack past the outer lifelines. After layout, pull
// each one in so it hugs the involved lifelines (centers ± a small margin).
function hugFragments(diagram) {
  const M = 10;
  const center = {};
  diagram.querySelectorAll("lifeline:not(.dg-foot)").forEach((l) => {
    const r = l.getBoundingClientRect();
    center[l.getAttribute("col")] = r.left + r.width / 2;
  });
  diagram.querySelectorAll("fragment, guard").forEach((el) => {
    const cols = (el.getAttribute("col") || "").trim().split(/\s+/);
    const xa = center[cols[0]];
    const xb = center[cols[cols.length - 1]];
    if (xa == null || xb == null) return;
    const r = el.getBoundingClientRect();
    el.style.marginLeft = `${xa - r.left - M}px`;
    el.style.marginRight = `${r.right - xb - M}px`;
  });
}

function drawOverlay(diagram) {
  // Idempotent: drop any overlay from a previous pass so a redraw (e.g. on
  // resize) replaces it rather than stacking a second SVG on top.
  const prev = diagram.querySelector(":scope > .dg-overlay");
  if (prev) prev.remove();
  const origin = diagram.getBoundingClientRect();
  const svg = el("svg", { class: "dg-overlay", width: origin.width, height: origin.height });
  const defs = el("defs");
  defineMarkers(defs);
  svg.appendChild(defs);

  // Lifelines: dashed verticals from below each header down to the footer
  // participant (or the diagram bottom if there is none). Footer clones don't
  // emit a lifeline of their own.
  const feet = {};
  diagram.querySelectorAll("lifeline.dg-foot").forEach((f) => { feet[f.getAttribute("col")] = boxIn(f, origin); });
  diagram.querySelectorAll("lifeline:not(.dg-foot)").forEach((l) => {
    const b = boxIn(l, origin);
    const x = b.x + b.w / 2;
    const foot = feet[l.getAttribute("col")];
    svg.appendChild(el("line", {
      x1: x, y1: b.y + b.h, x2: x, y2: foot ? foot.y : origin.height - 8,
      stroke: "var(--dg-line)", "stroke-width": 1.2, "stroke-dasharray": "4 4", opacity: 0.6,
    }));
  });

  // Activation bars, measured. An arrow endpoint that lands on an active
  // participant snaps to the bar's edge (the side the arrow approaches from), so
  // the arrowhead abuts the bar instead of overlapping its center — as
  // Mermaid/PlantUML draw it. With nested bars (one offset over another), snap to
  // the OUTERMOST edge among the bars covering the point, so the head abuts the
  // outer boundary and never pokes into a bar behind it.
  const acts = [];
  diagram.querySelectorAll("activation").forEach((a) => {
    const r = boxIn(a, origin);
    acts.push({
      col: a.getAttribute("col"),
      from: parseInt(a.getAttribute("from") || "1", 10),
      to: parseInt(a.getAttribute("to") || a.getAttribute("from") || "1", 10),
      left: r.x, right: r.x + r.w,
    });
  });
  const snapToBar = (pointEl, x, otherX) => {
    if (!acts.length || !pointEl) return x;
    const col = pointEl.getAttribute("col");
    const row = parseInt(pointEl.getAttribute("row") || "1", 10);
    const covering = acts.filter((b) => b.col === col && b.from <= row && row <= b.to);
    if (!covering.length) return x;
    return otherX < x
      ? Math.min(...covering.map((b) => b.left))
      : Math.max(...covering.map((b) => b.right));
  };

  // Connectors.
  diagram.querySelectorAll("arrow").forEach((a) => {
    const from = diagram.querySelector("#" + CSS.escape(a.getAttribute("from")));
    const to = diagram.querySelector("#" + CSS.escape(a.getAttribute("to")));
    if (!from || !to) {
      console.error(`[dg] arrow references missing anchor: from=${a.getAttribute("from")} to=${a.getAttribute("to")}`);
      return;
    }
    const [sa, ta] = parseAnchor(a.getAttribute("anchor"));
    const a1 = anchorPoint(boxIn(from, origin), sa);
    const a2 = anchorPoint(boxIn(to, origin), ta);
    const p1 = [snapToBar(from, a1[0], a2[0]), a1[1]];
    const p2 = [snapToBar(to, a2[0], a1[0]), a2[1]];
    const shape = a.getAttribute("path") || "straight";
    const k = parseFloat(a.getAttribute("curvature"));
    const geom = connectorGeometry(p1, p2, shape, Number.isFinite(k) ? k : 0.18);

    const path = el("path", {
      d: geom.d, fill: "none", stroke: "var(--dg-line)", "stroke-width": 1.6,
    });
    if ((a.getAttribute("line") || "solid") === "dashed") path.setAttribute("stroke-dasharray", "6 5");
    if (a.getAttribute("line") === "dotted") path.setAttribute("stroke-dasharray", "2 4");
    const head = HEADS[a.getAttribute("head") || "triangle"];
    const tail = HEADS[a.getAttribute("tail") || "none"];
    if (head) path.setAttribute("marker-end", `url(#${head})`);
    if (tail) path.setAttribute("marker-start", `url(#${tail})`);
    svg.appendChild(path);

    // Place the arrow's label: pick a point along the connector (label-pos),
    // then pin a side of the label box to it (label-anchor). Defaults: midpoint,
    // centered on the line.
    if (a.textContent.trim() || a.children.length) {
      const lp = pathPoint(geom, labelT(a.getAttribute("label-pos")));
      const anchor = LABEL_ANCHOR[a.getAttribute("label-anchor")] || LABEL_ANCHOR.center;
      a.style.left = `${lp[0] + anchor.dx}px`;
      a.style.top = `${lp[1] + anchor.dy}px`;
      a.style.transform = anchor.transform;
    }
  });

  diagram.insertBefore(svg, diagram.firstChild);
}

// Typeset TeX in every diagram before anything is measured, so math-sized boxes
// settle first. Uses KaTeX's auto-render if render.mjs injected it; a no-op
// otherwise, so the kit still runs without KaTeX. Delimiters: \(…\) inline and
// $$…$$ / \[…\] display — no single `$`, which would clash with plain text.
function renderMath() {
  const renderMathInElement = window.renderMathInElement;
  if (typeof renderMathInElement !== "function") return;
  document.querySelectorAll("diagram").forEach((d) =>
    renderMathInElement(d, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    }),
  );
}

// --- Embedding / responsive support ---------------------------------------
// These keep a *live* diagram correct in a browser (fluid embeds, window
// resize, iframe auto-height). They are inert for the one-shot PNG renderer:
// the redraw is idempotent, and postSize() no-ops on a top-level page.

// Redraw every overlay from current geometry — no re-layout, no re-typeset.
function redrawAll() {
  document.querySelectorAll("diagram").forEach(drawOverlay);
}

// Re-measure anchors and redraw connectors when a diagram's box resizes,
// coalesced to one redraw per animation frame so a drag tracks smoothly. A
// connector stays a pure function of its anchors — this only re-runs that
// function; it never routes.
let _dgResizeRaf = 0;
function armResponsive() {
  if (typeof ResizeObserver !== "function") return;
  const ro = new ResizeObserver(() => {
    if (_dgResizeRaf) return;
    _dgResizeRaf = requestAnimationFrame(() => {
      _dgResizeRaf = 0;
      redrawAll();
      postSize();
    });
  });
  document.querySelectorAll("diagram").forEach((d) => ro.observe(d));
}

// Tell a host page (iframe embed) our rendered size so it can self-fit. No-op
// on a top-level page (the PNG renderer) or a cross-origin host.
function postSize() {
  const d = document.querySelector("diagram");
  if (!d || typeof parent === "undefined" || parent === window) return;
  const r = d.getBoundingClientRect();
  try {
    parent.postMessage({ dg: "size", w: Math.ceil(r.width), h: Math.ceil(r.height) }, "*");
  } catch { /* cross-origin host: ignore */ }
}

async function render() {
  renderMath();
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  const diagrams = document.querySelectorAll("diagram");
  diagrams.forEach((d) => {
    if (d.classList.contains("sequence")) applySequenceLayout(d);
  });
  // Settle the grid, hug fragments to their lifelines, settle again, then draw.
  void document.body.offsetHeight;
  diagrams.forEach((d) => {
    if (d.classList.contains("sequence")) hugFragments(d);
  });
  void document.body.offsetHeight;
  diagrams.forEach(drawOverlay);
  document.documentElement.dataset.dgReady = "true";
  armResponsive(); // keep connectors attached if the container later resizes
  postSize();      // self-fit a host iframe (no-op when not embedded)
}

render().catch((e) => {
  console.error("[dg] render failed:", e);
  document.documentElement.dataset.dgReady = "error";
});
