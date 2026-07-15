# Flowly v1.0 — roadmap и kanban index

> Обновлено: 2026-07-15 · Источник требований: [`../PRD.md`](../PRD.md)

Этот каталог — переносимая project board. Подробный статус хранится в карточках этапов; данный файл содержит только общий обзор и ссылки.

## Текущий фокус

- **Активный этап:** 0. UX/UI-контракты (полная Konsta UI migration)
- **Активная задача:** E0-D0-T05 (Перевести весь production frontend на Konsta UI) — `in_progress`.
- **Следующее действие:** продолжить оставшиеся E0-D0-T05 surfaces и затем выполнить общий browser/state/safe-area matrix. Home review findings исправлены code-first; Tabbar использует official `Tabbar → ToolbarPane → TabbarLink` без custom visual CSS; onboarding S-MA-002–005 использует direct Konsta components, включая `Searchbar`, и больше не содержит CSS Modules/local visual wrappers. Home loading сохраняет approved Preloader-only DEC-038; DEC-039 удаляет с Home дату, categories и «Ещё для вас», не затрагивая catalog taxonomy; DEC-040 утверждает минимальный Home-only circular day progress exception и compact hierarchy из референса. Browser rerun последней cleanup-итерации отложен по явному указанию пользователя; static checks PASS.
- **Latest real-device scope:** DEC-046 removes Telegram avatar storage/proxy/rendering and D1 `photo_url`; DEC-047 owns fullscreen composed safe-area blur/title/actions geometry; Tabbar labels are 9px. Runtime commit `ce35676` deployed successfully in run 29395082940; real-device rerun pending.
- **UI workflow:** Konsta UI 5.2.0 + `ios` theme обязательны всегда (`DEC-035`); E0-D0-T05 — approved one-batch exception к per-screen approval `DEC-024`; обязательный frontend UI/UX quality pass по [`docs/design/FRONTEND_REVIEW.md`](../design/FRONTEND_REVIEW.md) сохраняется (`DEC-028`); client API calls только через `@tanstack/react-query` (`DEC-029`)
- **Блокеры:** открытые решения перечислены в [`DECISIONS.md`](DECISIONS.md)
- **Контекст продолжения:** [`HANDOFF.md`](HANDOFF.md)

## Общая доска

| Этап | Статус | Backlog | In progress | Blocked | Review | Done | Файл |
|---|---|---:|---:|---:|---:|---:|---|
| 0. UX/UI-контракты | in progress | 0 | 1 | 0 | 0 | 5 | [`00-design.md`](stages/00-design.md) |
| 1. Основа | done | 0 | 0 | 0 | 0 | 13 | [`01-foundation.md`](stages/01-foundation.md) |
| 2. Йога | backlog | 6 | 0 | 0 | 0 | 6 | [`02-yoga.md`](stages/02-yoga.md) |
| 3. Программы | backlog | 7 | 0 | 0 | 0 | 0 | [`03-programs.md`](stages/03-programs.md) |
| 4. Мой ритм | backlog | 8 | 0 | 0 | 0 | 0 | [`04-my-rhythm.md`](stages/04-my-rhythm.md) |
| 5. Telegram | backlog | 8 | 0 | 0 | 0 | 0 | [`05-telegram.md`](stages/05-telegram.md) |
| 6. Календарь и отчёты | backlog | 8 | 0 | 0 | 0 | 0 | [`06-calendar-reports.md`](stages/06-calendar-reports.md) |
| 7. Социальные функции | backlog | 7 | 0 | 0 | 0 | 0 | [`07-social.md`](stages/07-social.md) |
| 8. Стабилизация | backlog | 8 | 0 | 0 | 0 | 0 | [`08-stabilization.md`](stages/08-stabilization.md) |

**Итого:** 52 backlog / 1 in progress / 0 blocked / 0 review / 24 done.

## Зависимости этапов

```text
T00–T03: flows + wireframes + UI-kit requirements/reference
E1-D1-T01: npm workspaces
  └── E1-D1-T02: Next.js shell
        └── E1-D1-T11: historical custom production UI-kit
              └── E0-D0-T04: Главная S-MA-010 + states + approval
                    └── E0-D0-T05: full Konsta UI migration of current frontend
Этап 2: каталог + тренировки ── Этап 3: программы + program jobs
Этап 4: привычки + occurrences ── Этап 5: Telegram ── Этап 6: calendar/reports
Этапы 2–4 + permissions ── Этап 7: sharing/social
Все этапы ── Этап 8: production readiness
```

## Зафиксированные границы этапов

- `DEC-012` superseded решением `DEC-024`: общего generated design package и единого pre-development approval больше нет.
- T00–T03 сохраняются как нормативные references; production UI создаётся вручную в `apps/web` по одному screen slice.
- Каждый screen slice включает применимые states/интеракции и требует явного approval до начала следующего; bootstrap E1-D1-T01/T02 разрешён заранее.
- Исторический `DEC-025` custom production UI-kit superseded решением `DEC-035`: весь current/future frontend использует Konsta UI 5.2.0; `packages/ui` остаётся только для необходимых Flowly-specific wrappers и удаляется вместе с `/ui-kit`, если пуст.
- Этап 3 создаёт модель программных напоминаний и jobs; end-to-end Telegram delivery закрывает этап 5.
- Одиночные программы закрываются этапом 3; совместные программы — этапом 7.
- Backend lifecycle `activity_occurrences` создаётся на этапах 3–4; calendar UI и агрегация — этапом 6.
- Минимальные проверки выполняются вместе с функциональностью; этап 8 закрывает полный набор проверок и production readiness.

## Наследование подтверждённых решений

- Поле `decisions` каждой карточки содержит обязательные решения и открытые блокеры именно для этой работы.
- Перед стартом карточки агент обязан прочитать связанные `DEC-*`; superseded-решение заменяется указанным successor.
- Для UI/UX-карточек обязательны stage-level «Обязательные подтверждённые contracts» и [`docs/design/flows/`](../design/flows/): 68 surfaces, F01–F11, state profiles и PRD traceability.
- `DEC-013`–`DEC-022` сохраняют product/state contracts; visual foundation `DEC-023` и custom UI-kit gate `DEC-025` superseded решением `DEC-035`; `DEC-024` сохраняет iterative workflow, кроме явно approved one-batch migration E0-D0-T05.
- Current/future UI-карточки обязаны применять DEC-035 и Konsta-first; после E0-D0-T05 обычные feature slices снова требуют отдельного approval по DEC-024.

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
