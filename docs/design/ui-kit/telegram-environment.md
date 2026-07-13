# Telegram Mini App environment mapping

> Normative UI-kit contract for PRD §40.1 and DEC-023. No network dependency is introduced; production SDK injection remains the host application's responsibility.

## Mapping

| Telegram WebApp value/event | Flowly semantic target | Fallback without SDK |
|---|---|---|
| `colorScheme` | `data-theme="light|dark"` | `light`, or explicit catalog query `?theme=dark` |
| `themeParams.bg_color` | `--color-canvas` | theme token from `tokens.json` |
| `themeParams.secondary_bg_color` | `--color-surface` | theme token from `tokens.json` |
| `themeParams.text_color` | `--color-text` | theme token from `tokens.json` |
| `themeParams.hint_color` | `--color-text-muted` | theme token from `tokens.json` |
| `themeParams.button_color` | `--color-accent` | theme token from `tokens.json` |
| `themeParams.button_text_color` | `--color-on-accent` | theme token from `tokens.json` |
| `viewportStableHeight` | `--telegram-viewport-stable-height` | normal CSS viewport |
| `safeAreaInset.top/right/bottom/left` | `--component-safe-area-top/right/bottom/left` | `env(safe-area-inset-*, 0px)` |
| `themeChanged` | repeat theme + themeParams mapping | local theme switch |
| `viewportChanged` | repeat stable-height mapping | browser resize |
| `safeAreaChanged` | repeat four-sided inset mapping | CSS `env()` update |

Only strict six-digit hex values are accepted from `themeParams` before assignment to CSS custom properties. Missing/invalid values retain validated Flowly theme tokens.

## Catalog demonstration

- Real host: `window.Telegram.WebApp` is detected automatically.
- Deterministic local simulation: `index.html?telegram=1`.
- Four-sided safe-area evidence: `index.html?safe=1`.
- Explicit theme override for review: `index.html?theme=dark`.

The catalog does not load Telegram SDK from a CDN. Production bootstrapping may inject it before `ui-kit.js`; the same mapping contract applies.

## Accessibility boundary

Telegram-provided colors are host inputs and may not preserve Flowly's validated contrast matrix. Production integration must re-check effective semantic pairs and fall back to Flowly light/dark tokens when a supplied pair fails its role threshold. The static catalog's committed themes are validated independently in `tokens/contrast-report.json`.
