# PRD ↔ screen / flow / state traceability

> Forward direction is this matrix. Reverse direction is the `PRD` + `Flow` columns of [`screen-inventory.md`](screen-inventory.md) and `Screens` column of [`flow-inventory.md`](flow-inventory.md). `covered` is used only when the exact obligation text is observable in the cited inventory contract, state profile or diagram; a section-level mention alone is insufficient. List-valued obligations are split into independently checkable rows or an explicitly enumerated observable contract.

## Product principles, IA and entry

| PRD atomic requirement | Screen / flow / state / decision | Status |
|---|---|---|
| §8.1 explicit user completion only | S-MA-033,S-MA-073; F04,F09; DEC-015 | covered |
| §8.2 bounded reminders and quiet hours | S-MA-063,S-MA-091,S-BOT-003–004; F08; DEC-015 | covered |
| §8.3 all settings in Mini App; bot delivery only | S-MA-090–092,S-BOT-001–008; F08,F11 | covered |
| §8.4 privacy by default and explicit post-create share | S-MA-041,S-MA-061,S-MA-084; F05,F07,F10 | covered |
| §8.5 no hidden status/schedule/program correction | S-MA-033,S-MA-053,S-MA-065,S-MA-073; F04,F06,F07,F09 | covered |
| §8.6 rest distinct from skip and strict streak semantics | S-MA-033,S-MA-053,S-MA-064,S-MA-073; F04,F06,F07,F09 | covered |
| §9 exactly five tabs | S-MA-010,020,050,060,070; overview; DEC-013 | covered |
| §9 profile sections: friends/challenges/favorites/reports/settings/notifications/export/delete | S-MA-080–096; F10,F11 | covered |
| §10.1 welcome, Telegram check/profile/timezone/preferences/habit/bot/friend onboarding; only bot mandatory | S-MA-002–005; F01; DEC-014 | covered |
| §10.2 Telegram initData server auth/session, no password | S-MA-001; F01 | covered |
| §10.3 outside-Telegram production fallback; local/test emulation | S-WEB-001; F01 | covered; local/test is non-user environment |

## Home, yoga and workouts

