#!/usr/bin/env node
/* Test harness.
 *
 *   node tests/run.mjs            render all cases, diff vs golden, build gallery
 *   node tests/run.mjs --update   bless current renders as goldens
 *
 * Snapshot diffing proves STABILITY, not correctness. New cases are never
 * auto-blessed without --update; a golden should only be (re)blessed after a
 * visual verification pass (see .claude/skills/dev/SKILL.md).
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { renderMermaid } from "./lib/render-mermaid.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const casesDir = path.join(root, "tests/cases");
const renderer = path.join(root, "diagrams/render/render.mjs");

const UPDATE = process.argv.includes("--update");
const PER_PIXEL_THRESHOLD = 0.1; // pixelmatch color sensitivity
const MAX_DIFF_RATIO = 0.0001; // 0.01%: renders are bit-for-bit deterministic in the pinned Docker image (every case diffs 0 pixels), so this is just a hair of slack against a stray pixel, not real drift tolerance

// Each case is self-contained: tests/cases/<name>/ holds INTENT.md, ours.html,
// the committed golden.png, optional ref.mmd, and generated ours/ref/diff.png.

const cases = fs
  .readdirSync(casesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(casesDir, d.name, "ours.html")))
  .map((d) => d.name)
  .sort();

const results = [];

for (const name of cases) {
  const html = path.join(casesDir, name, "ours.html");
  const out = path.join(casesDir, name, "ours.png");
  const golden = path.join(casesDir, name, "golden.png");

  // Regenerate the Mermaid reference render for the gallery (comparison only).
  const refMmd = path.join(casesDir, name, "ref.mmd");
  if (fs.existsSync(refMmd)) {
    try {
      const res = await renderMermaid(fs.readFileSync(refMmd, "utf8"), path.join(casesDir, name, "ref.png"));
      if (!res.ok) console.error(`  [mermaid] ${name}: ${res.error}`);
    } catch (e) {
      console.error(`  [mermaid] ${name}: ${e.message}`);
    }
  }

  try {
    execFileSync("node", [renderer, html, out], { stdio: "pipe" });
  } catch (e) {
    results.push({ name, status: "render-error", detail: (e.stderr || e.message).toString().trim().split("\n").pop() });
    continue;
  }

  if (!fs.existsSync(golden)) {
    if (UPDATE) {
      fs.copyFileSync(out, golden);
      results.push({ name, status: "blessed" });
    } else {
      results.push({ name, status: "new", detail: "needs visual sign-off, then --update" });
    }
    continue;
  }

  const a = PNG.sync.read(fs.readFileSync(out));
  const b = PNG.sync.read(fs.readFileSync(golden));
  if (a.width !== b.width || a.height !== b.height) {
    results.push({ name, status: "size-mismatch", detail: `${a.width}x${a.height} vs golden ${b.width}x${b.height}` });
    if (UPDATE) fs.copyFileSync(out, golden);
    continue;
  }

  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: PER_PIXEL_THRESHOLD });
  const ratio = changed / (a.width * a.height);
  if (ratio > MAX_DIFF_RATIO) {
    fs.writeFileSync(path.join(casesDir, name, "diff.png"), PNG.sync.write(diff));
    results.push({ name, status: UPDATE ? "blessed (changed)" : "FAIL", detail: `${(ratio * 100).toFixed(2)}% pixels differ` });
    if (UPDATE) fs.copyFileSync(out, golden);
  } else {
    results.push({ name, status: "pass", detail: `${(ratio * 100).toFixed(3)}% diff` });
  }
}

buildGallery(results);

console.table(results);
const failed = results.filter((r) => r.status === "FAIL" || r.status === "size-mismatch" || r.status === "render-error");
const fresh = results.filter((r) => r.status === "new");
console.log(`\ngallery: ${path.join("tests", "gallery.html")}`);
if (UPDATE) console.log("goldens updated.");
if (fresh.length && !UPDATE) console.log(`${fresh.length} new case(s): verify visually, then \`npm run test:update\`.`);
if (failed.length && !UPDATE) {
  console.error(`${failed.length} case(s) failed.`);
  process.exit(1);
}

function buildGallery(results) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const rows = results
    .map((r) => {
      const dir = `cases/${r.name}`;
      const intent = readIfExists(path.join(casesDir, r.name, "INTENT.md"));
      const refMmd = readIfExists(path.join(casesDir, r.name, "ref.mmd"));
      const refPng = fs.existsSync(path.join(casesDir, r.name, "ref.png")) ? `${dir}/ref.png` : null;
      const diffPng = fs.existsSync(path.join(casesDir, r.name, "diff.png")) ? `${dir}/diff.png` : null;
      const goldenPng = fs.existsSync(path.join(casesDir, r.name, "golden.png")) ? `${dir}/golden.png` : null;
      return `<section>
  <h2>${esc(r.name)} <span class="status ${r.status.replace(/[^a-z]/gi, "")}">${esc(r.status)}</span>
    ${r.detail ? `<small>${esc(r.detail)}</small>` : ""}</h2>
  <div class="cols">
    <div class="col"><h3>intent</h3><pre>${esc(intent || "—")}</pre>
      ${refMmd ? `<h3>mermaid ref</h3><pre>${esc(refMmd)}</pre>` : ""}</div>
    <div class="col"><h3>mermaid render</h3>${refPng ? `<img src="${refPng}">` : "<p class=none>(none)</p>"}</div>
    <div class="col"><h3>ours</h3><img src="${dir}/ours.png"></div>
    <div class="col"><h3>golden${diffPng ? " / diff" : ""}</h3>
      ${goldenPng ? `<img src="${goldenPng}">` : "<p class=none>(unblessed)</p>"}
      ${diffPng ? `<img src="${diffPng}">` : ""}</div>
  </div>
</section>`;
    })
    .join("\n");

  const html = `<!doctype html><meta charset="utf-8"><title>diagrams gallery</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;margin:24px;color:#222}
  section{border-top:2px solid #eee;padding:16px 0}
  h2{font-size:18px;margin:0 0 12px} small{color:#888;font-weight:400;margin-left:8px}
  .status{font-size:12px;padding:2px 8px;border-radius:10px;background:#eee}
  .status.pass,.status.blessed,.status.blessedchanged{background:#d6f5d6}
  .status.FAIL,.status.sizemismatch,.status.rendererror{background:#f8d6d6}
  .status.new{background:#fff0c2}
  .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:start}
  .col h3{font-size:12px;text-transform:uppercase;color:#999;margin:0 0 6px}
  img{max-width:100%;border:1px solid #eee;border-radius:6px;background:#fff}
  pre{white-space:pre-wrap;background:#fafafa;border:1px solid #eee;border-radius:6px;padding:8px;font-size:12px;max-height:280px;overflow:auto}
  .none{color:#bbb}
</style>
<h1>diagrams — comparison gallery</h1>
${rows}`;
  fs.writeFileSync(path.join(root, "tests/gallery.html"), html);
}

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8").trim() : "";
}
