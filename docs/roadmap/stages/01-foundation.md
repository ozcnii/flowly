# Этап 1 — Основа

> PRD: §9–10, §40–43, §47, §49, §54 этап 1, §55.1 и §55.9.

## Цель

Получить разворачиваемую основу Mini App с авторизацией Telegram, хранилищами, миграциями, средами и базовой UI-оболочкой.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 9 | 0 | 0 | 0 | 0 |

## Зависимости и границы

- Входящих продуктовых зависимостей нет.
- Решения по внешним квотам связаны с `DEC-011`, но не блокируют локальную основу.
- Базовый UI не включает продуктовые экраны следующих этапов.

## Deliverable E1-D1 — Рабочая основа приложения

### E1-D1-T01 — Создать монорепозиторий

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §41.3 (`docs/PRD.md:1697-1720`)
- **depends_on:** — · **decisions:** —
- **scope:** структура `apps/web`, `apps/scheduler`, `packages/db`, `packages/shared`, `packages/ui`, `migrations`, `scripts`.
- **acceptance:** [ ] структура соответствует PRD; [ ] shared-код не дублируется; [ ] команды workspace документированы.
- **validation/evidence:** дерево файлов, package scripts, успешная установка зависимостей.

### E1-D1-T02 — Создать Next.js Mini App и базовый UI

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9, §40, §41.1, §55.1
- **depends_on:** E1-D1-T01
- **scope:** оболочка, пять основных вкладок, профильные разделы, светлая/тёмная темы, loading/empty/error/disabled states.
- **acceptance:** [ ] навигация соответствует §9; [ ] темы работают; [ ] состояния различимы; [ ] базовая доступность соблюдена.
- **validation/evidence:** build/typecheck при наличии, screenshots ключевых состояний, ручной keyboard-check.

### E1-D1-T03 — Настроить Cloudflare deployments

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §41.1–41.2, §42, §49
- **depends_on:** E1-D1-T01 · **decisions:** DEC-011
- **scope:** отдельные web и scheduler deployments, конфигурация bindings без production-секретов в репозитории.
- **acceptance:** [ ] web и scheduler изолированы; [ ] bindings описаны; [ ] секреты внешние; [ ] локальный запуск документирован.
- **validation/evidence:** deploy config, dry-run/local start, список bindings.

### E1-D1-T04 — Подключить D1 и миграции

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §41, §43, §49.2–49.3
- **depends_on:** E1-D1-T01
- **scope:** DB package, migration workflow и начальная схема для foundation-сущностей; остальные таблицы добавляются по этапам.
- **acceptance:** [ ] миграции повторяемы; [ ] local/test DB разделены; [ ] rollback/forward procedure документирована; [ ] schema соответствует реализуемому scope PRD.
- **validation/evidence:** migration output и schema snapshot.

### E1-D1-T05 — Подключить R2

- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §41.1, §46, §49.2
- **depends_on:** E1-D1-T01, E1-D1-T03
- **scope:** bindings и безопасный storage adapter; продуктовые upload flows остаются этапу 2.
- **acceptance:** [ ] local/test/prod bindings разделены; [ ] прямой публичный доступ не включён; [ ] adapter не связывает бизнес-логику напрямую с R2.
- **validation/evidence:** конфигурация и минимальная read/write-проверка по явному запросу.

### E1-D1-T06 — Реализовать Telegram auth и sessions

- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §10.2–10.3, §43.1–43.3, §44.1, §47.1, §55.1
- **depends_on:** E1-D1-T02, E1-D1-T04
- **scope:** проверка Telegram init data, создание пользователя/сессии, fallback-экран вне Telegram.
- **acceptance:** [ ] пароль не требуется; [ ] подпись и freshness проверяются; [ ] сессия безопасна; [ ] вне Telegram показано корректное состояние.
- **validation/evidence:** canonical auth requests/responses и screenshots отказа/успеха.

### E1-D1-T07 — Настроить local, test и production environments

- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §49.1–49.4, §55.9
- **depends_on:** E1-D1-T03, E1-D1-T04, E1-D1-T05
- **scope:** режимы, переменные, команды и Telegram mock/real modes.
- **acceptance:** [ ] среды не разделяют данные/секреты; [ ] команды воспроизводимы; [ ] mock mode не отправляет реальные сообщения.
- **validation/evidence:** env matrix и результаты запуска каждой доступной среды.

### E1-D1-T08 — Создать seed тестовых пользователей и данных

- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §49.5
- **depends_on:** E1-D1-T04, E1-D1-T07
- **scope:** повторяемые seed-данные для ролей и базовых состояний без production PII.
- **acceptance:** [ ] seed идемпотентен либо безопасно пересоздаётся; [ ] сценарии документированы; [ ] production запуск защищён.
- **validation/evidence:** seed output и перечень созданных сущностей.

### E1-D1-T09 — Закрыть foundation security и DoD

- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §40.3, §47.1, §55.1, применимая часть §55.9
- **depends_on:** E1-D1-T02–T08
- **scope:** review этапа, ownership defaults, headers/cookies, secret scan, проверка критериев основы.
- **acceptance:** [ ] каждый пункт §55.1 имеет evidence; [ ] применимые меры §47.1 закрыты; [ ] остаточные риски записаны.
- **validation/evidence:** review checklist, команды проверок, screenshots и ссылки на артефакты.

## Риски этапа

- Актуальность внешних тарифов требует DEC-011.
- Конкретные архитектурные решения, отсутствующие в PRD, нельзя принимать без decision card.

## Handoff этапа

Заполняется при каждом изменении статуса: активная карточка, фактический результат, проверки, изменённые файлы, блокеры и следующий шаг.
