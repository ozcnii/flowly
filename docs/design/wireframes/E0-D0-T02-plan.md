# E0-D0-T02 — план создания wireframes Flowly v1.0

> Статус: утверждён пользователем; реализация разрешена строго в описанном scope.
> Дата плана и approval: 2026-07-13.

## 1. Проблема

E0-D0-T01 зафиксировала нормативную IA: 69 уникальных surfaces (`59 Mini App + 8 Telegram bot + 2 browser fallback`), 11 flow families (`F01–F11`), 98 канонических screen↔flow membership-пар, 15 state profiles и атомарную PRD traceability. Сейчас эти contracts существуют как Markdown/Mermaid, но ещё не преобразованы в проверяемые wireframes.

Нужно создать переносимый low-fidelity пакет, который показывает структуру каждого surface, переходы, responsive-поведение и применимые состояния без преждевременного утверждения UI-kit или визуального направления Concept A.

## 2. Текущее поведение

- `docs/design/wireframes/` до старта задачи не содержал wireframes.
- Пользовательские сценарии описаны в `docs/design/flows/**`, но не представлены как визуальные screen frames.
- Concept A частично покрывает только `S-MA-010`, `S-MA-020`, `S-MA-060`, `S-MA-070` и selected-day summary `S-MA-072`; он не утверждён, не содержит пятую вкладку, полные flows, обязательные состояния, responsive/dark/accessibility evidence.
- Mermaid source статически проверен, но не рендерился реальным renderer; wireframes не должны считать его визуальную раскладку утверждённой.
- Этапы 1–8 заблокированы до полного design approval в E0-D0-T06.

## 3. Целевое поведение

В репозитории существует автономный HTML+CSS wireframe-каталог на русском языке:

- все 69 surface IDs имеют ровно один canonical base frame;
- F01–F11 имеют отдельные страницы с каноническим membership и последовательностью переходов;
- общие состояния представлены через 15 reusable profile boards;
- surface-specific critical, terminal, permission, destructive, offline и recovery states показаны отдельно там, где generic profile недостаточен;
- Mini App проверен на ширинах 360 px, 430 px и wide 1280 px без horizontal scroll;
- bot/browser surfaces визуально отличаются от Mini App и не раскрывают запрещённые данные;
- versioned PNG snapshots и coverage matrix позволяют механически проверить полноту.

## 4. Подтверждённые решения пользователя

- Формат: **HTML + PNG**.
- Организация: **по F01–F11**.
- Детализация: **серый low-fi**, без утверждения UI-kit.
- Состояния: **15 reusable profiles + отдельные critical states**, а не полное декартово размножение каждого состояния для каждого surface.
- План хранится отдельно: `docs/design/wireframes/E0-D0-T02-plan.md`.

## 5. Обязательные contracts

### 5.1 Решения

- `DEC-012`: дизайн-пакет обязателен до разработки; все evidence в `docs/design/`.
- `DEC-013`: ровно пять вкладок; профиль через avatar Главной; точные и безопасные deep links.
- `DEC-014`: bot connection — обязательный onboarding gate; прочие шаги можно пропустить.
- `DEC-015`: контекстные статусы, подтверждаемая manual correction, `no_response`, reminder bounds, stale callbacks.
- `DEC-016`: module-level Home failures, empty-day CTA, offline checkpoint/conflict, YouTube fallback, minimum own-workout data, fixed program lifecycle.
- `DEC-017`: weekly-target obligation, future-only schedule/timezone changes, archive instead of destructive habit deletion, status history.
- `DEC-018`: completed-period reports, `partial`, explained empty report, 30-day share-card retention.
- `DEC-019`: invite/sharing/participation permissions, read-only originals, explicit copy, revoke, owner controls.
- `DEC-020`: ownership transfer/end, separate Flowly profile, account grace period, clear-history boundary, protected export.
- `DEC-021`: separate report/hide/block actions.
- `DEC-022`: full-screen shell/auth errors, inline module errors, retained mutation input, offline drafts, skeleton loading, explained N/A.

### 5.2 Flow/state invariants

- Нормативный источник IDs, membership, observable content и state applicability — только `docs/design/flows/**`.
- Все 69 IDs сохраняются без переименования и расширения по предположению.
- 98 membership-пар должны остаться симметричными.
- Privacy by default; restricted/revoked/deleted target не показывает private data.
- Back/cancel не мутирует committed data; destructive action имеет explicit confirmation.
- UI не заявляет server success до фактической синхронизации.
- Неизвестные operational числа из `DEC-007`, `DEC-010`, `DEC-011` не выдумываются: показываются только availability/retry states.

## 6. Scope

### Входит

