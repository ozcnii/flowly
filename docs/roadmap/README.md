# Flowly v1.0 — roadmap и kanban index

> Обновлено: 2026-07-13 · Источник требований: [`../PRD.md`](../PRD.md)

Этот каталог — переносимая project board. Подробный статус хранится в карточках этапов; данный файл содержит только общий обзор и ссылки.

## Текущий фокус

- **Активный этап:** 1. Основа
- **Активная задача:** E1-D1-T05 (R2 storage) — следующая foundation-инфра.
- **Следующее действие:** T07 (envs) → review; далее T08 (seeds) → T09 (DoD gate) → T10 (profile).
- **UI workflow:** один screen slice + все применимые states/интеракции + явный approval (`DEC-024`)
- **Блокеры:** открытые решения перечислены в [`DECISIONS.md`](DECISIONS.md)
- **Контекст продолжения:** [`HANDOFF.md`](HANDOFF.md)

## Общая доска

| Этап | Статус | Backlog | In progress | Blocked | Review | Done | Файл |
|---|---|---:|---:|---:|---:|---:|---|
| 0. UX/UI-контракты | done | 0 | 0 | 0 | 0 | 5 | [`00-design.md`](stages/00-design.md) |
| 1. Основа | in progress | 3 | 0 | 0 | 1 | 7 | [`01-foundation.md`](stages/01-foundation.md) |
| 2. Йога | backlog | 10 | 0 | 0 | 0 | 0 | [`02-yoga.md`](stages/02-yoga.md) |
| 3. Программы | backlog | 7 | 0 | 0 | 0 | 0 | [`03-programs.md`](stages/03-programs.md) |
| 4. Мой ритм | backlog | 8 | 0 | 0 | 0 | 0 | [`04-my-rhythm.md`](stages/04-my-rhythm.md) |
| 5. Telegram | backlog | 8 | 0 | 0 | 0 | 0 | [`05-telegram.md`](stages/05-telegram.md) |
| 6. Календарь и отчёты | backlog | 8 | 0 | 0 | 0 | 0 | [`06-calendar-reports.md`](stages/06-calendar-reports.md) |
| 7. Социальные функции | backlog | 7 | 0 | 0 | 0 | 0 | [`07-social.md`](stages/07-social.md) |
| 8. Стабилизация | backlog | 8 | 0 | 0 | 0 | 0 | [`08-stabilization.md`](stages/08-stabilization.md) |

**Итого:** 59 backlog / 0 in progress / 0 blocked / 1 review / 12 done.

## Зависимости этапов

```text
T00–T03: flows + wireframes + UI-kit requirements/reference
E1-D1-T01: npm workspaces
  └── E1-D1-T02: Next.js shell
        └── E1-D1-T11: approved production UI-kit
              └── E0-D0-T04: Главная S-MA-010 + states + approval
              └── следующие screen slices внутри применимых feature cards
Этап 2: каталог + тренировки ── Этап 3: программы + program jobs
Этап 4: привычки + occurrences ── Этап 5: Telegram ── Этап 6: calendar/reports
Этапы 2–4 + permissions ── Этап 7: sharing/social
Все этапы ── Этап 8: production readiness
```

## Зафиксированные границы этапов

- `DEC-012` superseded решением `DEC-024`: общего generated design package и единого pre-development approval больше нет.
- T00–T03 сохраняются как нормативные references; production UI создаётся вручную в `apps/web` по одному screen slice.
- Каждый screen slice включает применимые states/интеракции и требует явного approval до начала следующего; bootstrap E1-D1-T01/T02 разрешён заранее.
- `DEC-025`: production UI-kit `packages/ui` утверждён пользователем через `/ui-kit` 2026-07-13; product screens используют его public API.
- Этап 3 создаёт модель программных напоминаний и jobs; end-to-end Telegram delivery закрывает этап 5.
- Одиночные программы закрываются этапом 3; совместные программы — этапом 7.
- Backend lifecycle `activity_occurrences` создаётся на этапах 3–4; calendar UI и агрегация — этапом 6.
- Минимальные проверки выполняются вместе с функциональностью; этап 8 закрывает полный набор проверок и production readiness.

## Наследование подтверждённых решений

- Поле `decisions` каждой карточки содержит обязательные решения и открытые блокеры именно для этой работы.
- Перед стартом карточки агент обязан прочитать связанные `DEC-*`; superseded-решение заменяется указанным successor.
- Для UI/UX-карточек обязательны stage-level «Обязательные подтверждённые contracts» и [`docs/design/flows/`](../design/flows/): 69 surfaces, F01–F11, state profiles и PRD traceability.
- `DEC-013`–`DEC-023` сохраняют продуктовые/визуальные contracts; `DEC-024` задаёт iterative production UI workflow; `DEC-025` — обязательный production UI-kit gate.
- Применимые UI-карточки содержат `ui_slices`, DEC-025 и используют public API `packages/ui`; следующий slice не начинается до явного approval текущего.

## Правила доски

- Статусы: `backlog`, `in_progress`, `blocked`, `review`, `done`.
- Одновременно агент ведёт одну активную задачу.
- Статус меняется только вместе с evidence и обновлением [`HANDOFF.md`](HANDOFF.md).
- `done` означает доказанное выполнение acceptance criteria, а не окончание написания кода.
- Нерешённые вопросы получают ID `DEC-*` в [`DECISIONS.md`](DECISIONS.md).
- Любой новый агент начинает с корневого [`AGENTS.md`](../../AGENTS.md), этого индекса и handoff.

## Definition of Ready

- [ ] Есть точные `prd_refs`.
- [ ] Результат задачи проверяем и ограничен.
- [ ] Указаны зависимости и решения.
- [ ] Нет незафиксированного продуктового/архитектурного выбора.
- [ ] Определены acceptance criteria и способ проверки.

## Definition of Done

- [ ] Все acceptance-пункты подтверждены evidence.
- [ ] Сохранены инварианты §8 и §57 PRD.
- [ ] Выполнены применимые проверки §50 и критерии §55.
- [ ] Проверены безопасность, ownership и privacy, где применимо.
- [ ] Обновлены downstream-зависимости и handoff.
- [ ] Остаточные риски записаны явно.
