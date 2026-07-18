#!/usr/bin/env node
/**
 * Headed Playwright: open ChatGPT, paste collage prompt, wait for image, download.
 * Usage: node scripts/chatgpt-paste-collage.mjs M1
 * Requires: already logged in once in the profile dir (.temp/catalog-art/chrome-profile)
 */
import { readFileSync, mkdirSync, existsSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sheet = process.argv[2] || "M1";
const require = createRequire(import.meta.url);
const { chromium } = require(join(root, "docs/design/ui-kit/node_modules/playwright"));

const promptPath = join(root, `.temp/catalog-art/paste-${sheet}.txt`);
const outDir = join(root, ".temp/catalog-art/input");
const profile = join(root, ".temp/catalog-art/chrome-profile");
mkdirSync(outDir, { recursive: true });
mkdirSync(profile, { recursive: true });

if (!existsSync(promptPath)) {
  // extract from PROMPT_EXERCISES.md or PROMPT_COVERS.md
  const files = [
    join(root, "docs/design/catalog-art/PROMPT_EXERCISES.md"),
    join(root, "docs/design/catalog-art/PROMPT_COVERS.md"),
  ];
  let text = "";
  for (const f of files) {
    const md = readFileSync(f, "utf8");
    const re = new RegExp(`## Sheet ${sheet}[\\s\\S]*?\`\`\`text\\n([\\s\\S]*?)\`\`\``);
    const m = md.match(re);
    if (m) { text = m[1].trim(); break; }
  }
  if (!text) throw new Error(`No prompt for sheet ${sheet}`);
  writeFileSync(promptPath, text + "\n");
}
const prompt = readFileSync(promptPath, "utf8").trim();
console.log(`Sheet ${sheet}: ${prompt.length} chars`);

const browser = await chromium.launchPersistentContext(profile, {
  channel: "chrome",
  headless: false,
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
});
const page = browser.pages()[0] || await browser.newPage();
await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 120_000 });
console.log("Opened ChatGPT — if login wall, complete login in the window.");

// Wait for composer
const composerSelectors = [
  "#prompt-textarea",
  "div[contenteditable='true']#prompt-textarea",
  "div[contenteditable='true'][data-placeholder]",
  "textarea[data-id='root']",
  "div.ProseMirror[contenteditable='true']",
];
let box = null;
for (let i = 0; i < 60; i++) {
  for (const sel of composerSelectors) {
    const el = page.locator(sel).first();
    if (await el.count() && await el.isVisible().catch(() => false)) { box = el; break; }
  }
  if (box) break;
  await page.waitForTimeout(1000);
}
if (!box) {
  console.log("Composer not found — finish login, then re-run: node scripts/chatgpt-paste-collage.mjs", sheet);
  // keep browser open
  await page.waitForTimeout(300_000);
  await browser.close();
  process.exit(2);
}

await box.click();
await page.keyboard.insertText(prompt);
await page.waitForTimeout(400);
// Send: Enter or button
const send = page.locator('button[data-testid="send-button"], button[aria-label="Send prompt"], button[aria-label="Отправить"]').first();
if (await send.count() && await send.isEnabled().catch(() => false)) await send.click();
else await page.keyboard.press("Enter");

console.log("Prompt sent. Waiting for generated image (up to 4 min)…");
// Wait for a new image in the conversation
const imgSel = 'div[data-message-author-role="assistant"] img, article img, img[alt*="Generated"], img[src*="oaidalle"], img[src*="blob:"], img[src*="images"]';
let img = null;
const start = Date.now();
while (Date.now() - start < 240_000) {
  const imgs = page.locator(imgSel);
  const n = await imgs.count();
  if (n > 0) {
    // pick last visible large image
    for (let i = n - 1; i >= 0; i--) {
      const el = imgs.nth(i);
      const boxSz = await el.boundingBox().catch(() => null);
      if (boxSz && boxSz.width > 200) { img = el; break; }
    }
    if (img) break;
  }
  await page.waitForTimeout(2000);
  process.stdout.write(".");
}
console.log("");
if (!img) {
  console.log("No image detected yet — review the ChatGPT window. When image is ready, save manually to .temp/catalog-art/input/" + sheet + ".png");
  await page.waitForTimeout(600_000);
  await browser.close();
  process.exit(3);
}

// Download via src or screenshot
const src = await img.getAttribute("src");
const dest = join(outDir, `${sheet}.png`);
if (src?.startsWith("http") || src?.startsWith("blob:")) {
  try {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }).catch(() => null),
      img.click({ button: "right" }).catch(() => undefined),
    ]);
    // Prefer fetch in page
    const b64 = await page.evaluate(async (url) => {
      const r = await fetch(url);
      const buf = await r.arrayBuffer();
      let s = "";
      const u = new Uint8Array(buf);
      for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
      return btoa(s);
    }, src);
    writeFileSync(dest, Buffer.from(b64, "base64"));
    console.log("Saved", dest);
  } catch (e) {
    await img.screenshot({ path: dest });
    console.log("Screenshot saved", dest, e.message);
  }
} else {
  await img.screenshot({ path: dest });
  console.log("Screenshot saved", dest);
}

console.log("READY_FOR_REVIEW", dest);
console.log("Look at the ChatGPT window + saved file. Reply if OK to slice.");
// keep open 2 min for review
await page.waitForTimeout(120_000);
await browser.close();
