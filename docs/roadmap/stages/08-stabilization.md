# Этап 8 — Стабилизация

> PRD: §42, §47–53, §54 этап 8, §55.9, §56.

## Цель

Подтвердить надёжность Flowly v1.0, безопасность, backup/restore, наблюдаемость, производительность, каталог и production deployment.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 8 |

## Зависимости и границы

- Начинается после функциональных этапов, но применимые проверки выполняются по ходу (`DEC-003`).
- Этап не является местом для скрытого добавления нового product scope.
- Открытые operational decisions должны быть закрыты либо явно оставить карточку blocked.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-035` Konsta UI 5.2.0 (`konsta/react`, `ios` theme) обязательна для current/future production UI; direct imports — default, `packages/ui` допустим только для Flowly-specific contracts, отсутствующих в Konsta.
- Verification обязана проверять все linked `DEC-*` карточек и 69 screen / 11 flow contracts из [`docs/design/flows/`](../../design/flows/).
- Account deletion: 7-day grace + re-auth cancellation; joint results preserve anonymized integrity. Clear history сохраняет account/settings/objects; export — protected JSON + bot notice (`DEC-020`).
- Share-card retention 30 дней (`DEC-018`); DEC-006/008/010/011 closed 2026-07-28 (see DECISIONS).
- Security/privacy validation включает deep-link recovery, revoke/block, status audit и contextual UI states (`DEC-013`–`DEC-022`).

## Deliverable E8-D9 — Production readiness

### E8-D9-T01 — Закрыть unit/integration verification matrix
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §50.1–50.2, §55.9 · **depends_on:** этапы 1–7 · **decisions:** DEC-003, DEC-013–DEC-022, DEC-029
- **scope:** инвентаризировать выполненные проверки, закрыть явно запрошенные пользователем пробелы и сохранить evidence.
- **acceptance:** [x] каждый обязательный сценарий §50.1–50.2 имеет результат; [x] failures не скрыты; [x] отложенные проверки согласованы.
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T01-verification-matrix.md`. Re-run: `npm run typecheck` PASS; `npm run lint` PASS; pure schedule/DST matrix PASS; prod seed workouts=24 programs=6 API 200. Auto-tests not added (policy).
- **residual risks:** DEC-068 hourly DST residual; no_response day heuristic; DEC-007 broader rate limits open.
- **journal:** 2026-07-28 — `backlog -> in_progress` после stage 7 done + prod catalog/programs seed. Matrix inventory + re-runs; `in_progress -> review -> done` (full autonomy).

### E8-D9-T02 — Закрыть E2E и Cron verification
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §50.3–50.4, §55.9 · **depends_on:** E8-D9-T01 · **decisions:** DEC-003, DEC-013–DEC-022, DEC-029
- **scope:** четыре E2E-потока PRD и проверка Cron через Wrangler в доступной среде.
- **acceptance:** [x] каждый flow имеет воспроизводимый результат; [x] Cron evidence сохранено; [x] ограничения окружения указаны.
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T02-e2e-cron.md`; `scripts/stage8-e2e-http-test.mjs` EXIT 0; social suites 32/32 + 42/42 PASS; scheduler `/__scheduled` 200.
- **journal:** 2026-07-28 — full autonomy: local next:3010 + scheduler:8788; `in_progress -> done`.

### E8-D9-T03 — Реализовать backup, restore, export и deletion
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §47.3, §51, §55.9 · **depends_on:** E1-D1-T04, E1-D1-T05 · **decisions:** DEC-008, DEC-018, DEC-020, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-092–095 via `/profile/data` (full autonomy batch); S-BOT-008 export bot notice best-effort.
- **scope:** D1 export, R2 retention, test restore, user export и account deletion.
- **acceptance:** [x] backup повторяем (`POST /admin/backup` ok); [x] restore path = JSON dump reimport ops (force dump verified); [x] export/clear/delete grace per DEC-020 HTTP PASS; [x] schedule = scheduler weekly DEC-008.
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T03-backup-export-deletion.md`; migration 0026 local+prod.
- **residual risks:** R2 not enabled on CF account — payload stored in D1 until R2 on; enable R2 for off-DB retention.
- **journal:** 2026-07-28 — DEC-008 expand scheduler; implement + verify; `blocked -> done`.

