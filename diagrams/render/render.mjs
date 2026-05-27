#!/usr/bin/env node
/* Render a diagram HTML file to PNG.
 *
 *   node render.mjs <input.html> <output.png>
 *
 * The browser is the layout engine: we load the authored markup, inject the
 * kit (CSS + runtime), wait for the runtime to finish drawing connectors, then
 * screenshot the <diagram> element at a high device scale factor.
 */
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import process from "node:process";

const here = path.dirname(fileURLToPath(import.meta.url));
const kitDir = path.resolve(here, "..", "kit");
const KIT_CSS = path.join(kitDir, "primitives.css");
const KIT_JS = path.join(kitDir, "kit.mjs");

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: render.mjs <input.html> <output.png>");
  process.exit(2);
}
const scale = Number(process.env.DG_SCALE || 2);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: scale });
  page.on("console", (m) => {
    if (m.type() === "error") console.error("  [page]", m.text());
  });
  page.on("pageerror", (e) => console.error("  [page error]", e.message));

  await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: "load" });
  await page.addStyleTag({ path: KIT_CSS });
  await page.addScriptTag({ path: KIT_JS, type: "module" });

  await page.waitForFunction(
    () => document.documentElement.dataset.dgReady !== undefined,
    null,
    { timeout: 8000 },
  );
  const state = await page.evaluate(() => document.documentElement.dataset.dgReady);
  if (state === "error") throw new Error("kit reported a render error (see [page] logs above)");

  const target = (await page.$("diagram")) || (await page.$("body"));
  await target.screenshot({ path: path.resolve(output) });
  console.log(`rendered ${input} -> ${output} @${scale}x`);
} finally {
  await browser.close();
}
