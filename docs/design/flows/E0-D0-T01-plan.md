# План E0-D0-T01 — информационная архитектура и user flows

> Статус: утверждён пользователем и реализован 2026-07-13. Evidence: [`validation-report.md`](validation-report.md).

## 1. Проблема

PRD определяет пять основных вкладок, дополнительные профильные разделы, Telegram-поверхности и функции §§8–40, но в репозитории пока нет полной карты экранов, ролей, entry points, переходов и обязательных UI-состояний. Concept A показывает только четыре экрана и не образует end-to-end flows. Без IA и traceability wireframes могут пропустить требования либо молча зафиксировать неутверждённые UX-решения.

## 2. Текущее поведение и состояние

- Этап 0 активен; E0-D0-T00 завершена, E0-D0-T01 находится `in_progress`.
- Concept A хранится в `docs/design/screens/concept-a/` и используется только как неутверждённый визуальный референс.
- В Concept A есть Главная, Тренировки, Мой ритм и Календарь; отсутствуют Программы, профильные разделы, onboarding, Telegram flows и большинство обязательных состояний.
- PRD §9 фиксирует пять вкладок: Главная, Тренировки, Программы, Мой ритм, Календарь.
- PRD §40.2 требует loading, empty, error, retry, offline и successful-save для каждого применимого экрана; acceptance E0-D0-T01 дополнительно требует disabled paths.
- Утверждённых screen IDs, flow IDs, двунаправленной PRD traceability и state matrix пока нет.

## 3. Целевой результат

Создать в `docs/design/flows/` repository-native пакет Markdown + Mermaid, который:

1. перечисляет все пользовательские surfaces Mini App, Telegram-бота и browser fallback;
2. фиксирует роли, entry points, пять вкладок и вложенные профильные разделы;
3. описывает обзорную карту и 11 end-to-end flow families;
4. для каждого экрана отмечает обязательные состояния, privacy/ownership и Concept A coverage/gap;
5. двунаправленно связывает атомарные требования PRD с screen/flow IDs;
6. связывает каждую оставшуюся неоднозначность с `DEC-*`;
7. не переходит в wireframes, UI-kit, финальные макеты или реализацию приложения.

## 4. Подтверждённые решения пользователя

### Формат и границы

- Источник истины: Markdown-таблицы и Mermaid-диаграммы в репозитории.
- Структура: одна обзорная карта + 11 доменных flows.
- Concept A остаётся референсом до design review, а не утверждённым стилем.
- UX-неясности решаются до фиксации соответствующих веток и записываются в `DECISIONS.md`.

### Навигация и entry points

- Нижняя навигация остаётся строго из пяти вкладок PRD.
- Вход в профиль — avatar на Главной; профиль содержит дополнительные разделы PRD.
- Bot links ведут в конкретный целевой экран; `/app` — на Главную, `/help` — в справку.
- Недоступный deep link показывает безопасную причину, recovery/вход при необходимости и релевантный выход.

### Onboarding, статусы и reminders

- Проверка связи с Telegram-ботом — обязательный onboarding gate с диагностикой и retry.
- При отсутствии ответа итоговый статус всегда `no_response`.
- Итоговые статусы и календарные исправления ограничиваются матрицей по типу активности и контексту; ручная правка подтверждается и журналируется, комментарий опционален.
- Пользовательская reminder policy соблюдает пределы PRD: интервал не менее 10 минут, максимум 10 сообщений на слот/день, последнее сообщение в тот же локальный день и вне quiet hours.
- Quiet-hours reminder доставляется после периода тишины только пока актуален; иначе доставка отменяется без автоматической смены результата действия.
- Stale Telegram callback не меняет данные повторно и возвращает актуальный статус/deep link.

### Контент, тренировки и программы

- Частичный сбой Главной локализуется в модуле; полностью пустой день показывает CTA к тренировке, программе или привычке.
- Активная тренировка сохраняет локальный checkpoint; после восстановления сети синхронизируется, реальный конфликт показывается пользователю.
- YouTube использует валидный cache fallback; иначе показывает явную недоступность, retry/альтернативу и не ломает активную сессию.
- Собственная тренировка валидируется уже при первом сохранении: нужны название, длительность, сложность и исполняемое содержимое.
- Для программ используется минимальный lifecycle: запуск с даты, прохождение без сдвигов, явное прекращение участия; повторный запуск создаёт новое прохождение.

### Habits и calendar

- Для цели `N раз в неделю` интерфейс явно показывает «обязательный сегодня», когда это следует из оставшихся допустимых дней; несколько выполнений учитываются только отдельными настроенными слотами.
- Pause/изменение расписания/timezone влияют только на будущие occurrences; история не переписывается; удаление привычки архивирует её.
- Календарь предлагает только допустимые для типа активности статусы и сохраняет status history.

### Reports, social и данные

