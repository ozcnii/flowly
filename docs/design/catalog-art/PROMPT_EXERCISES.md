# Paste prompts — exercise collages (ChatGPT image)

**Перед каждым sheet:**

1. Canvas size — **exact pixels** from the prompt. If the model downscales, keep the **same aspect ratio** (M1 ≈ **1.40**, M2/M3 ≈ **1.77**, E ≈ **1.33**) and the same grid (4×5 / 4×4 / 3×4). Never square cells.
2. Every cell **16:9 landscape** (target 1008×567). **Never square.**
3. Style = approved **M1** (green set, plants, wood floor).
4. Gutters **16px** (or thin white), border **16px**. Full body + mat in every cell (~6% pad).
5. No text, numbers, logos, watermarks.
6. Motion sheets: **camera lock** across frames of the same exercise.
7. After download: verify real `width×height` before slice; GIF default **900 ms per frame** (readable yoga tempo).

**Save downloads to:** `.temp/catalog-art/input/{SHEET}.png`  
Order: **M1 → M2 → M3 → E1 → E2 → E3 → E4**

---

## Shared STYLE block (same in every prompt)

```text
STYLE (locked — match approved M1 collage):
- Flat clean vector illustration, soft even light, NOT photoreal, NOT 3D
- ONE adult woman: black hair high bun, olive/sage-green sports bra + matching leggings
- Barefoot on dark green yoga mat, light wood floor, cream wall
- Small potted plant LEFT + small plant RIGHT in EVERY cell (same props)
- Soft contact shadow under body; consistent character scale across the whole collage
- No text, no UI, no logos, no watermarks
```

---

## Sheet M1 — motion 4×5 (4 frames × 5 exercises)

**Canvas: 4112 × 2939**  
**Grid: 4 cols × 5 rows** · cell **1008×567** · border/gutter **16**  
width=16+4×1008+3×16+16=**4112** · height=16+5×567+4×16+16=**2939**

```text
Create ONE image with EXACT canvas size 4112 × 2939 pixels.

GRID MATH (do not invent other sizes):
- Outer border: 16px all sides
- Columns: 4 | Rows: 5
- Each cell: 1008 × 567 pixels = exactly 16:9 landscape (NOT square)
- Gutters: 16px between columns and between rows
- Check width = 16 + 4*1008 + 3*16 + 16 = 4112
- Check height = 16 + 5*567 + 4*16 + 16 = 2939

Each ROW = one exercise, smooth 4-frame strip left→right (f1→f2→f3→f4).
Camera LOCK within each row: identical character scale, mat Y, floor line, plants; ONLY joints change. Full body + full mat; ~6% pad from cell edges. No sliding/hop/zoom.

STYLE (locked — match approved M1):
- Flat clean vector, soft light, NOT photoreal, NOT 3D
- ONE woman black high bun, olive/sage-green sports bra + leggings
- Barefoot, dark green mat, light wood floor, cream wall
- Plant LEFT + small plant RIGHT in EVERY cell
- No text, numbers, logos, watermarks

Row1 ex-mountain: 1 arms by sides → 2 arms mid-up → 3 arms overhead → 4 arms mid-down (loop)
Row2 ex-cat-cow: 1 full Cat → 2 neutral tabletop → 3 full Cow → 4 neutral tabletop
Row3 ex-child: 1 arms by sides → 2 arms slightly forward → 3 arms fully forward → 4 arms slightly forward
Row4 ex-thread-needle: 1 tabletop → 2 right arm threading → 3 full thread right / left up → 4 returning tabletop
Row5 ex-bird-dog: 1 tabletop → 2 start extend → 3 full opposite arm+leg → 4 return tabletop

Output exactly one collage 4112×2939; all 20 cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/M1.png`

---

## Sheet M2 — motion 4×4 (4 frames × 4 exercises)

**Canvas: 4112 × 2324**  
**Grid: 4 cols × 4 rows** · cell **1008×567** · border/gutter **16**  
height=16+4×567+3×16+16=**2324**

