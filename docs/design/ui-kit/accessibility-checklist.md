# E0-D0-T03 — accessibility checklist

> Scope: UI-kit catalog and normative component contracts. Browser evidence: Playwright 1.61.1 / Chromium 149.0.7827.55.

## Contrast and color

- [x] Normal text semantic pairs meet at least 4.5:1.
- [x] Large text, status/icon colors, strong borders and focus meet at least 3:1 against intended backgrounds.
- [x] 22 declared semantic pairs are calculated from canonical JSON values and pass; exact ratios are in [`tokens/contrast-report.json`](tokens/contrast-report.json).
- [x] Success, warning, danger, info, disabled and selected states use text/icon/shape in addition to color.
- [x] Light and dark themes preserve the same semantic hierarchy.

## Keyboard and focus

- [x] Interactive examples use native `button`, `a`, `input`, `textarea` and `dialog` semantics.
- [x] Every visible interactive control has visible text or an accessible name.
- [x] `:focus-visible` uses a 3 px focus token with offset and does not rely only on color.
- [x] Logical DOM order follows visual order; skip-link leads to `main`.
- [x] Dialog opens with native focus management and closes through native `method=dialog` controls.
- [x] Dark-theme keyboard focus evidence is stored in `snapshots/evidence/focus-dark-430.png`.

## Touch and pointer

- [x] All visible buttons, links, inputs, textareas, selects and custom button/tab roles are browser-audited; effective targets are at least 44×44 CSS px at 360/430/1280 and 200% text.
- [x] Checkbox/radio/switch controls are measured through their clickable label rectangles.
- [x] Destructive actions are text-labelled and separated from ordinary actions.
- [x] Hover is additive; no function requires hover.

## Responsive and text

- [x] No horizontal document overflow at 360, 430 or 1280 px in light/dark.
- [x] True root 200% text on 360 px preserves content/functions without horizontal document overflow.
- [x] Dense cards stack vertically; bottom-navigation labels and catalog theme/safe-area controls remain visibly available.
- [x] Evidence separately captures the affected Components shell and header controls; canonical sections cover all three viewports.

## States and feedback

- [x] Loading uses shape-preserving skeletons.
- [x] Module errors are inline; shell/auth patterns are full-screen by contract.
- [x] Mutation error explicitly preserves input and offers retry.
- [x] Offline explicitly distinguishes local draft/checkpoint from server success.
- [x] Empty states explain absence and offer a contextual action only where applicable.
- [x] Disabled examples retain a visible reason in the surrounding pattern contract.
- [x] Runtime sync/checkpoint and report partial/completed semantics are not color-only.
- [x] Selected chips/segments expose `aria-pressed`; current bottom-navigation destination exposes `aria-current`.

## Motion and environment

- [x] `prefers-reduced-motion: reduce` collapses animation and transition durations.
- [x] Skeleton remains legible as a static shape with reduced motion.
- [x] Safe-area variables map to `env(safe-area-inset-*)` with zero fallback and to Telegram `safeAreaInset` when available.
- [x] Non-zero top/right/bottom/left simulation does not cover shell/header/navigation controls.
- [x] Telegram `colorScheme`, theme colors, stable viewport and safe-area inputs have an explicit local mapping and deterministic simulation.
- [x] Runtime assets are local; fonts use `font-display: swap`.

## Residual verification

- [ ] Real Telegram iOS/Android WebView with a physical notch was not available; repeat safe-area and font rasterization checks during E0-D0-T04/T05 device review.
- [ ] Screen-reader announcements for production async mutations require final application semantics and are verified during implementation, not in this static kit.
