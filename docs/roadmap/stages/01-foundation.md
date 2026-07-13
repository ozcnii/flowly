# Этап 1 — Основа

> PRD: §9–10, §40–43, §47, §49, §54 этап 1, §55.1 и §55.9.

## Цель

Получить разворачиваемую основу Mini App с авторизацией Telegram, хранилищами, миграциями, средами и базовой UI-оболочкой.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 6 | 1 | 0 | 0 | 5 |

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

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §41.1–41.2, §42, §49
- **depends_on:** E1-D1-T01 · **decisions:** DEC-011, DEC-026
- **scope:** отдельные web и scheduler deployments, конфигурация bindings без production-секретов в репозитории.
- **acceptance:** [x] web и scheduler изолированы; [x] bindings описаны; [x] секреты внешние; [x] локальный запуск документирован.
- **validation/evidence:** pinned OpenNext 1.20.1/Wrangler 4.110.0; separate `apps/web|scheduler/wrangler.jsonc`; generated env types; local root typecheck/lint/build/audit PASS; web workerd `/` + `/ui-kit` 200; scheduler `/health` + `/__scheduled` 200; workspace dry-runs PASS (web 4711.05 KiB / gzip 981.22 KiB, scheduler 0.41 KiB / gzip 0.28 KiB); candidate-file secret scan 0. Real test deploys: `flowly-scheduler-test` version `cbca80ee-1d97-4c33-811b-12fdf282b38a`, Cron `* * * * *`, URL `https://flowly-scheduler-test.getflowly.workers.dev`; `flowly-web-test` version `f482628c-a193-499d-b595-fc223cb15aab`, URL `https://flowly-web-test.getflowly.workers.dev`. Remote Chromium smoke PASS: scheduler `/health` 200 with `status: ok`, web `/` 200, `/ui-kit` 200; web console errors 0. Final typecheck/lint/audit/diff-check PASS; production Workers untouched.
- **residual risks:** реальный Cron invocation/log не наблюдался — подтверждены registered trigger и local scheduled smoke; non-browser `urllib` получает Cloudflare edge 403/1010 по client signature, тогда как Chromium проходит 200; production deploy/domain/bindings остаются вне scope T03.
- **plan:** `.temp/E1-D1-T03/plan.md` — Plan confidence 95%, Implementation confidence 86%; явно утверждён пользователем 2026-07-13.
- **journal:** 2026-07-13 — пользователь выбрал Cloudflare deployment следующей foundation-задачей; `backlog -> in_progress`. Подтверждены real test deploy, имена `flowly-web-test`/`flowly-scheduler-test`, документирование future bindings без placeholders и health + no-op cron bootstrap. Изучены PRD/DEC-011, current manifests, OpenNext 1.20.1/Wrangler 4.110.0 и official deployment contracts; создан отдельный план. 2026-07-13 — пользователь явно утвердил план фразой «да»; реализация разрешена в утверждённом scope. Локальная реализация завершена: separate configs/bundles, web/scheduler workerd smoke и dry-runs PASS; Wrangler OAuth PASS; scheduler test upload выполнен, но Cloudflare потребовал account-level workers.dev subdomain; `in_progress -> blocked`, создан DEC-026. Первичная interactive registration создала временное malformed-имя; через Cloudflare Dashboard проверены нормальные доступные варианты. Пользователь выбрал `getflowly`; dashboard rename и Cloudflare API GET подтвердили `getflowly.workers.dev`. DEC-026 approved, `blocked -> in_progress`. Оба test Worker развернуты, Cron зарегистрирован, remote Chromium smoke и финальные проверки PASS; evidence/residual risks заполнены, `in_progress -> review`. Пользователь явно отклонил deep review фразой «Нет, закрыть»; acceptance/evidence подтверждены, `review -> done`. Production Workers не затронуты.

