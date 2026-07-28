# E8-D9-T01 — Unit/integration verification matrix (§50.1–50.2)

> Updated: 2026-07-28 · Commit baseline: `main` after stage 7 (`879f2a3` family) · Env: local pure + monorepo checks; prod D1 seed + public API smoke

## Method

- **Inventory first:** map each PRD §50.1 / §50.2 item to stage evidence already executed on stages 1–7.
- **Re-run where cheap and deterministic:** `typecheck`, `lint`, pure schedule matrix (`packages/core`), production catalog/programs public API.
- **Do not invent formal unit-test suite** (card: auto-tests only on explicit user request). Stage HTTP/pure matrices count as results.
- **Failures not hidden:** blocked/deferred items listed with reason and owner stage/card.

---

## Current re-run (2026-07-28)

| Check | Command / action | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | **PASS** exit 0 (web, scheduler, core, database, storage, telegram, ui, youtube) |
| Lint | `npm run lint` | **PASS** exit 0, diagnostics 0 |
| Pure schedule + TZ/DST | `npx tsx` → `expandHabitSlots` / `localDateTimeToUtcIso` / `localDateInTimezone` | **PASS** (exact multi-time, weekdays, weekly_target, interval days/hours, old anchor, NY summer `09:00→13:00Z`, winter `09:00→14:00Z`, empty range) |
| Prod catalog seed | wrangler D1 remote `0002` (current SQL, not stale `.temp` batch) | **PASS** workouts=24, categories=10, exercises=46, links=56, we=124; orphan `wo-breath-calm-8` removed |
| Prod programs seed | wrangler D1 remote `seeds/0008_starter_programs.sql` | **PASS** programs=6, program_days=79 |
| Prod public API | `GET /api/v1/workouts` + `/api/v1/programs` on `flowly-web.getflowly.workers.dev` | **PASS** 200, `total=24` / `total=6` |
| Local social HTTP suite re-run | `scripts/*http-test.mjs` vs `localhost:3000` | **SKIPPED** — port 3000 is Docker/other process; `POST /api/v1/auth/telegram` → 500 (`null.split`); default suite port `3010` down. Historical stage-7 suite remains PASS (see below). |

---

## §50.1 Unit-level scenarios

| # | Scenario | Result | Evidence source |
|---|---|---|---|
| U01 | Расчёт расписания (4 types) | **PASS** (historical + re-run) | E4-D5-T07/T08 pure+HTTP; re-run pure 2026-07-28 |
| U02 | Несколько времён в день | **PASS** | E4-D5-T05 slot uniqueness; T08 multi-slot; pure multi=3 |
| U03 | Дни недели | **PASS** | pure weekdays Mon-only; T07/T08 HTTP weekdays |
| U04 | Недельная цель | **PASS** | pure weekly_target; T04/T07/T08 |
| U05 | Интервалы | **PASS** | pure interval days/hours + old anchor; T07/T08 |
| U06 | Часовые пояса | **PASS** | DEC-069 profile TZ; T07 HTTP UTC→America/New_York; pure LA date edge |
| U07 | Переход летнего времени | **PASS** (bounded) | pure NY summer/winter offset; residual: ambiguous/nonexistent hourly DST not expanded beyond DEC-068 |
| U08 | Откладывание (snooze) | **PASS** | E5-D6-T02/T03 HTTP s30/s60/sc; `.temp/E5-stage5/evidence.md` |
| U09 | Период тишины | **PASS** | E5-D6-T07 quiet_hours_defer; stage5 evidence |
| U10 | Строгие серии | **PASS** | E6-D7-T04 `lib/calendar/streaks.ts` + GET streaks |
| U11 | Программные дни отдыха | **PASS** | E3-D4 skip/rest day matrix; rest day → 400 not_workout |
| U12 | `no_response` | **PASS** (with residual) | E5-D6-T07 `closeNoResponseForYesterday`; residual: day heuristic not exact local midnight |
| U13 | Ручное исправление | **PASS** | E4-D5-T05 status_history + concurrent PATCH idempotency |
| U14 | Отчёты | **PASS** | E6-D7-T05/T06 week/month API + share-card T08 |
| U15 | Права доступа | **PASS** | ownership 404 matrices stages 2–7; habit-share stranger 404; friends edge 32/32 |
| U16 | Идемпотентность | **PASS** | occurrences PATCH; webhook update_id; job idempotency_key; invite claim; second delivery claimed=0 |

