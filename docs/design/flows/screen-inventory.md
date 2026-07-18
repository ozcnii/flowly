# Screen and surface inventory

> Все IDs уникальны. Общие responsive/theme/a11y требования заданы в [`README.md`](README.md) и применяются ко всем визуальным surfaces.

## Mini App

| ID | Surface / назначение | Entry / actions / outcome | Flow | PRD | Privacy / ownership | Concept A |
|---|---|---|---|---|---|---|
| S-MA-001 | Shell/auth bootstrap | Telegram initData → session → target | F01 | §10.2–10.3 | unauthenticated; server validation | gap |
| S-MA-002 | Welcome/onboarding | start/skip optional steps | F01 | §10.1 | owner only | gap |
| S-MA-003 | Timezone/interests/preferences | detect/edit timezone, categories, duration, schedule | F01 | §10.1, §27 | owner only | gap |
| S-MA-004 | First habit/invite prompts | production controls disabled without mutation until E4-D5-T02/E7-D8-T01; then create/skip habit and invite/skip | F01 | §10.1 | owner only | partial: DEC-034 |
| S-MA-005 | Telegram launch gate | validated Mini App launch/session; completion mutation retry; cannot finish without confirmation | F01,F08 | §10.1, §36 | owner only; mandatory gate | covered: DEC-034 |
| S-MA-006 | Deep-link recovery | reason, auth/recovery, relevant safe exit | F01 | §10, §32, §36 | permission rechecked | gap |
| S-MA-010 | Главная | mobile-Telegram-only action-free shared Navbar with Flowly name; content header `Твой план` + constant `user-round` Profile action (DEC-043/046); day progress, nearest action, quick start, current program, habits, resume; no separate greeting/date/categories/«Ещё для вас» (DEC-039/043) | F02 | §11 | owner only | partial: home |
| S-MA-011 | Today action detail | complete/snooze/skip/rest where allowed | F02,F07,F08 | §11, §25–26 | occurrence owner | gap |
| S-MA-012 | Open-session conflict | continue / close / cancel new launch | F02,F04 | §14.4 | session owner | partial: E2-D3-T01 |
| S-MA-020 | Йога: catalog | mobile-only shared Navbar `Йога` (web hidden); shared YouTube-like 16:9 WorkoutMediaCard/two-line titles; search/filter/source/favorite/open (DEC-043/047/050/053) | F03 | §12 | public/entitled content | partial: catalog |
| S-MA-021 | YouTube results | mobile-only internal Navbar `Поиск YouTube` (web hidden); shared Card + fullscreen in-app player/save, stale/saved/error states; card→materialized workout planned by DEC-063/E2-D2-T08 (DEC-047/048/051/053) | F03,F05 | §19 | owner saves private copy | partial: search/save |
| S-MA-022 | Workout detail | mobile-only internal Navbar `Тренировка` (web hidden); adaptive media-first Cover→H1→meta; real/disabled exercise states + compact future actions + explicit disclosure; generated empty YouTube detail omits Exercises/Details by DEC-063 (DEC-047/048/051/054) | F03,F04,F10 | §13 | visibility checked; UGC warning | partial: detail |
| S-MA-023 | Favorites | workouts/videos/programs; no folders | F03,F06 | §18 | owner only | gap |
| S-MA-024 | Author profile/public content | real user author by ID; inspect/block/unblock (source pseudo-authors forbidden by DEC-057) | F03,F10 | §13.2, §56.6 | public data only | gap |
| S-MA-025 | Источники | one `/sources` overview; Flowly + YouTube independent 3-card previews; open detail / all via real source filter (DEC-057) | F03 | §12.1 | public/entitled content | partial: sources |
| S-MA-030 | Video session | play/pause/resume/finish | F04 | §14.1, §14.4 | session owner; one active | partial: E2-D3-T01 |
| S-MA-031 | Step session | back/pause/next/skip/+30/finish | F04 | §14.2, §14.4 | session owner | gap |
| S-MA-032 | Mixed mode chooser/session | choose video/steps, then execute | F04 | §14.3 | session owner | **cancelled** DEC-066 (v1 never) |
| S-MA-033 | Final status confirmation | explicit allowed status; optional comment | F04 | §14–15 | owner; no automatic status | partial: E2-D3-T01 |
| S-MA-034 | Resume/sync conflict | restore checkpoint, sync, resolve real conflict | F04 | §14.4, §40.2 | owner | partial: E2-D3-T01 |
| S-MA-040 | My workouts | drafts/private/shared/public; create/open | F05 | §16 | owner | gap |
| S-MA-041 | Workout editor | metadata/media/exercises/reorder/save draft | F05 | §16 | owner; first-save validation | gap |
| S-MA-042 | Exercise editor | image/GIF/instruction/sets/reps/time/rest | F05 | §16 | owner | gap |
| S-MA-043 | Workout visibility/share | private/friends/link/public/revoke | F05,F10 | §16.2, §33.2 | owner only | gap |
| S-MA-044 | Manual workout | date/time/duration/category/comment/status/source | F05,F09 | §17 | owner | gap |
| S-MA-045 | Media upload state | validate JPEG/PNG/WebP/GIF; retry/remove | F05 | §16.3, §40 | owner | gap |
| S-MA-050 | Программы: catalog/current | browse 7/14/30, favorites, current progress | F06 | §20 | owner; system/shared | gap (tab absent) |
| S-MA-051 | Program detail/days | inspect sequence/rest/goal/start | F06 | §20.1–20.2 | entitled viewer | gap |
| S-MA-052 | Program start | date/time/policy/friend invitation | F06,F10 | §20.3, §20.6 | owner; friend acceptance | gap |
| S-MA-053 | Program enrollment | today/progress/participants/leave/restart | F06,F10 | §20.4–20.6 | participant; scoped progress | gap |
| S-MA-054 | Program leave/ownership | confirm leave; transfer or end if owner | F06,F10 | §20.6 | owner/participant matrix | gap |
| S-MA-060 | Мой ритм | habits/today progress/quick complete/add | F02,F07 | §21 | owner | partial: rhythm |
| S-MA-061 | Habit create/edit | fields, schedule, slots, reminders, health warning | F07 | §22–24, §39 | owner; private on create | gap |
| S-MA-062 | Schedule builder | exact/weekdays/weekly target/interval | F07 | §23 | owner | gap |
| S-MA-063 | Reminder policy editor | presets/custom/quiet hours constraints | F07,F08 | §24, §37 | owner | gap |
| S-MA-064 | Habit detail/history | slots, streak, edit/pause/archive/share | F07,F10 | §21–23, §29, §33 | owner | gap |
| S-MA-065 | Habit lifecycle confirmation | future-only change; pause/resume/archive | F07 | §23, §26 | owner; history immutable | gap |
| S-MA-070 | Календарь month | month cells/filter/select | F02,F09 | §28 | owner; scoped shared data | partial: month |
| S-MA-071 | Calendar week | week/filter/select | F09 | §28 | owner | gap |
| S-MA-072 | Calendar day | activities/add manual/edit status + explicit Flowly/YouTube source cue (DEC-063) | F04,F05,F09 | §15, §17, §28 | owner | partial: day summary |
| S-MA-073 | Status correction | allowed status, confirm, optional comment/history | F04,F09 | §15, §26.2 | owner; audit retained | gap |
| S-MA-074 | Reports index | weekly/monthly/current partial/history + YouTube source Badge (DEC-063) | F09 | §30 | owner | gap |
| S-MA-075 | Report detail | metrics/comparison/shared-only joint stats | F09 | §30 | owner | gap |
| S-MA-076 | Share-card consent | choose safe fields/generate/download/share | F09 | §30.5 | owner; privacy filter | gap |
| S-MA-080 | Profile hub | mobile-Telegram-only action-free fixed/blurred title + native Telegram BackButton; profile + extra sections | F10,F11 | §9, §38 | owner | gap |
| S-MA-081 | Friends | list/invite/pending/remove/block | F10 | §32 | owner; confirmed links | gap |
| S-MA-082 | Invite accept/recovery | accept/reject/expired/already-used | F01,F10 | §32 | unauthenticated→auth; one-use | gap |
| S-MA-083 | Shared object read-only | recipient: view allowed fields/save copy; friend/participant with current shared object + enabled partner notifications: remind; link-only viewer: remind disabled | F10 | §33, §35 | access rechecked; revoke-aware; link alone grants no partner reminder | gap |
| S-MA-084 | Share access editor | friends/toggles/link/revoke | F10 | §33 | object owner | gap |
| S-MA-085 | Challenges | list/create/open | F10 | §34 | owner/participant | gap |
| S-MA-086 | Challenge editor/detail | goal/dates/participants/visibility/join/leave | F10 | §34 | owner controls; accept required | gap |
| S-MA-087 | Joint activity feed | shared progress/reactions/remind | F06,F10 | §20.6, §34–35 | participants; fixed reactions | gap |
| S-MA-088 | UGC report/hide/block | reason required; local hide; reversible block | F03,F10 | §13.2, §56.6 | authenticated viewer | gap |
| S-MA-090 | Profile settings | mobile-Telegram-only action-free fixed/blurred title + native Telegram BackButton; persisted Flowly name/timezone/weekly+monthly reports; device-local theme; week fixed Monday (DEC-042/044) | F11 | §27, §38.1 | owner | gap |
| S-MA-091 | Notification settings | quiet hours/default policy/categories/reports | F08,F11 | §37–38 | owner | gap |
| S-MA-092 | Data settings | export/history clear/account delete/public content | F11 | §38.3 | owner; re-confirm destructive | gap |
| S-MA-093 | Export status/download | request/progress/download protected JSON archive containing profile, workouts, habits, schedules, history, friends and reports; bot notice | F11 | §38.3, §51.2 | owner; protected archive | gap |
| S-MA-094 | Clear-history confirmation | explain scope/confirm/result | F11 | §38.3 | owner; objects/settings retained | gap |
| S-MA-095 | Account deletion/grace | explain, confirm, 7-day grace/cancel | F11 | §38.3, §47.3 | owner; sessions/reminders revoked | gap |

