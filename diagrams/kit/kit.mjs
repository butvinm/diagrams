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

function anchorPoint(box, name) {
  return (ANCHORS[name] || ANCHORS.center)(box);
}

function straightPath(p1, p2) {
  return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`;
}

// Quadratic Bézier bowed perpendicular to the chord by `k * length`.
function splinePath(p1, p2, k = 0.18) {
  const mx = (p1[0] + p2[0]) / 2;
  const my = (p1[1] + p2[1]) / 2;
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const off = k * len;
  return `M ${p1[0]} ${p1[1]} Q ${mx + nx * off} ${my + ny * off} ${p2[0]} ${p2[1]}`;
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
    const d = shape === "spline" ? splinePath(p1, p2) : straightPath(p1, p2);

    const path = el("path", {
      d, fill: "none", stroke: "var(--dg-line)", "stroke-width": 1.6,
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
      const mx = (p1[0] + p2[0]) / 2;
      const my = (p1[1] + p2[1]) / 2;
      a.style.left = `${mx}px`;
      a.style.top = `${my - 6}px`;
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
