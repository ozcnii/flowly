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
| Web | `MEDIA` | R2 | E1-D1-T05 |
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

Актуальная реализация и следующий шаг указаны в [HANDOFF](docs/roadmap/HANDOFF.md).
