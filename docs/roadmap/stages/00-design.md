# Этап 0 — UX/UI-дизайн

> PRD: §8–10, §11–39, §40, §54–55. Процесс утверждён в `DEC-012`.

## Цель

До начала разработки создать, проверить и явно утвердить полный UX/UI-пакет Flowly v1.0 в репозитории.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 6 | 0 | 0 | 0 | 1 |

## Зависимости и границы

- Входящих зависимостей нет.
- Этап не расширяет продуктовый scope PRD: неясности фиксируются в `DECISIONS.md` и блокируют соответствующую карточку.
- Все артефакты и evidence хранятся в `docs/design/`.
- Разработка этапов 1–8 не начинается до явного approval пользователя в E0-D0-T06.
- Approval фиксируется датой, ссылками на утверждённые версии и неизменяемыми snapshots; последующие изменения требуют повторного approval затронутого пакета.

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

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §8–10, §11–39, §40 · **depends_on:** — · **decisions:** DEC-012
- **scope:** инвентарь экранов и состояний, карта навигации, роли и end-to-end user flows для всех функций v1.0.
- **acceptance:** [ ] каждый экран и flow трассируется к PRD; [ ] happy/error/empty/loading/disabled paths учтены; [ ] продуктовые неясности вынесены в `DECISIONS.md`; [ ] артефакты сохранены в `docs/design/flows/`.
- **validation/evidence:** traceability matrix, диаграммы flows и ссылки на версии файлов.

### E0-D0-T02 — Создать wireframes всех экранов

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9–39, §40.2 · **depends_on:** E0-D0-T01 · **decisions:** DEC-012
- **scope:** wireframes всех экранов и ключевых состояний Mini App, Telegram-сценариев и responsive-вариантов, требуемых PRD.
- **acceptance:** [ ] покрыт инвентарь E0-D0-T01; [ ] переходы соответствуют user flows; [ ] ключевые состояния различимы; [ ] snapshots сохранены в `docs/design/wireframes/`.
- **validation/evidence:** перечень wireframes, coverage matrix и versioned snapshots.

### E0-D0-T03 — Создать UI-kit и дизайн-систему

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §40, §55.1 · **depends_on:** E0-D0-T01 · **decisions:** DEC-012
- **scope:** design tokens, типографика, цвета, spacing, iconography, компоненты, светлая/тёмная темы и правила доступных состояний.
- **acceptance:** [ ] токены и компоненты документированы; [ ] темы покрыты; [ ] состояния компонентов заданы; [ ] контраст, focus и touch targets проверяемы; [ ] артефакты сохранены в `docs/design/ui-kit/`.
- **validation/evidence:** component inventory, token specification, accessibility checklist и snapshots.

### E0-D0-T04 — Создать финальные макеты Flowly v1.0

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9–40, §55 · **depends_on:** E0-D0-T02, E0-D0-T03 · **decisions:** DEC-012
- **scope:** high-fidelity макеты всех экранов и ключевых состояний на основе утверждаемого UI-kit без добавления функций вне PRD.
- **acceptance:** [ ] покрыты все wireframes; [ ] использован единый UI-kit; [ ] light/dark и применимые responsive-состояния представлены; [ ] макеты сохранены в `docs/design/screens/`.
- **validation/evidence:** screen inventory, coverage matrix и versioned final snapshots.

### E0-D0-T05 — Собрать и проверить интерактивный прототип

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9–40, §55 · **depends_on:** E0-D0-T04 · **decisions:** DEC-012
- **scope:** интерактивный прототип ключевых end-to-end сценариев v1.0 по утверждаемым макетам.
- **acceptance:** [ ] ключевые flows E0-D0-T01 кликабельны; [ ] переходы и возвраты согласованы с макетами; [ ] ограничения прототипа записаны; [ ] переносимый prototype artifact сохранён в `docs/design/prototype/`.
- **validation/evidence:** список пройденных сценариев, screenshots/recording и версия prototype artifact.

### E0-D0-T06 — Провести дизайн-review и получить явный approval

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §8–40, §54–55 · **depends_on:** E0-D0-T01–T05 · **decisions:** DEC-012
- **scope:** проверить полноту UX/UI-пакета, закрыть или зафиксировать замечания и запросить явное утверждение пользователя до начала разработки.
- **acceptance:** [ ] coverage PRD подтверждён; [ ] замечания имеют статус; [ ] approved snapshots перечислены; [ ] пользователь явно утвердил пакет; [ ] дата и формулировка approval сохранены в `docs/design/APPROVAL.md`.
- **validation/evidence:** review checklist, traceability matrix, список approved artifacts и дословно зафиксированный approval пользователя.

## Handoff этапа

Фиксировать версии и пути артефактов, покрытие PRD, открытые `DEC-*`, замечания review, approved snapshots и следующее точное действие. Без evidence явного approval E0-D0-T06 и этап 0 не переводятся в `done`.
