# Flowly

<p align="center">
  <img src="docs/design/screens/concept-a/assets/flowly-icon.svg" alt="Flowly" width="180">
</p>

Telegram Mini App для йоги, привычек, напоминаний и отслеживания прогресса.

- [PRD](docs/PRD.md)
- [Roadmap](docs/roadmap/README.md)

## Workspace

Flowly использует npm workspaces:

```text
apps/web          — Next.js Telegram Mini App
apps/scheduler    — отдельный scheduler
packages/*        — core/database/integrations/UI/config boundaries
migrations/       — D1 migrations
seeds/            — repeatable seed data
scripts/          — repository automation
```

Основные команды:

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run preview
```

## Cloudflare Workers

Требуется Node.js `>=22`. Web и scheduler разворачиваются как отдельные Workers:

| Environment | Web | Scheduler |
|---|---|---|
| Test | `flowly-web-test` | `flowly-scheduler-test` |
| Production | `flowly-web` | `flowly-scheduler` |

Локальная разработка web остаётся на `next dev`. Для проверки production-like runtime используются отдельные workerd previews:

```bash
npm run preview
npm run preview:scheduler
npm run deploy:check
```

Scheduler preview запускается с `--test-scheduled`:

```text
GET http://localhost:8787/health
GET http://localhost:8787/__scheduled?cron=*+*+*+*+*
```

Перед локальной работой с environment variables скопируйте соответствующий безопасный example; реальные `.dev.vars` игнорируются git:

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars
cp apps/scheduler/.dev.vars.example apps/scheduler/.dev.vars
```

Test deployment после `npx wrangler login`:

```bash
npm run deploy:test
```

`npm run deploy:production` существует для будущего release workflow и не должен запускаться без отдельного подтверждения.

### Binding contract

| Worker | Binding | Ресурс | Карточка-владелец |
|---|---|---|---|
| Web | `ASSETS`, `IMAGES`, `WORKER_SELF_REFERENCE` | static assets, image transforms, self service | E1-D1-T03 |
| Web | `DB` | D1 | E1-D1-T04 |
| Web | `STORAGE` | R2 | E1-D1-T05 |
| Web | Telegram/YouTube secrets | Worker secrets | E1-D1-T06 и downstream integration cards |
| Scheduler | `DB` | D1 | E1-D1-T04 |
| Scheduler | `TELEGRAM_BOT_TOKEN` | Worker secret | E1-D1-T06 |

Фиктивные D1/R2 IDs и production secrets в репозиторий не добавляются. Secrets устанавливаются отдельно для каждого environment через Wrangler/Cloudflare dashboard.

## Database (D1) и миграции

База данных — Cloudflare D1 (SQLite). ORM — Drizzle, миграции — SQL, источник истины — TypeScript-схема в `packages/database/src/schema.ts`. E1-D1-T04 покрывает только foundation-таблицы (`users`, `user_settings`, `auth_sessions`); остальные таблицы добавляются по этапам.

D1 binding (`DB`) объявлен в `apps/web/wrangler.jsonc` для локального окружения; миграции лежат в корневом `migrations/` и применяются в локальную (miniflare) D1. Реальные test/production D1 не создаются (local-only scope).

Команды (из root):

```bash
npm run db:generate     # сгенерировать SQL-миграцию из TS-схемы (drizzle-kit generate)
npm run db:migrate       # применить миграции в локальную D1 (wrangler d1 migrations apply --local)
npm run db:reset         # очистить локальную D1 и заново применить все миграции
npm run db:seed          # seed (реализуется в E1-D1-T08)
```

Чтобы добавить таблицу/колонку: отредактируйте `packages/database/src/schema.ts`, запустите `npm run db:generate -- --name <описание>`, проверьте сгенерированный SQL в `migrations/`, затем `npm run db:migrate`.

Rollback / forward:

- D1-миграции forward-only: `db:migrate` применяет новые миграции последовательно, `d1_migrations` хранит применённые.
- Rollback выполняется новой миграцией, обращающей предыдущую (drop/revert). Руками удалять строки из `d1_migrations` не нужно.
- Полный пересбор локальной БД: `npm run db:reset`.

Schema-конвенции (все 31 таблицы): id = `text` (UUIDv7 app-side), timestamps = `text` ISO-8601 UTC, local dates = `text YYYY-MM-DD`, local times = `text HH:MM`, bool = `integer 0/1`, enums = `text` + Zod-валидация. FK объявлены с `ON DELETE CASCADE`; enforcement активен в локальной D1 (miniflare, проверено: orphan-INSERT отвергнут, CASCADE сработал) — production D1 подтвердить downstream (T06+).

## Storage (R2)

Файлы — Cloudflare R2 (PRD §46): пользовательские изображения, GIF, обложки, карточки отчётов, резервные JSON-экспорты. E1-D1-T05 покрывает только R2-binding и безопасный adapter; продуктовые upload/access flows (валидация MIME/размера, авторизованный маршрут чтения, удаление orphan-файлов) — этап 2.

