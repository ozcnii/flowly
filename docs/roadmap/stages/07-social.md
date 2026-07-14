# Этап 7 — Социальные функции

> PRD: §7.2, §8.4, §20.6, §32–35, §43.4–43.5, §43.11, §43.18, §43.25–43.27, §44.11–44.12, §50, §54 этап 7, §55.8.

## Цель

Добавить друзей, явный sharing, совместные программы, челленджи, реакции и ограниченные партнёрские напоминания при приватности по умолчанию.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 7 | 0 | 0 | 0 | 0 |

## Зависимости и инварианты

- Зависит от auth/permissions и объектов этапов 2–4.
- Друг видит только явно расшаренные данные; доступ отзывается.
- Совместные программы закрываются здесь (`DEC-002`).

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-025` production UI-kit из `packages/ui` и его public API обязательны для всех screen slices; app-local дубли shared primitives запрещены.
- Friend invite одноразовый/7 дней; reciprocal invite uses one pending relation; reject ≠ block; block reversible (`DEC-019`).
- Shared object — read-only original; copy only explicit; progress/streak toggles; revoke immediate (`DEC-019`).
- Joint participation requires acceptance; owner controls visibility/removal and must transfer ownership or end object before leaving (`DEC-019`, `DEC-020`).
- Partner remind доступен только friend/accepted participant с shared current object, notifications enabled и 2h limit (`DEC-015`, `DEC-019`).
- UI/privacy paths follow F10, `DEC-021`, `DEC-022` и [`docs/design/flows/`](../../design/flows/).

## Deliverable E7-D8 — Социальный контур

### E7-D8-T01 — Реализовать приглашения и friendships
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §32.1–32.3, §43.4–43.5, §44.11, §55.8 · **depends_on:** E1-D1-T06 · **decisions:** DEC-013, DEC-019, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-081, S-MA-082, S-BOT-001, S-BOT-007 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** create/accept/reject invite, несколько друзей и состояния связи.
- **acceptance:** [ ] invite уникален/безопасен; [ ] состояния валидны; [ ] нельзя создать связь с нарушением правил; [ ] несколько друзей поддержаны.
- **validation/evidence:** invitation state matrix и permission failures.

### E7-D8-T02 — Реализовать удаление друга и отзыв доступа
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §32.4, §33.3, §55.8 · **depends_on:** E7-D8-T01 · **decisions:** DEC-019, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-081, S-MA-083, S-MA-084 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** disconnect/revoke semantics и немедленная проверка доступа.
- **acceptance:** [ ] удалённый друг теряет доступ; [ ] владелец сохраняет данные; [ ] stale links не обходят revoke.
- **validation/evidence:** before/after authorization requests.

### E7-D8-T03 — Реализовать sharing привычек и тренировок
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §8.4, §33.1–33.2, §43.11, §43.18, §47.2 · **depends_on:** E2-D3-T03, E4-D5-T02, E7-D8-T01 · **decisions:** DEC-019, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-043, S-MA-064, S-MA-083, S-MA-084 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** явный per-object sharing только после создания.
- **acceptance:** [ ] default private; [ ] видны только разрешённые данные; [ ] public link не раскрывает owner/private fields; [ ] revoke работает.
- **validation/evidence:** owner/friend/stranger access matrix.

### E7-D8-T04 — Реализовать совместные программы
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §20.6, §55.3, §55.8 · **depends_on:** E3-D4-T07, E7-D8-T01–T03 · **decisions:** DEC-002, DEC-019, DEC-020, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-052, S-MA-053, S-MA-054, S-MA-087 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** joint enrollment, участники и разрешённая видимость прогресса без сдвига программы.
- **acceptance:** [ ] участники явно согласны; [ ] индивидуальные статусы защищены; [ ] программа сохраняет инварианты этапа 3.
- **validation/evidence:** two-user lifecycle and revoke case.

### E7-D8-T05 — Реализовать челленджи
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §34, §43.25–43.26, §44.12, §55.8 · **depends_on:** E7-D8-T01, E4-D5-T05 · **decisions:** DEC-019, DEC-020, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-085, S-MA-086, S-MA-087 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** создание, типы, membership и результаты по PRD.
- **acceptance:** [ ] membership/ownership проверяются; [ ] результаты основаны на occurrences; [ ] unauthorized data скрыты.
- **validation/evidence:** challenge lifecycle and access matrix.

### E7-D8-T06 — Реализовать реакции
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §34.3, §43.27, §55.8 · **depends_on:** E7-D8-T05 · **decisions:** DEC-019, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-087 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** разрешённые реакции на доступные социальные результаты.
- **acceptance:** [ ] реакция требует доступа; [ ] повторное действие детерминировано; [ ] revoke исключает дальнейшее взаимодействие.
- **validation/evidence:** reaction add/change/remove cases.

### E7-D8-T07 — Реализовать партнёрские напоминания и закрыть DoD
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §35, §50.1–50.3, §55.8 · **depends_on:** E5-D6-T08, E7-D8-T01–T06 · **decisions:** DEC-007, DEC-015, DEC-019, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-083, S-MA-087, S-BOT-007 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** ограниченные reminders между друзьями и полная проверка social permissions.
- **acceptance:** [ ] отправитель/получатель связаны и имеют разрешение; [ ] лимиты применены; [ ] каждый пункт §55.8 имеет evidence; [ ] нерасшаренные данные недоступны.
- **validation/evidence:** permission/E2E matrix и итоговый checklist.

## Handoff этапа

Фиксировать IDs двух тестовых пользователей, friendship/share state, конкретный permission matrix case и следующий запрос.