- Недельный отчёт отправляется в понедельник 09:00 за завершённую неделю; месячный — первого числа 09:00 за завершённый месяц, по timezone пользователя.
- Текущий период помечается `partial`; пустой отчёт объясняет отсутствие данных; share-card хранится 30 дней.
- Friend invite одноразовый и действует 7 дней; встречные invites используют одну pending-связь; reject не блокирует, block — отдельное обратимое действие.
- Shared object открывает read-only оригинал; копия создаётся только явным «Сохранить себе».
- Для привычки название/расписание/current status доступны в shared view; агрегированный прогресс и серия управляются отдельными toggles; revoke немедленно закрывает доступ.
- Совместное участие требует явного принятия; owner задаёт visibility и может удалить участника; реакции доступны участникам из фиксированного набора.
- Выход owner требует явной передачи ownership либо завершения совместного объекта.
- Имя и фотография внутри Flowly редактируемы независимо от Telegram вместе с остальными профильными настройками.
- Удаление аккаунта имеет 7-дневный grace period; совместные результаты других участников сохраняются без приватных данных удалённого пользователя.
- «Очистить историю» удаляет occurrences, статусы и отчётные результаты, сохраняя аккаунт, настройки и созданные объекты; экспорт — скачиваемый архив с bot-уведомлением.
- UGC report требует причину; hide действует только для текущего пользователя; block автора — отдельное обратимое действие.
- Общие UI states контекстные: shell/auth — full-screen, модульные ошибки — inline, mutation сохраняет ввод и retry, offline поддерживает draft, loading использует skeleton.

## 5. Открытые вопросы

Блокирующих UX-вопросов из проведённого workshop не осталось. Во время атомарной трассировки могут обнаружиться новые неоднозначности; в таком случае работа останавливается только для затронутой ветки, создаётся open `DEC-*` и запрашивается решение пользователя.

Остаются существующие operational decisions `DEC-006`–`DEC-011`. Для E0-D0-T01 значимы прежде всего:

- `DEC-007` — точные retry/rate limits за пределами уже утверждённых пользовательских границ;
- `DEC-010` — объём стартового каталога;
- `DEC-011` — внешние quota.

Они не блокируют IA целиком и отмечаются как constraints/blocked details там, где применимы.

## 6. Ограничения и non-goals

- Не менять scope и продуктовые принципы PRD.
- Не добавлять шестую вкладку и не заменять вкладку «Мой ритм» профилем.
- Не утверждать визуальный стиль Concept A.
- Не создавать wireframes, UI-kit, final screens или clickable prototype — это E0-D0-T02–T05.
- Не проектировать backend/API сверх observable flow constraints PRD.
- Не начинать этапы разработки 1–8 до E0-D0-T06.
- Не считать одно упоминание PRD-раздела полным coverage: трассировка выполняется до атомарных requirement bullets.
- Не умножать механически каждый экран на неприменимые состояния; использовать `N/A` только с причиной.

## 7. Затрагиваемые области

### Новые артефакты

- `docs/design/flows/README.md` — правила, легенда IDs и индекс.
- `docs/design/flows/screen-inventory.md` — screen/surface inventory и state matrix.
- `docs/design/flows/flow-inventory.md` — роли, entry points, F01–F11 и ветки.
- `docs/design/flows/traceability-matrix.md` — PRD ↔ screen/flow/state/DEC.
- `docs/design/flows/validation-report.md` — проверки полноты и evidence.
- `docs/design/flows/diagrams/00-overview.md`.
- `docs/design/flows/diagrams/01-onboarding-auth.md`.
- `docs/design/flows/diagrams/02-home-today.md`.
- `docs/design/flows/diagrams/03-yoga-discovery.md`.
- `docs/design/flows/diagrams/04-workout-execution.md`.
- `docs/design/flows/diagrams/05-own-workouts.md`.
- `docs/design/flows/diagrams/06-programs.md`.
- `docs/design/flows/diagrams/07-habits.md`.
- `docs/design/flows/diagrams/08-reminders-telegram.md`.
- `docs/design/flows/diagrams/09-calendar-reports.md`.
- `docs/design/flows/diagrams/10-social-sharing.md`.
- `docs/design/flows/diagrams/11-settings-data-privacy.md`.

### Обновляемые артефакты

- `docs/roadmap/DECISIONS.md` — утверждённые UX-решения workshop с новыми `DEC-*`.
- `docs/design/README.md` — ссылки на пакет flows.
- `docs/roadmap/stages/00-design.md` — evidence, checklist, status и residual risks E0-D0-T01.
- `docs/roadmap/README.md` — синхронизация stage counts/focus.
- `docs/roadmap/HANDOFF.md` — выполненные действия, проверки и следующий шаг.

## 8. UX surfaces и state mapping

Inventory должен охватить три поверхности:

1. **Mini App:** shell/auth/onboarding; пять вкладок; detail/create/edit/execution screens; профильные разделы; confirmation/permission overlays.
2. **Telegram-бот:** reminders, callbacks, reports, technical notifications, commands и deep links.
3. **Browser fallback:** открытие вне Telegram, auth/deep-link recovery и недоступная цель.

