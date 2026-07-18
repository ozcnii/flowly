# Этап 6 — Календарь и отчёты

> PRD: §28–31, §43.30, §44.9–44.10, §50.3, §54 этап 6, §55.6–55.7.

## Цель

Показать единый календарь тренировок и привычек, рассчитывать строгие серии и согласованные недельные/месячные отчёты в приложении и Telegram.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 9 | 0 | 0 | 0 | 0 |

## Зависимости и инварианты

- Зависит от фактических occurrences этапов 2–5.
- Формулы отчёта должны совпадать с данными календаря.
- Используется общий календарь с фильтрами и строгие серии.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-035` Konsta UI 5.2.0 (`konsta/react`, `ios` theme) обязательна для current/future production UI; direct imports — default, `packages/ui` допустим только для Flowly-specific contracts, отсутствующих в Konsta.
- Calendar correction предлагает только допустимые activity statuses, требует confirmation и сохраняет history (`DEC-015`, `DEC-017`). По `DEC-063` occurrence workout join возвращает `activitySource`; YouTube отображается явным text Badge, не только цветом, во всех calendar/report surfaces.
- Weekly report: Monday 09:00; monthly: first day 09:00; timezone пользователя; current period marked partial (`DEC-018`).
- Share-card retention — 30 дней (`DEC-018`, supersedes `DEC-009`); bot links открывают exact report target (`DEC-013`).
- UI/state/privacy contracts заданы F09, `DEC-022` и [`docs/design/flows/`](../../design/flows/).

## Deliverable E6-D7 — Календарь, серии и отчёты

### E6-D7-T01 — Реализовать calendar API и агрегацию
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-19
- **prd_refs:** §28, §43.21, §44.9 · **depends_on:** E2-D2-T08, E2-D3-T01, E3-D4-T06, E4-D5-T07 · **decisions:** DEC-015, DEC-017, DEC-029, DEC-063, DEC-065
- **scope:** month/week/day ranges, общий источник occurrences и timezone boundaries (session finishes + later manual logs).
- **acceptance:** [ ] диапазоны не теряют/дублируют события; [ ] yoga/habits различимы; [ ] Flowly/YouTube source mapping устойчив; [ ] ownership соблюдён.
- **validation/evidence:** API range matrix вокруг timezone boundaries.
- **journal:** 2026-07-19 — DEC-065: dropped hard depend on E2-D3-T04 (moved here as T09 after calendar UI).

### E6-D7-T02 — Реализовать month/week/day UI
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §28.1–28.2, §28.4, §40 · **depends_on:** E6-D7-T01 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025, DEC-029, DEC-063
- **ui_slices:** S-MA-070, S-MA-071, S-MA-072 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** три режима, навигация по датам, loading/empty/error states.
- **acceptance:** [ ] режимы согласованы; [ ] выбранный день доступен; [ ] responsive/keyboard states корректны.
- **validation/evidence:** screenshots desktop/mobile and keyboard walkthrough.

### E6-D7-T03 — Реализовать фильтры и детали дня
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-19
- **prd_refs:** §28.3, §28.5–28.6, §55.6 · **depends_on:** E6-D7-T02 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025, DEC-029, DEC-063, DEC-065
- **ui_slices:** S-MA-070, S-MA-071, S-MA-072, S-MA-073 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** yoga/habit filters, icons/colors/statuses, details и ручное изменение статуса. Entry «+ ручная запись» → E6-D7-T09 after day shell exists.
- **acceptance:** [ ] filters не меняют данные; [ ] statuses различимы; [ ] ручная запись видна (после T09); [ ] изменение журналируется.
- **validation/evidence:** UI/API scenario set.
- **journal:** 2026-07-19 — DEC-065: manual log is E6-D7-T09; day detail should expose create entry when T09 ships.

### E6-D7-T04 — Реализовать строгие серии
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §29, §56.8, §57 · **depends_on:** E6-D7-T01 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-064, S-MA-075 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** streak algorithms для ежедневных, weekday, weekly goal и yoga.
- **acceptance:** [ ] типы считаются по своим правилам; [ ] отдых/skip различаются; [ ] best result сохраняется; [ ] формулировки не негативны.
- **validation/evidence:** table of streak scenarios.

### E6-D7-T05 — Реализовать недельный отчёт
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.1–30.2, §30.4, §43.30, §44.10, §55.7 · **depends_on:** E6-D7-T01, E6-D7-T04 · **decisions:** DEC-018, DEC-022, DEC-024, DEC-025, DEC-029, DEC-063
- **ui_slices:** S-MA-074, S-MA-075 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** generation/storage/UI report из calendar source.
- **acceptance:** [ ] формулы §30.4 соблюдены; [ ] повторная генерация консистентна; [ ] данные приватны.
- **validation/evidence:** calendar-to-report reconciliation.

### E6-D7-T06 — Реализовать месячный отчёт
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.1, §30.3–30.4, §43.30, §44.10, §55.7 · **depends_on:** E6-D7-T05 · **decisions:** DEC-018, DEC-022, DEC-024, DEC-025, DEC-029, DEC-063
- **ui_slices:** S-MA-074, S-MA-075 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** monthly generation/storage/UI по тем же canonical formulas.
- **acceptance:** [ ] month boundaries/timezone корректны; [ ] значения сверяются с календарём; [ ] empty month обработан.
- **validation/evidence:** reconciliation examples.

### E6-D7-T07 — Доставлять отчёты и рекомендации
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.1, §31, §37.1, §55.7 · **depends_on:** E5-D6-T08, E6-D7-T05, E6-D7-T06 · **decisions:** DEC-013, DEC-018, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-010, S-BOT-006 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** Telegram delivery недельного/месячного отчёта и простые rule-based рекомендации.
- **acceptance:** [ ] app/Telegram values совпадают; [ ] рекомендации используют только правила §31; [ ] скрытых AI-решений нет.
- **validation/evidence:** paired app/message outputs.

### E6-D7-T08 — Реализовать share-card и закрыть DoD
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-19
- **prd_refs:** §30.5, §46, §47.2, §50.3, §55.6–55.7 · **depends_on:** E6-D7-T03–T07, E6-D7-T09 · **decisions:** DEC-018, DEC-022, DEC-024, DEC-025, DEC-029, DEC-065
- **ui_slices:** S-MA-076 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** безопасная карточка без private details, storage/access policy и полная проверка этапа (incl. manual-log visibility in calendar/reports).
- **acceptance:** [ ] share-card не раскрывает лишнее; [ ] доступ ограничен; [ ] все пункты §55.6–55.7 имеют evidence; [ ] retention явно решён либо остаётся blocked.
- **validation/evidence:** generated card samples, access checks, итоговый checklist.

### E6-D7-T09 — Реализовать ручную запись тренировки (ex-E2-D3-T04)
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-19
- **prd_refs:** §17, §28, §43.21, §43.23, §55.2, §55.6 · **depends_on:** E6-D7-T01, E6-D7-T02 · **decisions:** DEC-015, DEC-022, DEC-024, DEC-025, DEC-029, DEC-035, DEC-065
- **ui_slices:** S-MA-044 — выполнять после day shell; entry from S-MA-072 calendar day «+»; approval slice обязателен.
- **scope:** форма + API ручного occurrence (название, дата вкл. past, время, длительность, категория, комментарий, статус, источник); timezone-correct; owner-only; явные дубликаты; видно в calendar/day после save. **Не** own-workout constructor (E2-D3-T03).
- **acceptance:** [ ] дата/timezone корректны; [ ] past date ok; [ ] запись видна владельцу в дневнике; [ ] дубликаты обрабатываются явно.
- **validation/evidence:** current/past date HTTP + UI; calendar day shows manual row.
- **journal:** 2026-07-19 — moved from stage 2 **E2-D3-T04** per user («когда дневник готов»). DEC-065.

## Handoff этапа

Фиксировать date range/timezone, фильтры, исходные occurrence IDs, рассчитанные значения и расхождения calendar/report. **Manual log = E6-D7-T09** after calendar month/week/day UI (T02), not stage 2.
