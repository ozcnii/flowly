# Paste prompts — Flowly workout / program covers

**Production covers in `apps/web/public/media/catalog/covers/*.webp` are photoreal editorial wellness photos, 1:1 square (~640–1024).**  
Title text is drawn by the app UI — **never bake Russian/English titles into the image**.

> Historical note: older sections of this file described **flat-vector collages (C1/C2)**. Those were **not** used for current production covers. Do not use vector C1/C2 for new covers unless product explicitly switches style.

---

## Canonical STYLE (production — user-approved original)

Paste this block as the base for every new cover. Change only the **Subject** line (pose + mood + optional program/workout name for the model’s intent; name is **not** painted on the image).

```text
Создай одно фотореалистичное editorial wellness-фото для квадратной обложки программы «{NAME}» в мобильном приложении Flowly. Строго квадратная композиция 1:1. Взрослая женщина 25–40 лет {POSE_AND_COMPOSITION}; приглушённый шалфейный спортивный топ, нейтральная одежда. Светлая минималистичная студия в тёплых ivory и sage тонах, мягкий естественный утренний свет, сбоку одна лаконичная ветвь или растение в керамической вазе. Премиальная реалистичная wellness-фотография как в журнальной съёмке, чистый выразительный силуэт, который хорошо читается в маленькой карточке. Естественная анатомия. Без текста, букв, цифр, логотипов, водяных знаков, рамок и элементов интерфейса. Не добавляй других людей, зеркала или лишние конечности.
```

### Locked DNA (checklist before accept)

| Spec | Value |
|------|--------|
| Aspect | **1:1 square** (prefer 1024×1024, then we compress to webp ~640) |
| Style | Photoreal editorial wellness — **not** flat vector, not cartoon, not 3D |
| Person | One adult woman 25–40 |
| Outfit | Muted sage sports top, neutral bottoms |
| Set | Light minimal studio, warm ivory + sage, soft morning light |
| Prop | One simple plant/branch in ceramic vase (side) |
| Readability | Clear silhouette for small mobile card |
| Forbidden | Text, letters, numbers, logos, watermarks, frames, UI; other people; mirrors; extra limbs |

### After download

```text
.temp/catalog-art/input/{workoutId}.png   # or .jpg from ChatGPT
```

Tell agent «cover {id} done» →  
`apps/web/public/media/catalog/covers/{workoutId}.webp`

---

## Original reference (program «Гибкая спина»)

Exact prompt that matched the Home program photo style:

```text
Создай одно фотореалистичное editorial wellness-фото для квадратной обложки программы «Гибкая спина» в мобильном приложении Flowly. Строго квадратная композиция 1:1. Взрослая женщина 25–40 лет сидит на коврике со скрещёнными ногами, вид со спины, спокойная ровная естественная осанка; приглушённый шалфейный спортивный топ, нейтральная одежда. Светлая минималистичная студия в тёплых ivory и sage тонах, мягкий естественный утренний свет, сбоку одна лаконичная ветвь или растение в керамической вазе. Премиальная реалистичная wellness-фотография как в журнальной съёмке, чистый выразительный силуэт, который хорошо читается в маленькой карточке. Естественная анатомия. Без текста, букв, цифр, логотипов, водяных знаков, рамок и элементов интерфейса. Не добавляй других людей, зеркала или лишние конечности.
```

---

## Ready paste — missing workout covers (2026-07-19)

### wo-twists-15 — «Скручивания 15 минут»

```text
Создай одно фотореалистичное editorial wellness-фото для квадратной обложки программы «Скручивания 15 минут» в мобильном приложении Flowly. Строго квадратная композиция 1:1. Взрослая женщина 25–40 лет сидит или полулежит на коврике в спокойном скручивании позвоночника (seated or reclined spinal twist), корпус мягко развёрнут, руки помогают скрутке, лицо в профиль или скрыто; приглушённый шалфейный спортивный топ, нейтральная одежда. Светлая минималистичная студия в тёплых ivory и sage тонах, мягкий естественный утренний свет, сбоку одна лаконичная ветвь или растение в керамической вазе. Премиальная реалистичная wellness-фотография как в журнальной съёмке, чистый выразительный силуэт, который хорошо читается в маленькой карточке. Естественная анатомия. Без текста, букв, цифр, логотипов, водяных знаков, рамок и элементов интерфейса. Не добавляй других людей, зеркала или лишние конечности.
```

Save: `.temp/catalog-art/input/wo-twists-15.png`

### wo-standing-18 — «Стоячая практика»

```text
Создай одно фотореалистичное editorial wellness-фото для квадратной обложки программы «Стоячая практика» в мобильном приложении Flowly. Строго квадратная композиция 1:1. Взрослая женщина 25–40 лет стоит на коврике в сильной спокойной стоячей позе (воин или гора с руками вверх / upward salute), полный или 3/4 рост, устойчивая осанка; приглушённый шалфейный спортивный топ, нейтральная одежда. Светлая минималистичная студия в тёплых ivory и sage тонах, мягкий естественный утренний свет, сбоку одна лаконичная ветвь или растение в керамической вазе. Премиальная реалистичная wellness-фотография как в журнальной съёмке, чистый выразительный силуэт, который хорошо читается в маленькой карточке. Естественная анатомия. Без текста, букв, цифр, логотипов, водяных знаков, рамок и элементов интерфейса. Не добавляй других людей, зеркала или лишние конечности.
```

Save: `.temp/catalog-art/input/wo-standing-18.png`

---

## Program covers (E3-D4-T01) — 6 system tracks

**Aspect for program cards: 16:9** (cards use `aspect-video`). Workout covers may stay 1:1; program heroes are landscape.

Output path: `apps/web/public/media/programs/{programId}.webp` (~960×540 webp).  
Seed `cover_object_key`: `programs/{programId}.webp`.

| id | Program | Pose intent (must read at card size) |
|----|---------|--------------------------------------|
| `pr-soft-start-7` | Мягкий старт | easy seated, soft welcoming beginner energy |
| `pr-back-care-7` | Гибкая спина | spinal twist / cat-cow — **back/spine readable** |
| `pr-evening-unwind-7` | Вечернее заземление | restorative recline / evening fold |
| `pr-morning-rhythm-14` | Утренний ритм | standing arms up, bright morning energy |
| `pr-mobility-14` | Мобильность всего тела | hip opener / side stretch, mobility |
| `pr-full-body-30` | Полный ритм · 30 дней | warrior / strong full-body balance |

Use photoreal ivory/sage studio DNA; **no text on image**. Pose must match program theme.

---

## Historical — unused flat-vector collage path (do not use for production covers)

<details>
<summary>C1/C2 vector collages (superseded by photoreal square covers)</summary>

These prompts targeted flat vector M1 style and 16:9 collage grids. **Not** the current production look.

- Sheet C1: 4112×1741, 4×3 cells of 1008×567  
- Sheet C2: 4112×1182, 4×2  

See git history before 2026-07-19 if needed.

</details>
