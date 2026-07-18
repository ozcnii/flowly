# Этап 3 — Программы

> PRD: §8.6, §20, §43.13–43.15, §44.6, §50.1, §54 этап 3, §55.3.

## Цель

Реализовать одиночные программы 7/14/30 дней с выбранной датой старта, неизменяемым календарём, прогрессом, пропусками, отдыхом и подготовленными reminder jobs.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 5 | 0 | 0 | 1 | 1 |

## Границы

- `DEC-001`: этап создаёт reminder model/jobs; доставка выполняется этапом 5.
- `DEC-002`: совместные программы выполняются этапом 7.
- Пропуск не сдвигает программу; отдых — отдельное состояние.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-035` Konsta UI 5.2.0 (`konsta/react`, `ios` theme) обязательна для current/future production UI; direct imports — default, `packages/ui` допустим только для Flowly-specific contracts, отсутствующих в Konsta.
- Program lifecycle минимальный: start from date, progression без сдвигов, explicit leave; restart создаёт новое enrollment (`DEC-016`).
- Skip/rest/no_response не смешиваются; status mutations подтверждаются и журналируются (`DEC-015`).
- Joint participation требует acceptance, scoped visibility и owner transfer либо завершение объекта (`DEC-019`, `DEC-020`); реализация joint UI остаётся этапу 7.
- UI опирается на F06 и state contracts из [`docs/design/flows/`](../../design/flows/).

## Deliverable E3-D4 — Одиночные программы

### E3-D4-T01 — Реализовать каталог программ
- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-19
- **prd_refs:** §20.1–20.2, §43.13–43.14, §44.6 · **depends_on:** E2-D2-T01 · **decisions:** DEC-016, DEC-022, DEC-024, DEC-029, DEC-035 (DEC-025 superseded)
- **ui_slices:** S-MA-050 + S-MA-051 (one-pass review per user).
- **scope:** модели/API/UI программ и их дней для длительностей 7/14/30; 6 system programs from Flowly catalog; Start disabled (T02).
- **acceptance:** [x] порядок дней стабилен; [x] workout/rest day различимы; [x] данные валидируются.
- **validation/evidence:** plan `.temp/E3-D4-T01/plan.md` approved; migration `0011_programs.sql`; seed 6 programs / 79 days; HTTP list/filter/detail PASS; duration filter final UX: BlockTitle + Segmented `Все · 7 дн · 14 дн · 30 дн` (onboarding pattern); typecheck/lint PASS; user close «закрываем».
- **journal:** 2026-07-19 — plan approved; implement; filter UX iterations → Segmented + «N дн»; user: «хорошо» / «закрываем»; `review -> done`.

### E3-D4-T02 — Реализовать начало программы с выбранной даты
- **status:** review · **priority:** high · **owner:** AI agent · **updated:** 2026-07-19
- **prd_refs:** §20.3, §43.15, §44.6, §55.3 · **depends_on:** E3-D4-T01, E1-D1-T06 · **decisions:** DEC-016, DEC-019, DEC-022, DEC-024, DEC-029, DEC-035
- **ui_slices:** S-MA-052
- **scope:** enrollment, дата старта и вычисление календарных дат в timezone пользователя. Reminder/joint — later.
- **acceptance:** [x] дата выбирается явно; [x] enrollment принадлежит пользователю; [x] day mapping воспроизводим.
- **validation/evidence:** plan `.temp/E3-D4-T02/plan.md`; migration `0012_program_enrollments.sql` local PASS; HTTP enroll 201, day1=start day7=start+6, idempotent 200 same id, bad date 400, detail activeEnrollment; typecheck PASS.
- **journal:** 2026-07-19 — user «стартуй»; implement schema/API/Sheet date + enrollment screen; `in_progress -> review`.

### E3-D4-T03 — Реализовать текущий день и прогресс
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §20.2–20.3, §55.3 · **depends_on:** E3-D4-T02, E2-D3-T01 · **decisions:** DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-053 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** вычисление текущего дня, completed count и отображение прогресса.
- **acceptance:** [ ] прогресс основан на фактических статусах; [ ] будущие дни не выполнены; [ ] границы timezone корректны.
- **validation/evidence:** state matrix по датам и statuses.

### E3-D4-T04 — Обработать пропуск без сдвига программы
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §20.4, §26, §55.3, §57 · **depends_on:** E3-D4-T02 · **decisions:** DEC-015, DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-053 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** missed/skipped occurrence без изменения дат последующих дней.
- **acceptance:** [ ] календарь программы неизменен; [ ] статус записан отдельно; [ ] прогресс пересчитан корректно.
- **validation/evidence:** canonical missed-day sequence до/после.

### E3-D4-T05 — Реализовать дни отдыха
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §8.6, §20.5, §55.3 · **depends_on:** E3-D4-T02 · **decisions:** DEC-015, DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-051, S-MA-053 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** rest day как отдельный тип/статус, не равный skip.
- **acceptance:** [ ] UI и данные различают rest/skip; [ ] rest не требует тренировки; [ ] серии/прогресс получают корректный сигнал.
- **validation/evidence:** rest vs skip examples.

### E3-D4-T06 — Создать program occurrences
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §20, §26, §43.21 · **depends_on:** E3-D4-T02, E3-D4-T04, E3-D4-T05 · **decisions:** DEC-015, DEC-016, DEC-029
- **scope:** backend lifecycle occurrences для дней программ до calendar UI этапа 6.
- **acceptance:** [ ] occurrence уникален и связан с enrollment/day; [ ] UTC/timezone mapping устойчив; [ ] ручные статусы сохраняются.
- **validation/evidence:** generated occurrences и boundary cases.

### E3-D4-T07 — Подготовить reminder jobs и закрыть DoD программ
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §20, §43.22, §50.1, §55.3 · **depends_on:** E3-D4-T01–T06 · **decisions:** DEC-001, DEC-002, DEC-003, DEC-015, DEC-016, DEC-029
- **scope:** создать jobs без Telegram delivery; проверить одиночные программы, пропуски, отдых и прогресс.
- **acceptance:** [ ] jobs соответствуют planned occurrences; [ ] delivery явно отложена до этапа 5; [ ] все применимые пункты §55.3 имеют evidence; [ ] совместность помечена зависимостью этапа 7.
- **validation/evidence:** job records и итоговый checklist.

## Handoff этапа

**E3-D4-T02** `review` — user check Start → date → calendar days.
