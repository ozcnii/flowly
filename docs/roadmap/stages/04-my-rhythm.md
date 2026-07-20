# Этап 4 — Мой ритм

> PRD: §21–24, §26–27, §43.16–43.21, §44.7–44.8, §50.1, §54 этап 4, §55.4.

## Цель

Создать приватные привычки с четырьмя типами расписания, несколькими выполнениями, визуальной настройкой и политиками напоминаний.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 6 | 0 | 0 | 1 | 1 |

## Зависимости и инварианты

- Зависит от foundation auth/DB/UI.
- Schedule engine и occurrences нужны этапу 5 и создаются здесь.
- Привычка приватна до явного sharing на этапе 7.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-035` Konsta UI 5.2.0 (`konsta/react`, `ios` theme) обязательна для current/future production UI; direct imports — default, `packages/ui` допустим только для Flowly-specific contracts, отсутствующих в Konsta.
- Weekly target явно показывает «обязательный сегодня»; multiple completions считаются отдельными настроенными slots (`DEC-017`).
- Pause/schedule/timezone changes действуют только на future occurrences; history immutable; delete архивирует (`DEC-017`).
- No response остаётся `no_response`; correction ограничена activity context и audit history (`DEC-015`).
- Habit private by default, sharing/revoke follows `DEC-019`; UI states follows `DEC-022` и [`docs/design/flows/`](../../design/flows/).

## Deliverable E4-D5 — Привычки и расписания

### E4-D5-T01 — Реализовать экран «Мой ритм»
- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-19
- **prd_refs:** §21, §44.7 · **depends_on:** E1-D1-T02, E1-D1-T06 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025 (superseded by DEC-035), DEC-029, DEC-035, DEC-067
- **ui_slices:** S-MA-060 — выполнять последовательно; approval каждого ID обязательно до следующего.
- **scope:** экран «Ритм» как collection shell: empty state (§21.1 объяснение + §21.2 примеры + CTA «Добавить привычку»), типизированный HabitCard (DEC-067 progress-ring вокруг иконки) + list rendering (§21.3 поля) под будущие данные T02; direct Konsta composition (DEC-035) + approved inline SVG ring exception (DEC-067), react-query/ownership (DEC-029) подключаются в T02 вместе с GET /habits.
- **acceptance:** [x] empty/list states есть; [x] карточка показывает актуальное расписание/прогресс ( HabitCard DEC-067: progress-ring вокруг иконки + «N из M», следующий срок, серия «N дней подряд» — в dev-preview на mock); [~] чужие привычки недоступны (AuthGate в T01; DB-level `WHERE user_id` ownership — T02 с появлением API).
- **validation/evidence:** файлы `features/rhythm/{model/rhythm-types,ui/habit-card,ui/rhythm-screen}.tsx`, `app/(app)/rhythm/page.tsx`; Konsta Card/BlockTitle/Button/Badge/Chip + `@flowly/ui` Icon (DEC-037) + approved inline SVG progress-ring (DEC-067). States: empty (объяснение + 8 chips-подсказок §21.2 + disabled CTA «Добавить привычку» + «Создание привычки скоро»); dev-preview `?rhythm=demo` (dev-only, Badge «Предпросмотр», mock HabitCard list: Вода 3/4 partial, Сон вовремя 1/1 done, Прогулка 0/1 pending). HabitCard (DEC-067): ring вокруг иконки (progress 0–1, non-color cue «N из M»), серия «N дней подряд», quick-complete icon-only `Button` 44×44 disabled с `aria-label` (активен в T05). Checks: typecheck/lint PASS; production build PASS (`/rhythm` ƒ dynamic); browser — 0 console errors, overflowX 0 (empty+demo, 100 % и 200 % text), targets ≥44 (CTA 48, circle-check 44); cards 93px равновысокие; audits — raw controls 0, CSS modules 0, raw `fetch` 0, legacy flow visual 0, `@flowly/ui` только approved Icon. Screenshots: `.temp/E4-D5-T01/screenshots/rhythm-{empty,demo}-{light,dark}.png`. 
- **residual risks:** AppShell Navbar/Tabbar в этом slice не валидировались (preview-bypass без auth session; shell уже покрыт другими slices). GET /habits API, CRUD, DB ownership `WHERE user_id`, loading/error/offline states, identity color (§22.3) и completion (quick-complete активен в T05) — T02/T05.
- **journal:** 2026-07-19 — `backlog -> in_progress`; research + user approved scope (Empty + HabitCard dev-preview / disabled CTA «Скоро» / chips-подсказки). Реализация slice S-MA-060. **Empty state approved пользователем без изменений.** HabitCard: сначала «Почищенный текущий» (Progressbar), затем по feedback о пустоте под иконкой предложены 3 варианта (ring/bar/row); **user выбрал v1 ring** → зафиксирован как production, оформлен **DEC-067** (inline SVG ring exception к DEC-035, как DEC-040 для Home); варианты v2/v3 и switcher удалены. typecheck/lint/build/browser PASS. `in_progress -> review`, ждёт DEC-024 user approval slice S-MA-060. **User approved + committed `52c71f4` 2026-07-19 → `review -> done`.**

### E4-D5-T02 — Реализовать CRUD привычки, иконки и цвета
- **status:** review · **priority:** high · **owner:** AI agent · **updated:** 2026-07-19
- **prd_refs:** §10.1, §22, §43.16, §44.7, §55.4 · **depends_on:** E4-D5-T01, E1-D1-T04, E1-D1-T13 · **decisions:** DEC-017, DEC-019, DEC-022, DEC-024, DEC-025 (superseded by DEC-035), DEC-029, DEC-034, DEC-035, DEC-067
- **ui_slices:** S-MA-004 (real create), S-MA-061 (create/edit form). S-MA-064 full detail/history откладывается (edit доступ есть; история — T05+).
- **scope:** CRUD привычки: DB table `habits` (§43.16) + migration 0015; API GET/POST/PATCH/DELETE /habits с ownership; форма создания/редактирования S-MA-061 (title, description, icon grid 12, color palette 8, start date, allow_skip, медицинское предупреждение §39); /rhythm показывает реальные привычки с identity color (HabitCard DEC-067 ring); onboarding S-MA-004 — реальная кнопка «Создать привычку» + честный skip. Schedule types (T03/T04), occurrences (T05/T07), reminder policies (T06), sharing (E7) — вне T02.
- **acceptance:** [x] обязательные поля валидируются (zod: title 1–120, icon/color enum, date YYYY-MM-DD); [x] icon/color сохраняются (DB columns + Konsta Button grid picker); [x] default privacy соблюдена (status active, owner-only, no share at create §22.1); [x] sharing до создания отсутствует; [x] onboarding control создаёт реальную привычку (S-MA-004 real create → /rhythm/new?return=onboarding) ИЛИ честный «Пропустить»/«Продолжить».
- **validation/evidence:** файлы `packages/database/src/schema.ts` (habits table), `migrations/0015_habits.sql`; API `app/api/v1/habits/route.ts` (GET/POST), `app/api/v1/habits/[id]/route.ts` (GET/PATCH/DELETE); model `features/rhythm/model/{habits,habits-queries,habit-card-vm,rhythm-types}.ts`; UI `features/rhythm/ui/habit-form-screen.tsx` (S-MA-061, Konsta List/ListInput/Toggle/Button + icon/color Button grid + §39 medical Card), `habit-card.tsx` (identity color cell), `rhythm-screen.tsx` (useHabitsQuery real + loading/error/empty/list states), `features/onboarding/ui/habit-invite-screen.tsx` (S-MA-004 real create); routes `app/(app)/rhythm/{new,[id]/edit}/page.tsx`. **HTTP matrix (dev D1, dev-session):** no-auth GET 401; POST без title 400 invalid; POST валид → 201; list n=1 (title/color/todayTotal=0/skip); GET detail 200; PATCH 200 (title/color/skip updated); чужой/несуществующий GET/PATCH → 404 (privacy); POST bad color 400; DELETE 200 archived; list after archive n=0. **Browser (real auth):** /rhythm empty → CTA «Добавить» → /rhythm/new форма → submit → карточка «Утренняя разминка» (sunrise/Закат identity color, «Расписание скоро» при todayTotal=0) → edit prefill корректен. typecheck/lint/build PASS; 0 console errors; overflow 0; picker 12+8 Konsta Button (aria-pressed). Screenshots: `.temp/E4-D5-T02/screenshots/{rhythm-list-after-create,rhythm-edit-prefill,habit-create-form-{light,dark}}.png`. Plan: `.temp/E4-D5-T02/plan.md` (2 self-reviews).
- **residual risks:** schedule/occurrences/completion/reminder policies/sharing — явно вне T02 (T03–T07/E7); HabitCard todayTotal=0 показывает «Расписание скоро» (честный placeholder). S-MA-064 full detail/history (streak, pause, archive UI) — T05+. Real delete — cleanup E8 (DELETE=archive по DEC-017).
- **journal:** 2026-07-19 — `backlog -> in_progress -> review`; research PRD §22/§43.16/§44.7/§39/§55.4 + DEC + flows; plan `.temp/E4-D5-T02/plan.md` с 2 самостоятельными ревью (ownership 404, COLOR_OPTIONS static classes, todayTotal=0 edge, returnTo context, medical keywords). Реализация: migration 0015 + API + form + onboarding. HTTP CRUD matrix + browser create/edit flow PASS. Ждёт DEC-024 user approval.

### E4-D5-T03 — Реализовать расписание «конкретное время» и дни недели
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.1–23.2, §27, §43.17 · **depends_on:** E4-D5-T02 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-062 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** два schedule rule типа с пользовательским timezone.
- **acceptance:** [ ] нужные локальные даты/время генерируются; [ ] DST/timezone учитываются; [ ] редактирование не создаёт скрытых дублей.
- **validation/evidence:** schedule examples вокруг границ дня/DST.

### E4-D5-T04 — Реализовать недельную цель и интервальное расписание
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.3–23.4, §27, §43.17 · **depends_on:** E4-D5-T02 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-062 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** count-per-week и interval schedule согласно PRD.
- **acceptance:** [ ] недельные границы корректны; [ ] interval anchor сохраняется; [ ] timezone не меняет уже подтверждённые выполнения.
- **validation/evidence:** table-driven date examples.

### E4-D5-T05 — Реализовать несколько выполнений и lifecycle привычки
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.5, §26, §43.21, §44.8 · **depends_on:** E4-D5-T03, E4-D5-T04 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-011, S-MA-064, S-MA-065 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** несколько occurrences в день, completion/skip/rest/no_response, pause/resume.
- **acceptance:** [ ] каждое выполнение независимо; [ ] 0/partial/full progress различим; [ ] ручное изменение журналируется.
- **validation/evidence:** occurrence state matrix.

### E4-D5-T06 — Реализовать политики напоминаний
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §24, §43.19–43.20 · **depends_on:** E4-D5-T02 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-063 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** бережная, обычная, настойчивая и пользовательская policies с глобальными ограничениями.
- **acceptance:** [ ] шаги policy сохраняются; [ ] ограничения §24.5 применены; [ ] неизвестные числовые параметры не изобретены.
- **validation/evidence:** policy records и validation cases.

### E4-D5-T07 — Генерировать occurrences и reminder jobs
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §26–27, §43.21–43.22, §45 · **depends_on:** E4-D5-T03–T06 · **decisions:** DEC-015, DEC-017, DEC-029
- **scope:** идемпотентная генерация UTC occurrences/jobs без фактической Telegram delivery.
- **acceptance:** [ ] повторный запуск не создаёт дублей; [ ] timezone changes обработаны явно; [ ] jobs связаны с policy steps.
- **validation/evidence:** generation rerun и uniqueness evidence.

### E4-D5-T08 — Закрыть DoD привычек
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50.1, §55.4, §57 · **depends_on:** E4-D5-T01–T07 · **decisions:** DEC-003, DEC-015, DEC-017, DEC-019, DEC-022, DEC-029
- **scope:** проверить четыре schedule типа, multiple completions, privacy, skip policy, icons/colors.
- **acceptance:** [ ] каждый пункт §55.4 имеет evidence; [ ] применимые проверки расписаний выполнены по явному запросу; [ ] остаточные timezone/DST риски записаны.
- **validation/evidence:** итоговый checklist и scenario matrix.

## Handoff этапа

Фиксировать schedule type, timezone, generation window, последние созданные occurrence/job IDs и следующий проверяемый сценарий.