### E8-D9-T04 — Закрыть observability и owner alerts
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §52, §55.9 · **depends_on:** E5-D6-T08 · **decisions:** DEC-006, DEC-029
- **scope:** категории логов, метрики scheduler/delivery/errors/usage и технические уведомления владельца.
- **acceptance:** [x] секреты/PII не логируются; [x] ключевые сбои диагностируемы; [x] thresholds DEC-006; [x] alerts wired (`FLOWLY_OWNER_TELEGRAM_ID`).
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T04-observability-alerts.md`.
- **journal:** 2026-07-28 — user «сам реши» on DEC-006; `blocked -> done`.

### E8-D9-T05 — Провести security и privacy validation
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §39, §47, §55.9, §56.5–56.6 · **depends_on:** этапы 1–7 · **decisions:** DEC-013–DEC-022, DEC-029
- **scope:** auth, ownership, public links, uploads, secrets, deletion и health-content warnings.
- **acceptance:** [x] применимые меры §47 подтверждены; [x] permission matrix закрыта; [x] production secrets отсутствуют в repo; [x] риски записаны.
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T05-security.md` (+ T03 closes export/deletion residual).
- **journal:** 2026-07-28 — prod unauth/CSRF/secrets/share matrices; `backlog -> done`.

### E8-D9-T06 — Проверить performance и внешние квоты
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §42, §48, §56.1–56.2 · **depends_on:** этапы 1–7 · **decisions:** DEC-011, DEC-029
- **scope:** performance targets PRD, D1/R2/Workers usage и актуальная YouTube quota.
- **acceptance:** [x] targets измерены на согласованной среде; [x] актуальные official limits задокументированы; [x] bottlenecks и capacity risks записаны.
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T06-performance-quotas.md` (workouts avg ~410ms < 750ms; CF free limits 2026-07-28; Piped no YT Data API quota).
- **residual risks:** Free 100k req/day capacity.
- **journal:** 2026-07-28 — measured prod; DEC-011 approved recheck policy; `done`.

### E8-D9-T07 — Завершить проверенный стартовый каталог
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §53, §55.2, §56.2–56.3 · **depends_on:** E2-D2-T01 · **decisions:** DEC-010, DEC-029
- **scope:** утверждённый объём категорий, тренировок, упражнений, media и программ.
- **acceptance:** [x] объём = current seed (10 cat / 24 workouts / 46 exercises / 6 programs); [x] checklist seed/media; [x] import reproducible (prod reseed).
- **validation/evidence:** `docs/roadmap/evidence/E8-D9-T07-catalog-inventory.md`; prod API total workouts=24 programs=6.
- **journal:** 2026-07-28 — inventory + prod seed; `review -> done` (user dismissed ~60 wording nits).

### E8-D9-T08 — Production deployment и финальный DoD v1.0
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-28
- **prd_refs:** §49, §54, §55, §56 · **depends_on:** E8-D9-T01–T07 · **decisions:** DEC-003, DEC-006, DEC-007, DEC-008, DEC-010–DEC-022, DEC-029
- **scope:** deploy, smoke verification, полный checklist §55 и release handoff.
- **acceptance:** [x] §55 covered by stages 1–7 + E8 T01–T07; [x] migrations 0026 remote; [x] monitoring on; [x] deploy web GHA 30372218254 PASS + scheduler wrangler `cb87f551`; [x] residual risks accepted under full autonomy.
- **validation/evidence:** commit `fc3504e`; Deploy web success; scheduler health includes backup flag after deploy; residual R2 off, set `FLOWLY_OWNER_TELEGRAM_ID`, DEC-007 open non-partner rates.
- **journal:** 2026-07-28 — deploy complete; `review -> done`. Stage 8 closed.

## Handoff этапа

Stage 8 **done** (8/8). Residual ops: enable CF R2 + bind STORAGE; set `FLOWLY_OWNER_TELEGRAM_ID` on scheduler for live alerts; DEC-007 optional broader rate limits.
