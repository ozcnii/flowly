# Этап 0 — UX/UI-дизайн

> PRD: §8–10, §11–39, §40, §54–55. Процесс утверждён в `DEC-012`.

## Цель

До начала разработки создать, проверить и явно утвердить полный UX/UI-пакет Flowly v1.0 в репозитории.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 4 | 0 | 0 | 0 | 3 |

## Зависимости и границы

- Входящих зависимостей нет.
- Этап не расширяет продуктовый scope PRD: неясности фиксируются в `DECISIONS.md` и блокируют соответствующую карточку.
- Все артефакты и evidence хранятся в `docs/design/`.
- Разработка этапов 1–8 не начинается до явного approval пользователя в E0-D0-T06.
- Approval фиксируется датой, ссылками на утверждённые версии и неизменяемыми snapshots; последующие изменения требуют повторного approval затронутого пакета.

## Обязательные подтверждённые contracts

- `DEC-013`–`DEC-022` и [`docs/design/flows/`](../../design/flows/) — нормативная основа всех следующих дизайн-карточек.
- Concept A остаётся неутверждённым visual reference; он не заменяет screen/state/flow inventory.
- Новая продуктовая неоднозначность требует `DEC-*`; нельзя молча менять утверждённые navigation, statuses, permissions, destructive flows или bot gate.

## Deliverable E0-D0 — Утверждённый UX/UI-пакет Flowly v1.0

### E0-D0-T00 — Зафиксировать исходный HTML-мокап

- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §9, §11–12, §21, §28, §40 · **depends_on:** — · **decisions:** DEC-012
- **scope:** перенести предоставленный пользователем HTML-концепт в `docs/design/`, сохранить переносимую версию, логотип и preview, описать фактическое покрытие и пробелы без признания концепта утверждённым дизайном.
- **acceptance:** [x] исходные файлы сохранены без функциональных изменений; [x] системный мусор исключён; [x] локальный запуск документирован; [x] preview и логотип доступны; [x] покрытие и ограничения зафиксированы.
- **validation/evidence:** 13 файлов / 1,2 MB в `docs/design/screens/concept-a/`; HTTP 200 для `index.html`, standalone HTML, логотипа и JPG; [`preview.png`](../../design/screens/concept-a/preview.png); [`STATUS.md`](../../design/screens/concept-a/STATUS.md).
- **residual risks:** Concept A покрывает только четыре экрана, не содержит полных flows/обязательных состояний/тёмной темы и не имеет design approval; детали перечислены в `STATUS.md`.
- **journal:** 2026-07-13 — пользовательский каталог перенесён из корня, `.DS_Store` удалён, визуальное и функциональное покрытие проанализировано.

### E0-D0-T01 — Спроектировать информационную архитектуру и user flows

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §8–10, §11–39, §40 · **depends_on:** — · **decisions:** DEC-012–DEC-022
- **scope:** инвентарь экранов и состояний, карта навигации, роли и end-to-end user flows для всех функций v1.0.
- **acceptance:** [ ] независимый re-review должен подтвердить атомарную PRD traceability каждого экрана/flow; [ ] независимый re-review должен подтвердить happy/error/empty/loading/disabled applicability; [x] продуктовые неясности вынесены в `DECISIONS.md`; [x] артефакты сохранены в `docs/design/flows/`.
- **validation/evidence:** [`README`](../../design/flows/README.md), [69 screen/surface IDs + per-ID states](../../design/flows/screen-inventory.md), [F01–F11 + canonical membership](../../design/flows/flow-inventory.md), [atomic PRD traceability](../../design/flows/traceability-matrix.md), [12 Mermaid diagrams](../../design/flows/diagrams/00-overview.md), [validation report with reproducible commands/output](../../design/flows/validation-report.md). Internal validation PASS: 69 IDs; F01–F11; 98 bidirectional screen↔flow pairs with empty symmetric difference; 69 per-ID state assignments/15 profiles; canonical and Rendered diagram IDs; 0 broken links; 12 Mermaid blocks; roadmap 72 = 70 backlog/1 review/1 done; `git diff --check`; 0 staged files. Автотесты не создавались.
- **residual risks:** независимый semantic re-review ещё не выполнен, поэтому первые два acceptance-пункта не отмечены; Mermaid не рендерился CLI/parser; runtime permissions/offline и state copy пока только design contracts; Concept A не утверждён; DEC-006/007/008/010/011 остаются downstream constraints.
- **journal:** 2026-07-13 — deep review выявил и закрыл ошибки F04/F08, privacy/recovery gaps, 13 асимметрий membership, blanket states и неатомарную traceability; финальный независимый gate: blockers/warnings отсутствуют, кроме принятого residual risk отсутствия Mermaid renderer. Задача переведена `review -> done`; E0-D0-T02 разблокирована. Ранее: утверждённый план реализован без wireframes/UI-kit/code; DEC-013–DEC-022 записаны, DEC-009 superseded.

