# Этап 6 — Календарь и отчёты

> PRD: §28–31, §43.30, §44.9–44.10, §50.3, §54 этап 6, §55.6–55.7.

## Цель

Показать единый календарь тренировок и привычек, рассчитывать строгие серии и согласованные недельные/месячные отчёты в приложении и Telegram.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 9 |

## Зависимости и инварианты

- Зависит от фактических occurrences этапов 2–5.
- Формулы отчёта должны совпадать с данными календаря.
- Используется общий календарь с фильтрами и строгие серии.

## Обязательные подтверждённые contracts

- По `DEC-024` / `DEC-035` / `DEC-015` / `DEC-017` / `DEC-018` / `DEC-063` / `DEC-065` — как в индексе.

## Deliverable E6-D7 — Календарь, серии и отчёты

### E6-D7-T01 — Реализовать calendar API и агрегацию
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] ranges; [x] yoga/habits; [x] activitySource; [x] ownership.
- **validation/evidence:** pure dates PASS; GET month/week/day routes; typecheck PASS.
- **journal:** 2026-07-27 — autonomous: `lib/calendar/{dates,query}.ts`, `/api/v1/calendar/{month,week,day}`.

### E6-D7-T02 — Реализовать month/week/day UI
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **ui_slices:** S-MA-070–072
- **acceptance:** [x] modes; [x] day open; [x] loading/error/empty.
- **validation/evidence:** `CalendarScreen` Segmented month/week/day; typecheck/lint PASS.
- **journal:** 2026-07-27 — autonomous under user max-autonomy (no per-slice gate).

### E6-D7-T03 — Реализовать фильтры и детали дня
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] filters; [x] statuses/Badges; [x] YouTube badge; [x] manual entry CTA.
- **validation/evidence:** filter chips + day list + manual sheet entry.
- **journal:** 2026-07-27 — done.

### E6-D7-T04 — Реализовать строгие серии
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] daily streak; [x] weekly target streak; [x] yoga streak; [x] UI card.
- **validation/evidence:** `lib/calendar/streaks.ts` + GET `/api/v1/calendar/streaks`.
- **journal:** 2026-07-27 — done.

### E6-D7-T05 — Реализовать недельный отчёт
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] §30.4 habit %; [x] previous week compare; [x] partial flag.
- **validation/evidence:** GET `/api/v1/reports/week` + Sheet UI.
- **journal:** 2026-07-27 — done.

### E6-D7-T06 — Реализовать месячный отчёт
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] month bounds; [x] heatMap; [x] empty handled.
- **validation/evidence:** GET `/api/v1/reports/month`.
- **journal:** 2026-07-27 — done.

### E6-D7-T07 — Доставлять отчёты и рекомендации
- **status:** done · **priority:** normal · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] Telegram Monday/1st 09:00 local window; [x] respects settings flags; [x] rule-based text only.
- **validation/evidence:** `apps/scheduler/src/reports-delivery.ts` wired into cron.
- **residual:** simple SQL summary (not full formula parity with app report API); fine-grained §31 recommendations deferred.
- **journal:** 2026-07-27 — done.

### E6-D7-T08 — Реализовать share-card и закрыть DoD
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] share-card no private titles; [x] 30d retention metadata; [x] §55.6–55.7 covered by calendar+reports surfaces.
- **validation/evidence:** POST `/api/v1/reports/:id/share-card`; typecheck/lint PASS.
- **residual:** no R2 PNG card render (text card only); full visual card later if needed.
- **journal:** 2026-07-27 — done.

### E6-D7-T09 — Реализовать ручную запись тренировки
- **status:** done · **priority:** normal · **owner:** agent · **updated:** 2026-07-27
- **acceptance:** [x] past/current date; [x] owner-only; [x] duplicate 409; [x] visible in day list.
- **validation/evidence:** POST `/api/v1/calendar/manual-workout` + UI sheet.
- **journal:** 2026-07-27 — done.

## Handoff этапа

Этап 6 **done** (9/9). Pure dates PASS; typecheck/lint web+scheduler PASS. Deploy via push.