| PRD atomic requirement | Screen / flow / state / decision | Status |
|---|---|---|
| §11.1 greeting | S-MA-010 Home contract; F02 | covered |
| §11.1 overall day progress | S-MA-010 Home circular progress; F02; DEC-040 | covered |
| §11.1 nearest planned action | S-MA-010 Home contract; F02 | covered |
| §11.1 quick workout start | S-MA-010 Home contract; F02,F04 | covered |
| §11.1 current program | S-MA-010 Home contract; F02,F06 | covered |
| §11.1 today's habits | S-MA-010 Home contract; F02,F07 | covered |
| §11.1 no separate categories/weekly/recommendations/friend modules | S-MA-010; DEC-039 | intentionally removed from Home |
| §11.2 planned count | S-MA-010 Home contract; F02 | covered |
| §11.2 completed count | S-MA-010 Home contract; F02 | covered |
| §11.2 partially completed count | S-MA-010 Home contract; F02 | covered |
| §11.2 remaining count | S-MA-010 Home contract; F02 | covered |
| §11.2 no-response presence | S-MA-010 Home contract; F02 | covered |
| §11.3 initial category: для спины | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: перед сном | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: растяжка | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: расслабление | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: энергия | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: утренняя практика | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: шея и плечи | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: всё тело | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: короткая практика | S-MA-020 catalog contract; F03 | covered |
| §11.3 initial category: дыхание без аудиоинструкций | S-MA-020 catalog contract; F03 | covered |
| §11.3 categories expand from catalog data without UI-code changes | S-MA-020; F03 | covered; catalog volume blocked downstream: DEC-010 |
| §12.1 three catalog sources visibly labelled | S-MA-020; F03 | covered |
| §12.2 category/duration/difficulty/format/equipment/author-or-channel/source/favorite-only filters | S-MA-020–024 contract; F03, empty/reset state | covered |
| §12.3 search separately covers title/description/category/author/channel | S-MA-020–024 contract; F03 | covered |
| §12.4 card cover/title/duration/categories/format/difficulty/source/author/favorite/UGC | S-MA-020–024 contract; F03 | covered |
| §13.1 workout title | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 cover | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 short description | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 goal | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 categories | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 duration | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 difficulty | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 required equipment | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 contraindications | S-MA-022 workout-detail and health-safety contracts; F03 | covered |
| §13.1 exercise list | S-MA-022 workout-detail contract; F03,F04 | covered |
| §13.1 exercise images/GIF | S-MA-022 workout-detail contract; F03,F04 | covered |
| §13.1 text instructions | S-MA-022 workout-detail contract; F03,F04 | covered |
| §13.1 full YouTube video when present | S-MA-022 workout-detail contract; F03,F04 | covered |
| §13.1 author | S-MA-022 workout-detail contract; F03,F10 | covered |
| §13.1 source | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 Start action | S-MA-022 workout-detail contract; F04 | covered |
| §13.1 Favorite action | S-MA-022 workout-detail contract; F03 | covered |
| §13.1 Share action | S-MA-022 workout-detail contract; F10 | covered |
| §13.2 UGC warning/report/hide/author | S-MA-022,S-MA-024,S-MA-088; F03; DEC-021 | covered |
| §14.1 video start/session/player/time/pause/finish/explicit status/calendar; no subjective prompts or auto-completion | S-MA-030,S-MA-033,S-MA-072; F04 | covered |
| §14.2 step content/progress/timers and all controls incl. +30/skip; explicit final status | S-MA-031,S-MA-033; F04 | covered |
| §14.3 mixed content and user mode choice | S-MA-032; F04 | covered |
| §14.4 open-session persistence; one active; continue/close/cancel | S-MA-012,S-MA-034; F04; DEC-016 | covered |
| §15 five workout final statuses; manual calendar edit + history | S-MA-033,S-MA-073; F04,F09; DEC-015 | covered |
| §16.1 set title | S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 add description | S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 choose categories | S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 set duration | S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 set difficulty | S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 add YouTube link | S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 upload cover | S-MA-041,S-MA-045 own-workout editor contract; F05 | covered |
| §16.1 create custom exercises | S-MA-041,S-MA-042 own-workout editor contract; F05 | covered |
| §16.1 add exercise image/GIF | S-MA-042,S-MA-045 own-workout editor contract; F05 | covered |
| §16.1 set sets | S-MA-042 own-workout editor contract; F05 | covered |
| §16.1 set repetitions | S-MA-042 own-workout editor contract; F05 | covered |
| §16.1 set time | S-MA-042 own-workout editor contract; F05 | covered |
| §16.1 set rest | S-MA-042 own-workout editor contract; F05 | covered |
| §16.1 reorder exercises | S-MA-041,S-MA-042 own-workout editor contract; F05 | covered |
| §16.1 save draft | S-MA-040,S-MA-041 own-workout editor contract; F05 | covered |
| §16.1 keep private | S-MA-041,S-MA-043 own-workout editor contract; F05 | covered |
| §16.1 share with friends | S-MA-043 own-workout editor contract; F05,F10 | covered |
| §16.1 open by link | S-MA-043 own-workout editor contract; F05,F10 | covered |
| §16.1 make public | S-MA-043 own-workout editor contract; F05 | covered |
| §16.2 visibility modes; saved copies unaffected | S-MA-043,S-MA-083; F05,F10; DEC-019 | covered |
| §16.3 JPEG/PNG/WebP/GIF; no uploaded video, YouTube links allowed | S-MA-041,S-MA-045; F05 | covered |
| §17 manual workout fields and calendar/time/report/streak participation | S-MA-044,S-MA-072,S-MA-075; F05,F09 | covered |
| §18 favorites workout/YouTube/UGC/program; no folders | S-MA-023; F03,F06 | covered |
| §19.1 filter-built Russian YouTube query, no arbitrary query | S-MA-020–021; F03 | covered |
| §19.2 Russian preference/language limitation communicated | S-MA-021; F03 | covered |
| §19.3 result metadata/view/favorite/create workout | S-MA-021; F03,F05 | covered |
| §19.4 identical request cache retained at least 24 hours | S-MA-020–024 contract; S-MA-021; F03 diagram | covered |
| §19.4 cache key contains every selected filter | S-MA-020–024 contract; S-MA-021; F03 diagram | covered |
| §19.4 quota makes cache mandatory and unavailability observable | S-MA-020–024 contract; S-MA-021; F03; DEC-011 | covered; exact external quota operation remains DEC-011 |
| §19.5 store ID/metadata/cover/categories/update only, never video | S-MA-021,S-MA-041; F03,F05 | covered as observable no-upload constraint |

