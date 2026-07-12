# Этап 2 — Йога

> PRD: §11–19, §43.6–43.12, §43.23, §43.28, §44.2–44.5, §46, §53, §54 этап 2, §55.2.

## Цель

Дать пользователю каталог йоги, поиск и выполнение тренировок, собственный контент, избранное и ручные записи без автоматического подтверждения результата.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 10 | 0 | 0 | 0 | 0 |

## Зависимости и инварианты

- Зависит от этапа 1: auth, D1, R2 и UI shell.
- Сессия не завершается автоматически; итоговый статус выбирает пользователь.
- Пошаговый таймер поддерживает `+30 секунд`; ручная запись допускает прошлую дату; избранное без папок.

## Deliverable E2-D2 — Каталог и просмотр

### E2-D2-T01 — Подготовить стартовый каталог
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §12.1, §43.6–43.10, §53, §55.2 · **depends_on:** E1-D1-T04, E1-D1-T08 · **decisions:** DEC-010
- **scope:** seed/import категорий, тренировок, упражнений и связей.
- **acceptance:** [ ] структура соответствует моделям; [ ] импорт повторяем; [ ] источники и редакционная проверка фиксируются.
- **validation/evidence:** import output, counts и sample records.

### E2-D2-T02 — Реализовать категории, поиск и фильтры
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §11.3, §12.2–12.3, §44.2–44.3 · **depends_on:** E2-D2-T01
- **scope:** API и UI каталога с определёнными PRD фильтрами.
- **acceptance:** [ ] комбинации фильтров работают; [ ] empty/loading/error states есть; [ ] результаты не выходят за критерии.
- **validation/evidence:** canonical query set и screenshots.

### E2-D2-T03 — Реализовать карточку и страницу тренировки
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §12.4, §13, §44.3–44.4 · **depends_on:** E2-D2-T02
- **scope:** обязательные элементы, упражнения, источник, действия старта/сохранения.
- **acceptance:** [ ] все обязательные поля отображены; [ ] отсутствующие optional данные безопасны; [ ] ownership пользовательского контента соблюдён.
- **validation/evidence:** screenshots catalog/detail states и API responses.

### E2-D2-T04 — Реализовать YouTube search, cache и save
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §19, §43.28, §44.5, §56.2–56.3 · **depends_on:** E2-D2-T02
- **scope:** запрос из фильтров, русскоязычные результаты, кэширование и сохранение видео.
- **acceptance:** [ ] query формируется по PRD; [ ] cache используется; [ ] неподходящий результат можно отметить; [ ] quota errors обработаны.
- **validation/evidence:** сохранённые HTTP-примеры cache hit/miss/error.

### E2-D2-T05 — Реализовать избранное
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §18, §43.12, §55.2 · **depends_on:** E2-D2-T03
- **scope:** добавить, удалить и показать единый список без папок.
- **acceptance:** [ ] операции идемпотентны; [ ] список приватен владельцу; [ ] folders отсутствуют.
- **validation/evidence:** API/UI сценарий add/remove/reload.

## Deliverable E2-D3 — Выполнение и создание тренировок

### E2-D3-T01 — Реализовать видеосессию
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §14.1, §14.4, §15, §43.23 · **depends_on:** E2-D2-T03
- **scope:** start/resume/finish lifecycle и явный итоговый статус.
- **acceptance:** [ ] открытая сессия сохраняется; [ ] автозавершения нет; [ ] итог подтверждает пользователь.
- **validation/evidence:** lifecycle sequence и persisted records.

### E2-D3-T02 — Реализовать пошаговую и смешанную сессию
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §14.2–14.4, §15 · **depends_on:** E2-D2-T03
- **scope:** шаги, таймер, pause/resume, `+30 секунд`, mixed media и незавершённость.
- **acceptance:** [ ] переходы шагов корректны; [ ] +30 не ломает состояние; [ ] mixed flow поддержан; [ ] статус не автоматический.
- **validation/evidence:** UI walkthrough и session state trace.

### E2-D3-T03 — Реализовать собственные тренировки и media uploads
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §13.2, §16, §43.7–43.11, §44.3–44.4, §44.13, §46 · **depends_on:** E1-D1-T05, E2-D2-T03
- **scope:** private CRUD, упражнения, изображения/GIF через безопасный R2 flow.
- **acceptance:** [ ] ownership обязателен; [ ] ограничения загрузки соблюдены; [ ] удаление/доступ корректны; [ ] публичность не включается скрыто.
- **validation/evidence:** CRUD/upload cases и permission failures.

### E2-D3-T04 — Реализовать ручную запись тренировки
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §17, §43.21, §43.23, §55.2 · **depends_on:** E2-D3-T01
- **scope:** ручное добавление выполнения, включая прошлую дату.
- **acceptance:** [ ] дата и timezone корректны; [ ] запись видна владельцу; [ ] дубликаты обрабатываются явно.
- **validation/evidence:** текущая/прошлая дата и timezone examples.

### E2-D3-T05 — Закрыть DoD этапа «Йога»
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50, §55.2, §57 · **depends_on:** E2-D2-T01–T05, E2-D3-T01–T04
- **scope:** проверить все критерии §55.2 и инварианты §57.
- **acceptance:** [ ] каждый критерий имеет evidence; [ ] privacy/security проверены; [ ] риски YouTube и user content записаны.
- **validation/evidence:** итоговый checklist и ссылки на сценарии.

## Handoff этапа

При остановке указать активную карточку, состояние данных/миграций, проверенные пользовательские flows и следующий точный сценарий.
