# Paste prompts — Flowly workout covers

**Every cover cell is 16:9 landscape. Exact canvas sizes. Same style as M1 exercises — NOT stock photo.**

Order: **C1 → C2**  
Save: `.temp/catalog-art/input/C1.png`, `C2.png`

---

## Shared STYLE

```text
STYLE (locked — match M1 exercise art):
- Flat clean vector illustration, soft even light, NOT photoreal, NOT 3D, NOT stock photography
- ONE adult woman: black hair high bun, olive/sage-green sports bra + matching leggings
- Barefoot on dark green yoga mat, light wood floor, cream wall
- Optional small plants left/right for consistency with M1
- Full body preferred; mat visible; ~6% padding inside cell
- No text, no titles, no logos, no watermarks
```

---

## Sheet C1 — covers 4×3 (12 workouts)

**Canvas: 4112 × 1741**  
**Grid: 4 cols × 3 rows** · cell **1008×567** · border/gutter **16**  
width=16+4×1008+3×16+16=**4112** · height=16+3×567+2×16+16=**1741**

```text
Create ONE image with EXACT canvas size 4112 × 1741 pixels.

GRID MATH:
- Outer border: 16px all sides
- Columns: 4 | Rows: 3
- Each cell: 1008 × 567 pixels = exactly 16:9 landscape (NOT square)
- Gutters: 16px between columns and rows
- Check width = 16+4*1008+3*16+16 = 4112
- Check height = 16+3*567+2*16+16 = 1741

One static cover illustration per cell (hero for catalog card). Full body + mat when possible. Same character scale across grid.

STYLE (locked — match M1 exercise art):
- Flat clean vector, soft light, NOT photoreal, NOT stock photo room
- ONE woman black high bun, olive/sage-green sportswear
- Barefoot, dark green mat, light wood floor, cream wall, optional plants L/R
- No text, numbers, logos, watermarks

Row1:
1) wo-morning-10 — calm mountain or soft standing stretch (morning energy, still flat vector)
2) wo-back-soft-15 — child’s pose or gentle tabletop (soft back)
3) wo-stretch-evening-20 — seated forward fold (evening calm)
4) wo-core-12 — forearm plank stable

Row2:
5) wo-hips-25 — low lunge or pigeon
6) wo-balance-basic-15 — tree pose
7) wo-shoulders-14 — eagle arms or thread-the-needle
8) wo-breath-calm-8 — meditation seat, peaceful

Row3:
9) wo-energy-20 — warrior II (energetic but flat vector)
10) wo-lower-back-10 — knees-to-chest or cat pose
11) wo-legs-stretch-18 — half splits
12) wo-strength-flow-30 — chair pose

Output exactly one collage 4112×1741; all 12 cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/C1.png`

---

## Sheet C2 — covers 4×2 (8 workouts)

**Canvas: 4112 × 1182**  
**Grid: 4 cols × 2 rows** · cell **1008×567** · border/gutter **16**  
height=16+2×567+1×16+16=**1182**

```text
Create ONE image with EXACT canvas size 4112 × 1182 pixels.

GRID MATH:
- Border 16px; gutters 16px
- 4 columns × 2 rows
- Each cell 1008 × 567 (16:9 landscape, NOT square)
- width = 4112
- height = 16+2*567+16+16 = 1182

One cover per cell. Full body + mat when possible. Same character scale.

STYLE: same as M1 / C1 — green set, bun, dark green mat, wood floor, cream wall, flat vector, NOT stock photo. No text.

Row1:
1) wo-restorative-25 — savasana or legs-up-the-wall
2) wo-mobility-full-22 — cat-cow mid pose
3) wo-posture-16 — mountain or sphinx (forearms on mat if sphinx)
4) wo-evening-sleep-12 — child pose or savasana

Row2:
5) wo-balance-flow-20 — tree or half moon
6) wo-wrists-safe-13 — standing, arms free, no weight on hands
7) wo-deep-stretch-35 — wide-legged fold or deep pigeon
8) wo-step-test-short — mountain arms up (test workout cover; still flat vector)

Output exactly one collage 4112×1182; all 8 cells 16:9 landscape.
```

Save: `.temp/catalog-art/input/C2.png`

---

## After download

Agent slices → `apps/web/public/media/catalog/covers/{id}.webp`  
Replaces photo-style headers with M1-consistent art.
