# Deep plan: E4-D5-T03 — расписание «конкретное время» и дни недели

> Post-approval contract note (DEC-069, 2026-07-22): habit schedule no longer stores or edits a per-rule timezone; future expansion uses profile timezone and existing occurrence rows keep their timezone snapshot. T07 owns the compatibility migration/API/UI cleanup.

## Problem statement

После CRUD привычки (`E4-D5-T02`) Flowly умеет сохранять только базовую дату начала и не умеет задавать повторяемое расписание. Нужно добавить два PRD-типа расписания: exact times и weekdays, сохраняя пользовательский timezone и не переписывая историю.

## Evidence and current behavior

- Карточка `E4-D5-T03` требует `S-MA-062`, два schedule rule типа, пользовательский timezone, корректные локальные даты/время, DST/timezone и отсутствие скрытых дублей при редактировании.
- PRD §23.1: каждое заданное время создаёт отдельное ожидаемое выполнение; пример — ежедневно в 09:00 и 21:00.
- PRD §23.2: выбранные дни недели; для каждого дня поддерживается несколько времён.
- PRD §43.17 задаёт `habit_schedule_rules`: `habit_id`, `rule_type`, `timezone`, `configuration_json`, `valid_from`, `valid_until`, `created_at`; rule types включают `exact_times` и `weekdays`.
- `DEC-017`: изменения schedule/timezone влияют только на будущие occurrences, история immutable; отдельные configured slots остаются отдельными выполнениями.
- `DEC-022`: loading/error/mutation/offline states должны быть контекстными; mutation сохраняет ввод и предлагает retry.
- `DEC-024`: S-MA-062 реализуется одним реальным screen slice с отдельным user approval до следующего slice.
- `DEC-029`: client API calls — React Query + typed API helper; raw fetch в feature запрещён.
- Current `habit-form-screen.tsx` содержит базовую дату и `allowSkip`, но не содержит schedule rule editor/API/schema.
- Existing D1 occurrence uniqueness is `(user_id, entity_type, entity_id, scheduled_local_date)`; multiple same-day slots therefore require the schedule/occurrence model to preserve slot identity rather than collapsing by date.

## Target behavior

1. User opens create/edit habit form and sees a schedule section.
2. User chooses one of the approved T03 rule types:
   - `exact_times`: one or more local times repeated by the rule’s supported cadence;
   - `weekdays`: selected Monday–Sunday days, with one or more local times per selected day.
3. User chooses/retains a valid IANA timezone for the rule, initialized from the user profile timezone where applicable.
4. Form validates invalid/empty schedules, malformed times, duplicate slots, invalid timezone and impossible weekday/time combinations without losing entered data.
5. API persists the rule with ownership checks and stable identity; editing replaces/versions only future schedule configuration and does not alter immutable historical occurrences.
6. Local date/time expansion around ordinary days, midnight boundaries and DST transitions is deterministic and represented in evidence.

## Scope

### In scope

- D1 schema/migration for `habit_schedule_rules` and any minimal supporting uniqueness/version fields required by the approved existing contract.
- Typed server API for reading/upserting/deleting the current habit schedule, with habit ownership checks.
- React Query model/query/mutation integration.
- S-MA-062 create/edit UI using direct Konsta components and existing shared timezone picker where applicable.
- Validation and normalization of IANA timezone, weekdays, local `HH:mm` slots and duplicate slots.
- Pure schedule expansion utilities that map local rules to local date/time candidates and UTC instants with explicit DST behavior.
- Future-only mutation semantics and evidence that existing history is unchanged.
- Browser/API/typecheck/lint/build and date-boundary/DST verification.

### Out of scope / non-goals

- Weekly target and interval rules (`E4-D5-T04`).
- Occurrence generation/jobs/materialization (`E4-D5-T07`).
- Multiple completions/lifecycle/status changes (`E4-D5-T05`).
- Reminder policies and Telegram delivery (`E4-D5-T06`, Stage 5).
- Sharing/social behavior.
- Product decisions not already defined in PRD/DEC files.

## Resolved decisions

1. T03 owns rule persistence, validation and deterministic expansion helpers only. It does **not** materialize `activity_occurrences`; that remains T07 as stated by the card dependency graph.
2. Adopt the minimal explicit configuration contracts already implied by PRD examples: `exact_times = { times: [HH:mm, ...] }` (daily, sorted unique); `weekdays = { days: [1..7], timesByDay: { "1": [HH:mm, ...], ... } }` (Monday=1, Sunday=7, sorted unique). This is the smallest lossless representation for PRD §23.1–23.2 and does not invent weekly-target/interval fields.
3. Do not alter the existing occurrence unique index in T03. T03 stores slot configuration and expansion candidates; T07/T05 must introduce/approve slot identity before materializing multiple same-day occurrences. The risk is recorded as a downstream contract, not silently changed here.
4. Reuse `TimezonePicker`; initialize timezone from the authenticated `/me` timezone, persist it on the schedule rule, and keep it independently editable per rule. Validate IANA identifiers with `Intl.DateTimeFormat`.
5. DST behavior: local times in a spring-forward gap are rejected as invalid for that date during expansion; an autumn repeated hour is represented deterministically by the timezone conversion utility and never duplicated by a second synthetic slot. Exact conversion remains a pure helper with explicit scenario evidence.

## Open questions / blockers before implementation

None blocking for T03. The downstream slot-identity/index decision is explicitly deferred to T05/T07 and must be revisited before occurrence materialization.

## Constraints

