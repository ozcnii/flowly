# Flowly — AI handoff

> Этот файл должен позволять продолжить работу без истории чата и независимо от agent harness.

## Текущее состояние

- **Обновлено:** 2026-07-14
- **Текущий этап:** 1. Основа
- **Активная задача:** E1-D1-T05 (R2 storage) — deep plan + реализация следующей.
- **Статус:** **T06 done** (Phase 0 + все 8 slice approved, без deep review). Foundation backlog: T05 (R2), T07 (envs), T08 (seeds), T09 (security/DoD), T10 (profile/help).
- **Последний завершённый результат:** E1-D1-T06 done — Telegram auth/sessions (backend + 8 UI slice: S-MA-001…006, S-WEB-001/002).

## Что сделано

- Проанализирован `docs/PRD.md`.
- Зафиксированы восемь этапов разработки из §54.
- Исторический общий design gate DEC-012 superseded решением DEC-024: production UI теперь создаётся в реальном Next.js по одному screen slice со всеми states/интеракциями и отдельным approval.
- Провальный monolithic E0-D0-T04 package и его review artifacts удалены; T00–T03 сохранены как normative requirements/reference.
- Подтверждены npm workspaces и pinned bootstrap stack: Next.js 16.2.10, React 19.2.7, Tailwind 4.3.2, TypeScript 5.9.3.
- Concept A перенесён в `docs/design/screens/concept-a/`: четыре экрана, визуальное направление, логотип, standalone HTML и browser preview.
- В `STATUS.md` зафиксированы покрытие Concept A и пробелы относительно PRD; approval отсутствует.
- Реализован и скорректирован пакет E0-D0-T01: 69 screen/surface IDs, F01–F11, 12 Mermaid diagrams, explicit per-ID state profiles, atomic observable traceability и механически симметричные 98 screen↔flow membership pairs.
- Реализован E0-D0-T02: 13 HTML pages по F01–F11, 69 canonical surfaces, 15 profiles/105 state demos, 38 tailored critical frames, 39 canonical + 3 evidence PNG, pinned reproducible Playwright capture и 69-row coverage matrix.
- Deep-review corrections: безопасные F04/F08 terminal branches, F01 browser recovery, F10 relationship/revoke/permission paths, F11 deletion-grace re-auth; §19.4 cache and §51.2 export contents made observable.
- Workshop decisions зафиксированы как DEC-013–DEC-022; DEC-009 заменён DEC-018.
- Linked decisions синхронизированы с downstream metadata; 40 UI-bearing карточек имеют `ui_slices`, DEC-024/025 и обязательный последовательный approval; все 69 canonical surface IDs назначены хотя бы одной карточке.
- Во все 9 stage-файлов добавлены обязательные contracts; `AGENTS.md` требует реальный `apps/web`, запрещает design generation и требует утверждённый public API `packages/ui` до product screens.
- В корневом `README.md` полный wordmark заменён на icon Flowly.
- Согласованы границы программных напоминаний и совместных программ.
- Согласовано выполнение проверок по ходу этапов.
- Согласован workflow из пяти статусов.
- Созданы индекс, stage boards, decision log, handoff и правила агентов.

## Что делать следующим

1. E1-D1-T05 (R2): deep plan → approval → реализация (bindings local/test/prod, безопасный storage adapter, без прямого public access, бизнес-логика не завязана на R2).
2. Затем T07 (envs) → T08 (seeds) → T09 (security/DoD gate) → T10 (profile/help).
3. Production Cloudflare deploy не выполнять без отдельного подтверждённого scope.

## Открытые блокеры

Открыты `DEC-006`, `DEC-007`, `DEC-008`, `DEC-010`, `DEC-011` в [`DECISIONS.md`](DECISIONS.md); DEC-009 и DEC-012 superseded. Они не блокируют E0-D0-T04. Production UI-kit утверждён; сохраняется обязательный per-screen approval по DEC-024.
- ~~Внешний blocker по визуалу для S-MA-004 (чек-маркер/расположение)~~ — **resolved**: блокер был по Главной (S-MA-010, галочка `.habitAction`), починен другим агентом в 3 коммитах; S-MA-004 чек-иконок не имел. Evidence оставлен: `docs/roadmap/evidence/check-spacing-blocker-2026-07-14.png`.

## Изменённые артефакты

- `README.md`
- `AGENTS.md`
- `docs/roadmap/README.md`
- `docs/roadmap/DECISIONS.md`
- `docs/roadmap/HANDOFF.md`
- `docs/roadmap/stages/00-design.md` … `08-stabilization.md`
- `docs/roadmap/stages/01-foundation.md`
- `docs/design/README.md`
- `docs/design/flows/**` — план, inventories, traceability, validation и 12 diagrams
- `docs/design/wireframes/**` — утверждённый план, HTML, CSS/JS registry, coverage, validation, capture toolchain и 42 PNG
- `docs/design/ui-kit/**` — утверждённый plan, HTML, JSON/CSS tokens, local fonts/icons, inventory, accessibility/validation, capture toolchain и 22 PNG
- `docs/design/screens/concept-a/**`
- `.temp/E0-D0-T04/next-interactive-plan.md` — утверждённый migration/implementation plan
- `apps/**`, `packages/**`, `migrations/`, `seeds/`, `scripts/` — E1-D1-T01/T02
- `apps/web/features/home/**`, `apps/web/public/media/**` — E0-D0-T04 full state set visual-approved и done
- `docs/roadmap/evidence/check-spacing-blocker-2026-07-14.png` — blocker proof для текущего UI-issue
- `packages/ui/**`, `apps/web/app/ui-kit/**` — E1-D1-T11 production UI-kit
- `apps/web/{open-next.config.ts,wrangler.jsonc,.dev.vars.example,public/_headers}` — OpenNext test web deployment
- `apps/scheduler/{src/index.ts,wrangler.jsonc,.dev.vars.example,worker-configuration.d.ts}` — scheduler health/no-op Cron Worker
- root/workspace manifests, `.gitignore`, `README.md` — Cloudflare toolchain и documented commands

## Проверка текущего изменения

Roadmap migration / bootstrap verification:

