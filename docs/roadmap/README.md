# Flowly v1.0 — roadmap и kanban index

> Обновлено: 2026-07-19 · Источник требований: [`../PRD.md`](../PRD.md)

Этот каталог — переносимая project board. Подробный статус хранится в карточках этапов; данный файл содержит только общий обзор и ссылки.

## Текущий фокус

- **Активный этап:** 4. Мой ритм.
- **Активная задача:** E4-D5-T02 (CRUD привычки + API /habits + icon/color + onboarding S-MA-004), `review` — ждёт DEC-024 user approval.
- **Следующее действие:** user review T02 → `done`; затем E4-D5-T03 (schedule «конкретное время»/дни недели). E4-D5-T01 (экран «Ритм», slice S-MA-060) `done` (`52c71f4`).
- **Latest E2-D3-T01 scope:** DEC-062 implementation draft добавил D1 sessions/occurrence/history, one-open API, `/sessions/[id]`, shared IFrame API player, checkpoint/final status, Home resume и detail Start. Local migration, HTTP lifecycle, five-status matrix, typecheck/lint/build/deploy-check и focused 360/390/430 browser pass успешны. Approved correction v3 implemented: post-fix controlled 0:03 playback persists local/server 3 and restores 0:03; independent YouTube playback position persists through migration 0007/checkpoint/finish/local snapshot and restores via `seekTo`; equal-elapsed stale token auto-selects server without conflict Sheet; Pause geometry stable; Home resume compact with unbounded `m:ss`/`h:mm:ss`; same-active direct Continue; vertical conflict/final Sheets; final default `completed`; responsive exercises. Browser and mocked native Back exact Home→Continue return Home; reported unrelated-detail target still needs exact preceding Home-entry sequence. Runtime commit `b69e190` deployed to production in successful run `29579333079` with remote migrations 0006/0007; browser-UA smoke passed. Task remains `in_progress` until user/real-device verification.
- **Latest real-device scope:** DEC-046 removes Telegram avatar storage/proxy/rendering and D1 `photo_url`; DEC-047 owns fullscreen composed safe-area blur/title/actions geometry; Tabbar labels are 9px. Runtime commit `ce35676` deployed successfully in run 29395082940; follow-up `239ae28` removes all fixed primary Navbar actions, collapses its empty row, adds Home content header `Твой план` + Profile action and renames card title to `Прогресс на сегодня`; Deploy web run 29395715390 PASS. DEC-048 runtime `8633c9c` removes Profile/Settings web Back and uses official route-aware Telegram BackButton; `031de99` prevents internal-to-internal Close/X flicker by preserving native visibility during cleanup. Deploy runs 29396177091 and 29396563266 PASS; `045e0a2` inset-0 half-position was rejected after iPhone notch overlap; `429beb9` supersedes it: safe-area Navbar hidden on desktop/web, shown only on Telegram iOS/Android, mobile min inset 44px with title centered in its final 44px. Deploy web run 29398306357 PASS. DEC-052 supersedes fixed top-level hide: native Back follows session history on tab и child routes, direct entries use contextual parent replace, Home boundary enables closing confirmation; browser mock PASS, real-device Back/Close/X rerun pending.
- **Latest production API fix:** DEC-049 replaced unavailable Invidious with no-key Piped. Runtime `286d597`, Deploy web 29402655934 PASS; canonical production search miss/hit returns 12 results, edge queries 12/10/6, warning null.
- **UI workflow:** Konsta UI 5.2.0 + `ios` theme обязательны всегда (`DEC-035`); завершённая E0-D0-T05 была approved one-batch exception к per-screen approval `DEC-024`; обязательный frontend UI/UX quality pass по [`docs/design/FRONTEND_REVIEW.md`](../design/FRONTEND_REVIEW.md) сохраняется (`DEC-028`); client API calls только через `@tanstack/react-query` (`DEC-029`)
- **Блокеры:** открытые решения перечислены в [`DECISIONS.md`](DECISIONS.md)
- **Контекст продолжения:** [`HANDOFF.md`](HANDOFF.md)

## Общая доска

| Этап | Статус | Backlog | In progress | Blocked | Review | Done | Файл |
|---|---|---:|---:|---:|---:|---:|---|
| 0. UX/UI-контракты | done | 0 | 0 | 0 | 0 | 6 | [`00-design.md`](stages/00-design.md) |
| 1. Основа | done | 0 | 0 | 0 | 0 | 13 | [`01-foundation.md`](stages/01-foundation.md) |
| 2. Йога | done* | 0 | 0 | 1 | 0 | 12 | [`02-yoga.md`](stages/02-yoga.md) |
| 3. Программы | done | 0 | 0 | 0 | 0 | 7 | [`03-programs.md`](stages/03-programs.md) |
| 4. Мой ритм | **active** | 6 | 0 | 0 | 1 | 1 | [`04-my-rhythm.md`](stages/04-my-rhythm.md) |
| 5. Telegram | backlog | 8 | 0 | 0 | 0 | 0 | [`05-telegram.md`](stages/05-telegram.md) |
| 6. Календарь и отчёты | backlog | 9 | 0 | 0 | 0 | 0 | [`06-calendar-reports.md`](stages/06-calendar-reports.md) |
| 7. Социальные функции | backlog | 7 | 0 | 0 | 0 | 0 | [`07-social.md`](stages/07-social.md) |
| 8. Стабилизация | backlog | 8 | 0 | 0 | 0 | 0 | [`08-stabilization.md`](stages/08-stabilization.md) |

**Итого:** 38 backlog / 0 in progress / 1 blocked / 1 review / 39 done.
\*Stage 2 DoD `done`; residual board: E2-D3-T03 blocked (DEC-064). S-MA-032 cancelled (DEC-066), not a card.

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
