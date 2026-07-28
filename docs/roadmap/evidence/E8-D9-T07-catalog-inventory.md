# E8-D9-T07 — Starter catalog inventory

> 2026-07-28

## Volume (DEC-010)

| Entity | Target (DEC-010) | Seed source | Count |
|---|---|---|---:|
| Categories | ~10 | `seeds/0002_starter_catalog.sql` | **10** |
| Workouts | ~20 (+ YT seed) | same | **24** (21 flowly-ish + 3 youtube public seed) |
| Exercises | ~60 | same (unique ids) | **46** (note: DEC-010 said ~60; current seed 46 unique exercise ids — residual volume gap vs original wording) |
| Programs | stage 3 | `seeds/0008_starter_programs.sql` | **6** |
| Program days | — | same | **79** |

## Media assets

| Path | Files |
|---|---:|
| `apps/web/public/media/catalog/covers` | 22 |
| `apps/web/public/media/catalog/exercises` | 106 |
| `apps/web/public/media/programs` | 6 |

## Import reproducibility

| Step | Result |
|---|---|
| `catalog:build-seed` generator | exists `scripts/build-starter-catalog-sql.mjs` |
| Local seed scripts | `db:seed:catalog` / web programs file |
| Prod apply 2026-07-28 | remote D1 UPSERT catalog + programs; public API total workouts=24 programs=6 |
| Orphan cleanup | removed stale `wo-breath-calm-8` |

## Editorial checklist status

DEC-010 requires user quality checklist before catalog **product** done — already closed in E2-D2-T01 with user confirmation historically. T07 re-inventory:

| Criterion | Status |
|---|---|
| Title/description present | PASS (seed SQL) |
| Categories linked | PASS (links seeded) |
| Duration/format/difficulty | PASS fields in seed |
| Contraindications | PASS JSON arrays on workouts |
| YouTube IDs for YT rows | PASS 3 seeded videos |
| Covers | PASS webp keys + public media |
| Exercises linked | PASS workout_exercises |
| Import reproducible | PASS |

## Residual

1. Exercise unique count 46 vs historical “~60” wording — data as shipped in current seed, not expanded without product decision.
2. Full human editorial re-read of every description not re-performed this session; relies on stage-2 acceptance + reproducible import.