- [x] провальный `docs/design/screens/final/**`, старый T04 plan/reviews и `.pi-subagents` удалены;
- [x] DEC-024 approved; DEC-012 superseded;
- [x] старые T05/T06 удалены; T04 ограничен S-MA-010 и зависит от E1-D1-T02;
- [x] E1-D1-T01 `in_progress`; E1-D1-T02 разблокирован последовательностью T01 → T02;
- [x] 40 UI-bearing cards имеют `ui_slices`, sequential approval contract и покрывают все 69 canonical surface IDs;
- [x] E1-D1-T01: 9 npm workspaces, root lockfile, `npm install` 0 vulnerabilities, workspace query/build/typecheck/lint PASS;
- [x] E1-D1-T02: pinned stack, clean install, typecheck/lint/build/audit PASS; 24 browser runs, 2 screenshots, focus/overflow/nav/theme/dev-production isolation PASS;
- [x] E0-D0-T04 base checkpoint существует, но должен быть пересобран из approved `@flowly/ui`;
- [x] E1-D1-T11 package/public API: Button/IconButton/Card/Badge/Progress/AppHeader/BottomNavigation/Skeleton/EmptyState/InlineError/OfflineBanner;
- [x] `/ui-kit` browser matrix: 360/430/1280, light/dark, keyboard/focus, ≥44px targets, no overflow, interactions и reduced motion PASS;
- [x] `/ui-kit` visual approval: пользователь подтвердил «утверждаю ui kit» 2026-07-13;
- [x] E0-D0-T04 пересборка, full state set и visual approval Главной — done; deep review явно отклонён пользователем.
- [x] E1-D1-T03 local workerd/dry-run, typecheck/lint/build/audit/diff-check и candidate-file secret scan PASS;
- [x] `flowly-scheduler-test` deployed, version `cbca80ee-1d97-4c33-811b-12fdf282b38a`, Cron `* * * * *`;
- [x] `flowly-web-test` deployed, version `f482628c-a193-499d-b595-fc223cb15aab`;
- [x] remote Chromium: scheduler `/health`, web `/`, web `/ui-kit` = 200; production Workers untouched.

## Журнал handoff

### 2026-07-14 — E1-D1-T06 / Slice S-MA-005 preview + fix(habit select)

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T06 `in_progress` (S-MA-005 — preview, ждёт approval).
- **Сделано:**
  - **S-MA-005 (bot connection gate)** — `features/onboarding/ui/bot-connection-screen.{tsx,module.css}`, route `?onboarding=bot` в `app/page.tsx`; mandatory P-GATE (DEC-014, §10.1 step 9, §36), состояния `checking|linked|error`, dev-force `?bot=checking|linked|error`; completion disabled до верификации; дефолт авто checking→linked ~1.2с; убран `padding-left` у `.diagnostics`. Реальный `getChat` — этап 5.
  - **fix(habit):** нативная стрелка `<select>` поля «Время напоминания» не двигалась `padding-right` → `appearance:none` + `.selectWrap`/`.selectCaret` (chevron-down из `@flowly/ui`, тема-адаптивный, ~14px от края).
  - **S-MA-004 approved** пользователем; уточнено, что блокер «чек-иконки» был по Главной (S-MA-010), починен другим агентом.
  - Создан vision-субагент `code-analysis.vision-checker` на `openai-codex/gpt-5.3-codex-spark` для анализа скриншотов.
- **Проверки:** typecheck/lint PASS (`@flowly/web`); browser-verify 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors на экранах; select-caret confirmed (`appearance:none`, caret 14px от края).
- **Evidence:** `.temp/E1-D1-T06/screenshots/sma005-{checking,error}-430-light.png`, `sma005-linked-430-{light,dark}.png`, `sma004-select-caret-430-light.png`.
- **Блокеры / решения:** S-MA-005 ждёт явного approval (пользователь смотрит вживую); реальный `getChat` verify и Telegram WebView — этап 5/downstream.
- **Следующее точное действие:** approval S-MA-005 → запуск S-MA-006 (safe reason + auth/recovery/exit).

### 2026-07-14 — E1-D1-T06 / S-MA-005 approved + S-MA-006 approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `in_progress`; S-MA-005 (bot gate) и S-MA-006 (deep-link recovery) одобрены пользователем.
- **Сделано:**
  - **S-MA-006 (deep-link recovery)** — `features/recovery/ui/deep-link-recovery-screen.{tsx,module.css}`, отдельный dev-route `?recovery=unavailable|auth|permission` в `app/page.tsx` (не onboarding). Full-screen recovery (DEC-022): безопасная причина без раскрытия + recovery/auth + релевантный выход. 3 варианта: unavailable (→ Главная/Открыть в Telegram), auth (→ Войти заново loading→home / Главная), permission (→ Главная/Справка). Интеракция «Войти заново» проверена.
- **Проверки:** typecheck/lint PASS (`@flowly/web`); browser-verify 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors на экранах; «Войти заново» → loading → `/?tab=home` confirmed.
- **Evidence:** `.temp/E1-D1-T06/screenshots/sma006-{unavailable,auth,permission}-430-light.png`, `sma006-unavailable-430-dark.png`.
- **Блокеры / решения:** реальный access-recheck и Telegram WebView — downstream этапов; S-WEB-001/002 остались.
- **Следующее точное действие:** S-WEB-001 (open via Telegram).

### 2026-07-14 — E1-D1-T06 / S-WEB-001 approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `in_progress`; S-WEB-001 (outside-Telegram fallback) одобрен пользователем («чотко»). Остался S-WEB-002.
- **Сделано:** `features/web-fallback/ui/open-via-telegram-screen.{tsx,module.css}`, route `?web=open`. P-WEB (§10.3, unauthenticated): одна badge-иконка + «Откройте Flowly через Telegram» + «Открыть в Telegram»/«Справка»; данных приложения не показывается. Логотип убран по просьбе пользователя (был избыточен вместе с badge).
- **Проверки:** typecheck/lint PASS; 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors, 0 `<img>`.
- **Evidence:** `.temp/E1-D1-T06/screenshots/sweb001-open-430-{light,dark}.png`, `sweb001-open-430-light-nologo.png`.
- **Следующее точное действие:** S-WEB-002 (unavailable deep link).

### 2026-07-14 — E1-D1-T06 / S-WEB-002 approved → все 8 slice готовы, T06 в review

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `in_progress -> review`; все 8 UI slice approved (S-MA-001…006, S-WEB-001/002); acceptance закрыт.
- **Сделано:** S-WEB-002 `features/web-fallback/ui/unavailable-deep-link-screen.{tsx,module.css}`, route `?web=unavailable`. P-WEB (§10/§32/§36): safe reason без утечки target + «Открыть в Telegram»/«Справка».
- **Проверки:** typecheck/lint PASS; 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors.
- **Evidence:** `.temp/E1-D1-T06/screenshots/sweb002-unavailable-430-{light,dark}.png`.
- **Следующее точное действие:** решение пользователя по T06 (review→done) и выбор следующей задачи (foundation T05/T07/T08/T09/T10 либо этап 2).

