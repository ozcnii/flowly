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

Актуальная реализация и следующий шаг указаны в [HANDOFF](docs/roadmap/HANDOFF.md).
