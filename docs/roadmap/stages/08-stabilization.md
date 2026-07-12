# Этап 8 — Стабилизация

> PRD: §42, §47–53, §54 этап 8, §55.9, §56.

## Цель

Подтвердить надёжность Flowly v1.0, безопасность, backup/restore, наблюдаемость, производительность, каталог и production deployment.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 8 | 0 | 0 | 0 | 0 |

## Зависимости и границы

- Начинается после функциональных этапов, но применимые проверки выполняются по ходу (`DEC-003`).
- Этап не является местом для скрытого добавления нового product scope.
- Открытые operational decisions должны быть закрыты либо явно оставить карточку blocked.

## Deliverable E8-D9 — Production readiness

### E8-D9-T01 — Закрыть unit/integration verification matrix
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50.1–50.2, §55.9 · **depends_on:** этапы 1–7 · **decisions:** DEC-003
- **scope:** инвентаризировать выполненные проверки, закрыть явно запрошенные пользователем пробелы и сохранить evidence.
- **acceptance:** [ ] каждый обязательный сценарий §50.1–50.2 имеет результат; [ ] failures не скрыты; [ ] отложенные проверки согласованы.
- **validation/evidence:** verification matrix и команды с exit codes. Автотесты писать только по явному запросу пользователя.

### E8-D9-T02 — Закрыть E2E и Cron verification
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50.3–50.4, §55.9 · **depends_on:** E8-D9-T01
- **scope:** четыре E2E-потока PRD и проверка Cron через Wrangler в доступной среде.
- **acceptance:** [ ] каждый flow имеет воспроизводимый результат; [ ] Cron evidence сохранено; [ ] ограничения окружения указаны.
- **validation/evidence:** сценарии, screenshots/HTTP traces, команды. Автотесты — только по явному запросу.

### E8-D9-T03 — Реализовать backup, restore, export и deletion
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §47.3, §51, §55.9 · **depends_on:** E1-D1-T04, E1-D1-T05 · **decisions:** DEC-008
- **scope:** D1 export, R2 retention, test restore, user export и account deletion.
- **acceptance:** [ ] backup повторяем; [ ] restore фактически проверен; [ ] user data удаляются/экспортируются по PRD; [ ] schedule mechanism утверждён.
- **validation/evidence:** sanitized backup/restore logs и deletion inventory.

### E8-D9-T04 — Закрыть observability и owner alerts
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §52, §55.9 · **depends_on:** E5-D6-T08 · **decisions:** DEC-006
- **scope:** категории логов, метрики scheduler/delivery/errors/usage и технические уведомления владельца.
- **acceptance:** [ ] секреты/PII не логируются; [ ] ключевые сбои диагностируемы; [ ] thresholds утверждены; [ ] alerts проверены.
- **validation/evidence:** sample logs/metrics/alert delivery.

### E8-D9-T05 — Провести security и privacy validation
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §39, §47, §55.9, §56.5–56.6 · **depends_on:** этапы 1–7
- **scope:** auth, ownership, public links, uploads, secrets, deletion и health-content warnings.
- **acceptance:** [ ] применимые меры §47 подтверждены; [ ] permission matrix закрыта; [ ] production secrets отсутствуют в repo; [ ] риски записаны.
- **validation/evidence:** security checklist и concrete request results.

### E8-D9-T06 — Проверить performance и внешние квоты
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §42, §48, §56.1–56.2 · **depends_on:** этапы 1–7 · **decisions:** DEC-011
- **scope:** performance targets PRD, D1/R2/Workers usage и актуальная YouTube quota.
- **acceptance:** [ ] targets измерены на согласованной среде; [ ] актуальные official limits задокументированы; [ ] bottlenecks и capacity risks записаны.
- **validation/evidence:** measurements и ссылки на официальные источники с датой.

### E8-D9-T07 — Завершить проверенный стартовый каталог
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §53, §55.2, §56.2–56.3 · **depends_on:** E2-D2-T01 · **decisions:** DEC-010
- **scope:** утверждённый объём категорий, тренировок, упражнений, media и программ.
- **acceptance:** [ ] объём/критерии подтверждены пользователем; [ ] каждая запись прошла согласованный checklist; [ ] import reproducible.
- **validation/evidence:** catalog inventory и editorial evidence.

### E8-D9-T08 — Production deployment и финальный DoD v1.0
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §49, §54, §55, §56 · **depends_on:** E8-D9-T01–T07
- **scope:** deploy, smoke verification, полный checklist §55 и release handoff.
- **acceptance:** [ ] все пункты §55 подтверждены либо релиз заблокирован; [ ] rollback/runbook доступны; [ ] migrations применены; [ ] monitoring активен; [ ] residual risks приняты пользователем.
- **validation/evidence:** deploy logs, smoke results, финальная traceability matrix.

## Handoff этапа

Фиксировать environment/commit, release candidate, команды и exit codes, ссылки на evidence, открытые риски и точное rollback/next action.
