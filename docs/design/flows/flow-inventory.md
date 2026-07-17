# Flow inventory: roles, entry points, F01–F11

## Actors and permission boundaries

| Actor | Allowed scope | Forbidden / recovery |
|---|---|---|
| Unauthenticated / outside Telegram | fallback, auth/bootstrap, public invitation entry | no personal/target data; open through Telegram |
| Owner | own profile, objects, schedules, occurrences, reports, explicit shares | cannot alter another participant's result |
| Friend / participant | explicitly shared read-only data; accepted joint objects; fixed reactions/remind within limits | no implicit access to other data; revoke closes immediately |
| Link viewer | only current link-visible workout/object | no owner history/settings; save creates explicit copy |
| System/bot | delivery, validated idempotent callbacks, reports/deep links | no product setup; no automatic completion/status repair |
| System owner | no UI; catalog/technical operations only | no separate admin UI |

## Entry points

- Telegram Mini App launch → `S-MA-001`; bot `/app` → `S-MA-010`, `/today` → `S-MA-011`; `/help` removed by DEC-041.
- Reminder/report/invite/social/export notification → exact target after auth/access recheck; unavailable target → `S-MA-006` or `S-WEB-002`.
- Outside production Telegram → `S-WEB-001`; local/test emulation is an environment capability, not a v1 user surface.
- Persistent navigation has exactly five tabs with 9px labels (DEC-043). Native Telegram BackButton is hidden on those exact top-level routes and remains visible without Close/X flicker across internal route transitions; internal Back invokes history `router.back()` (DEC-048). On Telegram iOS/Android every exact top-level tab route uses an action-free shared Konsta Navbar; desktop/web renders no safe-area Navbar (DEC-047). Home title is the Flowly name, other titles use domain names. Home content alone starts with `Твой план` + constant `user-round` Profile action; Settings is reached through Profile (DEC-043/046).

## Families

The `Screens` cell is the canonical membership set for each family. The same pair must appear in the screen inventory `Flow` cell. Diagram `Canonical screen IDs` must equal this cell exactly; `Rendered node IDs` lists the exact IDs printed in Mermaid nodes and may only be a subset when a canonical member is an entry/handoff governed by the family but not expanded as a node.


