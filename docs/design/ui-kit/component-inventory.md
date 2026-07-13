# E0-D0-T03 — component inventory

> Source contracts: 69 surfaces, F01–F11, DEC-013–DEC-023. Каталог показывает system-level recipes; high-fi screen composition остаётся E0-D0-T04.

## Foundations

| Family | Contracts | Tokens / evidence |
|---|---|---|
| Color | semantic canvas/surface/text/border/accent/success/warning/danger/info/focus/overlay; light + dark | `tokens.json`, `contrast-report.json`, Foundations snapshots |
| Typography | Inter 400/500/600/700; Cormorant Garamond 500/600 только display roles; Cyrillic + Latin | `assets/fonts/**`, provenance и OFL |
| Layout | mobile-first 360–430, wider max 1200, gutters, 4 px spacing base | responsive snapshots 360/430/1280 |
| Shape/elevation | radius sm/md/lg/xl/full; border, shadow, overlay hierarchy | Foundations + Components |
| Iconography | 46-icon Lucide subset, 16/20/24 px roles, currentColor | `assets/icons/lucide.svg`, ISC |
| Motion | 120/200/320 ms, one easing; reduced-motion removes optional motion | reduced-motion evidence |
| Environment | Telegram theme semantic mapping, viewport and safe-area fallbacks | safe-area evidence |

## Components

| Component family | Required variants/states | Primary surfaces/contracts |
|---|---|---|
| Button | primary, secondary, ghost, destructive, icon, compact; focus, pressed, disabled, loading | all actionable Mini App surfaces; bot CTA semantics |
| Link / text action | navigation, retry, external, safe exit | S-MA-001, S-MA-006, S-MA-096, S-WEB-001–002 |
| Text field / textarea | label, help, validation, retained input, disabled | P-WIZARD, P-FORM |
| Search / select / date-time / numeric | leading icon, filters, validation and disabled reason | S-MA-020, S-MA-040–045, S-MA-052, S-MA-061–063, S-MA-070–071 |
| Checkbox / radio / switch | selected, unselected, focus, disabled | onboarding/settings/schedules/privacy forms |
| Chip / segmented / tabs | selected, unselected, focus; filters and report periods | catalogs, calendar, reports |
| Top bar / avatar | title/context/back/actions; avatar opens profile | DEC-013, Mini App shell |
| Bottom navigation | exactly 5 tabs; active/inactive/badge; safe area | DEC-013; Home/Yoga/Rhythm/Calendar/Friends |
| Module card | independent loading/error/empty/content | Home DEC-016 |
| Content card / list row | metadata, badge, progress, CTA, read-only | collections/details across F02–F10 |
| Badge / status | neutral, success, warning, danger, partial, sync pending | DEC-015/017/018 |
| Progress / metric / chart | progress, streak, completed-period report; not color-only | programs, habits, reports |
| Skeleton | shape-preserving loading; reduced motion | DEC-022 all applicable profiles |
| Empty state | explanation + contextual CTA where applicable | collection/report profiles |
| Inline alert | info/cache, warning/offline, mutation error/retry | module errors and retained mutations |
| Full-screen error | auth/shell error, safe reason/recovery/exit | P-SHELL, P-GATE, P-WEB |
| Toast / success | explicit committed mutation; no false offline success | mutable profiles |
| Dialog / confirm | cancel + explicit mutation, destructive semantics | P-CONFIRM and critical frames |
| Bottom sheet | mobile contextual selection/action | statuses, filters, actions |
| Runtime controls | timer, previous/pause/next, checkpoint/sync/conflict | S-MA-030–034 |
| Permission/read-only | owner/participant/link-viewer scope, copy/revoke/lock | DEC-019–021, F10 |
| Destructive zone | warning, explicit confirm, grace/archive semantics | DEC-020/021, F11 |
| Telegram message/action | bot identity, executable CTA, terminal status | S-BOT-003–008 |
| Browser fallback | no private data, Telegram recovery CTA | S-WEB-001–002 |

## Per-family implementation contract

`A` — состояние обязано быть показано/реализовано; `N/A` — неприменимо по указанной причине. Static hover/focus/pressed examples находятся в «Лаборатории состояний», runtime semantics — в native controls и ARIA attributes.