## Telegram bot and browser fallback

| ID | Surface | Actions / outcomes | Flow | PRD | Access |
|---|---|---|---|---|---|
| S-BOT-001 | `/start` / welcome | open Mini App; consume invite context | F01,F10 | §32, §36 | Telegram user |
| S-BOT-002 | `/app`, `/today` | deep link Home/Today | F01,F02 | §36.2 | Telegram user |
| S-BOT-003 | Habit reminder | done/snooze/custom/skip/open | F08 | §25.1, §25.3–25.6 | occurrence owner |
| S-BOT-004 | Yoga reminder | start/already done/snooze/rest/open | F08 | §25.2–25.7 | occurrence owner |
| S-BOT-005 | Callback result/stale | idempotent confirmation or current state/deep link | F08 | §25–26, §36.4 | callback user validated |
| S-BOT-006 | Weekly/monthly report | safe summary/open report | F09 | §30, §37 | report owner |
| S-BOT-007 | Invite/social notification | open accept/shared/joint target | F10 | §32, §34–37 | intended recipient |
| S-BOT-008 | Export/technical notification | protected download/open diagnostics | F11 | §37, §51.2 | owner |
| S-WEB-001 | Outside-Telegram fallback | “Откройте Flowly через Telegram” | F01 | §10.3 | unauthenticated |
| S-WEB-002 | Unavailable deep link | safe reason, open Telegram/re-auth, safe exit | F01 | §10, §32, §36 | no target data leaked |

