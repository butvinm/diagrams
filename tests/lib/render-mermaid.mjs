#!/usr/bin/env node
/* Render a Mermaid source to PNG using the project's existing Playwright +
 * Chromium (no mermaid-cli / extra browser download). Produces the reference
 * image for side-by-side comparison in the gallery. Reference only — we never
 * try to match Mermaid's layout.
 *
 *   node tests/lib/render-mermaid.mjs <in.mmd> <out.png>
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const MERMAID = path.resolve(here, "../../node_modules/mermaid/dist/mermaid.min.js");

export async function renderMermaid(code, outPath, { scale = 2 } = {}) {
  // DG_NO_SANDBOX=1 lets Chromium launch as root in a container (see render.mjs).
  const browser = await chromium.launch({ args: process.env.DG_NO_SANDBOX ? ["--no-sandbox"] : [] });
  try {
    const page = await browser.newPage({ deviceScaleFactor: scale });
    await page.setContent('<!doctype html><body style="margin:0;padding:12px;background:#fff">', { waitUntil: "load" });
    await page.addScriptTag({ path: MERMAID });
    const result = await page.evaluate(async (src) => {
      mermaid.initialize({ startOnLoad: false, theme: "default" });
      try {
        const { svg } = await mermaid.render("dg-ref", src);
        const wrap = document.createElement("div");
        wrap.id = "dg-ref-wrap";
        wrap.style.display = "inline-block";
        wrap.innerHTML = svg;
        document.body.appendChild(wrap);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e && e.message || e) };
      }
    }, code);
    const target = (await page.$("#dg-ref-wrap svg")) || (await page.$("body"));
    await target.screenshot({ path: outPath });
    return result;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [inp, out] = process.argv.slice(2);
  if (!inp || !out) {
    console.error("usage: render-mermaid.mjs <in.mmd> <out.png>");
    process.exit(2);
  }
  const code = fs.readFileSync(inp, "utf8");
  const res = await renderMermaid(code, out, { scale: Number(process.env.DG_SCALE || 2) });
  if (res.ok) console.log(`rendered ${inp} -> ${out}`);
  else {
    console.error(`mermaid error: ${res.error}`);
    process.exit(1);
  }
}