## Programs, habits, reminders and occurrences

| PRD atomic requirement | Screen / flow / state / decision | Status |
|---|---|---|
| §20.1 7/14/30-day programs | S-MA-050; F06 | covered |
| §20.2 program title | S-MA-051 program-detail contract; F06 | covered |
| §20.2 description | S-MA-051 program-detail contract; F06 | covered |
| §20.2 cover | S-MA-051 program-detail contract; F06 | covered |
| §20.2 duration | S-MA-051 program-detail contract; F06 | covered |
| §20.2 categories | S-MA-051 program-detail contract; F06 | covered |
| §20.2 day sequence | S-MA-051 program-detail contract; F06 | covered |
| §20.2 workout for every active day | S-MA-051,S-MA-053 program-detail contract; F06 | covered |
| §20.2 planned rest days | S-MA-051,S-MA-053 program-detail contract; F06 | covered |
| §20.2 final goal | S-MA-051 program-detail contract; F06 | covered |
| §20.2 progress | S-MA-053 program-detail contract; F06 | covered |
| §20.3 start date/time/policy/friend | S-MA-052; F06,F10 | covered |
| §20.4 miss remains and never shifts program | S-MA-053; F06; DEC-016 | covered |
| §20.5 planned rest neutral; user rest distinct and breaks strict streak | S-MA-053,S-MA-073; F06,F09 | covered |
| §20.6 multiple friends, separate/overall/joint progress, reactions, permitted notifications | S-MA-052–054,S-MA-087; F06,F10; DEC-019–020 | covered |
| §21.1 empty Rhythm explanation/examples/add; no auto-created examples | S-MA-060; F07 empty state | covered |
| §21.2 examples are arbitrary habits, not fixed list | S-MA-060–061; F07 | covered |
| §21.3 habit card title/icon/color/progress/next/streak/status/quick completion | S-MA-060; F07 | covered |
| §22.1 habit title | S-MA-061 habit-create contract; F07 | covered |
| §22.1 optional description | S-MA-061 habit-create contract; F07 | covered |
| §22.1 icon | S-MA-061 habit-create contract; F07 | covered |
| §22.1 color | S-MA-061 habit-create contract; F07 | covered |
| §22.1 start date | S-MA-061 habit-create contract; F07 | covered |
| §22.1 optional end date | S-MA-061 habit-create contract; F07 | covered |
| §22.1 schedule type | S-MA-061,S-MA-062 habit-create contract; F07 | covered |
| §22.1 completion count | S-MA-061,S-MA-062 habit-create contract; F07 | covered |
| §22.1 time | S-MA-061,S-MA-062 habit-create contract; F07 | covered |
| §22.1 reminder policy | S-MA-061,S-MA-063 habit-create contract; F07 | covered |
| §22.1 skip availability | S-MA-061,S-MA-063 habit-create contract; F07 | covered |
| §22.1 optional post-completion comment | S-MA-061 habit-create contract; F07 | covered |
| §22.1 privacy option hidden during create | S-MA-061 habit-create contract; F07 | covered |
| §22.1 created habit is private | S-MA-061 habit-create contract; F07 | covered |
| §22.2 system icon/emoji across card/calendar/report/bot | S-MA-061,S-MA-060,S-MA-070,S-MA-075,S-BOT-003; F07–F09 | covered |
| §22.3 user color never sole status cue | S-MA-061,S-MA-070,S-MA-075; §40 shared state | covered |
| §23.1 exact times create separate occurrences | S-MA-062,S-MA-064; F07 | covered |
| §23.2 weekdays support several times per day | S-MA-062; F07 | covered |
| §23.3 weekly goal/allowed days/time/fixed Monday week start/remaining and mandatory-day rule without hidden assignment | S-MA-062,S-MA-064; F07; DEC-017,DEC-042 | covered |
| §23.4 interval with anchor | S-MA-062; F07 | covered |
| §23.5 separate configured slots and full/partial/skipped/no-response daily result | S-MA-062,S-MA-064,S-MA-073; F07,F09 | covered |
| §24.1 gentle preset: main + one repeat after 90m | S-MA-063; F07,F08 | covered |
| §24.2 normal preset: main + 45m + final two hours later | S-MA-063; F07,F08 | covered |
| §24.3 persistent preset: main + 30m/60m/120m/final within allowed time | S-MA-063; F07,F08 | covered |
| §24.4 custom repeats/intervals/max/last/quiet/snooze/skip/final no-answer | S-MA-063; F07,F08; DEC-015 | covered |
| §24.5 min 10m, max 10/day, partner 2h, cancel on terminal status, quiet priority | S-MA-063,S-MA-091,S-BOT-003–005; F08 | covered |
| §25.1 habit reminder text and actions | S-BOT-003; F08 | covered |
| §25.2 yoga reminder text and actions | S-BOT-004; F08 | covered |
| §25.3 done updates occurrence/message/calendar/streak, confirms and cancels repeats | S-BOT-005,S-MA-072; F08,F09 | covered |
| §25.4 already done follows the same explicit completion contract | S-BOT-005,S-MA-072; F08,F09 | covered |
| §25.5 preset/custom snooze only current occurrence, no schedule change | S-BOT-003–005,S-MA-011; F08 | covered |
| §25.6 skip stops day/slot reminders, records editable skip, future unchanged | S-BOT-003,S-MA-073; F08,F09 | covered |
| §25.7 rest only where allowed, distinct and not strict completion | S-BOT-004,S-MA-073; F08,F09 | covered |
| §26 lifecycle statuses scheduled/due/notified/snoozed/completed/partial/rest/skipped/no_response/cancelled/expired | S-MA-011,S-MA-064,S-MA-072–073,S-BOT-005; F07–F09; DEC-015 | covered |
| §26.1 pending until local-day close then no_response; editable, never auto-skipped | S-BOT-005,S-MA-073; F08,F09 | covered |
| §26.2 correction old/new/time/source/user/comment | S-MA-073; F09 | covered |
| §27 IANA timezone/edit; UTC absolutes/local days/DST stable | S-MA-003,S-MA-090; F01,F11; DEC-017 | covered |