1. Canonical registry 69 surfaces с base-frame, profile, flows, PRD refs и critical-state refs.
2. HTML index и 11 flow pages F01–F11.
3. 15 reusable state-profile boards (`P-SHELL` … `P-WEB`).
4. Уникальные critical branches из inventory/diagrams: auth/browser recovery, bot gate, active-session conflict, offline checkpoint/sync conflict, stale callback, manual status correction, permissions/revoke, ownership transfer/end, archive, clear history, account grace/cancel deletion, export lifecycle, report partial/empty, YouTube fallback.
5. Mobile-first layout 360–430 px, wide adaptation, safe-area representation, keyboard/focus order annotations, text scaling and non-color state cues.
6. Нейтральный grayscale light/dark wireframe mode без финальных tokens.
7. Versioned PNG evidence на 360, 430 и 1280 px.
8. Coverage matrix, snapshot manifest, validation report и локальная инструкция просмотра.

### Не входит

- UI-kit, финальные цвета, типографика, иконки и brand polish — E0-D0-T03/T04.
- Production frontend/backend, API, persistence и runtime integration.
- Кликабельный end-to-end prototype уровня E0-D0-T05.
- Новые продуктовые функции, surface IDs, статусы, permissions или operational thresholds.
- Автоматические тесты: пользователь их отдельно не запрашивал; выполняются только документированные validation-команды и browser inspection.

## 7. Предлагаемая структура артефактов

```text
docs/design/wireframes/
├── E0-D0-T02-plan.md
├── README.md
├── index.html
├── assets/
│   ├── wireframes.css
│   ├── wireframes.js
│   └── surface-registry.js
├── flows/
│   ├── F01.html
│   ├── ...
│   └── F11.html
├── states/
│   └── profiles.html
├── coverage-matrix.md
├── snapshot-manifest.md
├── validation-report.md
└── snapshots/
    └── v1/
        ├── index-{360,430,1280}.png
        ├── states-{360,430,1280}.png
        └── F01–F11-{360,430,1280}.png
```

Ожидаемый минимальный snapshot set: `3 index + 3 states + 33 flow = 39 PNG`. Critical frames находятся внутри соответствующей flow page и поэтому попадают в её versioned full-page snapshots.

`surface-registry.js` является единственным HTML-каталогом canonical surface definitions; повторное участие surface в нескольких flows рендерится ссылкой на один definition, чтобы не создать расхождения между 69 unique IDs и 98 memberships.

## 8. UX states

Для каждого surface показываются:

- canonical base frame;
- назначенный profile и применимость `L/E/ER/R/O/S/D`;
- surface-specific observable outcome из state matrix;
- ссылки на flows и PRD obligations.

Отдельные profile boards показывают визуальную грамматику:

- skeleton loading;
- explained empty + CTA;
- full-screen или inline error по контексту;
- retry;
- offline/cached/draft/checkpoint;
- explicit success без ложного server confirmation;
- disabled с причиной;
- обоснованный `N/A`.

Critical state получает отдельный frame, если меняет безопасность, terminal outcome, permission, сохранность данных или recovery path. Обычные одинаковые состояния повторно для каждого surface не размножаются.

## 9. Data flow / state mapping

```text
screen-inventory.md ─┬─> canonical surface registry ─> base frames
flow-inventory.md ───┼─> F01–F11 membership/pages ──> transition annotations
diagrams/*.md ───────┼─> branch/terminal/recovery frames
state matrix ────────┼─> 15 profile boards + critical overrides
traceability ────────┴─> coverage-matrix.md

HTML pages + viewport matrix ─> Playwright/browser render ─> PNG snapshots
registry + DOM + files ────────> validation report
```

Wireframes не моделируют backend state machine самостоятельно: они отображают только observable состояния и разрешённые действия из утверждённых contracts.

## 10. Шаги реализации

1. Создать `README.md` с правилами просмотра, статусом low-fi и ссылками на F01–F11.
2. Перенести 69 surface records в canonical data registry без изменения IDs, profile, flow membership и observable contracts.
3. Создать общий grayscale shell: Mini App frame, Telegram message frame, browser fallback frame, safe areas, bottom nav из пяти вкладок, avatar entry.
4. Создать `index.html`: inventory summary, flow navigation, coverage/status legend, фильтр по ID/profile/flow.
5. Создать `states/profiles.html` для всех 15 profiles и применимых состояний.
6. Последовательно создать F01–F11 pages; на каждой показать preconditions, base frames, transitions, alternate/error/cancel/terminal branches и canonical membership.
7. Добавить critical frames и проверить их против решений DEC-013–DEC-022.
8. Добавить neutral light/dark wireframe mode и responsive rules; структура/иерархия не должна зависеть от темы.
9. Создать `coverage-matrix.md`: 69 IDs → canonical anchor → profile → flows → base/critical state → snapshots → PRD refs.
10. Запустить локальный static server и browser inspection на 360/430/1280 px.
11. Сохранить 39 versioned PNG snapshots в `snapshots/v1/`; записать размеры и SHA-256 в manifest.
12. Сформировать `validation-report.md`, обновить `docs/design/README.md`, task evidence, roadmap index и HANDOFF.
13. Перевести E0-D0-T02 в `review`, но не в `done`, пока acceptance/evidence не подтверждены review.