| Family | Anatomy / size | Applicable states | Explicit N/A | Token dependencies | Keyboard / semantics | Surface references |
|---|---|---|---|---|---|---|
| Primary/secondary/ghost button | label, optional leading icon; sm/md/lg, min 44 px | default, hover, focus, pressed, disabled, loading, success; destructive variant has danger state | error belongs to surrounding mutation, not button | control height/padding, accent/danger, focus, motion | native `button`; Enter/Space; `disabled`, `aria-busy` | all mutable Mini App profiles |
| Icon button | icon + accessible name; 44 px target | default, hover, focus, pressed, disabled | loading/error/success belong to action pattern | touch min, icon md, border/focus | native `button`, mandatory `aria-label` | shell, cards, runtime, overlays |
| Link/text action | visible label, optional icon; min 44 px when standalone | default, hover, focus, visited where navigation | loading/success not owned by link | text/info/focus, control min | native `a`, Enter; safe target contract | S-MA-001/006/096, S-WEB-001–002 |
| Text/search/textarea | label, control, help/error, optional leading/trailing icon; lg height | default, hover, focus, disabled, loading/read-only, error, success | pressed applies only to embedded action | surface/border/text/focus/status, spacing | native label association; Tab; `aria-invalid`, `aria-describedby`, `aria-busy` | P-WIZARD, P-FORM |
| Select/date/time/numeric | label, value, affordance, help/error; lg height | default, hover, focus, disabled, error, success | loading belongs to form/option source unless async | field + status + icon tokens | native control in production; keyboard arrows/platform semantics | S-MA-040–045/052/061–063/070–071 |
| Checkbox/radio | native input + full-row label; 44 px row | unchecked, checked, hover, focus, disabled, error at group level | loading/success belong to enclosing form | accent, focus, touch min | Tab; Space; radio arrows; fieldset/legend for groups | onboarding/settings/schedules/privacy |
| Switch | native checkbox semantics + track/thumb + label; 44 px row | off, on, hover, focus, disabled | loading/error/success belong to mutation pattern | accent, border, surface, motion | Tab/Space; checked state exposed natively | settings/schedules/privacy |
| Chip/segmented | text label, optional icon; 44 px target | default, hover, focus, pressed/selected, disabled | loading/error/success belong to collection/filter result | accent/soft/border/focus | native buttons with `aria-pressed`; exclusive update in JS | catalogs, calendar, reports |
| Top bar/avatar | title/context, optional back/actions, avatar; 44 px actions | default, focus, pressed, disabled action | loading/error/success represented by shell pattern | canvas/surface/border, safe-area, touch | landmark/header; named buttons; logical DOM order | Mini App shell, DEC-013 |
| Bottom navigation | exactly 5 icon+label destinations; 44 px minimum | default, hover, focus, pressed/current | loading/error/success are destination content states | nav height, surface/border/accent, safe-area | `nav`; active destination `aria-current="page"`; no hidden labels at 200% | all authenticated Mini App surfaces |
| Card/list/module | container, title, metadata, optional status/progress/action | default, hover/focus when actionable, loading skeleton, empty/error/success compositions, read-only/disabled | pressed only when whole card is an action | surface/border/radius/shadow/spacing/status | inner native action preferred; no nested interactive card role | collections/details/Home F02–F10 |
| Badge/status/progress | text + shape/icon; optional metric/progress | neutral, success, warning, danger, partial, sync-pending | focus/pressed/loading only when badge itself is interactive (not used here) | semantic status pairs, radius full | status never color-only; live announcements deferred to production | DEC-015/017/018, runtime/reports |
| Skeleton/empty/error/offline/success | state icon/shape, title, explanation, optional recovery CTA | context-specific L/E/ER/O/S/D per profile | N/A follows canonical 15-profile rationale | skeleton/status/surface/motion | recovery is native action; reduced-motion static skeleton | all applicable profiles, DEC-022 |
| Dialog/bottom sheet | heading, description, actions, close/drag affordance | default, focus, destructive, disabled action, mutation loading/error/success | hover not required on touch-only drag affordance | overlay/surface/shadow/radius/focus | native `dialog`; focus trap/return; Escape/cancel | P-CONFIRM and critical frames |
| Runtime controls | progress, timer, content, prev/play-next, checkpoint/sync | default, focus, pressed, disabled invalid control, loading, offline, sync success/conflict | empty is impossible for active runtime | accent/onAccent, runtime spacing, touch/icon, status | named native buttons; ordered controls; checkpoint text | S-MA-030–034 |
| Permission/read-only/destructive | icon, scope/reason, owner/status, explicit action | read-only, revoked, blocked, confirm, pending, success/error | generic loading only when permission check is unresolved | lock/danger/status/surface/focus | reason is textual; destructive confirm is separate; cancel non-mutating | DEC-019–021, F10/F11 |
| Telegram message/command | bot identity, message, executable CTA, terminal result | default, focus, pressed, disabled stale action, loading via Telegram transport, success/error | Mini App offline pattern N/A: Telegram owns transport | info/action/status/touch tokens | executable button labels; stale callback returns status/deep link | S-BOT-001–008 |
| Browser fallback | safe icon, reason, Telegram recovery CTA | loading auth check, safe error/recovery, disabled unavailable launch | success mutation N/A: read-only fallback | canvas/surface/text/accent/safe-area | no private target data; named native CTA | S-WEB-001–002 |