### E0-D0-T02 — Создать wireframes всех экранов

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §9–39, §40.2 · **depends_on:** E0-D0-T01 · **decisions:** DEC-012–DEC-022
- **scope:** wireframes всех экранов и ключевых состояний Mini App, Telegram-сценариев и responsive-вариантов, требуемых PRD.
- **acceptance:** [x] покрыт инвентарь E0-D0-T01; [x] переходы соответствуют user flows; [x] ключевые состояния различимы; [x] snapshots сохранены в `docs/design/wireframes/`.
- **validation/evidence:** [`README`](../../design/wireframes/README.md), [69-row coverage matrix](../../design/wireframes/coverage-matrix.md), [39 canonical + 3 evidence PNG manifest](../../design/wireframes/snapshot-manifest.md), [validation report](../../design/wireframes/validation-report.md). Validation PASS: 69 unique surfaces (59/8/2), 15 profiles/105 state demos, F01–F11/98 symmetric memberships, 38 tailored critical frames, 69 Russian title/action contracts, 0 hidden declared items, 0 content-label primary CTAs, 0 broken links, 78 light/dark browser runs + 13 runs at 200% text, 0 overflow/console/unlabelled controls, reproducible 39+3 snapshot hashes, `git diff --check`.
- **plan:** [`E0-D0-T02-plan.md`](../../design/wireframes/E0-D0-T02-plan.md) — утверждён пользователем 2026-07-13; реализация выполнена строго в согласованном scope.
- **residual risks:** ненулевые safe-area inset не проверены в реальном notched Telegram WebView; full-page PNG достигают ~23.3k px; финальный UX copy/UI-kit не входит в T02; staged `AGENTS.md` — внешнее состояние worktree и этой задачей не изменялось.
- **journal:** 2026-07-13 — план утверждён; HTML+PNG wireframes по F01–F11 реализованы. Findings независимых review по states, observable content, shell, keyboard, CTA, critical branches и snapshot reproducibility закрыты. После последней точечной правки bot CTA выполнена финальная механическая проверка; задача переведена `in_progress -> review`. Пользователь явно подтвердил «всё ок» и дал добро закрыть задачу; выполнен переход `review -> done`.

### E0-D0-T03 — Создать UI-kit и дизайн-систему

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §40, §55.1 · **depends_on:** E0-D0-T01 · **decisions:** DEC-012–DEC-022
- **scope:** design tokens, типографика, цвета, spacing, iconography, компоненты, светлая/тёмная темы и правила доступных состояний.
- **acceptance:** [ ] токены и компоненты документированы; [ ] темы покрыты; [ ] состояния компонентов заданы; [ ] контраст, focus и touch targets проверяемы; [ ] артефакты сохранены в `docs/design/ui-kit/`.
- **validation/evidence:** component inventory, token specification, accessibility checklist и snapshots.

### E0-D0-T04 — Создать финальные макеты Flowly v1.0

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9–40, §55 · **depends_on:** E0-D0-T02, E0-D0-T03 · **decisions:** DEC-012–DEC-022
- **scope:** high-fidelity макеты всех экранов и ключевых состояний на основе утверждаемого UI-kit без добавления функций вне PRD.
- **acceptance:** [ ] покрыты все wireframes; [ ] использован единый UI-kit; [ ] light/dark и применимые responsive-состояния представлены; [ ] макеты сохранены в `docs/design/screens/`.
- **validation/evidence:** screen inventory, coverage matrix и versioned final snapshots.

### E0-D0-T05 — Собрать и проверить интерактивный прототип

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9–40, §55 · **depends_on:** E0-D0-T04 · **decisions:** DEC-012–DEC-022
- **scope:** интерактивный прототип ключевых end-to-end сценариев v1.0 по утверждаемым макетам.
- **acceptance:** [ ] ключевые flows E0-D0-T01 кликабельны; [ ] переходы и возвраты согласованы с макетами; [ ] ограничения прототипа записаны; [ ] переносимый prototype artifact сохранён в `docs/design/prototype/`.
- **validation/evidence:** список пройденных сценариев, screenshots/recording и версия prototype artifact.

### E0-D0-T06 — Провести дизайн-review и получить явный approval

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §8–40, §54–55 · **depends_on:** E0-D0-T01–T05 · **decisions:** DEC-012–DEC-022
- **scope:** проверить полноту UX/UI-пакета, закрыть или зафиксировать замечания и запросить явное утверждение пользователя до начала разработки.
- **acceptance:** [ ] coverage PRD подтверждён; [ ] замечания имеют статус; [ ] approved snapshots перечислены; [ ] пользователь явно утвердил пакет; [ ] дата и формулировка approval сохранены в `docs/design/APPROVAL.md`.
- **validation/evidence:** review checklist, traceability matrix, список approved artifacts и дословно зафиксированный approval пользователя.

## Handoff этапа

Фиксировать версии и пути артефактов, покрытие PRD, открытые `DEC-*`, замечания review, approved snapshots и следующее точное действие. Без evidence явного approval E0-D0-T06 и этап 0 не переводятся в `done`.