## 11. Проверка

### Механическая

- ровно 69 unique surface definitions: 59 MA, 8 BOT, 2 WEB;
- ровно F01–F11 и 98 canonical membership pairs;
- каждый ID имеет base frame, один из 15 profiles, canonical anchor и coverage row;
- каждый flow page содержит exact canonical membership;
- нет неизвестных/пропущенных IDs, profiles, DEC refs и repository-relative links;
- существует полный manifest ожидаемых 39 PNG; hashes совпадают;
- `git diff --check` и отсутствие случайных generated/runtime files вне `docs/design/wireframes/`.

### Визуальная/browser

- успешный render index, profiles и F01–F11;
- viewport widths: 360, 430, 1280 px;
- horizontal overflow отсутствует;
- fixed navigation не перекрывает контент и учитывает safe area;
- focus order соответствует reading/action order;
- текст масштабируется без потери primary action;
- состояние различимо не только цветом;
- light/dark grayscale modes сохраняют иерархию;
- screenshots соответствуют manifest.

### Семантическая

- выборочная двунаправленная сверка с 250 traceability rows;
- полная сверка critical branches F01, F04, F08, F10, F11;
- separate review F02/F03/F05/F06/F07/F09 на empty/offline/retry/permissions;
- Concept A не используется как источник новых требований;
- operational placeholders не содержат придуманных лимитов.

## 12. Риски и edge cases

1. **Объём:** 69 unique surfaces участвуют в 98 flow memberships. Mitigation: canonical registry и повторное flow-представление через ссылки.
2. **State explosion:** полное произведение surfaces × states создало бы сотни дублирующихся frames. Mitigation: выбранные 15 profile boards + отдельные critical overrides.
3. **Скрытое проектирование UI-kit:** даже wireframe CSS может начать закреплять дизайн. Mitigation: только grayscale structural tokens, без brand/color/type decisions.
4. **Дублирование surface в flows:** один ID может участвовать в нескольких families. Mitigation: definition существует один раз, membership валидируется механически.
5. **Long-page snapshots:** full-page PNG могут быть высокими. Mitigation: flow-level страницы и manifest; при browser limit snapshot делится на именованные segments без изменения coverage.
6. **Dark mode до UI-kit:** на T02 проверяется только структурная переносимость grayscale, не финальная тема.
7. **Открытые DEC-007/010/011:** численные quota/catalog/retry параметры не блокируют wireframe structure, но запрещают конкретные значения.
8. **Mermaid visual risk:** wireframes сверяются с canonical text membership/branches, а не с потенциально неотрендеренной геометрией Mermaid.
9. **PNG reproducibility:** browser/font differences могут менять pixels. Manifest фиксирует текущие hashes и среду; approval snapshots далее фиксируются в E0-D0-T06.

## 13. Открытые вопросы

Блокирующие вопросы на текущем анализе отсутствуют: формат, структура, fidelity, state strategy и место плана подтверждены пользователем. Если при переносе обнаружится новая продуктовая неоднозначность, работа останавливается, создаётся/связывается `DEC-*`, карточка переводится в `blocked`.

## 14. Confidence assessment

- **Plan confidence: 94%.** Основание: полностью изучены карточка, PRD scope §9–39/§40.2, DEC-012–DEC-022, 69-ID inventory, 15 state profiles, F01–F11, 98 memberships, diagrams, traceability, validation report и ограничения Concept A; пользователь подтвердил четыре основных решения по формату и объёму.
- **Implementation confidence: 91%.** Основание: пакет статический и ограничен `docs/design/wireframes/`, данные уже нормализованы, browser tooling доступен, проверка имеет точные count/viewport criteria.
- Неопределённость снижают объём 69 surfaces, возможные browser limits для full-page PNG и отсутствие существующего project rendering toolchain. Уверенность повысится после proof render F01 + profiles на трёх viewport и проверки screenshot limits; это первый технический checkpoint реализации и не меняет утверждённый scope.

## 15. Approval gate

Пользователь явно ответил «Утверждаю» на запрос разрешить реализацию строго в описанном scope. Формат, структура, coverage strategy, число canonical surfaces и обязательные contracts остаются неизменными; их изменение требует остановки и повторного согласования.