```text
Create ONE image with EXACT canvas size 4112 × 2324 pixels.

GRID MATH:
- Border 16px all sides; gutters 16px
- 4 columns × 4 rows
- Each cell 1008 × 567 (16:9 landscape, NOT square)
- width = 16+4*1008+3*16+16 = 4112
- height = 16+4*567+3*16+16 = 2324

Each ROW = one exercise, 4-frame strip f1→f2→f3→f4.
Camera LOCK within each row (same scale, mat Y, floor, plants). Full body + mat. No hop/slide/zoom.

STYLE: same as M1 — green set, bun, dark green mat, wood floor, cream wall, plants L/R, flat vector, no text.

Row1 ex-neck-rolls:
1 head neutral standing → 2 head tilt right start → 3 full ear-to-shoulder right → 4 back toward neutral

Row2 ex-shoulder-rolls:
1 shoulders relaxed → 2 shoulders lift → 3 peak roll back → 4 lower toward relaxed

Row3 ex-sun-a:
1 mountain arms up → 2 hinge start → 3 half fold → 4 full forward fold soft knees (same feet)

Row4 ex-rag-doll:
1 soft fold arms dangling → 2 deeper → 3 deepest hang → 4 slightly release (loop)

Output exactly one collage 4112×2324; all 16 cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/M2.png`

---

## Sheet M3 — motion 4×4 (4 frames × 4 exercises)

**Canvas: 4112 × 2324** (same as M2)

```text
Create ONE image with EXACT canvas size 4112 × 2324 pixels.

GRID MATH (same as M2):
- Border 16px; gutters 16px; 4 cols × 4 rows
- Each cell 1008 × 567 (16:9 landscape, NOT square)
- width 4112; height 2324

Each ROW = 4-frame motion strip. Camera LOCK per row. Full body + mat. No hop/slide.

STYLE: same as M1 — green outfit, bun, dark green mat, wood floor, cream wall, plants L/R, flat vector, no text.

Row1 ex-wrist-warmup:
1 hands interlaced palms front relaxed → 2 push forward → 3 max wrist stretch → 4 slightly release

Row2 ex-ankle-mobility:
1 stand on left, right foot lifted ankle neutral → 2 point → 3 flex → 4 neutral

Row3 ex-hip-circles:
1 hands on hips pelvis center → 2 shift right → 3 shift back → 4 shift left (circle keyframes, feet planted)

Row4 ex-dead-bug:
1 on back knees tabletop arms up → 2 start extend opposite → 3 full extend hover → 4 return tabletop

Output exactly one collage 4112×2324; all 16 cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/M3.png`

---

## Sheet E1 — stills 3×4 (12 static poses)

**Canvas: 3088 × 2324**  
**Grid: 3 cols × 4 rows** · cell **1008×567** · border/gutter **16**  
width=16+3×1008+2×16+16=**3088** · height=**2324**

```text
Create ONE image with EXACT canvas size 3088 × 2324 pixels.

GRID MATH:
- Border 16px; gutters 16px
- 3 columns × 4 rows
- Each cell 1008 × 567 (16:9 landscape, NOT square)
- width = 16+3*1008+2*16+16 = 3088
- height = 16+4*567+3*16+16 = 2324

Each cell = ONE static canonical pose (not a motion strip). Full body + full mat, ~6% pad. Same character scale across grid.

STYLE: same as M1 — green set, bun, dark green mat, wood floor, cream wall, plants L/R, flat vector, no text.

Row1:
1) ex-down-dog — inverted V, hands and feet on mat, hips high
2) ex-low-lunge — back knee down, front knee 90°, torso upright
3) ex-half-split — front leg straight heel on mat, hips back, fold over front leg

Row2:
4) ex-forward-fold — standing, soft knees, head heavy
5) ex-warrior-one — front knee bent, back leg straight, arms up
6) ex-warrior-two — wide stance, front knee bent, arms horizontal

Row3:
7) ex-triangle — wide stance, hand to shin/floor, other arm up
8) ex-side-angle — front knee bent, forearm on thigh or hand down, top arm overhead
9) ex-tree — balance, foot on inner thigh, hands prayer or up

Row4:
10) ex-chair — knees bent as if sitting, arms up
11) ex-plank — high plank straight body on hands and toes
12) ex-side-plank — on one hand, body line, top arm up

Output exactly one collage 3088×2324; all 12 cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/E1.png`

---

## Sheet E2 — stills 3×4

**Canvas: 3088 × 2324** (same as E1)

