#!/usr/bin/env node
/**
 * Light exercise media seed (no ffmpeg).
 * Curated Wikimedia Commons files → Pillow webp (or keep real gif).
 * Sequential + long delay. Resume-safe.
 *
 *   node scripts/fetch-exercise-media.mjs
 *   FORCE=1 node scripts/fetch-exercise-media.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream, unlinkSync, copyFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(resolve(root, "seeds/catalog/starter-catalog.v1.json"), "utf8"));
const outDir = resolve(root, "apps/web/public/media/catalog/exercises");
const tmpDir = resolve(root, ".temp/exercise-media");
const UA = "FlowlyCatalogBot/1.0 (yoga mini-app; educational seed media)";
const DELAY = 2500;
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

/** Curated Commons file titles (exact). Prefer clear pose demos. */
const FILES = {
  "ex-mountain": "Mr-yoga-mountain-pose-1.jpg",
  "ex-neck-rolls": "Pendulum exercise (passive exercise).jpg",
  "ex-shoulder-rolls": "Pendulum exercise (passive exercise).jpg",
  "ex-cat-cow": "Bidalasana.png",
  "ex-child": "Balasana.JPG",
  "ex-down-dog": "Downward-Facing-Dog.JPG",
  "ex-low-lunge": "Jóga Anjaneyasana.jpg",
  "ex-half-split": "Ardha Hanumanasana Yoga-Asana Nina-Mel.jpg",
  "ex-forward-fold": "3Uttanasana.JPG",
  "ex-sun-a": "Sun_salutations_yoga.jpg",
  "ex-warrior-one": "Yoga Warrior I.jpg",
  "ex-warrior-two": "Virabhadrasana II - Warrior II Pose.jpg",
  "ex-triangle": "Trikonasana Yoga-Asana Nina-Mel.jpg",
  "ex-side-angle": "Utthita Parsvakonasana.JPG",
  "ex-tree": "Vriksasana Yoga-Asana Nina-Mel.jpg",
  "ex-chair": "A style of Utkatasana.JPG",
  "ex-plank": "Plank_(exercise).jpg",
  "ex-side-plank": "Side_plank.JPG",
  "ex-boat": "Mr-yoga-boat-pose2.jpg",
  "ex-bridge": "Setu Bandha Sarvangasana.JPG",
  "ex-sphinx": "Sphinx_pose.jpg",
  "ex-cobra": "Bhujangasana, Heinz Grill 1992.jpg",
  "ex-locust": "Salabhasana.JPG",
  "ex-puppy": "Uttana Shishosana.JPG",
  "ex-pigeon": "Eka Pada Rajakapotasana.JPG",
  "ex-lizard": "Utthan Pristhasana.JPG",
  "ex-butterfly": "Baddha Konasana.JPG",
  "ex-seated-fold": "Paschimottanasana.JPG",
  "ex-seated-twist": "Ardha Matsyendrasana.JPG",
  "ex-supine-twist": "Jathara Parivartanasana.JPG",
  "ex-happy-baby": "Ananda Balasana.JPG",
  "ex-legs-wall": "Viparita Karani.JPG",
  "ex-savasana": "Savasana.JPG",
  "ex-box-breath": "Sukhasana.JPG",
  "ex-long-exhale": "Sukhasana.JPG",
  "ex-crocodile": "Makarasana.JPG",
  "ex-tabletop-balance": "Bharmanasana.JPG",
  "ex-knee-hugs": "Apanasana.JPG",
  "ex-reclined-hamstring": "Supta Padangusthasana.JPG",
  "ex-figure-four": "Figure-four_stretch.jpg",
  "ex-calf-stretch": "Calf_stretch.jpg",
  "ex-eagle-arms": "Garudasana.JPG",
  "ex-garland": "Malasana.JPG",
  "ex-wide-fold": "Prasarita Padottanasana.JPG",
  "ex-half-moon": "Ardha Chandrasana.JPG",
  "ex-dancer-prep": "Natarajasana.JPG",
  "ex-crescent": "Ashta Chandrasana.JPG",
  "ex-humble-warrior": "Baddha Virabhadrasana.JPG",
  "ex-prasarita": "Prasarita Padottanasana.JPG",
  "ex-forearm-plank": "Forearm_plank.jpg",
  "ex-dolphin": "Dolphin_pose.jpg",
  "ex-side-bend": "Parsva Sukhasana.JPG",
  "ex-meditation-seat": "Sukhasana.JPG",
  "ex-thread-needle": "Thread_the_needle_pose.jpg",
  "ex-wrist-warmup": "Wrist_stretch.jpg",
  "ex-ankle-mobility": "Ankle_circles.jpg",
  "ex-hip-circles": "Hip_circles.jpg",
  "ex-bird-dog": "Bird_dog_exercise.jpg",
  "ex-dead-bug": "Dead_bug_exercise.jpg",
  "ex-rag-doll": "3Uttanasana.JPG",
};

