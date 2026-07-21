# Этап 4 — Мой ритм

> PRD: §21–24, §26–27, §43.16–43.21, §44.7–44.8, §50.1, §54 этап 4, §55.4.

## Цель

Создать приватные привычки с четырьмя типами расписания, несколькими выполнениями, визуальной настройкой и политиками напоминаний.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 4 | 1 | 0 | 0 | 3 |

## Зависимости и инварианты

- Зависит от foundation auth/DB/UI.
- Schedule engine и occurrences нужны этапу 5 и создаются здесь.
- Привычка приватна до явного sharing на этапе 7.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-035` Konsta UI 5.2.0 (`konsta/react`, `ios` theme) обязательна для current/future production UI; direct imports — default, `packages/ui` допустим только для Flowly-specific contracts, отсутствующих в Konsta.
- Weekly target явно показывает «обязательный сегодня»; multiple completions считаются отдельными настроенными slots (`DEC-017`). Для T04 canonical configs: `weekly_target={target,days,time}`, `interval={every,unit,anchorLocalDate,anchorLocalTime}`; interval uses local-calendar semantics, а mandatory-today indicator deferred to T07 (`DEC-068`).
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
- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-21
- **prd_refs:** §10.1, §22, §43.16, §44.7, §55.4 · **depends_on:** E4-D5-T01, E1-D1-T04, E1-D1-T13 · **decisions:** DEC-017, DEC-019, DEC-022, DEC-024, DEC-025 (superseded by DEC-035), DEC-029, DEC-034, DEC-035, DEC-067
- **ui_slices:** S-MA-004 (real create), S-MA-061 (create/edit form). S-MA-064 full detail/history откладывается (edit доступ есть; история — T05+).
- **scope:** CRUD привычки: DB table `habits` (§43.16) + migration 0015; API GET/POST/PATCH/DELETE /habits с ownership; форма создания/редактирования S-MA-061 (title, description, icon grid 12, color palette 8, start date, allow_skip, медицинское предупреждение §39); /rhythm показывает реальные привычки с identity color (HabitCard DEC-067 ring); onboarding S-MA-004 — реальная кнопка «Создать привычку» + честный skip. Schedule types (T03/T04), occurrences (T05/T07), reminder policies (T06), sharing (E7) — вне T02.
- **acceptance:** [x] обязательные поля валидируются (zod: title 1–120, icon/color enum, date YYYY-MM-DD); [x] icon/color сохраняются (DB columns + Konsta Button grid picker); [x] default privacy соблюдена (status active, owner-only, no share at create §22.1); [x] sharing до создания отсутствует; [x] onboarding control создаёт реальную привычку (S-MA-004 real create → /rhythm/new?return=onboarding) ИЛИ честный «Пропустить»/«Продолжить».
- **validation/evidence:** файлы `packages/database/src/schema.ts` (habits table), `migrations/0015_habits.sql`; API `app/api/v1/habits/route.ts` (GET/POST), `app/api/v1/habits/[id]/route.ts` (GET/PATCH/DELETE); model `features/rhythm/model/{habits,habits-queries,habit-card-vm,rhythm-types}.ts`; UI `features/rhythm/ui/habit-form-screen.tsx` (S-MA-061, единая row-based форма: title/description List rows + icon/color через Konsta Sheet из row «Внешний вид» + «Правила» date/allow-skip + §39 medical Card), `habit-card.tsx` (identity color cell), `rhythm-screen.tsx` (useHabitsQuery real + loading/error/empty/list states), `features/onboarding/ui/habit-invite-screen.tsx` (S-MA-004 real create); routes `app/(app)/rhythm/{new,[id]/edit}/page.tsx`. **HTTP matrix (dev D1, dev-session):** no-auth GET 401; POST без title 400 invalid; POST валид → 201; list n=1 (title/color/todayTotal=0/skip); GET detail 200; PATCH 200 (title/color/skip updated); чужой/несуществующий GET/PATCH → 404 (privacy); POST bad color 400; DELETE 200 archived; list after archive n=0. **Browser (real auth):** /rhythm empty → CTA «Добавить» → /rhythm/new форма → submit → карточка «Утренняя разминка» (sunrise/Закат identity color, «Расписание скоро» при todayTotal=0) → edit prefill корректен. typecheck/lint/build PASS; 0 console errors; overflow 0; picker 12+8 Konsta Button (aria-pressed). Screenshots: `.temp/E4-D5-T02/screenshots/{rhythm-list-after-create,rhythm-edit-prefill,habit-create-form-{light,dark}}.png`. Plan: `.temp/E4-D5-T02/plan.md` (2 self-reviews).
- **residual risks:** schedule/occurrences/completion/reminder policies/sharing — явно вне T02 (T03–T07/E7); HabitCard todayTotal=0 показывает «Расписание скоро» (честный placeholder). S-MA-064 full detail/history (streak, pause, archive UI) — T05+. Real delete — cleanup E8 (DELETE=archive по DEC-017).
- **journal:** 2026-07-19 — `backlog -> in_progress -> review`; research PRD §22/§43.16/§44.7/§39/§55.4 + DEC + flows; plan `.temp/E4-D5-T02/plan.md` с 2 самостоятельными ревью (ownership 404, COLOR_OPTIONS static classes, todayTotal=0 edge, returnTo context, medical keywords). Реализация: migration 0015 + API + form + onboarding. HTTP CRUD matrix + browser create/edit flow PASS. Ждёт DEC-024 user approval. 2026-07-20 — UI redesign S-MA-061: одна форма заменена тремя разными концепциями, переключаемые `?variant=1|2|3` (роуты `/rhythm/new` и `/rhythm/[id]/edit`). Business-логика/submit вынесены в `habit-form-shared.ts` (`useHabitFormSubmit`, `buildPayload`, `createInitial`); dispatcher `habit-form-screen.tsx`. V1 Compact iOS Form (`habit-form-compact.tsx`) — grouped BlockTitle/List + inline horizontal scroll-полоски icon/color + один CTA. V2 Guided Flow (`habit-form-guided.tsx`) — один вопрос на шаг (title→icon→color→details→review), Progressbar + «Шаг N из 5», Continue/Back/Done с локальной validation, live-preview перед созданием. V3 Preview-first (`habit-form-preview.tsx`) — живой HabitCard-preview сверху + List rows + icon/color через Konsta Sheet + «Правила» + CTA «Создать «{title}»». Checks: typecheck/lint/build PASS; 0 console errors; overflow 0 и targets ≥44 во всex 18 комбинациях (3 variants × 360/390/430 × light/dark); audits 0 raw interactive HTML / 0 raw fetch / 0 CSS modules / `@flowly/ui` только approved Icon. Konsta `ListInput title=""` workaround применён во всex 3 вариантах. Screenshots: `.temp/E4-D5-T02/screenshots/form-variant-{1,2,3}.png`. Статус `review` без изменений — ждёт user approval концепции. **2026-07-20 (user decision):** из 3 концепций выбран **V3** (row-based + Konsta Sheet), но preview-карточка отклонена как ненужная. Удалены V1 (`habit-form-compact.tsx`), V2 (`habit-form-guided.tsx`), switcher-инфраструктура (`habit-form-shared.ts`, `?variant=` из роутов); V3 без preview слит в единый `habit-form-screen.tsx` (inline helpers + edit loading/error wrapper). Роуты `/rhythm/new` и `/rhythm/[id]/edit` — без `?variant`. typecheck/lint/build PASS; overflow 0 + targets ≥48 + 0 console errors в матрице 360/390/430 × light/dark; Sheet open/select/close, title→CTA enable, medical §39 warning проверены. Screenshot: `.temp/E4-D5-T02/screenshots/habit-form-final.png`. **commit/push не выполнялись** по прямому запрету пользователя. **2026-07-21 (user feedback):** (1) **Date fix** — native `<input type=date>` value в TMA был с сдвигом (Chromium/WebKit не позиционирует `::-webkit-date-and-time-value` стилями; проверено: padding/line-height/display/appearance игнорируются). Решение: значение input скрыто (`!text-transparent` + скрытый picker-indicator), поверх — центрированный overlay-текст `formatDateRu` (DOM-замер: центр overlay == центр строки). Date вынесен в отдельный `List` внутри `relative`-обёртки. (2) **Icon catalog +12** — в спрайт DEC-037 добавлены точные Lucide-пути: `pill, footprints, brain, book-open, coffee, apple, activity, droplet, wind, flame, zap, smile, pencil` (итого 25 иконок). (3) **Emoji identity** (user decision: отдельное поле + миграция) — `habits.emoji TEXT` (migration `0016_habits_emoji.sql`), schema/zod/POST/PATCH/GET/list обновлены; `EMOJI_OPTIONS` (38 wellness-эмодзи); `HabitCardVM.emoji` + HabitCard рендерит emoji вместо Lucide-иконки когда задан; Sheet «Внешний вид» получил секцию «Эмодзи» (grid 6-col + «Без эмодзи»), row media/subtitle отражают выбор. Checks: typecheck/lint/build PASS; migration 0016 applied (local D1); browser create→list с emoji 💊 PASS; overflow 0 + targets ≥44 (base 48 / Sheet 44) + 0 console errors в матрице 360/390/430 × light/dark; audits 0 raw interactive HTML / 0 raw fetch / `@flowly/ui` только Icon. **commit/push не выполнялись** по прямому запрету пользователя.

### E4-D5-T03 — Реализовать расписание «конкретное время» и дни недели
- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-21
- **prd_refs:** §23.1–23.2, §27, §43.17 · **depends_on:** E4-D5-T02 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-062 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** два schedule rule типа с пользовательским timezone.
- **acceptance:** [x] exact_times/weekdays rules сохраняются с timezone и нормализованными слотами; [x] нужные локальные даты/время расширяются детерминированно; [x] редактирование закрывает прежнее правило и создаёт одну текущую версию без скрытых дублей; [x] occurrences не материализуются до T07, история не переписывается.
- **validation/evidence:** `.temp/E4-D5-T03/plan.md`; migration `0017_habit_schedule_rules.sql`; route `/api/v1/habits/[id]/schedule`; model `features/rhythm/model/schedule.ts`; browser `/rhythm/new` на localhost:3002 — переключение exact_times/weekdays, multiple time row, weekdays buttons, shared TimezonePicker. `typecheck` PASS; `lint` PASS с одним существующим warning `step-session-screen.tsx:449`; production `build` PASS; local D1 migration 0017 PASS. DST conversion remains a residual verification risk until dedicated scenario matrix is run. Production deploy `f0d84ab` / GitHub Actions `29843847723` PASS; real-device TMA time-picker interaction approved пользователем («очень круто») 2026-07-21, `review -> done`. Post-approval list cleanup: oversized outline HabitCard/progress placeholder/ellipsis/disabled completion removed; `/rhythm` uses compact direct Konsta List/ListItem rows with real exact-times/weekdays summary, full-row navigation, chevron, 44px identity circle for icon/emoji and two-line long-title clamp; 390px overflow 0, console errors 0, typecheck PASS.

### E4-D5-T04 — Реализовать недельную цель и интервальное расписание
- **status:** in_progress · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-21
- **prd_refs:** §23.3–23.4, §27, §43.17 · **depends_on:** E4-D5-T02 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025, DEC-029, DEC-068
- **ui_slices:** S-MA-062 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** count-per-week и interval schedule согласно PRD.
- **acceptance:** [x] недельные границы корректны; [x] interval anchor сохраняется; [ ] timezone не меняет уже подтверждённые выполнения — прямой mutation rerun не выполнен, occurrences остаются T07 scope.
- **validation/evidence:** `.temp/E4-D5-T04/plan.md`; `DEC-068`; pure table-driven checks for Monday/Sunday week bounds, weekly candidates, remaining/mandatory facts and interval anchor; web typecheck/lint/build/diff-check PASS; browser repro `/rhythm/019f8082-2956-754c-84a2-5a319faf4533/edit` restores persisted `weekdays` selection; one shared Konsta List frequency block renders all four types; exact/weekdays time rows use compact labelled ListItems with matching regular typography/padding to the start-date row, direct labelled clock/trash Buttons and no native-icon overlap; native picker click, add/delete behavior, keyboard-visible clock action and disabled final trash slot verified; light/dark 360/390/430 matrix has four radios, exactly one selected, overflow 0, console errors 0; screenshot `.temp/E4-D5-T04/screenshots/time-compact-390-light.png`; schedule API static audit touches only `habits`/`habitScheduleRules`, and current repro habit has 0 occurrences. Direct timezone/history mutation rerun remains unperformed before `review`.

### E4-D5-T05 — Реализовать несколько выполнений и lifecycle привычки
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.5, §26, §43.21, §44.8 · **depends_on:** E4-D5-T03, E4-D5-T04 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025, DEC-029, DEC-068
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
- **prd_refs:** §26–27, §43.21–43.22, §45 · **depends_on:** E4-D5-T03–T06 · **decisions:** DEC-015, DEC-017, DEC-029, DEC-068
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
