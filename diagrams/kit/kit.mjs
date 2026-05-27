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

// Returns the SVG path `d` and the on-path midpoint used to place the label.
// A `spline` is a quadratic Bézier bowed perpendicular to the chord by
// `k * length`; because the bow flips when the endpoints swap, two opposite
// connectors between the same pair separate into a symmetric lens, and their
// labels land on opposite sides instead of colliding at the chord midpoint.
function connectorGeometry(p1, p2, shape, k = 0.18) {
  const mx = (p1[0] + p2[0]) / 2;
  const my = (p1[1] + p2[1]) / 2;
  if (shape !== "spline") {
    return { d: `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`, mid: [mx, my] };
  }
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1;
  const off = k * len;
  const cx = mx + (-dy / len) * off;
  const cy = my + (dx / len) * off;
  const mid = [0.25 * p1[0] + 0.5 * cx + 0.25 * p2[0], 0.25 * p1[1] + 0.5 * cy + 0.25 * p2[1]];
  return { d: `M ${p1[0]} ${p1[1]} Q ${cx} ${cy} ${p2[0]} ${p2[1]}`, mid };
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
  mk("dg-open", el("path", { d: "M0,0 L10,5 L0,10", fill: "none", stroke: "var(--dg-line)", "stroke-width": 1.6 }), { refX: 9, refY: 5 });
  mk("dg-diamond", el("path", { d: "M0,5 L6,0 L12,5 L6,10 z", fill: "#fff", stroke: "var(--dg-line)", "stroke-width": 1.4 }), { refX: 11, refY: 5 });
  mk("dg-filled", el("path", { d: "M0,5 L6,0 L12,5 L6,10 z", fill: "var(--dg-line)" }), { refX: 11, refY: 5 });
}

const HEADS = { triangle: "dg-triangle", open: "dg-open", diamond: "dg-diamond", filled: "dg-filled", none: null };

function applySequenceLayout(diagram) {
  const parts = (diagram.getAttribute("participants") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const col = Object.fromEntries(parts.map((p, i) => [p, i + 1]));
  diagram.style.gridTemplateColumns = `repeat(${parts.length}, minmax(120px, 1fr))`;

  diagram.querySelectorAll("lifeline").forEach((l) => {
    l.style.gridColumn = col[l.getAttribute("col")] ?? 1;
    l.style.gridRow = 1;
  });
  diagram.querySelectorAll("point").forEach((p) => {
    const r = parseInt(p.getAttribute("row") || "1", 10);
    p.style.gridColumn = col[p.getAttribute("col")] ?? 1;
    p.style.gridRow = r + 1; // row 1 is the lifeline header
  });
}

function drawOverlay(diagram) {
  const origin = diagram.getBoundingClientRect();
  const svg = el("svg", { class: "dg-overlay", width: origin.width, height: origin.height });
  const defs = el("defs");
  defineMarkers(defs);
  svg.appendChild(defs);

  // Lifelines: dashed verticals from below each header to the diagram bottom.
  diagram.querySelectorAll("lifeline").forEach((l) => {
    const b = boxIn(l, origin);
    const x = b.x + b.w / 2;
    svg.appendChild(el("line", {
      x1: x, y1: b.y + b.h, x2: x, y2: origin.height - 8,
      stroke: "var(--dg-line)", "stroke-width": 1.2, "stroke-dasharray": "4 4", opacity: 0.6,
    }));
  });

  // Connectors.
  diagram.querySelectorAll("arrow").forEach((a) => {
    const from = diagram.querySelector("#" + CSS.escape(a.getAttribute("from")));
    const to = diagram.querySelector("#" + CSS.escape(a.getAttribute("to")));
    if (!from || !to) {
      console.error(`[dg] arrow references missing anchor: from=${a.getAttribute("from")} to=${a.getAttribute("to")}`);
      return;
    }
    const [sa, ta] = parseAnchor(a.getAttribute("anchor"));
    const p1 = anchorPoint(boxIn(from, origin), sa);
    const p2 = anchorPoint(boxIn(to, origin), ta);
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

    // Place the arrow's label content just above the path midpoint.
    if (a.textContent.trim() || a.children.length) {
      a.style.left = `${geom.mid[0]}px`;
      a.style.top = `${geom.mid[1] - 6}px`;
      a.style.transform = "translate(-50%, -100%)";
    }
  });

  diagram.insertBefore(svg, diagram.firstChild);
}

async function render() {
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  const diagrams = document.querySelectorAll("diagram");
  diagrams.forEach((d) => {
    if (d.classList.contains("sequence")) applySequenceLayout(d);
  });
  // Force layout to settle before measuring, then draw.
  void document.body.offsetHeight;
  diagrams.forEach(drawOverlay);
  document.documentElement.dataset.dgReady = "true";
}

render().catch((e) => {
  console.error("[dg] render failed:", e);
  document.documentElement.dataset.dgReady = "error";
});
