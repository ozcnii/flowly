# Flowly v1.0 — UI-kit и дизайн-система

> E0-D0-T03 · plan approved 2026-07-13 · visual foundation: DEC-023.

## Состав

- [`index.html`](index.html) — responsive HTML-каталог foundations, components и contextual patterns.
- [`tokens/tokens.json`](tokens/tokens.json) — canonical machine-readable tokens.
- [`tokens/tokens.css`](tokens/tokens.css) — generated CSS custom properties; вручную не редактируется.
- [`tokens/contrast-report.json`](tokens/contrast-report.json) — фактические WCAG contrast ratios.
- [`component-inventory.md`](component-inventory.md) — component/state/surface coverage.
- [`accessibility-checklist.md`](accessibility-checklist.md) — правила и evidence доступности.
- [`snapshot-manifest.md`](snapshot-manifest.md) — 18 canonical + 5 evidence PNG с SHA-256.
- [`validation-report.md`](validation-report.md) — воспроизводимые проверки и residual risks.
- [`E0-D0-T03-plan.md`](E0-D0-T03-plan.md) — утверждённый план.

## Visual foundation

UI-kit развивает спокойное wellness-направление Concept A, не признавая исходный четырёхэкранный mockup финальным дизайном. Основной UI-шрифт — локальный Inter, display roles — локальный Cormorant Garamond; иконки — локальный subset Lucide. Светлая и тёмная темы используют общую semantic hierarchy.

## Просмотр

Из корня репозитория:

```bash
python3 -m http.server 8765 --directory docs
```

Открыть `http://127.0.0.1:8765/design/ui-kit/`.

Query parameters для evidence:

- `?theme=dark` — тёмная тема;
- `?safe=1` — ненулевые top/right/bottom/left safe-area inset;
- `?scale=2` — true root 200% text;
- `?telegram=1` — deterministic Telegram theme/viewport/safe-area simulation.

Нормативный mapping Telegram WebApp описан в [`telegram-environment.md`](telegram-environment.md).

## Воспроизведение generated assets и snapshots

```bash
npm install --prefix docs/design/ui-kit
npx --prefix docs/design/ui-kit playwright install chromium
npm run generate --prefix docs/design/ui-kit
npm run validate --prefix docs/design/ui-kit
npm run capture --prefix docs/design/ui-kit
```

Pinned dependencies:

- Playwright `1.61.1` / Chromium `149.0.7827.55`;
- reference capture environment: Node `v22.23.0`, `darwin/arm64`; byte-identical guarantee относится к этой среде; на другой ОС snapshots необходимо пересоздать и явно review;
- `@fontsource/inter@5.2.8` (OFL-1.1);
- `@fontsource/cormorant-garamond@5.2.11` (OFL-1.1);
- `lucide-static@1.24.0` (ISC).

Runtime не обращается к CDN, Google Fonts или другим внешним источникам. Лицензии и provenance сохранены в `assets/fonts/`, `assets/icons/` и [`assets/provenance.json`](assets/provenance.json).

## Границы

Это нормативный UI-kit для E0-D0-T04, а не финальные 69 high-fi screens, production component library или интерактивный прототип. Общий approval UX/UI-пакета остаётся E0-D0-T06.
