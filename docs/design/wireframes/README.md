# Flowly v1.0 — wireframes

Low-fidelity HTML+PNG пакет E0-D0-T02 по утверждённым [`docs/design/flows/**`](../flows/README.md) и `DEC-012`–`DEC-022`.

## Статус и границы

- 69 canonical surfaces: 59 Mini App, 8 Telegram bot, 2 browser fallback.
- 11 flow pages (`F01`–`F11`) и 98 canonical memberships.
- 15 reusable state profiles + отдельные critical overrides.
- Серый light/dark wireframe mode проверяет структуру, но не утверждает UI-kit, финальные темы, типографику или brand styling.
- Concept A остаётся неутверждённым visual reference и не является источником требований.
- Это не production UI и не интерактивный прототип E0-D0-T05.

## Просмотр

Из корня репозитория:

```bash
python3 -m http.server 8765 --directory docs
```

Открыть `http://127.0.0.1:8765/design/wireframes/`.

Прямые входы:

- [`index.html`](index.html) — canonical inventory и F01–F11;
- [`states/profiles.html`](states/profiles.html) — 15 state profiles;
- [`flows/F01.html`](flows/F01.html) … [`flows/F11.html`](flows/F11.html) — flow pages;
- [`coverage-matrix.md`](coverage-matrix.md) — ID/profile/flow/PRD/snapshot mapping;
- [`snapshot-manifest.md`](snapshot-manifest.md) — versioned PNG и SHA-256;
- [`validation-report.md`](validation-report.md) — проверки и residual risks.

HTML должен открываться через static server: страницы используют общие relative assets. Canonical definitions находятся в `assets/surface-registry.js`; повторяющийся в нескольких flows surface не имеет независимых копий данных.

## Воспроизведение snapshots

Точный capture toolchain зафиксирован локальным `package.json`/`package-lock.json` (`playwright@1.61.1`). Из `docs/design/wireframes/`:

```bash
npm ci
npx playwright install chromium
npm run capture
```

`tools/capture-snapshots.mjs` самостоятельно запускает static server, создаёт 39 canonical + 3 evidence PNG, проверяет HTTP/console/horizontal overflow и перезаписывает `snapshot-manifest.md` с фактическими версиями Playwright/Chromium, размерами, bytes и SHA-256.

Текущий зафиксированный набор воспроизводимо создан `playwright@1.61.1` / Chromium `149.0.7827.55`; повторная генерация в другом browser/font environment ожидаемо изменит pixels и hashes и должна быть зафиксирована новым manifest.

## Viewport matrix

- `360×900` — минимальная mobile width;
- `430×900` — верхняя граница целевого mobile range;
- `1280×900` — wide adaptation;
- screenshots выполняются как full-page capture и лежат в `snapshots/v1/`.

## State strategy

Каждый surface имеет base frame и назначенный profile `L/E/ER/R/O/S/D`. Повторяющиеся состояния показаны на reusable profile boards. Отдельный critical frame обязателен там, где состояние меняет terminal outcome, recovery, permission, privacy, destructive action, offline checkpoint или достоверность server mutation.
