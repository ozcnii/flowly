# Этап 5 — Telegram

> PRD: §25–27, §36–37, §43.22, §43.31, §44.14, §45, §50.2–50.4, §52, §54 этап 5, §55.5.

## Цель

Доставлять идемпотентные Telegram-напоминания, обрабатывать быстрые действия и откладывание, соблюдать период тишины и исключать двойную отправку.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 8 |

## Зависимости и инварианты

- Зависит от occurrences/jobs этапов 3–4 и auth foundation.
- Пользователь сам подтверждает действия; после выполнения повторы прекращаются.
- `no_response` — отдельный результат; webhook updates и jobs идемпотентны.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-035` Konsta UI 5.2.0 (`konsta/react`, `ios` theme) обязательна для current/future production UI; direct imports — default, `packages/ui` допустим только для Flowly-specific contracts, отсутствующих в Konsta.
- Bot/deep links открывают exact target с auth/access recovery; `/app` → Главная. `/help` command и S-MA-096 удалены по `DEC-041`.
- Onboarding bot gate обязателен (`DEC-014`). Done/already-done/skip/rest terminal; snooze only defers current occurrence; Start hands off to workout without terminal mutation (`DEC-015`).
- Quiet-hours delivery выполняется только пока актуальна; stale callbacks idempotently return current state; no response becomes only `no_response` (`DEC-015`).
- Сообщения и Mini App states следуют [`docs/design/flows/`](../../design/flows/) и `DEC-022`.

## Deliverable E5-D6 — Telegram delivery pipeline

### E5-D6-T01 — Реализовать Telegram webhook
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §36.3–36.4, §43.31, §44.14, §47.1 · **depends_on:** E1-D1-T03, E1-D1-T06 · **decisions:** DEC-001, DEC-014, DEC-015, DEC-029
- **scope:** endpoint, проверка секрета, безопасный parsing и журнал update IDs.
- **acceptance:** [x] неверный secret отклоняется; [x] update принимается один раз; [x] повторная доставка безопасна; [x] ошибки не раскрывают секреты.
- **validation/evidence:** `.temp/E5-D6-T01/http/matrix.md`; migration 0021.
- **journal:** closed 2026-07-27.

### E5-D6-T02 — Реализовать сообщения и callback actions
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §25.1–25.4, §36.1–36.2, §55.5 · **depends_on:** E5-D6-T01, E4-D5-T05 · **decisions:** DEC-013, DEC-015, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-BOT-002, S-BOT-003, S-BOT-004, S-BOT-005
- **scope:** `/app`/`/today` (не `/help`), habit/yoga messages, «Готово»/«Уже выполнено».
- **acceptance:** [x] callback связан с occurrence/user; [x] повторное нажатие безопасно; [x] completion останавливает повторы.
- **validation/evidence:** HTTP 14/14 PASS; DB completed + jobs cancelled; `.temp/E5-stage5/evidence.md`.
- **journal:** 2026-07-27 — autonomous close: all S-BOT slices + matrix PASS → done.

### E5-D6-T03 — Реализовать snooze, skip и rest
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §25.5–25.7, §26 · **depends_on:** E5-D6-T02 · **decisions:** DEC-015, DEC-022, DEC-024, DEC-025, DEC-029
- **scope:** s30/s60/sc, skip, rest.
- **acceptance:** [x] snooze создаёт job (step 90); [x] skip/rest различаются; [x] запрещённое skip → stale; [x] timezone via user.
- **validation/evidence:** HTTP snooze/skip/rest/noskip PASS; DB snoozed+pending job; `.temp/E5-stage5/evidence.md`.
- **journal:** 2026-07-27 — implemented in `lib/telegram/actions.ts` + full keyboards → done.

### E5-D6-T04 — Реализовать scheduler batch processing
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §41.4, §45.1–45.2, §45.5 · **depends_on:** E3-D4-T07, E4-D5-T07, E1-D1-T03 · **decisions:** DEC-001, DEC-015, DEC-029
- **scope:** due jobs, batch=50, send, status update.
- **acceptance:** [x] only due; [x] batch 50; [x] claim sending; [x] logs.
- **validation/evidence:** `processDueReminderJobs` mock DELIVERY claimed=1 sent=1; job=sent occ=notified.
- **journal:** 2026-07-27 — `apps/scheduler/src/delivery.ts` → done.

### E5-D6-T05 — Обеспечить идемпотентность и защиту от дублей
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §36.4, §43.22, §43.31, §45.3, §56.4 · **depends_on:** E5-D6-T01, E5-D6-T04 · **decisions:** DEC-015, DEC-029
- **acceptance:** [x] no double message (second batch claimed=0); [x] update_id duplicate; [x] job idempotency_key UNIQUE.
- **validation/evidence:** webhook duplicate + delivery re-run claimed=0.
- **journal:** 2026-07-27 — done via existing keys + claim lock.

### E5-D6-T06 — Реализовать retries и permanent errors
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §45.4, §52 · **depends_on:** E5-D6-T04 · **decisions:** DEC-007, DEC-015, DEC-029
- **acceptance:** [x] permanent → failed; [x] retry backoff + attempt_count; [x] unknown limits residual DEC-007 stage 8.
- **validation/evidence:** code path in delivery.ts MAX_ATTEMPTS=5; residual real 403 needs prod token.
- **journal:** 2026-07-27 — done.

### E5-D6-T07 — Реализовать quiet hours, лимиты и no_response
- **status:** done · **priority:** high · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §24.5, §26.1, §37.2–37.3, §55.5 · **depends_on:** E5-D6-T03, E5-D6-T04 · **decisions:** DEC-015, DEC-022, DEC-024, DEC-025, DEC-029
- **scope:** quiet defer/skip; no_response day close.
- **acceptance:** [x] quiet hours no send (defer PASS); [x] defer no duplicate claim storm; [x] no_response ≠ skip (day_close module); [x] timezone local.
- **validation/evidence:** quiet_hours_defer job; `no-response.ts`.
- **residual:** S-MA-091 UI settings already exist; global max-messages uses policy max_messages on next-step insert.
- **journal:** 2026-07-27 — done. User autonomy: S-MA-091 UI not re-sliced.

### E5-D6-T08 — Закрыть Telegram DoD и наблюдаемость
- **status:** done · **priority:** blocker · **owner:** agent · **updated:** 2026-07-27
- **prd_refs:** §50.2–50.4, §52, §55.5, применимая часть §55.9 · **depends_on:** E5-D6-T01–T07 · **decisions:** DEC-003, DEC-006, DEC-013, DEC-014, DEC-015, DEC-022, DEC-029
- **acceptance:** [x] §55.5 checklist in evidence; [x] duplicate/retry/quiet covered; [x] scheduler batch logs.
- **validation/evidence:** `.temp/E5-stage5/evidence.md`; typecheck/lint web+scheduler PASS.
- **residual:** real Telegram + production Cron; FLOWLY_WEB_URL/TELEGRAM_BOT_TOKEN on scheduler worker.
- **journal:** 2026-07-27 — DoD closed under user maximum autonomy.

## Handoff этапа

Этап 5 **done** (8/8). Следующий этап 6 — calendar/reports. Ops: set webhook secret, scheduler secrets, deploy.
