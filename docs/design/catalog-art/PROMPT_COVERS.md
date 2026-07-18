# Paste prompts — Flowly workout covers (ChatGPT image)

Covers must match **exercise art** (`flowly-catalog-art-v1`).  
**Forbidden:** photoreal yoga photos, window light rooms, stock photography (current bad covers).

**Style lock:** flat vector, one woman black high bun, lavender-gray `#B8B4C4` set + mint `#A8D5C4` trim, sage bg `#D8E8E0`, lilac mat `#E8DDF0`, 16:9, full body, NO text NO logos.

---

## Sheet C1 — covers 4×3 (12)

```text
Create ONE image: 4 columns × 3 rows grid of 16:9 cover illustrations. Equal cells, 16px gutters sage #D8E8E0. flowly-catalog-art-v1 ONLY — flat vector, never photoreal. Same character every cell. No text.

Row1:
1) wo-morning-10 — calm standing mountain or soft stretch, airy morning mood (still flat sage bg).
2) wo-back-soft-15 — child’s pose or gentle tabletop, soft back care.
3) wo-stretch-evening-20 — seated forward fold, evening calm.
4) wo-core-12 — forearm plank stable.

Row2:
5) wo-hips-25 — low lunge or pigeon hip focus.
6) wo-balance-basic-15 — tree pose balance.
7) wo-shoulders-14 — eagle arms or thread-the-needle.
8) wo-breath-calm-8 — meditation seat, peaceful.

Row3:
9) wo-energy-20 — warrior II energetic stance (flat vector).
10) wo-lower-back-10 — knees-to-chest or cat pose.
11) wo-legs-stretch-18 — half splits or standing fold.
12) wo-strength-flow-30 — chair pose strength.

Strict: same character DNA; lilac mat; sage bg; no photo realism.
```

---

## Sheet C2 — covers 4×2 (8)

```text
Create ONE image: 4×2 grid of 16:9 covers. flowly-catalog-art-v1 ONLY. No text.

Row1:
1) wo-restorative-25 — savasana or legs-up-wall restorative.
2) wo-mobility-full-22 — cat-cow mid mobility.
3) wo-posture-16 — mountain or sphinx posture.
4) wo-evening-sleep-12 — child pose or savasana sleep calm.

Row2:
5) wo-balance-flow-20 — half moon or tree flow balance.
6) wo-wrists-safe-13 — standing arms free (no weight on hands).
7) wo-deep-stretch-35 — wide fold or deep pigeon.
8) wo-step-test-short — mountain arms up (test workout cover; still flat vector, not photo).

Strict alignment and style lock.
```

---

## After generation

Save as `.temp/catalog-art/input/C1.png`, `C2.png` then:

```bash
node scripts/slice-catalog-art.mjs --covers
```
