#!/usr/bin/env node
/* Render a diagram HTML file to PNG.
 *
 *   node render.mjs <input.html> <output.png>
 *
 * The browser is the layout engine: load the authored markup, inject the kit
 * (CSS + runtime), wait for the runtime to finish drawing connectors, then
 * screenshot the <diagram> element at a high device scale factor.
 *
 * Runs both in-repo and from a fresh plugin install:
 *   - Playwright is resolved normally; if it is missing (fresh install), it is
 *     npm-installed into the plugin root once, on first use.
 *   - The browser falls back from Playwright's Chromium to system Chrome/Edge,
 *     so no 150 MB download is required when a browser already exists.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const here = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(here, ".."); // = ${CLAUDE_PLUGIN_ROOT}
const KIT_CSS = path.join(pluginRoot, "kit", "primitives.css");
const KIT_JS = path.join(pluginRoot, "kit", "kit.mjs");

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: render.mjs <input.html> <output.png>");
  process.exit(2);
}
const scale = Number(process.env.DG_SCALE || 2);

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium);
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

// Resolve Playwright, bootstrapping the plugin's deps on first use if absent.
async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    if (!fs.existsSync(path.join(pluginRoot, "package.json"))) {
      throw new Error(`playwright is not installed and there is no package.json at ${pluginRoot} to bootstrap from`);
    }
    console.error("[dg] playwright not found — installing the renderer's dependencies (first run only)…");
    execFileSync("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], {
      cwd: pluginRoot,
      stdio: "inherit",
    });
    return await import("playwright");
  }
}

// Launch the first browser that works: Playwright's Chromium, else system Chrome/Edge.
async function launchBrowser(chromium) {
  const attempts = [{}, { channel: "chrome" }, { channel: "msedge" }];
  let lastErr;
  for (const opts of attempts) {
    try {
      return await chromium.launch(opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    "Could not launch a browser. Install Playwright's Chromium with:\n" +
      "  npx playwright install chromium\n" +
      "or install Google Chrome / Edge.\nLast error: " + (lastErr && lastErr.message),
  );
}