## Observable requirement contracts

These records make list-valued PRD obligations observable rather than treating a section reference as coverage.

### S-MA-010 Home contract

- Modules rendered independently: greeting; planned/completed/partial/remaining/no-response day totals; nearest planned action; quick workout start; current program; data-driven yoga categories; today's habits; weekly progress; recommendations; friend activity limited to explicitly shared objects.
- Initial category set is explicit: для спины; перед сном; растяжка; расслабление; энергия; утренняя практика; шея и плечи; всё тело; короткая практика; дыхание без аудиоинструкций. Further categories come from catalog data without UI-code changes.
- Completely empty day explains the absence and offers workout, program and habit CTAs; a failed module has its own loading/error/retry without hiding successful modules.
- Recommendation inputs are limited to selected categories, favorites, recent sessions, preferred duration, time of day, current program, long-unperformed categories and joint program. Observable rules: morning may prioritize short/energizing, evening relaxation/sleep, avoid overly frequent repetition, current-program continuation first, and never recommend a workout already completed today. Every card shows a human-readable reason.

### S-MA-022 workout-detail contract

- Required content is individually observable: title; cover; short description; goal; categories; duration; difficulty; required equipment; contraindications; exercise list; images/GIF; text instructions; full YouTube video when present; author; source; Start, Favorite and Share actions.