### 2026-07-14 — E1-D1-T06 done (без deep review) / старт E1-D1-T05 (R2)

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `review -> done` (пользователь «Закрыть без review»); следующая — E1-D1-T05 (R2 storage), `backlog -> in_progress` после deep plan.
- **Сделано:** T06 закрыт: Phase 0 backend auth + 8 UI slice approved (S-MA-001…006, S-WEB-001/002), acceptance подтверждён evidence.
- **Остаточные риски T06:** реальный Telegram WebView/safe-area и end-to-end delivery — downstream; rate limit in-memory per-isolate; dev-emulation path не runtime-тестировался в production build.
- **Следующее точное действие:** deep plan E1-D1-T05 (R2).

### 2026-07-13 — E1-D1-T06 / Slice S-MA-004 preview implemented

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Сделано:** добавлен экран `features/onboarding/ui/habit-invite-screen.tsx` + `habit-invite-screen.module.css`, подключён route `?onboarding=habit` в `apps/web/app/page.tsx`. Экран даёт два prompt в рамках S-MA-004: `create/skip habit` и `invite/skip`, без принудительной мутации при skip.
- **Проверки:** `npm run lint --workspace @flowly/web` и `npm run typecheck --workspace @flowly/web` PASS, локальный browser-preview `/?onboarding=habit` (http://localhost:3002) без console-errors.
- **Следующее точное действие:** получить подтверждение/approval на S-MA-004 и только после него переходить к S-MA-005.

### 2026-07-13 — E1-D1-T06 / Slice S-MA-003 approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Сделано:** S-MA-003 (preferences) одобрен как вариант «A»; `features/onboarding/ui/preferences-screen.tsx` с searchable Select по таймзонам (+ `packages/ui/src/select.tsx`, экспорт через `packages/ui/src/index.ts`), route-hook `?onboarding=preferences` в `apps/web/app/page.tsx`.
- **Технические детали:** поиск по городу/региону/времени, live-счётчик результатов, clear, фокус/keyboard скролл и сохранение timezone как PATCH /me.
- **Проверки:** typecheck/lint PASS (`@flowly/ui`, `@flowly/web`).
- **Следующее точное действие:** запускать следующий onboard-скрин **S-MA-004** только после короткого preview по UX.

### 2026-07-13 — E1-D1-T06 / Phase 0 (backend auth core) done

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T06 `in_progress` (Phase 0 — milestone done; 8 UI slices впереди).
- **Сделано:** `@flowly/core` (UUIDv7, ISO-time, константы TTL/freshness); `@flowly/telegram` (`verifyInitData` HMAC-SHA256 WebAppData + constant-time + freshness + parse user; `hasUserStartedBot` getChat); `apps/web/lib/{cloudflare.ts,auth/{session,cookies,csrf,rate-limit,schemas,users,session-user,dev}.ts}`; API routes `/api/v1/{auth/telegram,auth/logout,me}/route.ts`; `.dev.vars.example` (TELEGRAM_BOT_TOKEN, FLOWLY_DEV_EMULATION); README auth-раздел.
- **Проверки и результаты:** typecheck/lint/build PASS во всех workspaces. Runtime curl-repro (workerd preview, default env + D1, тестовый bot token): valid initData→200+HttpOnly/Secure `__Host-flowly-session` cookie+user created; tampered hash→401; tampered user→401; expired auth_date→401; GET /me cookie→200 / no-cookie→401; mutating без Origin→403 (CSRF); PATCH onboarding→200; logout→200. `git diff --check` PASS; secret scan 0 (.dev.vars gitignored, тестовый токен не в репо).
- **Архитектурные решения (утверждены):** cookie `__Host-flowly-session` (HttpOnly/Secure/SameSite=Lax); token=random32B, в БД SHA-256 hash (UNIQUE); CSRF=Origin-check; rate limit=min in-memory (prod→этап 8/DEC-007); id=UUIDv7 в `@flowly/core`; PATCH /me=onboarding-поля; freshness 24ч; сессия 30д+sliding.
- **Residual risks:** dev-emulation path (`FLOWLY_DEV_EMULATION`, gate `NODE_ENV!=='production'`) не runtime-тестировался в Phase 0 (workerd preview=production build); активируется в `next dev` после `initOpenNextCloudflareForDev`. `getChat` bot gate (S-MA-005) использует real bot — stage 5. Cookie в реальном Telegram WebView/device — residual (slices). Rate limit in-memory per-isolate (слабый, documented).
- **Следующее точное действие:** Phase 1 — UI slice S-MA-001 (auth bootstrap) по DEC-024 с approval.

### 2026-07-13 — E1-D1-T06 / старт Phase 0 (backend auth core)

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; Phase 0 plan approved, реализация начата.
- **Решено:** фазирование backend-first; бот gate = getChat verify (bot-cmds → этап 5); архитектура §5 (cookie __Host-/HttpOnly/Secure/Lax, token=random32B+SHA-256, CSRF=Origin-check, RL=min in-memory, UUIDv7 в packages/core, PATCH /me=onboarding-поля); freshness auth_date 24ч; сессия 30д+sliding.
- **Проверено:** PRD §10.2–10.3/§43.1–43.3/§44.1/§47.1/§55.1, F01 auth flow, screen inventory S-MA-001…006/S-WEB-001/002, DEC-013/014/022/027; canonical Telegram initData algorithm (HMAC-SHA256 WebAppData).
- **Plan:** [`.temp/E1-D1-T06/plan.md`](../../.temp/E1-D1-T06/plan.md); Plan confidence 85%, Phase 0 implementation confidence 82%.
- **Следующее точное действие:** реализовать Phase 0 (packages/core id, packages/telegram init-data+bot, apps/web lib/auth + API routes), затем verify (typecheck/lint/build + curl-repro валидного/невалидного initData).

### 2026-07-13 — E1-D1-T04 done

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `review -> done`; автотесты для T04 не добавлялись (политика тестов смягчена, но пользователь решил, что ручная comprehensive verification достаточна).
- **Comprehensive verification (по запросу пользователя «проверь всё целиком»):** `npm ci` / typecheck / lint / `next build` / `deploy:check` (OpenNext + wrangler dry-run `--env test`) — все PASS. Закрыло прежний residual #7 (build/deploy теперь реально запущены). Зафиксировано ожидаемое wrangler-warning: `d1_databases` на top-level, но не в `env.test` — нормально для local-only scope; добавляется при создании test D1 (отдельный scope, без фейковых `database_id`).
- **AGENTS.md (проект):** политика тестов обновлена — автотесты разрешены, но только полезные на реальный функционал, не бойлерплейт.
- **Итог по T04:** `@flowly/database` (Drizzle schema 3 таблиц + client + drizzle.config); миграции `0000_foundation.sql` + `0001_token_hash_unique.sql`; D1 binding `DB` в `apps/web/wrangler.jsonc` (local-only); root/web `db:*` скрипты; README rollback/forward; DEC-027 nullability-контракт; deep review 0 багов. T06/T08/T10 разблокированы.
- **Следующее точное действие:** выбрать E1-D1-T05 (R2) или E1-D1-T06 (Telegram auth/sessions).

### 2026-07-13 — E1-D1-T04 / deep review пройден, fixes применены

- **От кого / кому:** субагент (reviewer, fresh context) → AI agent → пользователь / следующий агент.
- **Статус задачи:** `review`; deep review завершён, post-review fixes применены, ждёт `review -> done`.
- **Deep review:** 0 багов; подтверждено schema↔PRD §43.1–43.3 (1:1), конвенции, FK CASCADE + orphan-reject (проверено эмпирически на local D1), `db:generate` идемпотентен, `db:reset`→`db:migrate` чистый, local-only scope, пиннинг, pattern-консистентность, roadmap sync.
- **Закрытые находки (по решению пользователя):** (1) `auth_sessions.token_hash` → UNIQUE — правка `schema.ts`, миграция `0001_token_hash_unique.sql`, forward-apply и dup-insert reject проверены. (2) nullability/types-контракт 3 foundation-таблиц зафиксирован в DEC-027 (approved), слинкован с E1-D1-T06/T10. (3) residual-risk #2 смяггчён: FK enforcement активен в local D1 (проверено), production подтвердить downstream.
- **Проверки:** typecheck/lint PASS; `git diff --check` CLEAN; secret scan 0; evidence `.temp/E1-D1-T04/evidence/schema-snapshot.json` обновлён (включает `auth_sessions_token_hash_unique`).
- **Изменённые артефакты:** `packages/database/src/schema.ts`, `migrations/0001_token_hash_unique.sql` + meta, `docs/roadmap/DECISIONS.md` (DEC-027), `docs/roadmap/stages/01-foundation.md` (T04/T06/T10 decisions + journal), `docs/roadmap/HANDOFF.md`, `README.md`.
- **Следующее точное действие:** пользователь решает `review -> done`.

### 2026-07-13 — E1-D1-T04 / реализована, переведена в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> review`; deep review ждёт решения пользователя.
- **Сделано:** `@flowly/database` (Drizzle schema 3 foundation-таблиц + `createDatabase` client + `drizzle.config`); миграция `migrations/0000_foundation.sql` (flat-layout) + `migrations/meta/`; D1 binding `DB` в `apps/web/wrangler.jsonc` (local-only, `migrations_dir: ../../migrations`); `apps/web/scripts/db-reset-local.mjs`; root `db:generate`/`db:migrate`/`db:reset`/`db:seed` скрипты; README — раздел «Database (D1) и миграции» с rollback/forward procedure и schema-конвенциями.
- **Schema-конвенции (утверждены):** id = TEXT UUIDv7 (app-side), timestamps = TEXT ISO-8601 UTC, local dates `YYYY-MM-DD`, local times `HH:MM`, bool = integer 0/1, enums = text+Zod; FK ON DELETE CASCADE; `users.telegram_id` UNIQUE, `auth_sessions.token_hash` index.
- **Проверки и результаты:** clean `npm install`; `npm run typecheck`/`lint` PASS во всех workspaces; `db:generate` идемпотентен («No schema changes»); `db:reset`→`db:migrate` PASS (6 команд, `0000_foundation.sql` ✅); повторный `db:migrate` = «No migrations to apply!»; `.schema` snapshot — ровно `users`/`user_settings`/`auth_sessions`; `git diff --check` PASS; candidate-file secret scan 0. Risk-first: wrangler корректно резолвит `../../migrations` из apps/web без `migrations_pattern` (flat layout drizzle-kit 0.31.10).
- **Evidence:** `.temp/E1-D1-T04/evidence/schema-snapshot.json`, `.temp/E1-D1-T04/plan.md`.
- **Residual risks:** 4 moderate npm audit (esbuild dev-server advisory via drizzle-kit devDep, не применима к `generate`, override ломает tree — принято); FK enforcement активен в локальной D1 (проверено: orphan-INSERT отвергнут, CASCADE сработал), production подтвердить downstream (T06+); `default_reminder_policy_id` FK — этап 3; UUIDv7 app-side; OpenNext `getRequestContext().env.DB` не проверялся (downstream T06); scheduler D1 binding — этап 3; `next build` не запускался (D1 binding не влияет на него).
- **Следующее точное действие:** пользователь решает по deep review; затем `review -> done`.

### 2026-07-13 — E1-D1-T04 / deep plan готов, ждёт approval

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; код/deploy до approval не пишется.
- **Решено (4 развилки):** migration workflow = Drizzle Kit (TS schema → `generate` → SQL → `wrangler d1 migrations apply --local`); scope = 3 foundation-таблицы (`users`, `user_settings`, `auth_sessions`); D1 окружение = local-only; plan-файл создан.
- **Проверено:** изучены PRD §41/§43/§49.1–49.3, текущие `packages/database` (пусто), `migrations/seeds/scripts` (`.gitkeep`), root `package.json` (скрипты `db:*` уже заданы), web/scheduler wrangler.jsonc (D1 binding отсутствует), DEC-006/007/008/010/011 (блокируют только этап 8). Pinned: drizzle-orm 0.45.2, drizzle-kit 0.31.10, wrangler 4.110.0, Node ≥22. Подтверждён canonical workflow из Drizzle D1 get-started и Cloudflare D1 migrations docs.
- **Plan:** [`.temp/E1-D1-T04/plan.md`](../../.temp/E1-D1-T04/plan.md); Plan confidence 92%, Implementation confidence 88%. Главный риск — поведение wrangler с `../` в migrations_dir/pattern (risk-first шаг).
- **Изменённые артефакты:** `.temp/E1-D1-T04/plan.md`, `docs/roadmap/stages/01-foundation.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Следующее точное действие:** пользователь утверждает/корректирует schema-конвенции (§5) и план целиком; затем risk-first верификация wrangler migrations path и реализация.

### 2026-07-13 — E1-D1-T03 done

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `review -> done`.
- **Решение:** пользователь явно отклонил deep review фразой «Нет, закрыть».
- **Итог:** acceptance/evidence подтверждены, test deployments работают, residual risks записаны, production не затронут.
- **Следующее точное действие:** выбрать новую foundation-карточку; текущая задача закрыта.

### 2026-07-13 — E1-D1-T03 / test deployments ready for review

- **От кого / кому:** AI agent → reviewer / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Результат:** scheduler/web test Workers deployed отдельно; scheduler Cron зарегистрирован; remote Chromium smoke 200; финальные проверки PASS.
- **Evidence:** URLs/version IDs и команды записаны в карточке E1-D1-T03; 22 working-tree files относятся к Cloudflare implementation/roadmap.
- **Residual risks:** Cron execution/log не наблюдался; `urllib` блокируется edge 403/1010, Chromium проходит 200; production вне scope и не затрагивался.
- **Следующее точное действие:** провести или отклонить deep review, затем решить `review -> done`.

### 2026-07-13 — DEC-026 approved / getflowly registered

- **От кого / кому:** пользователь + Cloudflare Dashboard/API → AI agent / следующий агент.
- **Статус задачи:** `blocked -> in_progress`; DEC-026 approved.
- **Факт:** `getflowly.workers.dev` проверен как available, выбран пользователем, зарегистрирован через Dashboard и подтверждён API GET.
- **Безопасность:** production Workers не затронуты; OAuth token не выводился/не сохранялся в проект.
- **Следующее точное действие:** test-only scheduler/web deploy и remote smoke.

### 2026-07-13 — DEC-026 / malformed subdomain correction

- **От кого / кому:** Cloudflare Dashboard/API → AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> blocked`; DEC-026 `approved -> open` до корректного выбора.
- **Факт:** interactive prompt сначала отклонил `flowly-wellness`, затем из-за повторного ввода зарегистрировал malformed account subdomain. Последующий API `409` / code `10036` означал «account already has an associated subdomain» и не являлся проверкой доступности нового имени; доступные варианты позже проверены через Dashboard без подтверждения update.
- **Безопасность:** production Workers не затронуты; OAuth token не выводился/не сохранялся в проект.
- **Следующее точное действие:** выбрать подтверждённый Dashboard вариант, выполнить dashboard rename и test-only deploy.

### 2026-07-13 — DEC-026 / first choice

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `blocked -> in_progress`.
- **Решение:** попытаться зарегистрировать `flowly-wellness.workers.dev`; финальным решением позже стал `getflowly.workers.dev`.
- **Следующее точное действие:** повторить только test scheduler/web deploy и remote smoke; production не трогать.

### 2026-07-13 — E1-D1-T03 / workers.dev subdomain blocker

- **От кого / кому:** Cloudflare runtime → AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> blocked`; создан DEC-026.
- **Факт:** OAuth PASS; scheduler bundle upload PASS, publish FAIL до регистрации account-level workers.dev subdomain.
- **Безопасность:** OAuth code/token не сохранён в репозитории; production Workers не затронуты.
- **Следующее точное действие:** пользователь выбирает уникальное `<name>.workers.dev`; после регистрации повторить test deploy.

### 2026-07-13 — E1-D1-T03 / local deployment verification PASS

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; remote test deploy pending OAuth.
- **Сделано:** OpenNext web config, separate scheduler health/no-op cron, test/production Worker identities, generated env types, documented binding/secret contract, Node >=22 toolchain.
- **Checks:** typecheck/lint/build/audit PASS; web workerd `/` + `/ui-kit` 200; scheduler `/health` + `/__scheduled` 200; web/scheduler dry-runs PASS; secret scan 0.
- **Bundle evidence:** web 4711.05 KiB upload / 981.22 KiB gzip; scheduler 0.41 KiB / 0.28 KiB.
- **Blocker:** Cloudflare OAuth callback server работает на localhost:8976; пользователь должен войти/authorize в открытом tab.
- **Следующее точное действие:** после подтверждения пользователя проверить `wrangler whoami` и выполнить только test deploy.

### 2026-07-13 — E1-D1-T03 / plan approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress`; implementation authorized.
- **Approval:** пользователь явно ответил «да» на `.temp/E1-D1-T03/plan.md`.
- **Scope:** OpenNext web, isolated scheduler health/no-op cron, local/dry-run, затем real test deploy; production deploy/D1/R2/business logic запрещены.
- **Следующее точное действие:** установить pinned toolchain и реализовать configs/bootstrap.

### 2026-07-13 — E1-D1-T03 / deep plan ready

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; implementation not started, plan approval pending.
- **Plan:** `.temp/E1-D1-T03/plan.md`; Plan confidence 95%, Implementation confidence 86%.
- **Подтверждено:** real test deploy; canonical worker names; no fake D1/R2 IDs; scheduler health + no-op cron.
- **Evidence:** current repo inspected; official Cloudflare/OpenNext docs and OpenNext commit `97ef330c6c976b15dd870f8cc280540f41e8833b`; current Next 16.2.10 входит в OpenNext 1.20.1 peer range; Wrangler 4.110 requires Node >=22.
- **Blocker:** Wrangler unauthenticated; remote verification needs user OAuth during approved implementation.
- **Следующее точное действие:** получить явный approval плана; до этого code/deploy запрещены.

### 2026-07-13 — E1-D1-T03 / deep analysis started

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; owner `unassigned -> AI agent`.
- **Решение:** следующая задача — Cloudflare deployments; отдельный русский plan-файл обязателен.
- **Границы:** web/scheduler deployments раздельны; production secrets не попадают в репозиторий; реализация до approval плана запрещена.
- **Следующее точное действие:** изучить PRD/DEC-011, текущие manifests/config и актуальные OpenNext/Cloudflare contracts; написать `.temp/E1-D1-T03/plan.md`.

### 2026-07-13 — E0-D0-T04 / closed without deep review

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `review -> done`.
- **Решение:** пользователь явно отказался от deep review: «не стоит, можешь закрывать».
- **Итог:** acceptance полностью закрыт; проверки/evidence сохранены; следующий screen slice разблокирован.
- **Residual risks:** mock data не подтверждает backend behavior; реальный Telegram WebView/device safe-area проверяется downstream.
- **Следующее точное действие:** выбрать E1-D1-T03 либо E1-D1-T04; самостоятельно выбор не делать.

### 2026-07-13 — E0-D0-T04 / final visual approval

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Approval evidence:** дословно: «заебись» после демонстрации base и полного state set.
- **Acceptance:** все пункты закрыты; typecheck/lint/build и browser evidence PASS; residual risk реального Telegram WebView остаётся за device validation.
- **Следующее точное действие:** спросить «Провести deep review?»; без ответа не переводить задачу в `done` и не начинать следующий screen slice.

### 2026-07-13 — E0-D0-T04 / contextual states implemented

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; implementation complete, final visual approval pending.
- **Сделано:** dev-only `home` scenarios `loading`, `empty`, `module-error`, `offline`, `resume`; skeleton modules, empty-day с 3 CTA, local error/retry, offline local-save feedback и distinct resume banner. Все состояния продолжают визуальное направление Concept A и используют production UI-kit.
- **Проверки:** root typecheck/lint/build PASS; 360/430/1280 light/dark; overflow 0; targets ≥44px; console errors 0; reduced motion, non-zero safe-area, empty actions, error retry lifecycle, offline habit mutation и resume action PASS.
- **Evidence:** `.temp/E0-D0-T04/screenshots/home-state-{loading,empty,module-error,offline,resume}-430.png`, `home-state-module-error-card.png`, `home-states-contact-sheet.jpg`.
- **Следующее точное действие:** финальный user review полного state set; не начинать следующий screen slice.

### 2026-07-13 — E0-D0-T04 / base state approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress`; base state approved, contextual states ещё не реализованы.
- **Approval evidence:** дословно: «главная теперь выглядит замечательно».
- **Закрыто:** normal/base composition, visual direction `Concept A + contracts`, generated photography, core interactions.
- **Следующее точное действие:** реализовать loading/empty/module-error/offline/resume, затем показать полный state set для финального approval Главной.

### 2026-07-13 — E0-D0-T04 / Concept A + generated photography checkpoint

- **От кого / кому:** пользователь → AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; base state повторно ожидает visual approval.
- **Feedback:** пользователь отклонил длинный dashboard и векторные изображения как непохожие на Concept A; выбрал `Concept A + contracts` и генерацию реальных людей через ChatGPT MCP.
- **Сделано:** Главная возвращена к спокойной mobile-first иерархии Concept A; resume стал компактным условным блоком; progress/categories/current program/habits/primary CTA образуют основной сценарий; weekly/recommendation/shared activity сохранены ниже как компактные contracts. Через ChatGPT сгенерированы 4:3 resume-photo и 1:1 program-photo, скачаны оригиналы, созданы WebP 1200×900 и 1000×1000.
- **Изменённые файлы:** `apps/web/features/home/**`, `apps/web/public/media/home-{resume,program}.webp`, `.temp/E0-D0-T04/generated/**`, task evidence/handoff.
- **Проверки и результаты:** root typecheck/lint/build PASS; Playwright 360/430/1280 light/dark; overflow 0; targets ≥44px; tabs 5/current 1; interactions/live notice PASS; console errors 0.
- **Evidence:** `.temp/E0-D0-T04/screenshots/home-concept-a-contracts-{360-dark-viewport,430-light,1280-light}.png`; generated prompts/originals в `.temp/E0-D0-T04/generated/`.
- **Следующее точное действие:** получить approval или единый пакет замечаний по новому base state; contextual states до этого не начинать.

### 2026-07-13 — E0-D0-T04 / approved-kit base checkpoint

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; остановка на review base state по DEC-024.
- **Сделано:** `/` снова показывает Главную; normal state пересобран на `Card`, `Button`, `IconButton`, `Badge`, `Progress`, `Icon`; shell переведён на production `BottomNavigation` и `OfflineBanner`; представлены day progress, resume, today plan, quick start, current program, habits, weekly rhythm, recommendation и explicitly shared friend activity.
- **Изменённые файлы:** `apps/web/app/page.tsx`, `components/shell/app-shell.tsx`, `features/home/**`, task evidence/handoff.
- **Проверки и результаты:** root typecheck/lint/build PASS; Playwright 360/430/1280 light/dark; overflow 0; interactive targets ≥44px; focus 3px; tabs 5/current 1; profile href, category selection, habit toggle/live notice PASS; console errors 0.
- **Evidence:** `.temp/E0-D0-T04/screenshots/home-approved-kit-base-{360-light-viewport,430-dark-viewport,1280-light}.png`.
- **Блокеры / решения:** технических блокеров нет; contextual states не начинать до пользовательского review base state.
- **Следующее точное действие:** принять пакет визуальных замечаний либо approval base state.

### 2026-07-13 — E1-D1-T11 утверждена / E0-D0-T04 разблокирована

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задач:** E1-D1-T11 `in_progress -> review -> done`; E0-D0-T04 `blocked -> in_progress`.
- **Approval:** дословно: «утверждаю ui kit».
- **Синхронизация:** acceptance T11 закрыт; stage 0/1 summaries, roadmap index, DEC-025 evidence и handoff обновлены.
- **Residual risk:** реальный Telegram WebView/safe-area переносится в device validation product screens.
- **Следующее точное действие:** пересобрать base Главной из `@flowly/ui` и остановиться на пользовательском review base state.

### 2026-07-13 — E1-D1-T11 / production UI-kit ожидает approval

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; E0-D0-T04 остаётся `blocked`.
- **Сделано:** создан независимый `@flowly/ui` с canonical tokens/themes и 12 production component families; собран интерактивный `/ui-kit`; заглушка `F` в app shell заменена фирменным знаком Flowly, знак также используется как favicon.
- **Изменённые файлы:** `packages/ui/**`, `apps/web/app/ui-kit/**`, `apps/web/public/brand/flowly-icon.svg`, `apps/web/app/icon.svg`, shell/config/global imports и task evidence.
- **Проверки и результаты:** root typecheck/lint/build PASS; `/ui-kit` static; Playwright 360/430/1280 light/dark, no overflow, ≥44px targets, keyboard focus 3px, loading/disabled/live status, navigation и reduced motion PASS; console errors 0.
- **Evidence:** `.temp/E1-D1-T11/ui-kit-{360-light,430-dark,1280-light}.png`, `.temp/E1-D1-T11/shell-real-logo-430.png`.
- **Блокеры / решения:** требуется только явный visual approval пользователя; Telegram WebView/safe-area остаётся residual risk.
- **Следующее точное действие:** принять пакет визуальных замечаний либо явный approval; product screens до этого не продолжать.

### 2026-07-13 — DEC-025 / production UI-kit gate

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задач:** E0-D0-T04 `in_progress -> blocked`; E1-D1-T11 `backlog -> in_progress`.
- **Причина:** статический reference UI-kit использовался только как tokens/fonts/icons, а `packages/ui` оставался пуст; consistency production screens не гарантировалась.
- **Решение:** сначала создать/утвердить production components и `/ui-kit`, затем пересобрать Главную исключительно из утверждённого public API.
- **Следующее точное действие:** реализовать T11 и остановиться на visual approval `/ui-kit`.

### 2026-07-13 — DEC-024 / переход к интерактивным Next.js screen slices

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** E1-D1-T01 `backlog -> in_progress`; старый T04 scope superseded.
- **Решение:** удалить только провальный generated T04, сохранить T00–T03, bootstrap реальный Next.js через npm workspaces, затем реализовывать по одному экрану + states; первой будет Главная S-MA-010.
- **Roadmap:** DEC-012 superseded DEC-024; E0-D0-T05/T06 удалены; downstream UI cards получили `ui_slices` и per-ID approval contract.
- **План:** `.temp/E0-D0-T04/next-interactive-plan.md`, Plan confidence 94%, Implementation confidence 91%; утверждён пользователем.
- **T01 evidence:** root package/lockfile, 9 workspace manifests, `npm install` и `npm query .workspace` PASS; выполнен `in_progress -> review -> done`.
- **T02 evidence:** `npm ci`, typecheck/lint/build/audit PASS; 24 browser runs; `.temp/E1-D1-T02/screenshots/**`; выполнен `in_progress -> review -> done`.
- **T04 base evidence:** `apps/web/features/home/**`; `.temp/E0-D0-T04/screenshots/home-base-clean-{360-light,430-dark,1280-light}.png`; typecheck/lint/build и browser interaction checks PASS.
- **Следующее точное действие:** показать base state пользователю и остановиться до feedback; никакого review-loop или следующего state заранее.

### 2026-07-13 — E0-D0-T03 / пользователь принял corrected UI-kit

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** `review -> done`.
- **Подтверждение:** пользователь явно поручил перевести задачу, закоммитить и запушить после corrected validation PASS.
- **Evidence:** acceptance закрыт; 5 blockers + 4 warnings исправлены; `npm run validate` и deterministic capture PASS; 23 snapshots зафиксированы.
- **Residual risks:** реальный Telegram WebView/notch, production async announcements и cross-OS rasterization сохранены в карточке/validation report.
- **Следующее точное действие:** начать E0-D0-T04.

### 2026-07-13 — E0-D0-T03 / deep-review findings закрыты

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress -> review`; дополнительный review не запускался.
- **Исправлено:** per-family state/anatomy/token/keyboard/surface contracts; visual state laboratory/full-screen shell error; `aria-pressed`/`aria-current`; Telegram theme/viewport/four-sided safe-area mapping; поставляемый `npm run validate`; true root 200% reflow без скрытия; browser setup; safe server root guard; полный effective-target audit.
- **Проверки:** `npm run validate` PASS (generated drift 0, 22/22 contrast, 69/69 surfaces, 23 snapshots, links/roadmap PASS); capture 18+5 PASS; два capture byte-identical; `git diff --check` PASS.
- **Evidence:** `component-inventory.md`, `telegram-environment.md`, `accessibility-checklist.md`, `snapshot-manifest.md`, `validation-report.md`.
- **Residual risks:** реальный Telegram WebView/notch, production async announcements и cross-OS rasterization.
- **Следующее точное действие:** пользовательское подтверждение; затем `done` и E0-D0-T04.

### 2026-07-13 — E0-D0-T03 / independent deep review

- **От кого / кому:** fresh-context reviewer → AI agent / пользователь.
- **Статус задачи:** `review -> in_progress`; review gate FAIL.
- **Findings:** 5 blockers — incomplete per-component state/anatomy contract, missing selected ARIA semantics, missing Telegram environment mapping, non-reproducible static/69-surface validation claims, hidden controls/labels in 200% mode. 4 warnings — four-sided safe-area evidence, clean-machine browser setup, capture-server path guard, incomplete interactive-target audit.
- **Артефакт:** `.temp/E0-D0-T03/reviews/deep-review.md`.
- **Изменения реализации:** не применялись; только синхронизированы task status/evidence/handoff.
- **Следующее точное действие:** после подтверждения пользователя исправить findings одним проходом и повторить validation; дополнительный review автоматически не запускать.

### 2026-07-13 — E0-D0-T03 / реализация переведена в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Сделано:** реализован утверждённый self-contained UI-kit: canonical JSON → generated CSS, local Inter/Cormorant/Lucide с лицензиями, responsive light/dark catalog, 24 component families, DEC-022 patterns и 69/69 surface mapping.
- **Изменённые файлы:** `docs/design/ui-kit/**`, `docs/design/README.md`, `docs/roadmap/DECISIONS.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки:** generation PASS; 22 contrast pairs PASS; browser 360/430/1280 light/dark PASS; 200% text/focus/reduced-motion/safe-area PASS; 22 PNG deterministic; links/syntax/`git diff --check` PASS. Автотесты не добавлялись.
- **Evidence:** `docs/design/ui-kit/component-inventory.md`, `accessibility-checklist.md`, `snapshot-manifest.md`, `validation-report.md`.
- **Residual risks:** реальный Telegram WebView/notch и production async semantics не проверены; high-fi composition относится к T04.
- **Следующее точное действие:** пользовательский review; затем `done` либо точечные findings.

### 2026-07-13 — E0-D0-T03 / старт deep analysis

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; owner `unassigned -> AI agent`.
- **Проверено:** E0-D0-T01/T02 завершены; другая активная карточка отсутствует; прочитаны roadmap, handoff, PRD §40/§55.1, DEC-012–DEC-022, flows/inventories/diagrams и wireframe contracts.
- **Границы:** Concept A остаётся неутверждённым reference; UI-kit обязан покрыть mobile-first 360–430, wider screens, Telegram light/dark, safe area, touch/focus/contrast и contextual state model DEC-022.
- **Решения:** пользователь выбрал отдельный план, развитие Concept A, локальные Inter + Cormorant Garamond, Lucide и формат HTML + CSS + JSON + PNG; записано в DEC-023 и downstream metadata.
- **План:** [`docs/design/ui-kit/E0-D0-T03-plan.md`](../design/ui-kit/E0-D0-T03-plan.md), Plan confidence 94%, Implementation confidence 91%.
- **Approval:** пользователь явно утвердил план 2026-07-13; реализация разрешена.
- **Следующее точное действие:** собрать token pipeline, local assets и component catalog, затем выполнить validation.

### 2026-07-13 — E0-D0-T02 / пользователь принял wireframes

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** `review -> done`.
- **Подтверждение:** пользователь явно сообщил, что всё ок, и дал добро закрыть задачу; дополнительный review не требуется.
- **Evidence:** acceptance checklist закрыт; validation PASS; `docs/design/wireframes/**` содержит coverage, manifest и reproducible captures.
- **Блокеры / риски:** продуктовых блокеров нет; residual risks сохранены в карточке и validation report.
- **Следующее точное действие:** начать E0-D0-T03 — UI-kit и дизайн-система.

### 2026-07-13 — E0-D0-T02 / реализация переведена в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Сделано:** реализованы 69 canonical wireframes по F01–F11, visual state profiles и tailored critical branches; закрыты review findings по content caps, CTA semantics, shell/accessibility и snapshot reproducibility.
- **Изменённые файлы:** `docs/design/wireframes/**`, `docs/design/README.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки и результаты:** 69/15/98/38 coverage PASS; browser responsive/theme/text-scale PASS; 42 PNG + hashes PASS; два последовательных captures byte-identical; `git diff --check` PASS; автотесты не добавлялись.
- **Evidence:** `docs/design/wireframes/coverage-matrix.md`, `snapshot-manifest.md`, `validation-report.md`.
- **Блокеры / решения:** продуктовых блокеров нет; staged `AGENTS.md` — внешнее состояние worktree; non-zero safe-area остаётся residual risk.
- **Следующее точное действие:** пользовательский review; затем `done` либо точечные замечания.

### 2026-07-13 — E0-D0-T02 / старт deep analysis

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** `backlog -> in_progress`; owner — AI agent.
- **Сделано:** пользователь подтвердил старт E0-D0-T02, отдельный русский deep plan, HTML+PNG, организацию по F01–F11, grayscale low-fi и стратегию «15 profiles + critical states»; deep analysis завершён.
- **Изменённые файлы:** `docs/design/wireframes/E0-D0-T02-plan.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки и результаты:** изучены PRD §9–39/§40.2, DEC-012–DEC-022, 69 surfaces, 15 profiles, F01–F11/98 memberships, diagrams, traceability и Concept A gaps; одновременно других активных карточек нет.
- **Evidence:** отдельный план и синхронизированные карточка, stage summary, общий индекс и handoff.
- **Блокеры / решения:** пользователь явно утвердил план; новые продуктовые решения самостоятельно не принимаются. Findings первого review закрыты: отдельные visual state/critical frames, observable layouts, русская семантика, contextual shell, keyboard semantics и корректные S-MA-094/095; validation report и единый snapshot set созданы.
- **Следующее точное действие:** завершить финальный независимый re-review; затем перевести карточку в `review` либо вернуть findings в реализацию.

### 2026-07-13 — Синхронизация решений с downstream-задачами

- **От кого / кому:** пользователь → AI agent → все следующие агенты.
- **Результат:** DEC-013–DEC-022 связаны с конкретными task cards; stage contracts и agent workflow делают их обязательными для исполнения.
- **Изменённые файлы:** `README.md`, `AGENTS.md`, `docs/roadmap/README.md`, `DECISIONS.md`, `HANDOFF.md`, `stages/00-design.md` … `08-stabilization.md`.
- **Проверки:** 72 cards parsed; 68 cards с decisions; 0 неизвестных DEC; 0 active refs на superseded DEC-009; 9/9 stage contract sections; icon и repository-relative links существуют.
- **Следующее точное действие:** commit/push текущего пакета, затем начать E0-D0-T02.

### 2026-07-13 — E0-D0-T01 / deep review завершён

- **От кого / кому:** AI agent → независимые reviewers → следующий агент.
- **Статус задачи:** done.
- **Findings:** исправлены F04 active-session branching, F08 terminal/snooze/Start, social revoke/permissions, deletion re-auth, bidirectional membership, per-ID states, atomic PRD traceability, Concept A mapping и diagram evidence.
- **Проверки:** финальный независимый gate — blockers отсутствуют; 69 IDs, 98 symmetric pairs, 15 profiles, 250 traceability rows, 12 Mermaid blocks, 0 broken links, roadmap sync и `git diff --check` PASS.
- **Residual risk:** Mermaid не проверялся реальным renderer/CLI; визуальная проверка переносится в E0-D0-T02.
- **Следующее точное действие:** начать E0-D0-T02.

### 2026-07-13 — E0-D0-T01 / реализация IA и flows

- **От кого / кому:** пользователь → AI agent → независимый reviewer.
- **Статус задачи:** review.
- **Сделано:** утверждённый план реализован в Markdown + Mermaid; добавлены 69 surface IDs, F01–F11, overview + 11 diagrams, state/privacy и PRD traceability; workshop decisions перенесены в DEC-013–DEC-022.
- **Изменённые файлы:** `docs/design/README.md`, `docs/design/flows/**`, `docs/roadmap/DECISIONS.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки и результаты:** custom Python validation PASS (IDs, F01–F11, state columns, reverse refs, Markdown links, balanced Mermaid fences); roadmap counts PASS; `git diff --check` PASS; tests не добавлялись.
- **Evidence:** [`validation-report.md`](../design/flows/validation-report.md), [`traceability-matrix.md`](../design/flows/traceability-matrix.md), [`diagrams/`](../design/flows/diagrams/).
- **Блокеры / решения:** open DEC-006/007/008/010/011 — downstream; новых UX-блокеров нет. Mermaid не проверялся renderer CLI.
- **Следующее точное действие:** независимый acceptance review E0-D0-T01; затем `done` или возврат замечаний в `in_progress`.

### 2026-07-13 — E0-D0-T01 / deep analysis и план

- **От кого / кому:** пользователь → AI agent.
- **Статус задачи:** in_progress; реализация ожидает approval плана.
- **Сделано:** после commit `cbc5acd` карточка назначена AI agent; проанализированы PRD, Concept A и 11 flow families; проведён UX-workshop; создан `docs/design/flows/E0-D0-T01-plan.md`.
- **Решения:** Markdown + Mermaid, overview + 11 доменов, Concept A как референс; ответы пользователя перечислены в плане и должны быть перенесены в `DECISIONS.md` после approval.
- **Следующее точное действие:** получить явное approval плана E0-D0-T01.

### 2026-07-13 — E0-D0-T00 / импорт Concept A

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** done.
- **Сделано:** исходный HTML-мокап перенесён в `docs/design/screens/concept-a/`; сохранены assets, standalone HTML, preview и gap-analysis.
- **Изменённые файлы:** `README.md`, `docs/design/**`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`, `docs/roadmap/stages/00-design.md`.
- **Проверки и результаты:** HTTP 200 для основной/standalone версий и ключевых assets; browser render успешен; console содержит только необязательный 404 `favicon.ico`.
- **Evidence:** `docs/design/screens/concept-a/preview.png`, `STATUS.md`.
- **Блокеры / решения:** Concept A не утверждён и не закрывает E0-D0-T01–T06.
- **Следующее точное действие:** начать E0-D0-T01 с полной карты экранов и user flows.

### 2026-07-13 — Добавление обязательного UX/UI-этапа

- **От кого:** пользователь / AI agent
- **Кому:** следующий AI agent
- **Результат:** добавлен этап 0 до разработки с обязательными user flows, wireframes, UI-kit, финальными макетами, интерактивным прототипом и явным approval.
- **Изменённые файлы:** `docs/roadmap/README.md`, `DECISIONS.md`, `HANDOFF.md`, `stages/00-design.md`, `stages/01-foundation.md`, `docs/design/README.md`.
- **Следующее действие:** начать E0-D0-T01 и сохранять артефакты в `docs/design/flows/`.
- **Исторический блокер:** этапы 1–8 не начинать до approval E0-D0-T06 — superseded решением DEC-024 от 2026-07-13.

### 2026-07-13 — Инициализация roadmap

- **От кого:** AI agent
- **Кому:** следующий AI agent / пользователь
- **Результат:** создана переносимая kanban-документация.
- **Осталось:** выбрать первую реализационную карточку.
- **Риски:** operational параметры в `DEC-006`–`DEC-011` пока не утверждены.

## Шаблон следующей записи

```markdown
### YYYY-MM-DD HH:MM — TASK-ID / краткое действие

- **От кого / кому:**
- **Статус задачи:**
- **Сделано:**
- **Изменённые файлы:**
- **Проверки и результаты:**
- **Evidence:**
- **Блокеры / решения:**
- **Следующее точное действие:**
```
