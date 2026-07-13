# Этап 1 — Основа

> PRD: §9–10, §40–43, §47, §49, §54 этап 1, §55.1 и §55.9.

## Цель

Получить разворачиваемую основу Mini App с авторизацией Telegram, хранилищами, миграциями, средами и базовой UI-оболочкой.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 8 | 0 | 0 | 0 | 3 |

## Зависимости и границы

- Bootstrap E1-D1-T01/T02 разрешён до screen approval согласно `DEC-024`; `DEC-012` superseded.
- Входящих продуктовых зависимостей нет.
- Решения по внешним квотам связаны с `DEC-011`, но не блокируют локальную основу.
- Базовый UI создаёт shell/theme/scenario infrastructure; после T02 выполнен и утверждён production UI-kit E1-D1-T11, первый product screen — E0-D0-T04.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-025` production UI-kit из `packages/ui` и его public API обязательны для всех screen slices; app-local дубли shared primitives запрещены.
- UI реализует ровно пять вкладок; профиль открывается avatar с Главной; deep links проходят auth/access recovery (`DEC-013`).
- Bot connection — обязательный onboarding gate (`DEC-014`); Flowly name/photo редактируются отдельно от Telegram (`DEC-020`).
- Shell/auth errors full-screen, module errors inline, mutation сохраняет ввод, offline поддерживает draft, loading использует skeleton (`DEC-022`).
- Источник screen/state/flow contracts: [`docs/design/flows/`](../../design/flows/).

## Deliverable E1-D1 — Рабочая основа приложения

### E1-D1-T01 — Создать npm-монорепозиторий

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §41.3 (`docs/PRD.md:1697-1720`), §49.3
- **depends_on:** — · **decisions:** DEC-024
- **scope:** npm workspaces и структура `apps/web`, `apps/scheduler`, `packages/core`, `packages/database`, `packages/telegram`, `packages/youtube`, `packages/storage`, `packages/ui`, `packages/config`, `migrations`, `seeds`, `scripts`; без domain implementation.
- **acceptance:** [x] структура соответствует PRD; [x] единый root lockfile и workspace-команды работают; [x] shared-код не дублируется и premature abstractions не создаются; [x] команды документированы.
- **validation/evidence:** root [`package.json`](../../../package.json) + `package-lock.json`; 9 workspace manifests; `npm install` PASS (9 workspace links, 0 vulnerabilities); `npm query .workspace` = 9; empty-safe `build/typecheck/lint` PASS; workspace commands документированы в [`README.md`](../../../README.md).
- **residual risks:** workspace packages пока намеренно не содержат domain implementation; Next.js и реальные scripts относятся к T02.
- **journal:** 2026-07-13 — `backlog -> in_progress -> review -> done`; структура и команды механически проверены, E1-D1-T02 разблокирована.

### E1-D1-T02 — Создать Next.js Mini App shell

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §9, §40, §41.1, §55.1
- **depends_on:** E1-D1-T01 · **decisions:** DEC-013, DEC-014, DEC-020, DEC-022, DEC-023, DEC-024
- **scope:** Next.js 16.2.10 App Router, React 19.2.7, TypeScript 5.9.3, Tailwind 4.3.2; Telegram-ready shell, theme/safe-area foundation, пять navigation destinations, profile entry и dev-only typed scenario infrastructure без product screen implementation.
- **acceptance:** [x] pinned stack устанавливается; [x] shell/nav соответствуют §9; [x] light/dark/safe-area/focus/reduced-motion foundation работает; [x] dev scenarios не входят в production UX; [x] build/typecheck/lint проходят.
- **validation/evidence:** `npm ci`, typecheck, lint, Next production build и `npm audit --audit-level=moderate` PASS (0 vulnerabilities); 24 browser runs = 360/430/1280 × light/dark × ready/loading/error/offline, overflow 0, tabs 5, selected 1, console errors 0; focus outline 3px; production не показывает dev scenario/error query; screenshots `.temp/E1-D1-T02/screenshots/`.
- **residual risks:** OpenNext/Cloudflare runtime относится к T03; Telegram WebView/device ещё не проверен; shell intentionally не содержит product screen.
- **journal:** 2026-07-13 — `backlog -> in_progress -> review -> done`; stale ESLint 10 install устранён clean install, зафиксирован совместимый ESLint 9.39.5; PostCSS override 8.5.18 закрыл audit advisory.

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
- **depends_on:** E1-D1-T02, E1-D1-T04 · **decisions:** DEC-013, DEC-014, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-001, S-MA-002, S-MA-003, S-MA-004, S-MA-005, S-MA-006, S-WEB-001, S-WEB-002 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** проверка Telegram init data, создание пользователя/сессии, onboarding и безопасные browser/deep-link recovery states; bot command surfaces остаются этапу 5.
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
- **depends_on:** E1-D1-T02–T08 · **decisions:** DEC-013, DEC-014, DEC-020, DEC-022
- **scope:** review этапа, ownership defaults, headers/cookies, secret scan, проверка критериев основы.
- **acceptance:** [ ] каждый пункт §55.1 имеет evidence; [ ] применимые меры §47.1 закрыты; [ ] остаточные риски записаны.
- **validation/evidence:** review checklist, команды проверок, screenshots и ссылки на артефакты.

### E1-D1-T10 — Реализовать профиль, настройки профиля и справку

- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §9, §10.1, §38.1, §55.1 · **depends_on:** E1-D1-T06, E1-D1-T08 · **decisions:** DEC-013, DEC-020, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-080, S-MA-090, S-MA-096 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** профиль Flowly, отдельное от Telegram редактирование имени/фото/timezone/preferences и help/status; data lifecycle/notification settings остаются своим downstream cards.
- **acceptance:** [ ] avatar entry ведёт в профиль; [ ] Flowly identity редактируется отдельно от Telegram; [ ] contextual states и help recovery покрыты; [ ] каждый screen ID утверждён отдельно.
- **validation/evidence:** typed scenarios, screenshots/browser interactions, API evidence при наличии и дословный approval каждого ID.

### E1-D1-T11 — Создать и утвердить production UI-kit

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §40, §41.3, §55.1 · **depends_on:** E1-D1-T02 · **decisions:** DEC-022, DEC-023, DEC-024, DEC-025
- **scope:** реализовать `packages/ui` с canonical tokens/themes/typography и утверждёнными Button/IconButton/Card/Badge/Progress/AppHeader/BottomNavigation/Skeleton/EmptyState/InlineError/OfflineBanner; собрать интерактивный `/ui-kit`; не продолжать product screens.
- **acceptance:** [x] package имеет стабильный public API и не зависит от `apps/web`; [x] light/dark и component states интерактивно представлены; [x] min 44px, focus-visible, keyboard и reduced motion проверены; [x] `/ui-kit` работает на 360–430/wide; [x] пользователь явно утвердил production UI-kit.
- **validation/evidence:** `packages/ui/src/**`, `apps/web/app/ui-kit/**`; root `typecheck`, `lint`, `build` PASS, `/ui-kit` static route; browser 360/430/1280, light/dark, no horizontal overflow, package target audit ≥44px, keyboard focus 3px, loading/disabled/live status, reduced-motion `animation-name:none` PASS; screenshots `.temp/E1-D1-T11/ui-kit-{360-light,430-dark,1280-light}.png`; дословный approval пользователя 2026-07-13: «утверждаю ui kit».
- **residual risks:** реальный Telegram WebView/safe-area не проверен; этот риск переносится в device validation применимых product screens.
- **journal:** 2026-07-13 — создана после выявления пустого `packages/ui`; `backlog -> in_progress`, E0-D0-T04 blocked до approval. 2026-07-13 — production package и интерактивный `/ui-kit` реализованы и механически проверены; остановка на обязательном visual approval. 2026-07-13 — пользователь явно подтвердил «утверждаю ui kit»; `in_progress -> review -> done`, E0-D0-T04 разблокирована.

## Риски этапа

- Актуальность внешних тарифов требует DEC-011.
- Конкретные архитектурные решения, отсутствующие в PRD, нельзя принимать без decision card.

## Handoff этапа

Заполняется при каждом изменении статуса: активная карточка, фактический результат, проверки, изменённые файлы, блокеры и следующий шаг.
