#!/usr/bin/env node
/**
 * Slice ChatGPT collages → catalog exercise/cover assets + 2-frame GIFs.
 *
 * Expects PNGs in .temp/catalog-art/input/ (see docs/design/catalog-art/README.md).
 * Uses sharp if available, else pure node is not enough — requires `sharp` from apps/web or root.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = join(root, ".temp/catalog-art/input");
const outEx = join(root, "apps/web/public/media/catalog/exercises");
const outCovers = join(root, "apps/web/public/media/catalog/covers");
const require = createRequire(import.meta.url);

let sharp;
try {
  sharp = require(join(root, "node_modules/sharp"));
} catch {
  try { sharp = require(join(root, "apps/web/node_modules/sharp")); } catch {
    console.error("Need sharp. From repo root: npm i sharp");
    process.exit(1);
  }
}

const all = process.argv.includes("--all");
const coversOnly = process.argv.includes("--covers");
const exercisesOnly = process.argv.includes("--exercises") || (!coversOnly && !all);
const doExercises = all || exercisesOnly;
const doCovers = all || coversOnly;

mkdirSync(outEx, { recursive: true });
mkdirSync(outCovers, { recursive: true });
mkdirSync(join(root, ".temp/catalog-art/out"), { recursive: true });

/** @type {Record<string, { file: string, cols: number, rows: number, cells: string[] }>} */
const EXERCISE_SHEETS = {
  E1: {
    file: "E1.png", cols: 3, rows: 4,
    cells: [
      "ex-down-dog", "ex-low-lunge", "ex-half-split",
      "ex-forward-fold", "ex-warrior-one", "ex-warrior-two",
      "ex-triangle", "ex-side-angle", "ex-tree",
      "ex-chair", "ex-plank", "ex-side-plank",
    ],
  },
  E2: {
    file: "E2.png", cols: 3, rows: 4,
    cells: [
      "ex-boat", "ex-bridge", "ex-sphinx",
      "ex-cobra", "ex-locust", "ex-puppy",
      "ex-pigeon", "ex-lizard", "ex-butterfly",
      "ex-seated-fold", "ex-seated-twist", "ex-supine-twist",
    ],
  },
  E3: {
    file: "E3.png", cols: 3, rows: 4,
    cells: [
      "ex-happy-baby", "ex-legs-wall", "ex-savasana",
      "ex-box-breath", "ex-long-exhale", "ex-crocodile",
      "ex-tabletop-balance", "ex-knee-hugs", "ex-reclined-hamstring",
      "ex-figure-four", "ex-calf-stretch", "ex-eagle-arms",
    ],
  },
  E4: {
    file: "E4.png", cols: 3, rows: 4,
    cells: [
      "ex-garland", "ex-wide-fold", "ex-half-moon",
      "ex-dancer-prep", "ex-crescent", "ex-humble-warrior",
      "ex-prasarita", "ex-forearm-plank", "ex-dolphin",
      "ex-side-bend", "ex-meditation-seat", null,
    ],
  },
};

/** Motion sheets: each row = [id, frameA, frameB] via two cells */
const MOTION_SHEETS = {
  M1: {
    file: "M1.png", cols: 2, rows: 5,
    pairs: [
      "ex-mountain", "ex-cat-cow", "ex-child", "ex-thread-needle", "ex-bird-dog",
    ],
  },
  M2: {
    file: "M2.png", cols: 2, rows: 4,
    pairs: ["ex-neck-rolls", "ex-shoulder-rolls", "ex-sun-a", "ex-rag-doll"],
  },
  M3: {
    file: "M3.png", cols: 2, rows: 4,
    pairs: ["ex-wrist-warmup", "ex-ankle-mobility", "ex-hip-circles", "ex-dead-bug"],
  },
};

const COVER_SHEETS = {
  C1: {
    file: "C1.png", cols: 4, rows: 3,
    cells: [
      "wo-morning-10", "wo-back-soft-15", "wo-stretch-evening-20", "wo-core-12",
      "wo-hips-25", "wo-balance-basic-15", "wo-shoulders-14", "wo-breath-calm-8",
      "wo-energy-20", "wo-lower-back-10", "wo-legs-stretch-18", "wo-strength-flow-30",
    ],
  },
  C2: {
    file: "C2.png", cols: 4, rows: 2,
    cells: [
      "wo-restorative-25", "wo-mobility-full-22", "wo-posture-16", "wo-evening-sleep-12",
      "wo-balance-flow-20", "wo-wrists-safe-13", "wo-deep-stretch-35", "wo-step-test-short",
    ],
  },
};