- Konsta UI 5.2.0, `theme="ios"`, direct components; no raw interactive HTML or custom visual controls.
- One screen slice only: S-MA-062; do not start T04 or another slice before approval.
- Shared AppShell/header/safe-area/keyboard contracts remain unchanged.
- Layout must not shift when validation/loading/error text appears; reserve status space or use fixed/overlay slots.
- Preserve entered form values on mutation errors and support retry.
- No fake schedule success, no inferred reminder behavior, no silent timezone conversion.

## Affected areas (expected)

- `packages/database/src/schema.ts`
- new migration under `migrations/`
- `apps/web/app/api/v1/habits/[id]/schedule/route.ts` or the approved existing habits API shape
- `apps/web/features/rhythm/model/` schedule types, validation, queries/mutations, expansion utilities
- `apps/web/features/rhythm/ui/habit-form-screen.tsx` and/or a T03-only schedule composite if justified by existing patterns
- shared timezone picker only if a missing capability is proven
- roadmap card, `README.md`, `HANDOFF.md`, and possibly `DECISIONS.md` if an open contract requires a new decision

## Data flow / state mapping

`/me.timezone` → initial schedule timezone → S-MA-062 local rule editor → typed React Query mutation → authenticated API ownership check → `habit_schedule_rules` version/current row → deterministic expansion utility for validation/evidence → future-only downstream handoff to T07. Existing history/terminal occurrences are read-only and must not be rewritten.

UI states: initial/loading, populated exact-times, populated weekdays, invalid draft, mutation pending, mutation error with retry, offline draft, empty/no schedule, and edit with existing rule. Every state keeps geometry stable and exposes non-color cues.

## Implementation steps

1. Re-read full linked PRD sections, DEC records and current schema/API contracts; resolve the four open questions or record approved `DEC-*` decisions.
2. Set `E4-D5-T03` to `in_progress` and synchronize stage summary, roadmap index and `HANDOFF.md` before code changes.
3. Define and document the minimal schedule rule/config contract; add schema/migration and ownership-safe API.
4. Implement pure local-date/time + IANA timezone normalization/expansion helpers, including midnight, date-boundary and DST cases; do not materialize occurrences.
5. Implement React Query typed reads/mutations and integrate S-MA-062 with direct Konsta controls, shared timezone picker, stable loading/error/retry/offline states and accessible labels.
6. Run two independent reviewer passes over the plan and implementation (reviewers only; no reviewer writes).
7. Run typecheck, targeted lint, build, HTTP/API matrix, date/DST scenario matrix and browser checks at 360/390/430 light/dark; verify no overflow, console errors, raw controls/fetch, or layout shift.
8. Update evidence, residual risks, card acceptance, stage summary, roadmap index and `HANDOFF.md`; ask for explicit S-MA-062 approval before proceeding to T04.

## Verification plan

- API: unauthenticated 401; owner read/write succeeds; foreign habit/rule returns safe 404/403 according to existing API contract; malformed timezone/time/day rejected; duplicate slots normalized/rejected; retry preserves draft.
- Schedule examples: daily 09:00/21:00; Monday/Wednesday/Friday 18:00; multiple times on one weekday; local midnight crossing; month/year boundary; DST spring gap; DST autumn repeated hour; timezone change affects only future rule expansion.
- DB: migration applies cleanly; ownership and current-rule uniqueness; update does not alter historical occurrences/status history.
- UI: create/edit/readback, exact-times ↔ weekdays switching, timezone selection, invalid/empty/error/offline/pending states, keyboard focus, touch targets ≥44px, 200% text, 360/390/430 light/dark, console errors 0 and document overflow 0.

## Risks and residuals

- DST policy and duplicate local times can change the number of UTC instants; this must be explicitly represented, not silently guessed.
- Existing date-only occurrence uniqueness may conflict with multiple configured slots; if T03 cannot safely preserve slot identity without T05/T07, stop and request a decision rather than changing downstream semantics.
- Browser timezone emulation is not equivalent to real Telegram device verification; real-device confirmation remains a residual risk.
- Existing uncommitted/previous T02 changes must not be reverted or broadened.

## Confidence assessment

- **Plan confidence: 91%.** Requirements, PRD fields, linked decisions, current T02 form and existing D1 uniqueness were inspected. Confidence is below 95% because the exact `configuration_json` shape, DST policy and slot identity coupling to T05/T07 are not fully specified.
- **Implementation confidence: 86%.** UI/API scaffolding is familiar, but safe schema semantics for multiple same-day slots and DST require explicit confirmation before implementation. Confidence rises above 90% after the four open questions are resolved and the two reviewer passes agree.

## Self-review 1 — requirements and boundaries

- PASS: T03 is limited to exact-times/weekdays rule persistence, editor, validation and expansion; T04–T07 remain outside scope.
- PASS: PRD §23.1/23.2 and §43.17 are represented without inventing weekly-target/interval behavior.
- PASS: future-only semantics and immutable history are explicit.
- PASS: the existing date-only occurrence index is not silently mutated; the multiple-slot downstream risk is visible.
- Correction applied: configuration contracts, Monday-based weekday numbering, timezone ownership and DST policy are now explicit.

## Self-review 2 — implementation readiness and verification

- PASS: current project already provides direct Konsta controls, shared TimezonePicker, React Query, typed API patterns, D1/Drizzle schema and Intl timezone primitives.
- PASS: UI states include loading, empty, invalid, pending, retry and offline draft; layout stability is called out.
- PASS: verification includes API ownership, duplicate normalization, boundary dates, DST, 200% text and 360/390/430 light/dark.
- Residual warning: DST conversion must be implemented and evidenced carefully because the project has no dedicated timezone library; do not claim full DST support until scenario checks pass.

- Reviewer 1: self-review completed.
- Reviewer 2: self-review completed.
- User approval to implement: granted in chat on 2026-07-21.