### S-MA-020–024 catalog and YouTube contract

- Catalog exposes Flowly, YouTube and public-UGC sources and labels the source on every card. Filters are category, duration, workout difficulty, video/steps/mixed format, equipment, author/channel, source and favorite-only; search covers title, description, category, author and channel.
- Workout cards expose cover, title, duration, categories, format, difficulty, source, author, favorite and UGC marker. Detail exposes the §13.1 fields/actions; UGC adds warning, report, hide and author profile.
- DEC-050/053 presentation contract: Catalog and YouTube share one vertical 16:9 `WorkoutMediaCard` built only from direct Konsta primitives plus media Image; visual titles are limited to two lines while full text remains accessible/on detail, one-line secondary metadata may truncate, compact icon actions differ by domain. Filter single-select groups use Radio, independent filters use Toggle; modal Sheet owns focus trap/inert/Escape/restore; disabled favorite remains visible by explicit approval; loading uses Preloader and offline keeps available data.
- DEC-051/053 presentation contract: YouTube and workout detail use mobile-only action-free PrimaryNavbar/native BackButton, direct Konsta without CSS Modules/custom Skeleton, accessible Preloader states and Dynamic Type-safe content. YouTube keeps real Save and opens a privacy-enhanced fullscreen in-app player from cover; external Watch links are absent.
- DEC-058 player contract: Telegram mobile Popup uses shared action-free safe-area title, contains 16:9 media below composed top inset in portrait/landscape and delegates close to the shared native Back override stack; desktop/web keeps Konsta Navbar + Close.
- DEC-059 action contract: YouTube Search/detail play, Catalog filter and Home Profile use exact shared Konsta Glass→44px Button→20px icon composition; Catalog cards remain detail-only with no play; timezone Searchbar has 16px side insets.
- DEC-054 workout detail contract: all source variants use media-first Cover→H1≤3→metadata→meaningful description; real exercises render as compact List, missing exercises and future Start/Favorite/Share/UGC functions remain visible compact-disabled with `Скоро`; `Сведения` is an explicit info/subtitle/chevron disclosure without compounded section margins.
- DEC-057 sources contract: `/sources` combines Flowly and YouTube as independent 3-card horizontal previews plus real filtered-Catalog links; source-type `/authors/*` pages do not exist, while S-MA-024 remains reserved for future real user author IDs.
- DEC-052 navigation contract: native Telegram BackButton is session-history aware across child and tab routes; direct entries use contextual parent fallbacks, active-tab taps are no-op, rapid clicks cannot skip entries, and only Home boundary index 0 hides Back/enables closing confirmation.
- DEC-056 keyboard contract: mobile text-entry focus globally hides the shared bottom Tabbar and reduces main reserve; blur restores both, while non-text controls and desktop focus preserve navigation.
- DEC-061 route hierarchy contract: shared Tabbar exists only on five exact top-level roots; Profile/Settings/YouTube/Workout/Sources/Safety and all future internal paths hide it on every platform and use compact bottom reserve.
- YouTube query is generated from every selected filter rather than arbitrary text. Results show cover, title, channel, duration, publication date, description, view, favorite and create-workout actions; Russian preference and language-detection limitation are disclosed.
- Identical YouTube requests use a cache retained for **at least 24 hours**, whose key contains **all selected filters**. UI distinguishes cache/API results and quota unavailability, with retry/alternative. Flowly stores only video ID, metadata, cover/URL, user categories and last-update date; it never downloads the video.

