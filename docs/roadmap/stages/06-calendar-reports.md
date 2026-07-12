# Этап 6 — Календарь и отчёты

> PRD: §28–31, §43.30, §44.9–44.10, §50.3, §54 этап 6, §55.6–55.7.

## Цель

Показать единый календарь тренировок и привычек, рассчитывать строгие серии и согласованные недельные/месячные отчёты в приложении и Telegram.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 8 | 0 | 0 | 0 | 0 |

## Зависимости и инварианты

- Зависит от фактических occurrences этапов 2–5.
- Формулы отчёта должны совпадать с данными календаря.
- Используется общий календарь с фильтрами и строгие серии.

## Deliverable E6-D7 — Календарь, серии и отчёты

### E6-D7-T01 — Реализовать calendar API и агрегацию
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §28, §43.21, §44.9 · **depends_on:** E2-D3-T04, E3-D4-T06, E4-D5-T07
- **scope:** month/week/day ranges, общий источник occurrences и timezone boundaries.
- **acceptance:** [ ] диапазоны не теряют/дублируют события; [ ] yoga/habits различимы; [ ] ownership соблюдён.
- **validation/evidence:** API range matrix вокруг timezone boundaries.

### E6-D7-T02 — Реализовать month/week/day UI
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §28.1–28.2, §28.4, §40 · **depends_on:** E6-D7-T01
- **scope:** три режима, навигация по датам, loading/empty/error states.
- **acceptance:** [ ] режимы согласованы; [ ] выбранный день доступен; [ ] responsive/keyboard states корректны.
- **validation/evidence:** screenshots desktop/mobile and keyboard walkthrough.

### E6-D7-T03 — Реализовать фильтры и детали дня
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §28.3, §28.5–28.6, §55.6 · **depends_on:** E6-D7-T02
- **scope:** yoga/habit filters, icons/colors/statuses, details и ручное изменение статуса.
- **acceptance:** [ ] filters не меняют данные; [ ] statuses различимы; [ ] ручная запись видна; [ ] изменение журналируется.
- **validation/evidence:** UI/API scenario set.

### E6-D7-T04 — Реализовать строгие серии
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §29, §56.8, §57 · **depends_on:** E6-D7-T01
- **scope:** streak algorithms для ежедневных, weekday, weekly goal и yoga.
- **acceptance:** [ ] типы считаются по своим правилам; [ ] отдых/skip различаются; [ ] best result сохраняется; [ ] формулировки не негативны.
- **validation/evidence:** table of streak scenarios.

### E6-D7-T05 — Реализовать недельный отчёт
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.1–30.2, §30.4, §43.30, §44.10, §55.7 · **depends_on:** E6-D7-T01, E6-D7-T04
- **scope:** generation/storage/UI report из calendar source.
- **acceptance:** [ ] формулы §30.4 соблюдены; [ ] повторная генерация консистентна; [ ] данные приватны.
- **validation/evidence:** calendar-to-report reconciliation.

### E6-D7-T06 — Реализовать месячный отчёт
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.1, §30.3–30.4, §43.30, §44.10, §55.7 · **depends_on:** E6-D7-T05
- **scope:** monthly generation/storage/UI по тем же canonical formulas.
- **acceptance:** [ ] month boundaries/timezone корректны; [ ] значения сверяются с календарём; [ ] empty month обработан.
- **validation/evidence:** reconciliation examples.

### E6-D7-T07 — Доставлять отчёты и рекомендации
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.1, §31, §37.1, §55.7 · **depends_on:** E5-D6-T08, E6-D7-T05, E6-D7-T06
- **scope:** Telegram delivery недельного/месячного отчёта и простые rule-based рекомендации.
- **acceptance:** [ ] app/Telegram values совпадают; [ ] рекомендации используют только правила §31; [ ] скрытых AI-решений нет.
- **validation/evidence:** paired app/message outputs.

### E6-D7-T08 — Реализовать share-card и закрыть DoD
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §30.5, §46, §47.2, §50.3, §55.6–55.7 · **depends_on:** E6-D7-T03–T07 · **decisions:** DEC-009
- **scope:** безопасная карточка без private details, storage/access policy и полная проверка этапа.
- **acceptance:** [ ] share-card не раскрывает лишнее; [ ] доступ ограничен; [ ] все пункты §55.6–55.7 имеют evidence; [ ] retention явно решён либо остаётся blocked.
- **validation/evidence:** generated card samples, access checks, итоговый checklist.

## Handoff этапа

Фиксировать date range/timezone, фильтры, исходные occurrence IDs, рассчитанные значения и расхождения calendar/report.