---

## §50.2 Integration scenarios

| # | Scenario | Result | Evidence source |
|---|---|---|---|
| I01 | D1 | **PASS** | migrations 0000–0025 local+remote; prod seed 2026-07-28; schema apply via deploy |
| I02 | Telegram webhook | **PASS** (prod wired) | E5 T01/T02; prod setWebhook + secret; residual: full real-device callback matrix not re-run this card |
| I03 | Telegram callback | **PASS** (local mock HTTP) | E5-D6-T02 14/14 matrix done/skip/rest/snooze/stale/dup |
| I04 | Scheduler | **PASS** (local/mock) | E5 T04 batch; habit generation cron; reports-delivery wired; residual: continuous prod cron observation → T02/T04 |
| I05 | R2 | **PASS** (scoped) | media/covers in public assets + storage package; full backup/export R2 → E8-D9-T03 |
| I06 | YouTube cache | **PASS** | E2-D2-T04 cache miss/hit; DEC-049 Piped prod miss/hit 12 |
| I07 | Приглашения | **PASS** | E7-D8-T01 friends-invite HTTP + auto-accept; DoD `E7-DoD-55.8.md` |
| I08 | Удаление доступа | **PASS** | E7-D8-T02 revoke/unfriend cascade + edge 32/32 |

---

## Gaps / deferred (explicit)

| Item | Status | Defer to | Notes |
|---|---|---|---|
| Dedicated Jest/Vitest unit suite files | **N/A by policy** | — | Coverage is pure `tsx` + HTTP matrices; formal unit suite only if user requests |
| Local re-run full social HTTP suite today | **DEFERRED** | ops / next session | Docker on :3000; auth 500; need clean `next dev` + `FLOWLY_DEV_EMULATION` on free port |
| Production Telegram live callback send matrix | **DEFERRED residual** | E8-D9-T02 / device | Mock/local PASS; real bot send partially proven earlier (outbound message_id) |
| DEC-007 rate-limit full product policy | **OPEN** | E8-D9-T05 / DEC | Partner remind 2h PASS; broader limits not product-closed |
| Account export/deletion integration | **OUT OF SCOPE T01** | E8-D9-T03 | Listed only so not confused with §50.2 |
| E2E four flows + Cron wrangler route | **OUT OF SCOPE T01** | E8-D9-T02 | §50.3–50.4 |
| Own-workout share | **N/A** | DEC-064 / E2-D3-T03 | Stage 7 DoD |

---

## Stage evidence index (canonical)

| Stage | Artifact |
|---|---|
| 4 Habits DoD | stage `04-my-rhythm.md` T07/T08 validation; pure+HTTP schedule |
| 5 Telegram | `.temp/E5-stage5/evidence.md` |
| 6 Calendar/reports | stage `06-calendar-reports.md` done summary |
| 7 Social | `docs/roadmap/evidence/E7-DoD-55.8.md`; `scripts/*http-test.mjs` |
| 8 T01 | this file |

Scripts (historical social suite, local):

- `scripts/friends-invite-http-test.mjs`
- `scripts/friends-edge-http-test.mjs`
- `scripts/habit-share-http-test.mjs`
- `scripts/challenges-http-test.mjs`
- `scripts/stage7-final-http-test.mjs`

---

## Acceptance checklist (T01)

- [x] каждый обязательный сценарий §50.1–50.2 имеет результат (PASS / PASS-bounded / DEFERRED with reason)
- [x] failures не скрыты (local suite skip, DST residual, no_response heuristic, DEC-007 open)
- [x] отложенные проверки согласованы в таблице Gaps (owner card named)

## Residual risks

1. Local HTTP suite not re-proven on this machine today.
2. Hourly DST ambiguous times still DEC-068 residual.
3. `no_response` uses “yesterday” cron heuristic.
4. Prod catalog was empty after wipe; seed restored 2026-07-28 — keep remote seed file in sync with `seeds/0002_starter_catalog.sql` (stale `.temp/deploy` batch was missing workouts).