/** Fallback search terms if curated file 404s */
const FALLBACK_Q = {
  "ex-plank": "plank exercise yoga mat",
  "ex-side-plank": "side plank yoga",
  "ex-bridge": "bridge pose yoga",
  "ex-sphinx": "sphinx pose yoga",
  "ex-locust": "locust pose yoga",
  "ex-puppy": "puppy pose yoga",
  "ex-pigeon": "pigeon pose yoga",
  "ex-lizard": "lizard pose yoga",
  "ex-butterfly": "baddha konasana",
  "ex-seated-fold": "paschimottanasana",
  "ex-seated-twist": "ardha matsyendrasana",
  "ex-supine-twist": "supine twist yoga",
  "ex-happy-baby": "happy baby yoga",
  "ex-legs-wall": "legs up the wall yoga",
  "ex-savasana": "savasana yoga",
  "ex-crocodile": "crocodile pose yoga",
  "ex-tabletop-balance": "tabletop yoga pose",
  "ex-knee-hugs": "knees to chest yoga",
  "ex-reclined-hamstring": "supta padangusthasana",
  "ex-figure-four": "figure four stretch",
  "ex-calf-stretch": "calf stretch standing",
  "ex-eagle-arms": "garudasana",
  "ex-garland": "malasana yoga",
  "ex-wide-fold": "prasarita padottanasana",
  "ex-half-moon": "ardha chandrasana",
  "ex-dancer-prep": "natarajasana",
  "ex-crescent": "crescent lunge yoga",
  "ex-humble-warrior": "humble warrior yoga",
  "ex-forearm-plank": "forearm plank",
  "ex-dolphin": "dolphin pose yoga",
  "ex-side-bend": "seated side bend yoga",
  "ex-thread-needle": "thread the needle yoga",
  "ex-wrist-warmup": "wrist stretch",
  "ex-ankle-mobility": "ankle mobility",
  "ex-hip-circles": "hip circles exercise",
  "ex-bird-dog": "bird dog exercise",
  "ex-dead-bug": "dead bug exercise",
  "ex-half-split": "half splits yoga",
  "ex-side-angle": "parsvakonasana",
  "ex-chair": "utkatasana",
  "ex-sun-a": "sun salutation yoga",
  "ex-box-breath": "sukhasana",
  "ex-long-exhale": "sukhasana meditation",
  "ex-meditation-seat": "sukhasana",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOk(url, attempt = 0) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (res.status === 429) {
    if (attempt >= 5) throw new Error("429 too many");
    await sleep(10000 + attempt * 5000);
    return fetchOk(url, attempt + 1);
  }
  return res;
}

async function downloadFile(fileName, dest) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=800`;
  const res = await fetchOk(url);
  if (!res.ok) throw new Error(`file ${res.status} ${fileName}`);
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) throw new Error(`not image ${type} ${fileName}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return type;
}

async function searchOne(q) {
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrsearch: q, gsrlimit: "5",
    gsrnamespace: "6", prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "800",
  });
  const res = await fetchOk(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!res.ok) throw new Error(`search ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii?.thumburl && !ii?.url) continue;
    const title = (p.title || "").replace(/^File:/, "");
    if (/collage|chart|logo|stamp|map|flag|statue/i.test(title)) continue;
    return title;
  }
  return null;
}

function toWebp(src, dest) {
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(src)})
if im.mode in ("RGBA", "P"):
    im = im.convert("RGBA")
    bg = Image.new("RGB", im.size, (245, 247, 244))
    bg.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
    im = bg
else:
    im = im.convert("RGB")
im.thumbnail((960, 960))
im.save(${JSON.stringify(dest)}, "WEBP", quality=80, method=4)
`;
  const r = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || "pillow").slice(0, 240));
}

const provenance = [];
const mediaMap = {};
const summary = { ok: 0, skip: 0, fail: [] };

for (const ex of catalog.exercises) {
  const webp = join(outDir, `${ex.id}.webp`);
  const gif = join(outDir, `${ex.id}.gif`);
  if (process.env.FORCE !== "1") {
    if (existsSync(gif)) {
      mediaMap[ex.id] = { mediaType: "gif", mediaObjectKey: `catalog/exercises/${ex.id}.gif` };
      summary.ok++; summary.skip++; provenance.push({ id: ex.id, status: "skip" }); continue;
    }
    if (existsSync(webp)) {
      mediaMap[ex.id] = { mediaType: "image", mediaObjectKey: `catalog/exercises/${ex.id}.webp` };
      summary.ok++; summary.skip++; provenance.push({ id: ex.id, status: "skip" }); continue;
    }
  }

  const raw = join(tmpDir, `${ex.id}-raw`);
  let fileName = FILES[ex.id];
  let mime = "";
  try {
    try {
      mime = await downloadFile(fileName, raw);
    } catch (e1) {
      const q = FALLBACK_Q[ex.id] || ex.title;
      console.warn("curated miss", ex.id, e1.message, "→ search", q);
      await sleep(DELAY);
      const found = await searchOne(q);
      if (!found) throw e1;
      fileName = found;
      mime = await downloadFile(fileName, raw);
    }

    if (/gif/i.test(mime)) {
      copyFileSync(raw, gif);
      mediaMap[ex.id] = { mediaType: "gif", mediaObjectKey: `catalog/exercises/${ex.id}.gif` };
    } else {
      toWebp(raw, webp);
      mediaMap[ex.id] = { mediaType: "image", mediaObjectKey: `catalog/exercises/${ex.id}.webp` };
    }
    try { unlinkSync(raw); } catch {}
    summary.ok++;
    provenance.push({ id: ex.id, status: "ok", file: fileName, ...mediaMap[ex.id] });
    console.log("OK", ex.id, "←", fileName);
  } catch (e) {
    summary.fail.push(ex.id);
    provenance.push({ id: ex.id, status: "fail", error: String(e.message || e).slice(0, 160) });
    console.warn("FAIL", ex.id, e.message);
  }
  await sleep(DELAY);
}

writeFileSync(join(tmpDir, "provenance.json"), JSON.stringify({ at: new Date().toISOString(), summary, mediaMap, provenance }, null, 2));
writeFileSync(join(tmpDir, "media-map.json"), JSON.stringify(mediaMap, null, 2));
console.log(JSON.stringify(summary, null, 2));