```text
Create ONE image with EXACT canvas size 3088 × 2324 pixels.

GRID MATH: border 16; gutters 16; 3×4; each cell 1008×567 (16:9 NOT square); width 3088; height 2324.
One static pose per cell. Full body + mat. Same character scale.

STYLE: same as M1 — green set, bun, dark green mat, wood floor, cream wall, plants L/R, flat vector, no text.

Row1:
1) ex-boat — sit bones, legs lifted, arms forward
2) ex-bridge — on back, hips lifted, feet planted
3) ex-sphinx — on belly, BOTH FOREARMS flat on mat, low chest lift (NOT straight-arm cobra)

Row2:
4) ex-cobra — hands under shoulders, elbows soft, chest higher than sphinx
5) ex-locust — on belly, chest and legs lifted, arms by sides
6) ex-puppy — knees under hips, arms long forward, chest melting, hips high

Row3:
7) ex-pigeon — front shin on mat, back leg extended
8) ex-lizard — low lunge, hands inside front foot
9) ex-butterfly — seated soles together, knees open, tall spine

Row4:
10) ex-seated-fold — legs extended, torso folds over
11) ex-seated-twist — seated spinal twist
12) ex-supine-twist — ON BACK, both knees stacked to one side, arms in T

Output exactly one collage 3088×2324; all cells 16:9. Sphinx must show forearms on floor.
```

Save: `.temp/catalog-art/input/E2.png`

---

## Sheet E3 — stills 3×4

**Canvas: 3088 × 2324**

```text
Create ONE image with EXACT canvas size 3088 × 2324 pixels.

GRID MATH: border 16; gutters 16; 3×4; each cell 1008×567 (16:9 NOT square); width 3088; height 2324.
One static pose per cell. Full body + mat.

STYLE: same as M1 — green set, bun, dark green mat, wood floor, cream wall, plants L/R, flat vector, no text.

Row1:
1) ex-happy-baby — on back, hold outer feet, knees open
2) ex-legs-wall — on back, legs vertical up
3) ex-savasana — fully supine, arms relaxed palms up

Row2:
4) ex-box-breath — easy cross-legged meditation seat, hands on knees
5) ex-long-exhale — same seat, softer shoulders (same framing as box-breath)
6) ex-crocodile — prone, forehead on stacked hands

Row3:
7) ex-tabletop-balance — all fours, one arm OR one leg slightly lifted
8) ex-knee-hugs — on back, hug both knees to chest
9) ex-reclined-hamstring — on back, one leg extended up held gently

Row4:
10) ex-figure-four — on back, ankle on opposite knee
11) ex-calf-stretch — standing, back heel down
12) ex-eagle-arms — standing, arms wrapped elbows stacked

Output exactly one collage 3088×2324; all cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/E3.png`

---

## Sheet E4 — stills 3×4

**Canvas: 3088 × 2324**

```text
Create ONE image with EXACT canvas size 3088 × 2324 pixels.

GRID MATH: border 16; gutters 16; 3×4; each cell 1008×567 (16:9 NOT square); width 3088; height 2324.
One static pose per cell. Full body + mat (except empty cell).

STYLE: same as M1 — green set, bun, dark green mat, wood floor, cream wall, plants L/R, flat vector, no text.

Row1:
1) ex-garland — Malasana squat, hands in prayer
2) ex-wide-fold — feet wide, torso folds
3) ex-half-moon — balance on one hand and foot, other limbs lifted

Row2:
4) ex-dancer-prep — standing, hold one foot behind, other arm forward
5) ex-crescent — high lunge, back knee off floor, arms up
6) ex-humble-warrior — warrior stance, torso folded, hands clasped behind

Row3:
7) ex-prasarita — wide-legged forward fold (canonical)
8) ex-forearm-plank — elbows under shoulders, body straight
9) ex-dolphin — forearms down, hips up inverted V

Row4:
10) ex-side-bend — seated, one arm overhead, lean sideways
11) ex-meditation-seat — easy cross-legged, tall spine
12) EMPTY — solid cream wall color only, no character, no mat (placeholder cell)

Output exactly one collage 3088×2324; all non-empty cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/E4.png`

---

## After download

| File | Contents |
|------|----------|
| `M1.png` | 5 exercises × 4 frames → GIF |
| `M2.png` | neck, shoulders, sun-a, rag-doll × 4 frames → GIF |
| `M3.png` | wrists, ankles, hips, dead-bug × 4 frames → GIF |
| `E1–E4.png` | static poses → webp |

Agent: gutter-aware slice + multi-frame GIF assembly. Say **«M1 done»** / **«E1 done»** etc.