## Calendar, reports, recommendations and social

| PRD atomic requirement | Screen / flow / state / decision | Status |
|---|---|---|
| §28.1 month/week/day modes | S-MA-070–072; F09 | covered |
| §28.2 unified yoga/workout/program/habit/joint/manual calendar | S-MA-070–072; F09 | covered |
| §28.3 filter: all | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: yoga | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: habits | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: one concrete habit | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: program | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: joint activities | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: completed only | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: skipped only | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.3 filter: no-response only | S-MA-070–072 calendar-filter contract; F09 | covered |
| §28.4 icons/colors/status/overflow count in cell | S-MA-070; F09 | covered |
| §28.5 completed/partial/rest/skipped/no-response/scheduled/open session | S-MA-070–073; F09 | covered |
| §28.6 day time/status/duration/source/edit/manual add | S-MA-072–073,S-MA-044; F09 | covered |
| §29.1 daily streak requires every mandatory slot; partial does not continue | S-MA-064,S-MA-075; F07,F09 | covered |
| §29.2 unscheduled weekdays are neutral | S-MA-064,S-MA-075; F07,F09 | covered |
| §29.3 weekly-target streak counts consecutive successful weeks | S-MA-064,S-MA-075; F07,F09 | covered |
| §29.4 yoga streak: completed continues; user rest/skip/no-response break; planned rest neutral | S-MA-064,S-MA-075; F07,F09 | covered |
| §29.5 current/best streak and start/best dates displayed | S-MA-064,S-MA-075; F07,F09 | covered |
| §30.1 reports in app/bot, opt-out, publish card | S-MA-074–076,S-MA-091,S-BOT-006; F09,F11 | covered |
| §30.2 weekly planned/completed/partial/rest/skipped/no-response metrics | S-MA-075 report contract; F09 | covered |
| §30.2 weekly total time and program progress | S-MA-075 report contract; F09 | covered |
| §30.2 each habit completion and percentage | S-MA-075 report contract; F09 | covered |
| §30.2 current streaks and previous-week comparison | S-MA-075 report contract; F09 | covered |
| §30.2 permitted joint statistics and short text summary | S-MA-075 report contract; S-BOT-006; F09 | covered |
| §30.3 monthly calendar heatmap/workout count/total time | S-MA-075 report contract; F09 | covered |
| §30.3 habit completion/most regular/most skipped | S-MA-075 report contract; F09 | covered |
| §30.3 current and best streaks/program completion | S-MA-075 report contract; F09 | covered |
| §30.3 previous-month comparison/permitted joint statistics | S-MA-075 report contract; F09 | covered |
| §30.3 best weekdays and result card | S-MA-075 report contract; S-BOT-006; F09 | covered |
| §30.4 habit percentage numerator is completed mandatory slots | S-MA-075 report contract; F09 | covered |
| §30.4 denominator is elapsed mandatory slots including skipped/no-response | S-MA-075 report contract; F09 | covered |
| §30.4 future slots excluded | S-MA-075 report contract; F09 | covered |
| §30.4 yoga count/time separate and partial not full | S-MA-075 report contract; F09 | covered |
| §30.4 joint statistics only for shared objects | S-MA-075 report contract; F09,F10 | covered |
| §30.5 card excludes private/medical/comments/unconsented names; explicit field choice | S-MA-076; F09; DEC-018 | covered |
| §31 no complex algorithm; inputs limited to listed categories/favorites/recent/duration/time/program/staleness/joint program | S-MA-010 Home contract; F02 | covered |
| §31 morning/evening contextual rules | S-MA-010 Home contract; F02 | covered |
| §31 avoid overly frequent repeat | S-MA-010 Home contract; F02 | covered |
| §31 current program continuation first | S-MA-010 Home contract; F02 | covered |
| §31 exclude workout already completed today | S-MA-010 Home contract; F02 | covered |
| §31 every recommendation shows understandable reason | S-MA-010 Home contract; F02 | covered |
| §32.1 invite deep-link/bot/app/confirm friendship | S-MA-081–082,S-BOT-001,S-BOT-007; F01,F10 | covered |
| §32.2 multiple friends | S-MA-081; F10 | covered |
| §32.3 invite/pending/accepted/rejected/removed/blocked states | S-MA-081–082; F10; DEC-019 | covered |
| §32.4 remove revokes shares/notifications, preserves joint history/public availability | S-MA-081,S-MA-083; F10 | covered |
| §33.1 shared habit allowed fields/toggles; no edit/other data/reminder control | S-MA-083–084; F10; DEC-019 | covered |
| §33.2 workout link/friend/public | S-MA-043,S-MA-083–084; F10 | covered |
| §33.3 revoke anytime | S-MA-084; F10 | covered |
| §34.1 challenge title | S-MA-085–086 challenge contract; F10 | covered |
| §34.1 description | S-MA-086 challenge contract; F10 | covered |
| §34.1 participants | S-MA-086 challenge contract; F10 | covered |
| §34.1 start date | S-MA-086 challenge contract; F10 | covered |
| §34.1 end date | S-MA-086 challenge contract; F10 | covered |
| §34.1 goal type | S-MA-086 challenge contract; F10 | covered |
| §34.1 required amount | S-MA-086 challenge contract; F10 | covered |
| §34.1 linked workouts or habits | S-MA-086 challenge contract; F10 | covered |
| §34.1 result visibility | S-MA-086 challenge contract; F10 | covered |
| §34.1 notifications | S-MA-086 challenge contract; F10 | covered |
| §34.2 goal: complete N workouts | S-MA-086 challenge contract; F10 | covered |
| §34.2 goal: practice every day | S-MA-086 challenge contract; F10 | covered |
| §34.2 goal: finish a program | S-MA-086 challenge contract; F10 | covered |
| §34.2 goal: complete a habit N times | S-MA-086 challenge contract; F10 | covered |
| §34.2 goal: accumulate total time | S-MA-086 challenge contract; F10 | covered |
| §34.3 overall/personal/feed/reactions/final card | S-MA-086–087; F10 | covered |
| §35 partner remind only shared/current/enabled/2h/logged/fixed text | S-MA-083,S-MA-087,S-BOT-007; F10; DEC-019 | covered |

