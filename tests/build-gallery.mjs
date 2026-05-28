/* Build the public GitHub Pages gallery into ./site.
 *
 *   node tests/build-gallery.mjs
 *
 * No browser needed: it copies the committed (Docker-blessed) golden PNGs for
 * the canonical images, and reuses `render.mjs --html` to emit live, embeddable
 * copies. The page itself is the proof of the embed feature — the hero is a
 * user-resizable <iframe> of a fluid diagram that reflows as you drag it.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const casesDir = path.join(root, "tests/cases");
const site = path.join(root, "site");
const renderer = path.join(root, "diagrams/render/render.mjs");
const REPO = "https://github.com/butvinm/diagrams/blob/master";

// A live, resizable fluid diagram leads the page (the headline demo).
const hero = "class-responsive";
// One canonical card per diagram type, in display order.
const grid = [
  ["sequence-basic", "Sequence"],
  ["state-basic", "State machine"],
  ["class-basic", "Class"],
  ["deployment-basic", "Deployment"],
  ["dfd-basic", "Data-flow (DFD)"],
  ["flowchart-basic", "Flowchart"],
  ["sequence-math", "Math (KaTeX)"],
];

// Fresh output tree.
fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(path.join(site, "img"), { recursive: true });
fs.mkdirSync(path.join(site, "embeds"), { recursive: true });
fs.writeFileSync(path.join(site, ".nojekyll"), ""); // serve _-prefixed assets, skip Jekyll

const emit = (name) =>
  execFileSync("node", [renderer, path.join(casesDir, name, "ours.html"), path.join(site, "embeds", `${name}.html`), "--html"], { stdio: "pipe" });

// Hero embed (live, resizable).
emit(hero);

// Grid: copy each golden + emit a live embed for the "open live" link.
const cards = grid
  .map(([name, label]) => {
    fs.copyFileSync(path.join(casesDir, name, "golden.png"), path.join(site, "img", `${name}.png`));
    emit(name);
    return `    <figure class="card">
      <a class="shot" href="embeds/${name}.html" title="open the live, self-contained embed">
        <img src="img/${name}.png" alt="${label} diagram" loading="lazy">
      </a>
      <figcaption>
        <span class="label">${label}</span>
        <a href="${REPO}/tests/cases/${name}/ours.html">source</a>
        <a href="embeds/${name}.html">open live &nearr;</a>
      </figcaption>
    </figure>`;
  })
  .join("\n");

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>diagrams — gallery</title>
<style>
  :root { --ink:#1a1a1a; --muted:#6b7280; --line:#e5e7eb; --accent:#2563eb; }
  * { box-sizing: border-box; }
  body { font:16px/1.6 system-ui,-apple-system,sans-serif; color:var(--ink); margin:0; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 48px 20px 80px; }
  h1 { font-size: 2rem; margin: 0 0 6px; }
  .tagline { color: var(--muted); margin: 0 0 32px; font-size: 1.05rem; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  h2 { font-size: 1.2rem; margin: 40px 0 14px; }
  .hero-note { color: var(--muted); font-size: .92rem; margin: 0 0 12px; }
  /* user-resizable embed: drag the bottom-right corner to watch it reflow */
  .resizer { resize: both; overflow: auto; min-width: 360px; min-height: 240px;
             width: 100%; max-width: 100%; border: 1px dashed #c7ccd6; border-radius: 10px;
             padding: 6px; background: #fbfbfc; }
  .resizer iframe { width: 100%; height: 100%; border: 0; display: block; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .card { margin: 0; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: #fff; }
  .card .shot { display: block; background: #fff; }
  .card img { display: block; width: 100%; height: 200px; object-fit: contain; background: #fff; padding: 12px; }
  figcaption { display: flex; gap: 12px; align-items: baseline; padding: 10px 14px; border-top: 1px solid var(--line); font-size: .85rem; }
  figcaption .label { font-weight: 600; margin-right: auto; }
  footer { margin-top: 56px; color: var(--muted); font-size: .9rem; border-top: 1px solid var(--line); padding-top: 20px; }
</style>

<div class="wrap">
  <h1>diagrams</h1>
  <p class="tagline">UML &amp; technical diagrams authored as plain HTML + CSS, rendered to PNG — or embedded live.</p>

  <h2>Live &amp; responsive</h2>
  <p class="hero-note">A self-contained embed of a <code>fluid</code> class diagram. <strong>Drag the bottom-right corner</strong> — gutters flex, the grid reflows 4&nbsp;→&nbsp;2 columns, and the connectors redraw to follow. Text stays selectable.</p>
  <div class="resizer">
    <iframe class="embed" src="embeds/${hero}.html" title="resizable responsive class diagram"></iframe>
  </div>

  <h2>One of each type</h2>
  <div class="grid">
${cards}
  </div>

  <footer>
    Canonical images are the repo's Docker-blessed goldens; each card links to its
    HTML <a href="${REPO}/tests/cases">source</a> and a live, self-contained embed
    (<code>render.mjs --html</code>). <a href="https://github.com/butvinm/diagrams">Project on GitHub</a>.
  </footer>
</div>

<script>
  // Auto-fit each live embed to the size its kit posts (matched by source window).
  addEventListener("message", (e) => {
    if (!e.data || e.data.dg !== "size") return;
    for (const f of document.querySelectorAll("iframe.embed")) {
      if (f.contentWindow === e.source) {
        f.style.height = e.data.h + "px";
        if (!f.closest(".resizer")) f.style.width = e.data.w + "px"; // fixed cards size to content; hero stays fluid
        break;
      }
    }
  });
</script>
`;

fs.writeFileSync(path.join(site, "index.html"), html);
console.log(`gallery: site/index.html  (hero: ${hero}, ${grid.length} cards)`);
