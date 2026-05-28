#!/usr/bin/env node
/* Render a diagram HTML file to PNG.
 *
 *   node render.mjs <input.html> <output.png>
 *
 * The browser is the layout engine: load the authored markup, inject the kit
 * (CSS + runtime), wait for the runtime to finish drawing connectors, then
 * screenshot the <diagram> element at a high device scale factor.
 *
 *   node render.mjs <input.html> <output.html> --html
 *
 * With --html it instead emits a self-contained, embeddable HTML file (markup +
 * inlined kit CSS/JS, plus KaTeX inlined only when the diagram uses math). No
 * browser is launched — the kit runs live in the consumer's browser, so an
 * embedded diagram stays responsive (gaps flex, breakpoints reflow, connectors
 * redraw on resize) and its text stays selectable.
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
// Vendored KaTeX (offline): the CSS is injected via its file:// URL so the
// @font-face url(fonts/…) resolve next to it; the runtime + auto-render are
// plain globals the kit calls if present.
const KATEX_DIR = path.join(pluginRoot, "kit", "vendor", "katex");
const KATEX_CSS = path.join(KATEX_DIR, "katex.min.css");
const KATEX_JS = path.join(KATEX_DIR, "katex.min.js");
const KATEX_AUTORENDER = path.join(KATEX_DIR, "auto-render.min.js");

const argv = process.argv.slice(2);
const htmlMode = argv.includes("--html");
const [input, output] = argv.filter((a) => !a.startsWith("--"));
if (!input || !output) {
  console.error("usage: render.mjs <input.html> <output.png>\n       render.mjs <input.html> <output.html> --html");
  process.exit(2);
}

// --html: emit a self-contained, embeddable HTML file. Pure inlining, no browser.
if (htmlMode) {
  emitStandaloneHtml(input, output);
  process.exit(0);
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
  if (fs.existsSync(KATEX_CSS)) {
    await page.addStyleTag({ url: pathToFileURL(KATEX_CSS).href });
    await page.addScriptTag({ path: KATEX_JS });
    await page.addScriptTag({ path: KATEX_AUTORENDER });
  }
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

// Emit a self-contained, embeddable HTML file: the authored markup followed by
// the inlined kit CSS + runtime (and KaTeX inlined only when the diagram uses
// math). Assets go *after* the authored content so the cascade/order matches
// what the renderer injects at run time. The kit runs live in the embedding
// browser — keeping the diagram responsive and its text selectable.
function emitStandaloneHtml(inputPath, outputPath) {
  const authored = fs.readFileSync(path.resolve(inputPath), "utf8");
  const css = fs.readFileSync(KIT_CSS, "utf8");
  const kit = fs.readFileSync(KIT_JS, "utf8");

  // Math is opt-in by delimiter: \( … \), \[ … \], or $$ … $$ (no lone $).
  const usesMath = /\\\(|\\\[|\$\$/.test(authored);

  let assets = `<style>\n${css}\n</style>\n`;
  if (usesMath) {
    if (!fs.existsSync(KATEX_CSS)) {
      console.error("[dg] diagram uses math but vendored KaTeX is missing; emitting without it");
    } else {
      assets += `<style>\n${inlineKatexFonts(fs.readFileSync(KATEX_CSS, "utf8"))}\n</style>\n`;
      assets += `<script>\n${fs.readFileSync(KATEX_JS, "utf8")}\n</script>\n`;
      assets += `<script>\n${fs.readFileSync(KATEX_AUTORENDER, "utf8")}\n</script>\n`;
    }
  }
  // type="module" matches how the renderer loads the kit (it uses import-less
  // top-level code, but module scope keeps its helpers off the global object).
  assets += `<script type="module">\n${kit}\n</script>\n`;

  fs.writeFileSync(path.resolve(outputPath), `${authored.trimEnd()}\n${assets}`);
  console.log(`emitted ${inputPath} -> ${outputPath} (self-contained${usesMath ? ", +KaTeX" : ""})`);
}

// Rewrite KaTeX's `url(fonts/NAME.woff2)` references to inline data: URIs so the
// emitted file is fully offline. Only woff2 is inlined (the format browsers try
// first); the now-dangling woff/ttf fallbacks are never fetched.
function inlineKatexFonts(katexCss) {
  return katexCss.replace(/url\(fonts\/([^)]+\.woff2)\)/g, (match, file) => {
    const fontPath = path.join(KATEX_DIR, "fonts", file);
    if (!fs.existsSync(fontPath)) return match;
    const b64 = fs.readFileSync(fontPath).toString("base64");
    return `url(data:font/woff2;base64,${b64})`;
  });
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
  // Chromium's setuid sandbox can't run as root inside a container; opt out with DG_NO_SANDBOX=1 (set by the Docker test env).
  // Off by default — the shipped renderer keeps the sandbox on a normal desktop.
  const args = process.env.DG_NO_SANDBOX ? ["--no-sandbox"] : [];
  const attempts = [{ args }, { channel: "chrome", args }, { channel: "msedge", args }];
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