### E1-D1-T04 — Подключить D1 и миграции

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §41, §43, §49.2–49.3
- **depends_on:** E1-D1-T01 · **decisions:** DEC-011, DEC-026, DEC-027 (не блокируют; operational DEC-006/007/008/010/011 относятся к этапу 8)
- **scope:** DB package, migration workflow и начальная схема для foundation-сущностей; остальные таблицы добавляются по этапам.
- **acceptance:** [x] миграции повторяемы (`db:reset`+`db:migrate` дают идентичный `.schema`; `db:generate` идемпотентен «No schema changes»); [x] local/test DB разделены (local-only miniflare state в `apps/web/.wrangler/state/v3/d1`; реальные test/prod D1 не создаются; separation documented); [x] rollback/forward procedure документирована (README: forward = apply новых миграций, rollback = новая reverse-миграция, полный пересбор через `db:reset`); [x] schema соответствует реализуемому scope PRD (3 таблицы = §43.1–43.3; snapshot evidence).
- **validation/evidence:** `packages/database/{package.json,tsconfig.json,eslint.config.mjs,drizzle.config.ts,src/{schema,client,index}.ts}`; миграции `migrations/0000_foundation.sql` + `migrations/0001_token_hash_unique.sql` + `migrations/meta/`; D1 binding в `apps/web/wrangler.jsonc` (`DB`, `database_name: flowly-db`, local `database_id`, `migrations_dir: ../../migrations`); `apps/web/scripts/db-reset-local.mjs`; root `package.json` db-скрипты. Clean `npm install`; `npm run typecheck`/`lint` PASS во всех workspaces; `db:generate` идемпотентен; `db:reset`→`db:migrate` PASS (6 команд, `0000_foundation.sql` ✅); повторный `db:migrate` = «No migrations to apply!»; schema snapshot `.temp/E1-D1-T04/evidence/schema-snapshot.json` — ровно `users`/`user_settings`/`auth_sessions` + `users_telegram_id_unique` + `auth_sessions_token_hash_unique` (UNIQUE, проверено dup-insert reject) + FK ON DELETE CASCADE; `git diff --check` PASS; candidate-file secret scan 0; независимый deep review PASS (0 багов; findings закрыты: `token_hash`→UNIQUE, DEC-027 nullability-контракт).
- **residual risks:** (1) 4 moderate npm audit — esbuild dev-server advisory (GHSA-67mh-4wv8-2f99) через legacy `@esbuild-kit` в devDep drizzle-kit; не применима к офлайн `drizzle-kit generate`; override esbuild создаёт invalid tree, даунгрейд drizzle-kit до 0.18.1 ломает API — принято как dev-only residual. (2) FK enforcement активен в локальной D1 (miniflare, проверено: orphan-INSERT отвергнут, CASCADE сработал); production D1 подтвердить downstream (T06+). (3) `user_settings.default_reminder_policy_id` — FK добавляется этапом 3. (4) id = UUIDv7 app-side; downstream-inserts обязаны передавать id. (5) OpenNext `getRequestContext().env.DB` не проверялся в T04 (downstream T06). (6) scheduler D1 binding — этап 3. (7) `next build` и OpenNext `deploy:check` запущены при comprehensive verification — PASS (next build compiled успешно, OpenNext worker 4711.05 KiB / gzip 981.22 KiB, wrangler dry-run `--env test` OK). Замечание wrangler: `d1_databases` объявлен на top-level, но не в `env.test` (environments не наследуют) — ожидаемо для local-only scope; добавляется в `env.test` при создании test D1 (отдельный scope, фейковые `database_id` не добавляются).
- **plan:** [`.temp/E1-D1-T04/plan.md`](../../../.temp/E1-D1-T04/plan.md) — Drizzle Kit, 3 таблицы, local-only D1; Plan confidence 92%, Implementation confidence 88%; утверждён пользователем 2026-07-13 (TEXT UUIDv7, TEXT ISO-8601).
- **journal:** 2026-07-13 — пользователь выбрал E1-D1-T04 следующей foundation-задачей; `backlog -> in_progress`; закрыты 4 развилки (Drizzle Kit / 3 таблицы / local-only / plan-файл); deep plan готов. 2026-07-13 — план утверждён (UUIDv7, ISO-8601); реализация: `@flowly/database` (Drizzle schema + client + drizzle.config), flat-layout миграция `0000_foundation.sql`, D1 binding в `apps/web/wrangler.jsonc`, root/web db-скрипты, README rollback/forward. Risk-first: wrangler корректно резолвит `../../migrations` из apps/web (flat, без `migrations_pattern`). Проверки PASS; `in_progress -> review`. 2026-07-13 — независимый deep review (субагент, fresh context): 0 багов; FK CASCADE и orphan-reject проверены эмпирически на local D1; residual-risk #2 смяггчён (FK активен в local). Закрыты 2 находки по решению пользователя: `auth_sessions.token_hash` → UNIQUE (миграция `0001_token_hash_unique.sql`, forward-apply и dup-reject проверены); nullability/types-контракт 3 таблиц зафиксирован в DEC-027 и слинкован с T06/T10. 2026-07-13 — comprehensive verification по запросу пользователя: `npm ci`/typecheck/lint/`next build`/`deploy:check` PASS (включая OpenNext + wrangler dry-run `--env test`); зафиксировано ожидаемое wrangler-warning про `d1_databases` вне `env.test` (local-only). AGENTS.md: политика тестов смягчена — автотесты разрешены, но только полезные на реальный функционал. Состояние — `review`, ждёт решения `review -> done`. 2026-07-13 — пользователь решил закрыть без автотестов (политика тестов в AGENTS.md смягчена: автотесты разрешены, но только полезные на реальный функционал; для T04 ручная comprehensive verification достаточна); `review -> done`.

### E1-D1-T05 — Подключить R2

- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §41.1, §46, §49.2
- **depends_on:** E1-D1-T01, E1-D1-T03
- **scope:** bindings и безопасный storage adapter; продуктовые upload flows остаются этапу 2.
- **acceptance:** [ ] local/test/prod bindings разделены; [ ] прямой публичный доступ не включён; [ ] adapter не связывает бизнес-логику напрямую с R2.
- **validation/evidence:** конфигурация и минимальная read/write-проверка по явному запросу.