| ID | Goal / preconditions / trigger | Happy path and mutation | Alternate, error, cancellation and terminal outcomes | Screens | Diagram |
|---|---|---|---|---|---|
| F01 | Enter/auth/onboard/deep-link. Telegram context or browser URL. | validate initData → real profile/timezone/preferences → disabled deferred habit/invite capabilities → mandatory validated-launch completion gate → target/Home; create session/profile/settings and durable completion marker | optional steps skipped; completion save retry; invalid auth/outside Telegram; inaccessible target gives safe reason/recovery/exit | S-MA-001–006,S-MA-082,S-BOT-001–002,S-WEB-001–002 | [01](diagrams/01-onboarding-auth.md) |
| F02 | Answer “what today?” after auth. | Home loads independent modules → open/complete/start/resume relevant action; occurrence/session changes reflected | module-level loading/error/retry; offline; completely empty day offers workout/program/habit; conflict routes to F04 | S-MA-010–012,S-MA-060,S-MA-070,S-BOT-002 | [02](diagrams/02-home-today.md) |
| F03 | Find and inspect yoga content. | catalog/search/filter → workout/YouTube → favorite/open/create basis | empty filters; cache fallback; unavailable YouTube with retry/alternative; UGC report/hide/block; restricted detail recovery | S-MA-020–025,S-MA-088 | [03](diagrams/03-yoga-discovery.md) |
| F04 | Explicitly execute and record workout. Detail is accessible; max one active session. | start → video/step/mixed → pause/resume → finish → explicit status → calendar | active conflict branches separately: continue current; close current only after explicit “не завершено”, then optionally start new; cancel new launch without mutation; app close saves open session; offline checkpoint/sync; real conflict shown; never more than one active session; video runtime uses DEC-062 persisted route/player/checkpoint/finish contract | S-MA-012,S-MA-022,S-MA-030–034,S-MA-072–073 | [04](diagrams/04-workout-execution.md) |
| F05 | Create/manage own or manual workout. | editor validates title/duration/difficulty/executable content → draft/save → visibility later; manual entry writes occurrence | media/type/size errors; offline draft; retry preserving input; cancel; copy from YouTube; owner-only edit/delete/share | S-MA-021,S-MA-040–045,S-MA-072 | [05](diagrams/05-own-workouts.md) |
| F06 | Start/continue/leave/restart program. | catalog/detail → date/time/policy → enrollment → fixed calendar progression/rest/progress → completion | missed day never shifts; joint invite needs acceptance; leave confirmation; owner transfers ownership or ends joint object; restart creates new enrollment | S-MA-023,S-MA-050–054,S-MA-087 | [06](diagrams/06-programs.md) |
| F07 | Create and maintain arbitrary habit. | private create → schedule type/slots/policy → occurrences → completion/progress/streak; edits affect future only | empty Rhythm CTA; medical neutral warning; weekly “обязательный сегодня”; pause/resume; delete archives; offline draft/errors; history unchanged | S-MA-011,S-MA-060–065 | [07](diagrams/07-habits.md) |
| F08 | Receive/action Telegram reminder. Bot linked and occurrence relevant. | scheduler respects policy/quiet hours → message; done/already-done, skip and allowed rest produce their distinct terminal statuses and cancel repeats; snooze creates only a deferred reminder; Start hands off to F04 | quiet-hours delay only while relevant else cancel delivery without status/schedule mutation; snooze preserves occurrence status and permanent schedule; Start performs no terminal mutation; stale/duplicate returns current state idempotently; custom time opens app; bot error diagnosed; no response closes day as `no_response` | S-MA-005,S-MA-011,S-MA-063,S-MA-091,S-BOT-003–005 | [08](diagrams/08-reminders-telegram.md) |
| F09 | Inspect/correct calendar and reports. | month/week/day filters → detail → allowed status correction with confirm/history; weekly/monthly report → safe card | empty/loading/error/offline; current period `partial`; no-data explanation; card field consent; Monday/month-start 09:00 completed period; manual workout | S-MA-070–076,S-MA-044,S-BOT-006 | [09](diagrams/09-calendar-reports.md) |
| F10 | Establish friend/share/joint participation safely. | one-use invite → acceptance → explicit share/read-only original/save copy; create/join challenge/program; react; friend/participant may remind only for a shared current object with notifications enabled | 7-day expiry; counterpart invites share one pending link; reject ≠ reversible block; visibility change/revoke immediate; owner removes participant; leave requires transfer/end; remove friend revokes private shares/future notifications while preserving joint history/public access; link-only viewers cannot remind | S-MA-022,S-MA-024,S-MA-043,S-MA-052–054,S-MA-064,S-MA-080–088,S-BOT-001,S-BOT-007 | [10](diagrams/10-social-sharing.md) |
| F11 | Change profile/settings and manage data. | edit Flowly name/timezone/preferences; notifications; export protected JSON archive containing profile/workouts/habits/schedules/history/friends/reports + bot notice; clear history; request deletion | validation/offline draft/retry; timezone affects future only; confirmations; deletion revokes session/reminders; cancellation remains reachable during 7-day grace through validated Telegram re-auth/reactivation and restores sessions/reminders; expiry preserves anonymized joint integrity; UGC management | S-MA-080,S-MA-090–096,S-BOT-008 | [11](diagrams/11-settings-data-privacy.md) |

## Cross-flow invariants

1. **Status:** only the activity/context status matrix is offered; manual correction is confirmed and audited with optional comment. `no_response` is never silently converted to `skipped`.
2. **Deep links:** resolve only after auth and permission checks; unavailable, expired, revoked and deleted targets expose no private data and offer a relevant safe exit.
3. **Offline:** reads may show cached content as such; complex mutations preserve drafts; active workout stores a checkpoint; no UI claims a server mutation succeeded before sync.
4. **Privacy:** private by default; share is object-specific; shared original remains read-only; copy is explicit; reports/cards include only consented, permitted data.
5. **Back/cancel:** exits do not mutate committed data; destructive actions require explicit confirmation; active-session exit preserves open session until explicit closure.
6. **Operational constraints:** YouTube quotas/catalog size/retry tuning remain `DEC-007`, `DEC-010`, `DEC-011`; affected branches show availability/retry without inventing numeric policies.