async function sliceGrid(path, cols, rows) {
  if (!existsSync(path)) throw new Error(`missing ${path}`);
  const img = sharp(path);
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  if (!W || !H) throw new Error(`bad size ${path}`);
  const cw = Math.floor(W / cols), ch = Math.floor(H / rows);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const buf = await sharp(path)
        .extract({ left: c * cw, top: r * ch, width: cw, height: ch })
        .png()
        .toBuffer();
      cells.push(buf);
    }
  }
  return cells;
}

async function writeWebp(buf, dest) {
  await sharp(buf).resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toFile(dest);
}

async function writeGifPair(bufA, bufB, dest) {
  // sharp gif: encode two frames via gif with delay
  const a = await sharp(bufA).resize({ width: 720, height: 720, fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(bufB).resize({ width: a.info.width, height: a.info.height, fit: "fill" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Prefer gifenc-less path: write temp pngs and use sharp join — sharp doesn't multi-frame gif well.
  // Fall back: write A as webp and also try png sequence for pillow helper.
  const tmpA = dest.replace(/\.gif$/, "-A.png");
  const tmpB = dest.replace(/\.gif$/, "-B.png");
  await sharp(bufA).resize({ width: 720, height: 720, fit: "inside" }).png().toFile(tmpA);
  await sharp(bufB).resize({ width: a.info.width, height: a.info.height, fit: "fill" }).png().toFile(tmpB);
  // Pillow GIF (same light approach as before)
  const { spawnSync } = await import("node:child_process");
  const py = `
from PIL import Image
a=Image.open(${JSON.stringify(tmpA)}).convert("RGB")
b=Image.open(${JSON.stringify(tmpB)}).convert("RGB")
b=b.resize(a.size)
a.save(${JSON.stringify(dest)}, save_all=True, append_images=[b,a,b], duration=750, loop=0, optimize=True)
print("ok", ${JSON.stringify(dest)})
`;
  const r = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || "pillow gif failed");
  console.log("gif", dest, r.stdout.trim());
}

async function processStills() {
  for (const [name, sheet] of Object.entries(EXERCISE_SHEETS)) {
    const path = join(inputDir, sheet.file);
    if (!existsSync(path)) { console.warn("skip missing", path); continue; }
    const cells = await sliceGrid(path, sheet.cols, sheet.rows);
    for (let i = 0; i < sheet.cells.length; i++) {
      const id = sheet.cells[i];
      if (!id) continue;
      const dest = join(outEx, `${id}.webp`);
      await writeWebp(cells[i], dest);
      console.log("still", id);
    }
  }
}

async function processMotion() {
  for (const [name, sheet] of Object.entries(MOTION_SHEETS)) {
    const path = join(inputDir, sheet.file);
    if (!existsSync(path)) { console.warn("skip missing", path); continue; }
    const cells = await sliceGrid(path, sheet.cols, sheet.rows);
    for (let i = 0; i < sheet.pairs.length; i++) {
      const id = sheet.pairs[i];
      const a = cells[i * 2], b = cells[i * 2 + 1];
      const dest = join(outEx, `${id}.gif`);
      await writeGifPair(a, b, dest);
      // remove stale webp if any
      const webp = join(outEx, `${id}.webp`);
      if (existsSync(webp)) {
        const { unlinkSync } = await import("node:fs");
        unlinkSync(webp);
      }
    }
  }
}

async function processCovers() {
  for (const [name, sheet] of Object.entries(COVER_SHEETS)) {
    const path = join(inputDir, sheet.file);
    if (!existsSync(path)) { console.warn("skip missing", path); continue; }
    const cells = await sliceGrid(path, sheet.cols, sheet.rows);
    for (let i = 0; i < sheet.cells.length; i++) {
      const id = sheet.cells[i];
      if (!id) continue;
      const dest = join(outCovers, `${id}.webp`);
      await sharp(cells[i]).resize({ width: 1280, height: 720, fit: "cover" }).webp({ quality: 85 }).toFile(dest);
      console.log("cover", id);
    }
  }
}

const log = { at: new Date().toISOString(), doExercises, doCovers };
try {
  if (doExercises) {
    await processStills();
    await processMotion();
  }
  if (doCovers) await processCovers();
  writeFileSync(join(root, ".temp/catalog-art/out/last-run.json"), JSON.stringify(log, null, 2));
  console.log("done", log);
} catch (e) {
  console.error(e);
  process.exit(1);
}