### E1-D1-T06 — Реализовать Telegram auth и sessions

- **status:** in_progress · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §10.2–10.3, §43.1–43.3, §44.1, §47.1, §55.1
- **depends_on:** E1-D1-T02, E1-D1-T04 · **decisions:** DEC-013, DEC-014, DEC-022, DEC-024, DEC-025, DEC-027
- **ui_slices:** S-MA-001, S-MA-002, S-MA-003, S-MA-004, S-MA-005, S-MA-006, S-WEB-001, S-WEB-002 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** проверка Telegram init data, создание пользователя/сессии, onboarding и безопасные browser/deep-link recovery states; bot command surfaces остаются этапу 5.
- **acceptance:** [ ] пароль не требуется; [ ] подпись и freshness проверяются; [ ] сессия безопасна; [ ] вне Telegram показано корректное состояние.
- **validation/evidence:** canonical auth requests/responses и screenshots отказа/успеха.
- **plan:** [`.temp/E1-D1-T06/plan.md`](../../../.temp/E1-D1-T06/plan.md) — фазирование backend-first; Phase 0 (backend auth core) approved 2026-07-13 (архитектура §5, freshness 24ч, сессия 30д+sliding). Plan confidence 85%, Phase 0 implementation confidence 82%.
- **journal:** 2026-07-13 — выбрана следующей после E1-D1-T04; `backlog -> in_progress`; фазирование утверждено (backend auth core → UI slices); bot gate scope = getChat verify, bot-cmds → этап 5; закрыты open questions (freshness 24ч, TTL 30д+sliding, PATCH /me = onboarding-поля, categories → этапы 2/4). Phase 0 implementation started. 2026-07-13 — **Phase 0 done**: `@flowly/core` (UUIDv7, time), `@flowly/telegram` (verifyInitData HMAC-SHA256, getChat), `apps/web/lib/{cloudflare,auth/*}` (session/cookie/CSRF/rate-limit/zod/users), API routes `/api/v1/{auth/telegram,auth/logout,me}`. Runtime curl-repro PASS (workerd preview, default env + D1): valid initData→200+HttpOnly/Secure cookie+user created; tampered hash→401; tampered user→401; expired auth_date→401; /me cookie→200 / no-cookie→401; no-Origin mutating→403 (CSRF); PATCH onboarding→200; logout→200. typecheck/lint/build PASS; secret scan 0 (.dev.vars gitignored, test token не в репо). Длительность T06 = in_progress (остаются 8 UI slices + acceptance «вне Telegram состояние"). 2026-07-13 — **Slice S-MA-001 (auth bootstrap) approved (DEC-024, дословно «заебись»)**: client `components/auth/auth-gate.tsx` (GET /me → если нет сессии, POST /auth/telegram с initData; full-screen loading/error per DEC-022; рендерит app только после сессии); `telegram.d.ts` (window.Telegram типы); интегрирован в `app/page.tsx`; dev-force `?auth=loading|error|ready` для превью. Browser-verify (next dev :3002): loading (logo+«Проверяем вход…»+skeletons, 0 errors), error (role=alert «Не удалось войти»+retry, full-screen), success→app (header+Home+5-tab nav). typecheck/lint PASS. Скриншоты `.temp/E1-D1-T06/screenshots/sma001-{loading,error}-430.png`. Dev-сервер на http://localhost:3002. 2026-07-13 — **Slice S-MA-002 (welcome) approved (DEC-024, дословно «заебок»)**: `features/onboarding/ui/welcome-screen.tsx` (calm intro: hero+Flowly mark, display-h1, описание, «Начать»+«Пропустить», P-WIZARD skip≠save; standalone full-canvas без bottom-nav); dev-preview `?onboarding=welcome` в `page.tsx`. Browser-verify: рендер ✅, «Начать»→`/?tab=home` ✅, 0 console errors на экране. typecheck/lint PASS. 2026-07-13 — **Slice S-MA-003 (preferences) approved (вариант A)**: `features/onboarding/ui/preferences-screen.tsx` (+ `packages/ui/src/select.tsx`, export из `packages/ui/src/index.ts`): расширенный timezone-селект с поиском city/region/time, clear, счётчиком результатов и клавиатурной навигацией. Dev-preview `?onboarding=preferences` в `page.tsx`. typecheck/lint PASS (`@flowly/ui`, `@flowly/web`). 2026-07-13 — **Slice S-MA-004 (first habit/invite prompts) implemented (preview only)**: `features/onboarding/ui/habit-invite-screen.tsx` (+ `.../habit-invite-screen.module.css`) с `?onboarding=habit`; оба prompt могут быть skipped без мутации в dev-preview; typecheck/lint PASS (`@flowly/web`). Скриншот evidence: `apps/web/.next/static/sma004-430.png`.

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
- **prd_refs:** §9, §10.1, §38.1, §55.1 · **depends_on:** E1-D1-T06, E1-D1-T08 · **decisions:** DEC-013, DEC-020, DEC-022, DEC-024, DEC-025, DEC-027
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