## Bot, settings, health and UX

| PRD atomic requirement | Screen / flow / state / decision | Status |
|---|---|---|
| §36.1 bot welcome/launch/reminders/callback/reports/invites/friends/reactions/deep links | S-BOT-001–008; F01,F08–F11 | covered |
| §36.2 `/start /app /today`, no product setup; `/help` removed by DEC-041 | S-BOT-001–002; F01,F02 | covered |
| §36.3 webhook secret | no user screen; F08 trust boundary | N/A: technical implementation requirement |
| §36.4 idempotent update/callback | S-BOT-005; F08; DEC-015 | covered |
| §37.1 primary reminder | S-MA-091 notification-type contract; S-BOT-003–004; F08 | covered |
| §37.1 repeat | S-MA-091 notification-type contract; S-BOT-003–004; F08 | covered |
| §37.1 final reminder | S-MA-091 notification-type contract; S-BOT-003–004; F08 | covered |
| §37.1 program start | S-MA-091 notification-type contract; S-BOT-007; F06,F10 | covered |
| §37.1 program completion | S-MA-091 notification-type contract; S-BOT-007; F06,F10 | covered |
| §37.1 weekly report | S-MA-091 notification-type contract; S-BOT-006; F09 | covered |
| §37.1 monthly report | S-MA-091 notification-type contract; S-BOT-006; F09 | covered |
| §37.1 invite | S-MA-091 notification-type contract; S-BOT-007; F10 | covered |
| §37.1 friend activity | S-MA-091 notification-type contract; S-BOT-007; F10 | covered |
| §37.1 partner reminder | S-MA-091 notification-type contract; S-BOT-007; F10 | covered |
| §37.1 reaction | S-MA-091 notification-type contract; S-BOT-007; F10 | covered |
| §37.1 technical error requiring user action | S-MA-091 notification-type contract; S-BOT-008; F11 | covered |
| §37.2 independent repeat/report/friend/reaction/recommendation controls + habit main notification | S-MA-063,S-MA-091; F07,F11 | covered |
| §37.3 quiet start/end and delay/skip behavior | S-MA-091,S-BOT-003–005; F08; DEC-015 | covered |
| §38.1 Telegram-origin identity/timezone/fixed Monday/theme/time/persisted reports | S-MA-090; F11; DEC-020,DEC-042,DEC-044 | covered |
| §38.2 quiet/default/quick intervals/partner/weekly/monthly | S-MA-091; F11 | covered |
| §38.3 export/delete/clear-history/public-workout/friend management are separate data actions | S-MA-092–095,S-MA-040,S-MA-081; F11 | covered |
| §51.2 user export is protected downloadable JSON | S-MA-093 export contract; F11 | covered |
| §51.2 archive contains profile/workouts/habits/schedules/history/friends/reports | S-MA-093 export contract; F11 diagram | covered |
| §39 Flowly is not a medical app | S-MA-061/S-MA-022 health-safety contract; F03,F07 | covered |
| §39 never suggests a drug | S-MA-061 health-safety contract; F07 | covered |
| §39 never determines dosage | S-MA-061 health-safety contract; F07 | covered |
| §39 never checks compatibility | S-MA-061 health-safety contract; F07 | covered |
| §39 never recommends skipping medication | S-MA-061 health-safety contract; F07 | covered |
| §39 never replaces system/medical reminders | S-MA-061 health-safety contract; F07 | covered |
| §39 shows the required neutral medication warning | S-MA-061 health-safety contract; F07 | covered |
| §39 workout contraindications without personalized medical analysis | S-MA-022 health-safety contract; F03 | covered |
| §40.1 mobile 360–430/wide/touch/no horizontal scroll/min fields/themes/safe area/drafts | all S-MA; shared requirements in README/state matrix | covered |
| §40.2 loading/empty/error/retry/offline/saved per applicable screen | all surfaces; screen state matrix; DEC-022 | covered |
| §40.3 contrast/non-color/labels/keyboard/text/GIF stop/reduced motion | all visual surfaces; README common invariant | covered |

## Reverse-orphan rule

Every screen row names at least one PRD section and F-family. Every F-family names its complete screen set and diagram. Screens introduced only to realize approved workshop constraints cite the nearest PRD contract plus `DEC-013`–`DEC-022`; none is based on Concept A alone.