R2 binding (`STORAGE`, bucket `flowly-storage`) объявлен в `apps/web/wrangler.jsonc` для локального окружения (local-only scope). Реальные test/production bucket не создаются (отдельный scope, по аналогии с D1). **Прямой публичный доступ не включён** — доступ только через adapter (`getStorage()` из `apps/web/lib/cloudflare.ts`); авторизованные маршруты чтения появляются на этапе 2.

Adapter — `@flowly/storage`: `createStorage(bucket): StorageAdapter` с методами `put/get/delete/exists` и хелпером `storageKey({ kind, id, ext })` (серверная генерация ключа, §46.2). Бизнес-код зависит от интерфейса `StorageAdapter`, а не от `R2Bucket` напрямую.

- Ключи объектов: `<kind>/<uuidv7>.<ext>`, `kind ∈ images|gifs|covers|reports|exports`.
- Лимиты/форматы (§46.2): image ≤5 МБ, GIF ≤10 МБ, MIME проверяется, SVG/исполняемые форматы запрещены — реализуется в upload flow этапа 2.

## Auth и сессии

Авторизация — Telegram Mini App `initData` (PRD §10.2, §47.1). Без email/пароля.

- `POST /api/v1/auth/telegram` — проверка подписи initData (HMAC-SHA256, алгоритм Telegram) + freshness `auth_date` (24ч) → find/create user + сессия → HttpOnly+Secure cookie.
- `POST /api/v1/auth/logout` — уничтожение сессии, очистка cookie.
- `GET /api/v1/me` — текущий пользователь (требует сессию).
- `PATCH /api/v1/me` — onboarding-поля (timezone, locale, week_starts_on); полный профиль/имя/фото → T10 (DEC-020).

Безопасность: cookie `__Host-flowly-session` (HttpOnly+Secure+SameSite=Lax), raw token не хранится (в БД — SHA-256 hash, UNIQUE), CSRF — проверка `Origin`, sliding session TTL 30д, Zod-валидация, minimal rate limit (production-grade → этап 8 / DEC-007), bot-токен только в Cloudflare secret.

Локальная проверка auth без реального Telegram: сгенерировать валидный initData тестовым токеном и гонять через workerd preview (default env, с D1):

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars   # вписать тестовый TELEGRAM_BOT_TOKEN
node .temp/E1-D1-T06/gen-init-data.mjs <botToken> <telegramId>   # → initData
npm run preview                                       # default env (D1 binding)
```

Dev-эмуляция Telegram-пользователя (PRD §10.3) для `next dev` — флаг `FLOWLY_DEV_EMULATION=1`; **никогда не включать в production**.

## Среды и режимы (environments)

Три среды (PRD §49.1) с строгой изоляцией данных/секретов:

| Среда | Next.js | D1 | R2 | Telegram | Cron | Домен | Данные/секреты |
|---|---|---|---|---|---|---|---|
| **local** | `next dev` | локальная (miniflare, `.wrangler/state`) | локальная (miniflare) | **mock** | — | `localhost` | `.dev.vars` (gitignored), тестовые пользователи |
| **test** | preview/deploy `--env test` | отдельная test D1 | отдельный test bucket | test-бот (`TELEGRAM_MODE=test` — ставить **явно**, иначе prod-build даст `production`) | test Cron | preview/`*.workers.dev` | отдельные test-ресурсы, test-токен как secret |
| **production** | deploy | production D1 | production R2 | основной бот (`TELEGRAM_MODE=production`) | production Cron | production-домен | prod-секреты только через Cloudflare secret store |

Local D1/R2 создаются Wrangler/miniflare и **не затрагивают** test/production (PRD §49.2). Реальные test/prod D1/R2 и test-бот создаются отдельным scope (без фейковых ID в репо).

**Telegram-режимы** (PRD §49.4): `mock` | `test` | `production` — `@flowly/telegram` `resolveTelegramMode(env)`. Явный `TELEGRAM_MODE` выигрывает; иначе local `next dev` → `mock`, deployed → `production` (test обязан явно ставить `TELEGRAM_MODE=test`). В **`mock`** исходящие сообщения пишутся в локальный журнал (`createTelegramLogger`, console + in-memory buffer) и **не отправляются** (0 сетевых вызовов). Реальный outbound sender появляется на этапе 5 и обязан маршрутизировать отправку через режим.

Команды (PRD §49.3, из root):

```bash
npm run dev               # local Next.js + local D1/R2 + mock Telegram
npm run preview           # OpenNext workerd preview (--env test)
npm run db:migrate        # применить миграции в локальную D1
npm run db:reset          # пересобрать локальную D1
npm run deploy:test       # deploy в test-окружение
npm run deploy:production # deploy в production
npm run typecheck / lint / build / test / test:e2e
```

Изоляция: `.dev.vars`, `**/.wrangler/` gitignored (см. `.gitignore`); `.dev.vars.example` отслеживается как шаблон; prod-токен — только Cloudflare secret, никогда в репо.

Актуальная реализация и следующий шаг указаны в [HANDOFF](docs/roadmap/HANDOFF.md).