## Surface-profile coverage

Все 69 canonical surfaces покрыты system patterns ниже; сумма строк — 69.

| Profile | Count | UI-kit composition | Surface IDs |
|---|---:|---|---|
| P-SHELL | 1 | shell + full-screen error/recovery | S-MA-001 |
| P-WIZARD | 3 | form controls + progress + retained draft | S-MA-002, S-MA-003, S-MA-004 |
| P-GATE | 1 | diagnostic result + retry + disabled reason | S-MA-005 |
| P-DETAIL-READ | 3 | read-only detail + safe recovery | S-MA-006, S-MA-051, S-MA-096 |
| P-COLLECTION | 11 | shell + filters + cards/list + empty/error/success | S-MA-010, S-MA-020, S-MA-021, S-MA-023, S-MA-040, S-MA-050, S-MA-060, S-MA-072, S-MA-081, S-MA-085, S-MA-087 |
| P-DETAIL | 6 | detail card + status/actions/permission | S-MA-011, S-MA-022, S-MA-024, S-MA-053, S-MA-064, S-MA-083 |
| P-CONFIRM | 8 | dialog/sheet + cancel + explicit outcome | S-MA-012, S-MA-033, S-MA-054, S-MA-065, S-MA-073, S-MA-082, S-MA-094, S-MA-095 |
| P-RUNTIME | 4 | runtime controls + checkpoint/sync/conflict | S-MA-030, S-MA-031, S-MA-032, S-MA-034 |
| P-FORM | 15 | labelled controls + validation + retained draft | S-MA-041, S-MA-042, S-MA-043, S-MA-044, S-MA-045, S-MA-052, S-MA-061, S-MA-062, S-MA-063, S-MA-076, S-MA-084, S-MA-086, S-MA-088, S-MA-090, S-MA-091 |
| P-COLLECTION-READ | 4 | filters + read-only collection states | S-MA-070, S-MA-071, S-MA-080, S-MA-092 |
| P-REPORT-READ | 2 | completed/partial/empty report blocks | S-MA-074, S-MA-075 |
| P-REPORT | 1 | generation/download + success/error | S-MA-093 |
| P-COMMAND | 2 | bot command + executable deep-link action | S-BOT-001, S-BOT-002 |
| P-MESSAGE | 6 | bot message + idempotent callback/terminal status | S-BOT-003, S-BOT-004, S-BOT-005, S-BOT-006, S-BOT-007, S-BOT-008 |
| P-WEB | 2 | safe fallback + Telegram CTA, no private data | S-WEB-001, S-WEB-002 |

## State contract

- Default, focus-visible, pressed, disabled and loading are component states.
- Loading/empty/error/retry/offline/success/disabled remain contextual domain patterns per DEC-022.
- Critical terminal, permission, privacy, destructive, conflict and recovery branches remain explicit compositions from the wireframes; UI-kit does not collapse them into a generic alert.
