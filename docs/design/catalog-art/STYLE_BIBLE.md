# Flowly catalog art — style bible (deterministic)

**Version:** `flowly-catalog-art-v1`  
**Purpose:** one locked visual system for **all** exercise GIFs/stills and **all** Flowly workout covers.  
**Generator:** ChatGPT image (user account). **Not** ad-hoc agent `image_gen`.  
**Consumers:** `apps/web/public/media/catalog/exercises/*`, `apps/web/public/media/catalog/covers/*`.

If any instruction conflicts with this bible, **this file wins**.

---

## 1. Character DNA (must never change)

| Trait | Exact value |
|--------|-------------|
| Species | One adult woman, same person on every tile |
| Face | Soft rounded face, small nose, closed calm smile optional; **no** photoreal pores/skin texture |
| Hair | Black hair in a **high neat bun**, short soft fringe; same silhouette always |
| Body | Medium athletic build; simple geometric limbs (flat vector, not realistic muscle shading) |
| Outfit top | Fitted sports bra, fill `#B8B4C4` (lavender-gray), trim/edges `#A8D5C4` (mint) |
| Outfit bottom | High-waist leggings, fill `#B8B4C4`, side stripe/trim `#A8D5C4` |
| Skin | Flat warm peach `#F0C7A8` — no gradients beyond one soft shadow |
| Barefoot | Always barefoot on the mat |

**Forbidden:** second character, men, children, photoreal photo, 3D render, anime eyes, logos, watermarks, text, UI chrome, props except the mat (and covers: one optional plant silhouette only if listed).

---

## 2. Environment DNA

| Element | Exact value |
|---------|-------------|
| Background | Flat solid `#D8E8E0` (sage mint). Optional *very* soft floor horizon band `#CEE0D6` bottom 18% — same on all tiles |
| Yoga mat | Rectangle `#E8DDF0` (pale lilac), thin darker edge `#D4C4E8`; always fully visible under feet/body |
| Lighting | Flat studio illustration light from left-front; one soft contact shadow under body `#C5D4CC` only |
| Perspective | Orthographic-ish **side or 3/4 side** as specified per pose; camera height mid-body; **no** Dutch angle |

**Camera lock (critical for GIF):**  
For any two frames of the same exercise, **identical**: canvas crop, mat position, character scale, floor line Y, horizon, camera distance. Only joint angles / limb positions may change.

---

## 3. Tile / frame geometry

| Spec | Value |
|------|--------|
| Exercise cell aspect | **16:9** |
| Safe padding | Character + mat inside 8% inset from each edge |
| Full body | Always entire body + entire mat visible |
| No cropping | Head, hands, feet never cut by frame edge |

---

## 4. Motion / GIF rules

- Static poses (`mediaType: image` historically): **one** locked still cell is enough (we export webp or 1-frame gif later).
- Motion poses (need GIF): generate **exactly two** cells **A then B** side-by-side as one strip **or** two cells in fixed grid slots with same camera lock.
- Transition A→B must be a clear readable yoga movement (e.g. cat ↔ cow), **not** a random hop or scale zoom.
- **No** Ken Burns, zoom, pan, or character sliding on the mat between frames.

### Motion pair list (must be GIF)

| id | Frame A | Frame B |
|----|---------|---------|
| ex-mountain | Tadasana arms by sides | Tadasana arms overhead |
| ex-neck-rolls | seated/standing head neutral | head tilted gently to right (neck stretch) |
| ex-shoulder-rolls | shoulders neutral | shoulders rolled back/up peak |
| ex-cat-cow | Cat: spine rounded up, head tucked | Cow: belly down, gaze slightly up |
| ex-child | Child: arms by sides, hips on heels | Child: arms extended forward, hips on heels |
| ex-sun-a | Mountain arms up | Forward fold soft knees |
| ex-thread-needle | Right arm threaded under, left up | Left arm threaded under, right up |
| ex-wrist-warmup | hands interlaced palms out front | wrists flexed slightly further |
| ex-ankle-mobility | standing, right foot lifted ankle neutral | same pose, ankle flexed/pointed peak |
| ex-hip-circles | standing hands on hips, pelvis center | pelvis shifted to side (circle peak) |
| ex-bird-dog | tabletop neutral | opposite arm+leg extended |
| ex-dead-bug | back on mat, knees tabletop arms up | opposite arm+leg extended |
| ex-rag-doll | soft forward fold arms dangling | slightly deeper fold (same feet) |

All other exercises: single still cell (canonical pose).

---

## 5. Covers DNA (workout headers / catalog cards)

Same character + same outfit + same flat style as exercises.

| Spec | Value |
|------|--------|
| Aspect | **16:9** |
| Background | Same sage `#D8E8E0` (not photo interiors, not windows, not realistic rooms) |
| Composition | Character in a pose that matches the workout mood; mat visible; generous breathing room |
| Style | Flat vector only — **forbid** stock photo, soft-focus photography, realistic lighting blooms |
| Text | **Never** |

Cover list (Flowly only; not YouTube thumbnails):

| id | Mood / suggested pose cue |
|----|---------------------------|
| wo-morning-10 | Standing mountain or gentle stretch, morning calm |
| wo-back-soft-15 | Tabletop or child’s pose soft back |
| wo-stretch-evening-20 | Seated forward fold evening calm |
| wo-core-12 | Forearm plank or dead-bug |
| wo-hips-25 | Low lunge or pigeon |
| wo-balance-basic-15 | Tree pose |
| wo-shoulders-14 | Eagle arms or thread needle |
| wo-breath-calm-8 | Meditation seat |
| wo-energy-20 | Warrior II energetic but still flat vector |
| wo-lower-back-10 | Knees to chest or cat |
| wo-legs-stretch-18 | Half split or forward fold |
| wo-strength-flow-30 | Chair or plank |
| wo-restorative-25 | Savasana or legs up wall |
| wo-mobility-full-22 | Cat-cow mid |
| wo-posture-16 | Mountain or sphinx |
| wo-evening-sleep-12 | Child or savasana |
| wo-balance-flow-20 | Half moon or tree |
| wo-wrists-safe-13 | Standing arms free (no weight on wrists) |
| wo-deep-stretch-35 | Wide fold or pigeon |
| wo-step-test-short | Mountain arms up (test badge energy, still flat) |

---

## 6. Determinism checklist (before accepting a collage)

- [ ] One character only, bun + lavender/mint outfit  
- [ ] Background exactly sage flat (no photo room)  
- [ ] Mat lilac, full in frame  
- [ ] No text/logos  
- [ ] For GIF pairs: floor line and scale match  
- [ ] Grid cells equal size, equal gutters  
- [ ] Covers match exercise style (not photography)

---

## 7. File outputs (after slice)

```
apps/web/public/media/catalog/exercises/{id}.webp   # static
apps/web/public/media/catalog/exercises/{id}.gif    # motion (2 frames, loop)
apps/web/public/media/catalog/covers/{workoutId}.webp
```

See `README.md` for ChatGPT paste workflow + `scripts/slice-catalog-art.mjs`.
