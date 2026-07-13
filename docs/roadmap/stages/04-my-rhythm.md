# Этап 4 — Мой ритм

> PRD: §21–24, §26–27, §43.16–43.21, §44.7–44.8, §50.1, §54 этап 4, §55.4.

## Цель

Создать приватные привычки с четырьмя типами расписания, несколькими выполнениями, визуальной настройкой и политиками напоминаний.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 8 | 0 | 0 | 0 | 0 |

## Зависимости и инварианты

- Зависит от foundation auth/DB/UI.
- Schedule engine и occurrences нужны этапу 5 и создаются здесь.
- Привычка приватна до явного sharing на этапе 7.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-025` production UI-kit из `packages/ui` и его public API обязательны для всех screen slices; app-local дубли shared primitives запрещены.
- Weekly target явно показывает «обязательный сегодня»; multiple completions считаются отдельными настроенными slots (`DEC-017`).
- Pause/schedule/timezone changes действуют только на future occurrences; history immutable; delete архивирует (`DEC-017`).
- No response остаётся `no_response`; correction ограничена activity context и audit history (`DEC-015`).
- Habit private by default, sharing/revoke follows `DEC-019`; UI states follows `DEC-022` и [`docs/design/flows/`](../../design/flows/).

## Deliverable E4-D5 — Привычки и расписания

### E4-D5-T01 — Реализовать экран «Мой ритм»
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §21, §44.7 · **depends_on:** E1-D1-T02, E1-D1-T06 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-060 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** empty state, список и карточка привычки с состояниями PRD.
- **acceptance:** [ ] empty/list states есть; [ ] карточка показывает актуальное расписание/прогресс; [ ] чужие привычки недоступны.
- **validation/evidence:** screenshots и ownership responses.

### E4-D5-T02 — Реализовать CRUD привычки, иконки и цвета
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §22, §43.16, §44.7, §55.4 · **depends_on:** E4-D5-T01, E1-D1-T04 · **decisions:** DEC-017, DEC-019, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-061, S-MA-064 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** поля создания/редактирования, разрешение пропуска, icon/color choices.
- **acceptance:** [ ] обязательные поля валидируются; [ ] icon/color сохраняются; [ ] default privacy соблюдена; [ ] sharing до создания отсутствует.
- **validation/evidence:** CRUD matrix и UI states.

### E4-D5-T03 — Реализовать расписание «конкретное время» и дни недели
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.1–23.2, §27, §43.17 · **depends_on:** E4-D5-T02 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-062 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** два schedule rule типа с пользовательским timezone.
- **acceptance:** [ ] нужные локальные даты/время генерируются; [ ] DST/timezone учитываются; [ ] редактирование не создаёт скрытых дублей.
- **validation/evidence:** schedule examples вокруг границ дня/DST.

### E4-D5-T04 — Реализовать недельную цель и интервальное расписание
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.3–23.4, §27, §43.17 · **depends_on:** E4-D5-T02 · **decisions:** DEC-017, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-062 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** count-per-week и interval schedule согласно PRD.
- **acceptance:** [ ] недельные границы корректны; [ ] interval anchor сохраняется; [ ] timezone не меняет уже подтверждённые выполнения.
- **validation/evidence:** table-driven date examples.

### E4-D5-T05 — Реализовать несколько выполнений и lifecycle привычки
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §23.5, §26, §43.21, §44.8 · **depends_on:** E4-D5-T03, E4-D5-T04 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-011, S-MA-064, S-MA-065 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** несколько occurrences в день, completion/skip/rest/no_response, pause/resume.
- **acceptance:** [ ] каждое выполнение независимо; [ ] 0/partial/full progress различим; [ ] ручное изменение журналируется.
- **validation/evidence:** occurrence state matrix.

### E4-D5-T06 — Реализовать политики напоминаний
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §24, §43.19–43.20 · **depends_on:** E4-D5-T02 · **decisions:** DEC-015, DEC-017, DEC-022, DEC-024, DEC-025
- **ui_slices:** S-MA-063 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** бережная, обычная, настойчивая и пользовательская policies с глобальными ограничениями.
- **acceptance:** [ ] шаги policy сохраняются; [ ] ограничения §24.5 применены; [ ] неизвестные числовые параметры не изобретены.
- **validation/evidence:** policy records и validation cases.

### E4-D5-T07 — Генерировать occurrences и reminder jobs
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §26–27, §43.21–43.22, §45 · **depends_on:** E4-D5-T03–T06 · **decisions:** DEC-015, DEC-017
- **scope:** идемпотентная генерация UTC occurrences/jobs без фактической Telegram delivery.
- **acceptance:** [ ] повторный запуск не создаёт дублей; [ ] timezone changes обработаны явно; [ ] jobs связаны с policy steps.
- **validation/evidence:** generation rerun и uniqueness evidence.

### E4-D5-T08 — Закрыть DoD привычек
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50.1, §55.4, §57 · **depends_on:** E4-D5-T01–T07 · **decisions:** DEC-003, DEC-015, DEC-017, DEC-019, DEC-022
- **scope:** проверить четыре schedule типа, multiple completions, privacy, skip policy, icons/colors.
- **acceptance:** [ ] каждый пункт §55.4 имеет evidence; [ ] применимые проверки расписаний выполнены по явному запросу; [ ] остаточные timezone/DST риски записаны.
- **validation/evidence:** итоговый checklist и scenario matrix.

## Handoff этапа

Фиксировать schedule type, timezone, generation window, последние созданные occurrence/job IDs и следующий проверяемый сценарий.