### S-MA-041 own-workout editor contract

- First save and later edits expose: title; description; categories; duration; difficulty; YouTube link; cover upload; custom exercises; exercise image/GIF; sets; repetitions; time; rest; exercise reordering; draft save; private mode; friend sharing; link access; public mode.

### S-MA-051 program-detail contract

- Program composition exposes: title; description; cover; duration; categories; day sequence; workout for each active day; planned rest days; final goal; progress.

### S-MA-061 habit-create contract

- Fields are explicit: title; optional description; icon; color; start date; optional end date; schedule type; completion count; time; reminder policy; skip availability; optional post-completion comment. Privacy is hidden at creation and the created habit is private.

### S-MA-070–072 calendar-filter contract

- Filters are explicit: all; yoga; habits; one concrete habit; program; joint activities; completed only; skipped only; no-response only.

### S-MA-086 challenge contract

- Creation fields are explicit: title; description; participants; start date; end date; goal type; required amount; linked workouts or habits; result visibility; notifications.
- Goal types are explicit: complete N workouts; practice every day; finish a program; complete a habit N times; accumulate total time.

### S-MA-091 notification-type contract

- Independently represented types: primary reminder; repeat; final reminder; program start; program completion; weekly report; monthly report; invite; friend activity; partner reminder; reaction; technical error requiring user action.

### S-MA-061/S-MA-022 health-safety contract

- Medication habits never suggest a drug, determine dosage, check compatibility, recommend skipping, or replace a system/medical reminder; creation shows the exact neutral warning required by §39.
- Workout detail shows contraindications but performs no personalized medical analysis.

### S-MA-075 report contract

- Weekly detail exposes separately: planned workouts, completed workouts, partial completions, rest, skips, no-response actions, total activity time, program progress, each habit's completion, completion percentage, current streaks, previous-week comparison, permitted joint statistics and short text summary.
- Monthly detail exposes separately: calendar heatmap, workout count, total time, habit completion, most regular habits, most skipped habits, current/best streaks, program completion, previous-month comparison, permitted joint statistics, best weekdays and result card.
- Habit percentage uses completed mandatory slots / elapsed mandatory slots; skipped and no-response remain in the denominator and future slots are excluded. Yoga count and time are separate; partial is not full. Joint statistics include only shared objects.

### S-MA-093 export contract

- The downloadable protected archive is JSON and observably enumerates: profile, workouts, habits, schedules, history, friends and reports. Request, progress, failure, protected download and bot notification are separate states.

## State matrix

Each ID is assigned to one explicitly defined profile below; this is the canonical per-surface applicability mapping. `A` means the state must be designed. Every `N/A` includes the reason why that state cannot occur on the assigned surface. `S` is a visible successful mutation, not generic successful loading.

