# E0-D0-T02 — validation report

> Дата: 2026-07-13. Статус: validation PASS; пользователь явно принял wireframes, E0-D0-T02 переведена в `done`. Это task-level acceptance и не заменяет финальный approval всего UX/UI-пакета в E0-D0-T06.

## Реализованный пакет

- 69 canonical surfaces: 59 Mini App, 8 Telegram bot, 2 browser fallback.
- 11 flow pages `F01`–`F11`; 98 screen↔flow memberships.
- 15 reusable state profiles; 105 отдельных visual state demos (`15 × L/E/ER/R/O/S/D`) с объяснёнными N/A.
- 38 unique critical surfaces имеют отдельный critical frame; повторное участие в flows рендерит тот же canonical definition.
- Русские wireframe title/action semantics для 69/69 surfaces и русские flow/profile contracts.
- Расширенные observable layouts для атомарных contracts Home, catalog/YouTube, workout detail/editor, program detail, habit/schedule, calendar, reports, challenge, notifications, export, clear history и account deletion.
- Контекстный shell: bottom navigation отсутствует в shell/wizard/gate/runtime/form/confirm; avatar entry существует только на `S-MA-010`.
- 39 canonical full-page PNG (`13 pages × 3 viewport`) и 3 специальных evidence captures.

## Исправленные findings первого review

| Finding | Исправление | Evidence |
|---|---|---|
| Critical states были prose callouts | Добавлены отдельные `criticalDevice` frames; state profiles получили 105 visual demos, включая реальный skeleton | `assets/wireframes.js`, `states/profiles.html`, flow snapshots |
| Generic layouts не показывали atomic content | Добавлены surface-specific `content` contracts и колонка `Layout evidence` | `assets/surface-registry.js`, `coverage-matrix.md` |
| Большинство title/actions были английскими | Добавлены русские title/action semantics для 69/69; flow/profile contracts переведены | `assets/surface-registry.js` |
| Bottom nav/avatar применялись вне контекста | Nav исключён из shell/wizard/gate/runtime/form/confirm; avatar только `S-MA-010` | `assets/wireframes.js` |
| `S-MA-094` показывал account-deletion contract | `S-MA-094` теперь явно описывает clear-history boundary; 7-day grace находится на `S-MA-095` | F11 snapshots, registry |
| In-frame actions не были keyboard controls | Actions/nav/collections — native buttons, fields — labelled inputs; focus evidence — 3 px double outline | `snapshots/evidence/focus-F01-360.png` |
| Render caps скрывали отдельные content/actions | Удалены caps для parsed actions, bot, runtime, form, collection/detail/report layouts; browser-аудит 69 surfaces: missing items = 0 | `assets/wireframes.js` |
| Primary controls иногда использовали labels | Для Mini App применяются action-safe profile/ID labels; для всех 8 bot surfaces заданы явные executable CTA | `assets/wireframes.js` |
| Critical branches были слишком generic | Все 38 critical IDs имеют точные 2–5 branch controls; generic fallback отсутствует | `assets/wireframes.js` |
| Snapshot generation не была воспроизводимой | Добавлены pinned Playwright package/lock и capture script; два последовательных capture дали 42/42 идентичных SHA-256 | `package.json`, `package-lock.json`, `tools/capture-snapshots.mjs` |

## Механическая проверка

Проверено Python/Node анализом generated registry и файлов:

```text
surfaces=69 unique
surface types=59 MA / 8 BOT / 2 WEB
profiles=15; assignments=69
flows=F01–F11
memberships=98 from registry / 98 from flows / symmetric difference=0
Russian title/action semantics=69/69
critical unique surfaces=38
coverage rows=69
HTML pages=13
canonical PNG=39
evidence PNG=3
broken repository-relative links=0
node --check wireframes.js=PASS
node --check surface-registry.js=PASS
git diff --check=PASS
.DS_Store under wireframes=0
```

`S-MA-094` дополнительно проверен на явное сохранение аккаунта/settings/created objects при удалении occurrences/statuses/report results.

## Browser validation

Playwright `1.61.1`, Chromium `149.0.7827.55`, self-hosted static server из capture script:

- 78 render runs: `13 pages × 3 widths × light/dark`;
- widths: 360, 430, 1280 px;
- HTTP/console errors: 0;
- horizontal overflow: 0;
- unlabelled focusable controls: 0;
- positive `tabindex`: 0;
- 13 дополнительных runs на 360 px при 200% root text size: overflow 0;
- keyboard traversal достигает in-frame action; computed focus outline `double 3px`;
- `prefers-reduced-motion: reduce`: skeleton `animation-name: none`, document `scroll-behavior: auto`;
- dark grayscale mode проверен browser run и отдельным evidence screenshot;
- screenshots: 39/39 canonical + 3/3 evidence captures созданы из текущего source, expected widths и SHA-256 зафиксированы;
- два последовательных запуска `npm run capture` в одной среде: 42/42 PNG byte-identical.

Evidence:

- [`snapshot-manifest.md`](snapshot-manifest.md);
- [`snapshots/evidence/dark-states-430.png`](snapshots/evidence/dark-states-430.png);
- [`snapshots/evidence/focus-F01-360.png`](snapshots/evidence/focus-F01-360.png);
- [`snapshots/evidence/reduced-motion-states-430.png`](snapshots/evidence/reduced-motion-states-430.png).

## Semantic spot-check

Полностью перепроверены critical families:

- F01: full-screen auth, mandatory bot gate, browser/deep-link recovery;
- F04: one active session, explicit close/cancel, offline checkpoint/sync conflict, explicit terminal status;
- F08: contextual actions, quiet-hours semantics, stale/duplicate callback;
- F10: invite/share/revoke/permissions, read-only original, owner transfer/end;
- F11: export lifecycle, clear-history boundary, re-auth/account grace/cancel deletion.

Дополнительно сверены atomic observable contracts `S-MA-010`, `020–024`, `041`, `051`, `061–063`, `070–075`, `086`, `091`, `093–095`.

## Repository state

- Автоматические тесты не создавались и не запускались: задача documentation/static-design only, пользователь отдельно тесты не просил.
- `git diff --check` проходит.
- `.DS_Store` и subagent runtime artifacts удалены из task tree/worktree.
- В staging до этой задачи уже находится `AGENTS.md`; он не изменялся и не unstaged этой работой. Это внешний worktree state, который должен быть учтён перед commit.

## Residual risks / unverified

1. Ненулевые значения CSS `env(safe-area-inset-*)` не эмулировались реальным notched Telegram WebView; source использует top/right/bottom/left insets, обычный Chromium возвращает zero.
2. Full-page PNG остаются высокими (максимум около 23.3k px), хотя index сокращён с ~55.5k до ~12.1k px; для review рекомендуется flow-level navigation и HTML.
3. Pixel output может отличаться в другом browser/font environment; в зафиксированной Playwright/Chromium-среде повторный capture byte-identical, manifest фиксирует текущие bytes/hashes.
4. Wireframe copy является структурной и не считается финальным UX copy/UI-kit.