Для каждого screen/surface record фиксируются:

- stable ID и surface;
- actor/role, entry points и linked flows;
- primary actions и terminal outcomes;
- entities/state mutations;
- loading, empty, error, retry, offline, saved, disabled;
- permission/privacy/ownership;
- light/dark, responsive, safe-area и accessibility requirements без визуальной реализации;
- PRD refs, Concept A ref/gap и `DEC-*`.

Flow record содержит preconditions, trigger, happy path, alternate/error/recovery/cancel/back paths, state mutations, Telegram/deep-link effects, privacy и связанные screen IDs.

## 9. План реализации

1. **Зафиксировать решения workshop.** Добавить утверждённые записи в `DECISIONS.md`, связать их с E0-D0-T01 и downstream-задачами; не менять PRD.
2. **Определить схему IDs и легенду.** Ввести стабильные `S-*`, `F01–F11`, state/decision markers и правила versioning.
3. **Создать screen inventory.** Последовательно разобрать PRD §§8–40 и cross-check применимых §§44–57; включить Mini App, bot и browser fallback surfaces.
4. **Создать role/entry-point map.** Зафиксировать владельца, друга/участника, viewer по ссылке, unauthenticated user и system actors без расширения permissions.
5. **Описать F01–F11.** Создать таблицу flows и 11 Mermaid-диаграмм плюс overview; включить happy, alternate, error, offline, recovery, cancellation/back и terminal outcomes.
6. **Наложить state/privacy matrix.** Проверить обязательные состояния §40.2, disabled paths, ownership, revoke/block/deletion и health/privacy constraints.
7. **Построить двунаправленную traceability.** Для каждого requirement bullet указать screen/flow/state/DEC/status; проверить обратные ссылки от каждого screen/flow.
8. **Провести gap-review.** Сопоставить Concept A, отметить reusable references и gaps без изменения статуса Concept A.
9. **Выполнить validation.** Найти orphan requirements, orphan screens/flows, отсутствующие states, битые links/IDs, unresolved decisions и противоречия.
10. **Синхронизировать kanban/handoff.** Заполнить evidence и residual risks; переводить E0-D0-T01 в `review` только при фактическом выполнении acceptance.

## 10. Проверки

- Уникальность всех screen/flow IDs.
- Каждая из пяти вкладок и каждый профильный раздел PRD присутствуют.
- Все 11 flow families имеют Mermaid diagram и linked screen IDs.
- Каждый атомарный requirement §§8–40 имеет `covered`, `partial`, `N/A: reason` или `blocked: DEC-*`.
- Нет screen/flow без PRD refs или явно указанного основания.
- Для каждого применимого экрана рассмотрены loading/empty/error/retry/offline/saved/disabled.
- Проверены owner/friend/link-viewer/unauthenticated permissions и revoke paths.
- Deep links имеют auth, unavailable-target и return/recovery ветки.
- Mermaid blocks синтаксически извлекаются; repository-relative Markdown links существуют.
- Roadmap counts/status совпадают в stage, index и handoff.
- `git diff --check` проходит.
- Автоматические тесты не создаются без отдельного запроса пользователя.

## 11. Риски и edge cases

- Атомарная декомпозиция большого PRD может выявить дополнительные UX-противоречия; запрещено решать их молча.
- Универсальные состояния могут породить фиктивные variants; `N/A` требует проверяемого обоснования.
- Telegram callback/deep-link, offline drafts и status corrections пересекают несколько доменов и могут расходиться между диаграммами.
- Privacy leakage возможна через reports, share cards, friend activity, revoke и обезличенные joint results; нужна отдельная cross-check матрица.
- Concept A визуально убедителен, но неполон; нельзя позволить ему заменить требования PRD.
- Решение о редактируемых имени/фото создаёт отдельную Flowly-идентичность поверх Telegram; это нужно явно отразить в profile flow и data mapping.
- 30-дневный retention share-card заменяет открытый `DEC-009` и должен быть синхронизирован с downstream storage policy.

## 12. Confidence assessment

- **Plan confidence: 94%.** Основание: полностью проанализированы PRD headings §§8–40, карточка E0-D0-T01, roadmap/decisions/handoff, Concept A; независимые анализы построили screen inventory, 11 flow families и gap/risk review; пользователь закрыл известные UX-развилки.
- **Implementation confidence: 91%.** Артефакты документальные и проверяемые, формат/структура утверждены. Неопределённость остаётся из-за объёма атомарной traceability и возможности обнаружить новые противоречия при полном проходе requirement bullets.

До 100% не хватает фактической сборки матрицы и diagrams, проверки всех обратных ссылок и разрешения возможных новых `DEC-*`. Если новая неоднозначность влияет на navigation, permissions, destructive behavior, status semantics или Telegram gate, затронутая ветка останавливается и возвращается пользователю на решение.