| Profile | L | E | ER | R | O | S | D | Applicability contract |
|---|---|---|---|---|---|---|---|---|
| P-SHELL | A | N/A: bootstrap has no domain collection | A | A | A | A | A | auth/session/bootstrap; success means session established |
| P-WIZARD | A | N/A: finite form, not a collection | A | A | A | A | A | onboarding/settings/editor input is retained on retry/offline |
| P-GATE | A | N/A: required connection check has a result, not an empty collection | A | A | A | A | A | mandatory gate/diagnostics; disabled reason is visible |
| P-COLLECTION | A | A | A | A | A | A | A | actionable list/index/dashboard; empty has a domain CTA or explanation; success names its mutation |
| P-COLLECTION-READ | A | A | A | A | A | N/A: navigation/filtering does not save data | A | read/navigation collection; empty remains explainable |
| P-DETAIL | A | N/A: identified object detail cannot be empty; unavailable is ER | A | A | A | A | A | actionable detail; saved is favorite/copy/action success |
| P-DETAIL-READ | A | N/A: identified read-only detail cannot be empty; unavailable is ER | A | A | A | N/A: no mutation on this surface | A | read/recovery detail; actions only navigate or retry |
| P-RUNTIME | A | N/A: active runtime is either open or unavailable | A | A | A | A | A | checkpoint/offline and invalid-control disabled paths |
| P-FORM | A | N/A: create/edit form is not a collection | A | A | A | A | A | draft retained; validation and permission disable reasons |
| P-CONFIRM | N/A: confirmation is local over loaded context | N/A: explicit pending action exists | A | A | A | A | A | cancel has no mutation; success names the committed outcome |
| P-REPORT | A | A | A | A | A | A | A | actionable generation/download surface; success is explicit |
| P-REPORT-READ | A | A | A | A | A | N/A: report browsing does not mutate data | A | no-data explanation and partial marker are explicit |
| P-MESSAGE | N/A: Telegram owns transport loading | N/A: pushed message has concrete occurrence/content | A | A | N/A: transport/offline handled by Telegram | A | A | callback result, stale/duplicate and deep-link retry |
| P-COMMAND | N/A: Telegram owns transport loading | N/A: command response is concrete | A | A | N/A: transport/offline handled by Telegram | N/A: command/deep link is non-mutating | A | bot error recovers through diagnostics/deep link |
| P-WEB | A | N/A: fallback is a concrete safe state | A | A | A | N/A: fallback is read-only | A | restricted target data is never rendered |

