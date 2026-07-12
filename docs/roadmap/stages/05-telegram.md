# Этап 5 — Telegram

> PRD: §25–27, §36–37, §43.22, §43.31, §44.14, §45, §50.2–50.4, §52, §54 этап 5, §55.5.

## Цель

Доставлять идемпотентные Telegram-напоминания, обрабатывать быстрые действия и откладывание, соблюдать период тишины и исключать двойную отправку.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 8 | 0 | 0 | 0 | 0 |

## Зависимости и инварианты

- Зависит от occurrences/jobs этапов 3–4 и auth foundation.
- Пользователь сам подтверждает действия; после выполнения повторы прекращаются.
- `no_response` — отдельный результат; webhook updates и jobs идемпотентны.

## Deliverable E5-D6 — Telegram delivery pipeline

### E5-D6-T01 — Реализовать Telegram webhook
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §36.3–36.4, §43.31, §44.14, §47.1 · **depends_on:** E1-D1-T03, E1-D1-T06
- **scope:** endpoint, проверка секрета, безопасный parsing и журнал update IDs.
- **acceptance:** [ ] неверный secret отклоняется; [ ] update принимается один раз; [ ] повторная доставка безопасна; [ ] ошибки не раскрывают секреты.
- **validation/evidence:** canonical HTTP requests для valid/invalid/duplicate update.

### E5-D6-T02 — Реализовать сообщения и callback actions
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §25.1–25.4, §36.1–36.2, §55.5 · **depends_on:** E5-D6-T01, E4-D5-T05
- **scope:** сообщения привычки/йоги и действия «Готово», «Уже выполнено».
- **acceptance:** [ ] callback связан с occurrence/user; [ ] повторное нажатие безопасно; [ ] completion останавливает повторы.
- **validation/evidence:** callback sequences и persisted status history.

### E5-D6-T03 — Реализовать snooze, skip и rest
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §25.5–25.7, §26 · **depends_on:** E5-D6-T02
- **scope:** готовое/произвольное откладывание, «Сегодня пропущу», «Сегодня отдыхаю» по разрешённым правилам.
- **acceptance:** [ ] snooze создаёт корректный job; [ ] skip/rest различаются; [ ] запрещённое действие недоступно; [ ] timezone соблюдён.
- **validation/evidence:** request/state matrix.

### E5-D6-T04 — Реализовать scheduler batch processing
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §41.4, §45.1–45.2, §45.5 · **depends_on:** E3-D4-T07, E4-D5-T07, E1-D1-T03
- **scope:** ежеминутный выбор due jobs, batch=50, отправка и обновление статусов.
- **acceptance:** [ ] выбираются только due jobs; [ ] batch limit соблюдён; [ ] параллельные запуски безопасны; [ ] backlog наблюдаем.
- **validation/evidence:** scheduler run logs и job transitions.

### E5-D6-T05 — Обеспечить идемпотентность и защиту от дублей
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §36.4, §43.22, §43.31, §45.3, §56.4 · **depends_on:** E5-D6-T01, E5-D6-T04
- **scope:** unique idempotency keys, locks/claims и повторная доставка webhook/scheduler.
- **acceptance:** [ ] повторные процессы не создают двойное сообщение; [ ] race outcome детерминирован; [ ] duplicate evidence сохраняется.
- **validation/evidence:** canonical concurrent/duplicate reproduction set.

### E5-D6-T06 — Реализовать retries и permanent errors
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §45.4, §52 · **depends_on:** E5-D6-T04 · **decisions:** DEC-007
- **scope:** retryable/permanent классификация, ограниченные попытки, logging/metrics.
- **acceptance:** [ ] permanent errors не зациклены; [ ] retry history видна; [ ] неизвестные лимиты остаются blocked до решения.
- **validation/evidence:** simulated error matrix и job history.

### E5-D6-T07 — Реализовать quiet hours, лимиты и no_response
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §24.5, §26.1, §37.2–37.3, §55.5 · **depends_on:** E5-D6-T03, E5-D6-T04
- **scope:** пользовательские настройки, перенос delivery из quiet period, global limits и отдельный `no_response`.
- **acceptance:** [ ] в quiet hours отправки нет; [ ] перенос не создаёт дублей; [ ] no_response не равен skip; [ ] timezone корректен.
- **validation/evidence:** boundary-time scenarios.

### E5-D6-T08 — Закрыть Telegram DoD и наблюдаемость
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50.2–50.4, §52, §55.5, применимая часть §55.9 · **depends_on:** E5-D6-T01–T07 · **decisions:** DEC-003
- **scope:** проверить полный reminder flow, mock journal, Cron и observability.
- **acceptance:** [ ] каждый пункт §55.5 имеет evidence; [ ] duplicate/retry/quiet cases проверены; [ ] scheduler диагностируем.
- **validation/evidence:** итоговый checklist, canonical requests и logs.

## Handoff этапа

Сохранять конкретные update/job/occurrence IDs, условия scheduler run, результаты повторного запуска и следующий запрос из canonical repro set.