| Surface ID | Profile | Surface-specific observable state / N/A clarification |
|---|---|---|
| S-MA-001 | P-SHELL | auth failure is full-screen; retry revalidates initData |
| S-MA-002 | P-WIZARD | skipped optional step is not successful-save |
| S-MA-003 | P-WIZARD | timezone/preferences input survives retry |
| S-MA-004 | P-WIZARD | controls stay disabled with no fake mutation until linked downstream cards implement them |
| S-MA-005 | P-GATE | completion disabled during validation/save; DEC-034 accepts the validated Telegram launch/session as the gate |
| S-MA-006 | P-DETAIL-READ | unavailable target is ER, with safe recovery/exit |
| S-MA-010 | P-COLLECTION | modules load independently; empty day has three CTAs |
| S-MA-011 | P-DETAIL | action set disabled by occurrence type/status |
| S-MA-012 | P-CONFIRM | continue, close and cancel-new are distinct |
| S-MA-020 | P-COLLECTION | no results offers reset filters |
| S-MA-021 | P-COLLECTION | cache/API source and quota fallback are visible |
| S-MA-022 | P-DETAIL | inaccessible/hidden content is ER, not empty |
| S-MA-023 | P-COLLECTION | empty favorites is explained; no folders |
| S-MA-024 | P-DETAIL | block/unblock success is visible |
| S-MA-025 | P-COLLECTION | source sections load independently; partial failure keeps the successful source visible |
| S-MA-030 | P-RUNTIME | player failure preserves active session |
| S-MA-031 | P-RUNTIME | invalid timer/step controls show disabled reason |
| S-MA-032 | P-RUNTIME | unavailable mode is disabled with reason |
| S-MA-033 | P-CONFIRM | no status is selected automatically |
| S-MA-034 | P-RUNTIME | checkpoint sync conflict is explicit |
| S-MA-040 | P-COLLECTION | empty own-workouts offers create |
| S-MA-041 | P-FORM | first save requires all approved minimum fields |
| S-MA-042 | P-FORM | exercise draft/order survives retry |
| S-MA-043 | P-FORM | unavailable visibility options explain permission |
| S-MA-044 | P-FORM | manual record input survives retry |
| S-MA-045 | P-FORM | upload validation/retry/remove are explicit |
| S-MA-050 | P-COLLECTION | empty catalog/current areas are distinct |
| S-MA-051 | P-DETAIL-READ | unavailable day/workout is recoverable ER |
| S-MA-052 | P-FORM | start disabled until date/time/policy are valid |
| S-MA-053 | P-DETAIL | missed/rest/completed progress states are distinct |
| S-MA-054 | P-CONFIRM | owner cannot leave without transfer/end |
| S-MA-060 | P-COLLECTION | empty Rhythm explains and offers add |
| S-MA-061 | P-FORM | private-by-default save and neutral health warning |
| S-MA-062 | P-FORM | invalid schedule/slots show field reasons |
| S-MA-063 | P-FORM | global reminder limits disable invalid policy values |
| S-MA-064 | P-DETAIL | no-history is an explained empty substate |
| S-MA-065 | P-CONFIRM | future-only impact and archive outcome are explicit |
| S-MA-070 | P-COLLECTION-READ | empty filtered calendar offers reset; filtering/selecting does not save |
| S-MA-071 | P-COLLECTION-READ | empty filtered week offers reset; filtering/selecting does not save |
| S-MA-072 | P-COLLECTION | empty day permits manual add |
| S-MA-073 | P-CONFIRM | correction success includes audit history |
| S-MA-074 | P-REPORT-READ | no reports/current partial are explained |
| S-MA-075 | P-REPORT-READ | no-data report is not fabricated |
| S-MA-076 | P-FORM | generation disabled until safe fields consented |
| S-MA-080 | P-COLLECTION-READ | profile hub only navigates; section mutations occur in child surfaces |
| S-MA-081 | P-COLLECTION | empty/pending/removed/blocked relations are distinct |
| S-MA-082 | P-CONFIRM | expired/used/rejected invite has safe terminal outcome |
| S-MA-083 | P-DETAIL | revoked is ER; remind disabled for link-only viewer |
| S-MA-084 | P-FORM | revoke/visibility success and permissions are visible |
| S-MA-085 | P-COLLECTION | empty challenges offers create |
| S-MA-086 | P-FORM | join/leave/visibility controls follow role |
| S-MA-087 | P-COLLECTION | empty feed is valid; participant permissions gate actions |
| S-MA-088 | P-FORM | reason required; hide/block outcomes are separate |
| S-MA-090 | P-FORM | profile/timezone draft survives retry |
| S-MA-091 | P-FORM | invalid quiet-hours/policy combinations explain disabled |
| S-MA-092 | P-COLLECTION-READ | data hub only navigates to independent actions |
| S-MA-093 | P-REPORT | request/progress/failure/protected download/expiry |
| S-MA-094 | P-CONFIRM | success states exact removed/retained scope |
| S-MA-095 | P-CONFIRM | grace, re-auth cancellation and expiry are distinct |
| S-BOT-001 | P-COMMAND | invite context may be unavailable without leaking target |
| S-BOT-002 | P-COMMAND | exact target is access-checked |
| S-BOT-003 | P-MESSAGE | terminal, snooze and stale outcomes are distinct |
| S-BOT-004 | P-MESSAGE | Start is handoff; rest only when allowed |
| S-BOT-005 | P-MESSAGE | stale/duplicate returns current state without mutation |
| S-BOT-006 | P-MESSAGE | no-data summary is explicit; personal fields protected |
| S-BOT-007 | P-MESSAGE | recipient/access rechecked before target opens |
| S-BOT-008 | P-MESSAGE | download is protected; failure opens diagnostics |
| S-WEB-001 | P-WEB | only “open through Telegram” and safe exit |
| S-WEB-002 | P-WEB | unavailable reason/re-auth/exit; no target data |

## Mutations and terminal outcomes

- Mutations: session/profile, favorites, workout/session/draft/media, enrollment, habit/schedule/policy/occurrence, report card, friendship/share/challenge/reaction, export/history/account lifecycle.
- Every mutation exposes success, retry without lost input, and disabled reason. Cancel/back preserves prior committed data; complex forms preserve draft (§40.1).
- Status correction, share/revoke, block/unblock, leave/ownership, clear history and account deletion use explicit confirmation and the permission rules in `DEC-015`, `DEC-019`, `DEC-020`, `DEC-021`.
