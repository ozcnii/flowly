# Flowly — журнал решений

> Решения не удаляются. После подтверждения меняется статус, добавляются дата, ответ и влияние на задачи.

## Статусы

- `open` — требуется решение пользователя.
- `approved` — решение явно подтверждено.
- `superseded` — заменено более новым решением со ссылкой на него.

## Подтверждённые решения

### DEC-001 — Граница программных напоминаний

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** этап 3 создаёт модель напоминаний и jobs; end-to-end Telegram delivery реализуется на этапе 5.
- **PRD:** §20, §25, §43.22, §45, §54.
- **Влияет на:** E3-D4-T07, E5-D6-T01–T08.

### DEC-002 — Совместные программы

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** одиночные программы закрываются этапом 3; совместные программы реализуются на этапе 7.
- **PRD:** §20.6, §54 этапы 3 и 7, §55.3, §55.8.
- **Влияет на:** E3-D4-T01–T07, E7-D8-T04.

### DEC-003 — Время выполнения проверок

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** применимые проверки выполняются по ходу функциональных этапов; этап 8 закрывает полную suite и production readiness.
- **PRD:** §50, §54 этап 8, §55.9.
- **Влияет на:** все этапы.

### DEC-004 — Kanban workflow

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** использовать пять статусов: `backlog`, `in_progress`, `blocked`, `review`, `done`.
- **Влияет на:** все карточки и `AGENTS.md`.

### DEC-005 — Формат проектных артефактов

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** один общий индекс, отдельный файл каждого этапа, отдельные decision/handoff журналы и корневой `AGENTS.md`.
- **Влияет на:** `docs/roadmap/**`, `AGENTS.md`.

### DEC-012 — Обязательный UX/UI-этап до разработки

- **Статус:** superseded
- **Дата:** 2026-07-13
- **Решение:** добавить отдельный этап 0 до разработки; обязательны user flows, wireframes, UI-kit, финальные макеты и интерактивный прототип; артефакты и evidence хранятся в `docs/design/`; переход к разработке разрешён только после явного approval пользователя.
- **Основание:** явный выбор пользователя; monolithic pre-development gate позднее отменён после неудачной попытки generated high-fidelity package.
- **PRD:** §8–40, §54–55.
- **Влияет на:** исторические E0-D0-T00–T03 и design artifacts; для текущей и будущей работы применять DEC-024.
- **Заменено:** DEC-024.

### DEC-013 — IA, навигация и deep links

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** нижняя навигация содержит ровно пять вкладок PRD; профиль открывается avatar с Главной. Bot links ведут в точную цель, `/app` — на Главную, `/help` — в справку. Недоступная цель показывает безопасную причину, recovery/auth при необходимости и релевантный выход.
- **Основание:** подтверждено пользователем на UX-workshop E0-D0-T01.
- **PRD:** §9–10, §32, §36.
- **Влияет на:** E0-D0-T01–T06; E1-D1-T02/T06/T09; E5-D6-T02/T08; E7-D8-T01; E8-D9-T01/T02/T05/T08.

### DEC-014 — Обязательная связь с ботом в onboarding

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** связь с Telegram-ботом — обязательный onboarding gate с диагностикой и retry; остальные onboarding-шаги можно пропустить.
- **PRD:** §10.1, §36.
- **Влияет на:** E0-D0-T01–T06; E1-D1-T02/T06/T09; E5-D6-T01/T02/T08; E8-D9-T01/T02/T05/T08.

### DEC-015 — Статусы, reminder bounds и stale callbacks

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** отсутствие ответа завершается только `no_response`; UI предлагает статусы по типу активности/контексту, ручная правка подтверждается и журналируется с опциональным комментарием. Custom reminder: интервал ≥10 минут, максимум 10 сообщений на слот/день, последнее — в тот же локальный день вне quiet hours. После quiet hours сообщение доставляется лишь пока актуально, иначе отменяется без смены результата. Stale callback идемпотентно возвращает текущий статус/deep link.
- **PRD:** §15, §24–26, §36–37.
- **Влияет на:** E0-D0-T01–T06; E2-D3; E3-D4-T04–T07; E4-D5-T05–T08; E5-D6-T01–T08; E6-D7-T01–T04; E7-D8-T07; E8-D9-T01/T02/T05/T08.

### DEC-016 — Resilience контента, тренировок и lifecycle программ

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** сбой Главной локализуется в модуле, пустой день даёт CTA к тренировке/программе/привычке. Активная тренировка хранит offline checkpoint и показывает реальный sync conflict. YouTube использует валидный cache fallback, иначе явные unavailable/retry/alternative. Первое сохранение своей тренировки требует название, длительность, сложность и исполняемое содержимое. Program lifecycle: запуск с даты, без сдвигов, явный выход; restart создаёт новое прохождение.
- **PRD:** §11, §14, §16, §19–20, §40.2.
- **Влияет на:** E0-D0-T01–T06; E2-D2-T02–T04; E2-D3-T01–T03/T05; E3-D4-T01–T07; E8-D9-T01/T02/T05/T08.

### DEC-017 — Habit lifecycle, weekly target и timezone

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** weekly target явно показывает «обязательный сегодня» по оставшимся допустимым дням; несколько выполнений считаются только отдельными настроенными слотами. Pause, schedule edit и timezone влияют лишь на будущие occurrences; история не переписывается; удаление привычки архивирует её. Календарь предлагает только допустимые статусы и хранит status history.
- **PRD:** §23, §26–29.
- **Влияет на:** E0-D0-T01–T06; E4-D5-T01–T08; E6-D7-T01–T04; E8-D9-T01/T02/T05/T08.

### DEC-018 — Периоды отчётов и retention share-card

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** недельный отчёт отправляется в понедельник 09:00 за завершённую неделю, месячный — первого числа 09:00 за завершённый месяц в timezone пользователя; текущий период помечается `partial`, пустой объясняет отсутствие данных. Share-card хранится 30 дней.
- **PRD:** §27, §30, §37.
- **Влияет на:** E0-D0-T01–T06; E6-D7-T05–T08; E8-D9-T01–T03/T05/T08.
- **Заменяет:** DEC-009.

### DEC-019 — Friend invites, sharing и совместное участие

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** invite одноразовый, действует 7 дней; встречные invites используют одну pending-связь; reject не блокирует, block отдельный и обратимый. Shared object — read-only original, копия только через «Сохранить себе». Shared habit всегда раскрывает название/расписание/current status, progress и streak — отдельными toggles; revoke действует немедленно. Совместное участие требует acceptance; owner задаёт visibility/может удалить участника; реакции фиксированные.
- **PRD:** §20.6, §32–35.
- **Влияет на:** E0-D0-T01–T06; E2-D3-T03/T05; E3-D4-T02; E4-D5-T02/T08; E7-D8-T01–T07; E8-D9-T01/T02/T05/T08.

### DEC-020 — Ownership, профиль и destructive data actions

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** выход owner из совместного объекта требует передачи ownership либо завершения объекта. Flowly name редактируется отдельно от Telegram; аватар не редактируется и не загружается в Flowly, а берётся из актуального Telegram-профиля при входе/проверке. Удаление аккаунта имеет 7-дневный grace period и сохраняет обезличенную целостность результатов других участников. «Очистить историю» удаляет occurrences, статусы и отчётные результаты, сохраняя аккаунт, настройки и созданные объекты. Экспорт — скачиваемый архив с bot notification.
- **PRD:** §20.6, §34, §38, §47.3, §51.2.
- **Влияет на:** E0-D0-T01–T06; E1-D1-T02/T09/T10; E7-D8-T04/T05; E8-D9-T01–T03/T05/T08.

### DEC-021 — UGC report, hide и block

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** report требует причину; hide действует только для текущего пользователя; block автора — отдельное обратимое действие.
- **PRD:** §13.2, §56.6.
- **Влияет на:** E0-D0-T01–T06; E2-D2-T03, E2-D3-T05; E8-D9-T01/T02/T05/T08.

### DEC-022 — Контекстная модель UI-состояний

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** shell/auth errors — full-screen; module errors — inline; mutation сохраняет ввод и предлагает retry; offline поддерживает draft; loading использует skeleton. Все состояния применяются контекстно, а неприменимость объясняется.
- **PRD:** §40.
- **Влияет на:** E0-D0-T01–T06 и все task cards, где metadata содержит `DEC-022`; особенно UI/review cards этапов 1–8.

### DEC-023 — Visual foundation и формат UI-kit

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** UI-kit развивает wellness-направление Concept A без признания самого концепта финальным дизайном; основной UI-шрифт — локально хранимый Inter, display-шрифт — локально хранимый Cormorant Garamond с кириллицей; иконки — локально закреплённый Lucide. Артефакт включает переносимый HTML-каталог, CSS custom properties, machine-readable JSON tokens и versioned PNG snapshots; все внешние runtime-зависимости исключены.
- **Основание:** явный выбор пользователя при старте E0-D0-T03.
- **PRD:** §40, §55.1.
- **Влияет на:** E0-D0-T03–T04, `docs/design/ui-kit/**`, production UI screen slices.

### DEC-024 — Интерактивные Next.js screen slices вместо общего design gate

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** отказаться от единовременного generated high-fidelity пакета и общего pre-development approval. Реальный UI создаётся в `apps/web` на утверждённом Next.js-стеке итерациями «один экран + все применимые states и интеракции». Каждый screen slice требует отдельного пользовательского approval до начала следующего; scripts используются только для проверки/capture, а не для генерации дизайна. Bootstrap E1-D1-T01/T02 разрешён до screen approval. T00–T03 сохраняются как нормативные requirements/reference; провальный T04 package удаляется.
- **Основание:** явное решение пользователя после неудовлетворительного результата monolithic T04 и review-loop.
- **Техническая фиксация:** npm workspaces; Next.js 16.2.10; React/React DOM 19.2.7; Tailwind CSS 4.3.2; TypeScript 5.9.3. OpenNext Cloudflare проверяется отдельной карточкой E1-D1-T03.
- **Approval contract:** применимая карточка содержит `ui_slices`; route/component, base и contextual states, интеракции, responsive/theme/accessibility evidence и дословный approval пользователя фиксируются до перехода к следующему screen slice.
- **PRD:** §9–40, §41.1, §41.3, §54–55.
- **Влияет на:** E0-D0-T04; E1-D1-T01/T02/T06/T09; все downstream UI cards этапов 2–8; `AGENTS.md`, roadmap, handoff и `apps/web/**`.
- **Заменяет:** DEC-012.

### DEC-025 — Production UI-kit до продолжения screen slices

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** до продолжения Главной создать production UI-kit в `packages/ui` и отдельный интерактивный route `/ui-kit`. UI-kit включает canonical tokens/themes/typography, Button/IconButton, Card, Badge, Progress, AppHeader, BottomNavigation, Skeleton, EmptyState, InlineError и OfflineBanner с focus/touch/reduced-motion contracts. Product screen использует только утверждённые production components; app-local компонент допускается лишь как кандидат и не считается shared до явного решения. Главная остаётся blocked до visual approval `/ui-kit`.
- **Основание:** пользователь обнаружил, что `packages/ui` пуст, а Главная собрана напрямую на app-local CSS; пользователь явно потребовал сначала production UI-kit.
- **Approval contract:** `/ui-kit` должен быть интерактивно проверяемым в light/dark, 360–430/wide, keyboard/focus и component states; дословный approval фиксируется до разблокировки E0-D0-T04.
- **Approval evidence:** 2026-07-13 пользователь явно подтвердил: «утверждаю ui kit»; E1-D1-T11 завершена, E0-D0-T04 разблокирована.
- **PRD:** §40, §41.3, §55.1.
- **Влияет на:** E1-D1-T11, E0-D0-T04, все downstream `ui_slices`, `packages/ui/**`, `apps/web/app/ui-kit/**`, `AGENTS.md`.

### DEC-026 — Cloudflare workers.dev subdomain

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** использовать account-level subdomain `getflowly.workers.dev` для test web/scheduler deployments.
- **Основание:** Cloudflare Dashboard подтвердил доступность `getflowly`; пользователь явно выбрал его из проверенных доступных вариантов. Dashboard update выполнен, Cloudflare API GET подтвердил `subdomain: getflowly`.
- **Контекст:** исходный interactive prompt создал malformed-имя из-за повторного ввода; оно исправлено dashboard rename и не используется как deployment evidence.
- **PRD:** §41.1–41.4, §49.
- **Влияет на:** E1-D1-T03, test Worker URLs и deployment evidence.

### DEC-027 — Nullability/types-контракт foundation-таблиц

- **Статус:** approved
- **Дата:** 2026-07-13
- **Решение:** зафиксировать SQL-типы и nullability для foundation-таблиц E1-D1-T04 (`users`, `user_settings`, `auth_sessions`), поскольку PRD §43.1–43.3 задаёт только имена полей. Контракт:
  - **users** — `id` (text PK, UUIDv7 app-side), `telegram_id` (text NOT NULL UNIQUE), `username` (text nullable), `first_name` (text NOT NULL), `last_name` (text nullable), `photo_url` (text nullable), `timezone` (text NOT NULL), `week_starts_on` (integer NOT NULL, 0–6, 0=Sunday), `locale` (text NOT NULL), `created_at`/`updated_at` (text NOT NULL ISO-8601 UTC), `deleted_at` (text nullable, soft-delete).
  - **user_settings** — `user_id` (text PK, FK→`users.id` ON DELETE CASCADE), `quiet_hours_start`/`quiet_hours_end` (text nullable HH:MM), `quiet_hours_behavior` (text nullable), `default_reminder_policy_id` (text nullable; FK добавляется этапом 3), `weekly_report_enabled`/`monthly_report_enabled`/`friend_notifications_enabled`/`partner_reminders_enabled` (integer NOT NULL, bool 0/1), `weekly_report_day` (integer nullable 0–6), `weekly_report_time` (text nullable HH:MM).
  - **auth_sessions** — `id` (text PK, UUIDv7 app-side), `user_id` (text NOT NULL FK→`users.id` ON DELETE CASCADE), `token_hash` (text NOT NULL UNIQUE), `expires_at`/`last_used_at`/`created_at` (text NOT NULL ISO-8601 UTC).
  - Общие типы: id = text UUIDv7 (генерация app-side, D1 не имеет нативной UUID-функции); timestamps = text ISO-8601 UTC; bool = integer 0/1; enums = text + app-side Zod-валидация; FK = `ON DELETE CASCADE` (users использует soft-delete, CASCADE — safety net для hard-DELETE).
- **Основание:** PRD не задаёт SQL-типы/nullability; явный контракт нужен T06 (insert user/session) и T10 (profile/settings) для корректной insert-логики, чтобы не выводить ограничения из кода. Выявлено независимым deep review E1-D1-T04.
- **PRD:** §43.1–43.3, §41.1.
- **Влияет на:** E1-D1-T04, E1-D1-T06, E1-D1-T10.

### DEC-028 — Frontend UI/UX quality gate для production screen slices

- **Статус:** approved
- **Дата:** 2026-07-14
- **Решение:** любой production frontend screen slice перед показом пользователю обязан пройти самостоятельный UI/UX quality pass агентом по [`docs/design/FRONTEND_REVIEW.md`](../design/FRONTEND_REVIEW.md). Нельзя сдавать экран, если он выглядит как техническая заготовка: служебные ID/roadmap-тексты, огромные заглушечные блоки, нерелевантные disabled-actions, fake-buttons/fake-mutations, избыточные рамки/пустоты, невыстроенная визуальная иерархия, несогласованные отступы с соседними экранами или карточки без реального смысла должны быть исправлены до user review. Проверка обязательна в реальном браузере на 360–430px и включает: визуальную иерархию, плотность/отступы, primary content first, отсутствие внутренних технических формулировок, релевантность actions, loading/empty/error/offline states, keyboard/touch targets, overflow=0, console errors=0, light/dark. Если экран сомнителен визуально — агент сначала сам делает UI/UX review и исправления, а не перекладывает разбор на пользователя.
- **Основание:** пользователь неоднократно указал на некачественные frontend-решения в E2-D2-T03 (огромные кнопки, лишние блоки, плохие отступы, служебность и непроработанность UI) и потребовал зафиксировать правило в `AGENTS.md`.
- **PRD:** §40, §41.3, §55.
- **Влияет на:** все downstream UI-bearing cards/stages 2–8, `AGENTS.md`, `docs/roadmap/HANDOFF.md`, production UI implementation in `apps/web/**`.

### DEC-029 — @tanstack/react-query как обязательный client data layer

- **Статус:** approved
- **Дата:** 2026-07-14
- **Решение:** все client-side запросы из `apps/web` к Flowly API должны выполняться через `@tanstack/react-query` (`useQuery`/`useMutation`) и общий typed API helper. Raw `fetch` в client components/features для app API запрещён; допустим только внутри общего API helper и server route handlers. Read-запросы получают стабильные query keys и app-level cache; mutations инвалидируют или обновляют связанные queries. Server-side route handlers остаются на стандартном Request/Response API.
- **Cache policy v1:** default queries `staleTime=30s`, `gcTime=5m`, `retry=1`; catalog/detail/author reads `staleTime=5m`, `gcTime=30m`; `me` `staleTime=30s`, `gcTime=5m`, `retry=false`; mutations без auto-retry.
- **Основание:** зависимость `@tanstack/react-query` уже установлена, но не использовалась; пользователь явно потребовал «переводи проект целиком и полностью на @tanstack/react-query».
- **Plan:** `.temp/react-query-migration/plan.md`, approved пользователем 2026-07-14 («Внедрять по плану»).
- **PRD:** §41.3, §44.2–44.5, §55.
- **Влияет на:** `apps/web/**`, все current/future client API calls, `AGENTS.md`, roadmap handoff.

### DEC-030 — YouTube search provider v1: Invidious + controlled fallback

- **Статус:** approved
- **Дата:** 2026-07-14
- **Решение:** E2-D2-T04 реализует YouTube search без `YOUTUBE_API_KEY` через Invidious-compatible API provider. Production/test provider base URL задаётся env `INVIDIOUS_BASE_URL`; hardcoded public instance не используется как contract. Если provider недоступен и есть stale cache — можно использовать stale fallback как внутренний data-source без пользовательского `из кэша`; если cache нет — controlled unavailable/error. Dev без `INVIDIOUS_BASE_URL` не показывает fixture как реальные результаты.
- **Scope v1:** S-MA-021 использует свободный пользовательский input + фильтры с debounce; `на русском` не добавляется в запрос. `save` создаёт/возвращает idempotent private workout-copy для текущего пользователя (`sourceType=youtube`, `youtubeVideoId`, no video download). `create-workout` полноценным editor-flow не реализуется до downstream own-workout editor и не показывается как disabled CTA в S-MA-021. `Неподходящий результат` убран из S-MA-021 по user UI review; moderation/quality feedback вернётся отдельным scope, если понадобится.
- **Основание:** пользователь спросил про поиск без `YOUTUBE_API_KEY`, после объяснения рисков official/oEmbed/Invidious выбрал `Try Invidious`; затем approved deep plan `.temp/E2-D2-T04/plan.md` вариантом `Approve v1 scope`; после UI review явно выбрал `Input + фильтры` для YouTube search.
- **PRD:** §19, §43.28, §44.5, §55.2.
- **Влияет на:** E2-D2-T04, `packages/youtube/**`, `apps/web/app/api/v1/youtube/**`, `youtube_search_cache`, `apps/web/features/youtube-search/**`, future provider swap to official YouTube Data API.

### DEC-031 — Product routing cleanup после E2-D2-T04

- **Статус:** approved
- **Дата:** 2026-07-14
- **Решение:** после закрытия E2-D2-T04 перевести пользовательские экраны с query-router `/?screen=...` на нормальные route paths (`/catalog`, `/youtube`, `/workouts/[id]`, `/authors/[source]` и т.п.). До завершения E2-D2-T04 routing cleanup не смешивать с YouTube scope.
- **Основание:** пользователь указал, что текущие URLs вида `?screen=catalog&theme=light` не являются нормальным product routing; выбран порядок «после E2-D2-T04».
- **PRD:** §44.2–44.5.
- **Влияет на:** `apps/web/app/**`, app-shell navigation, screen links, browser/manual verification URLs, downstream UI slices.

### DEC-032 — Persistent app shell, routing and UX architecture gate

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** все product routes Flowly должны использовать устойчивый shared app shell/layout pattern. Bottom navigation/header/avatar не должны пропадать между обычными product screens. Нельзя делать standalone product pages, которые обходят shell, если flow не approved как immersive/fullscreen. Нельзя использовать `?screen=`/`?tab=` как product routing. Навигация внутри приложения не должна показывать re-auth/auth-error/loading flicker при уже установленной сессии. Для Next.js нужно использовать route groups/nested `layout.tsx` там, где это сохраняет shell и предотвращает remount общего layout. Back/cancel placement должен быть консистентным внутри раздела; нельзя прыгать между верхней и нижней кнопкой без UX-основания. Внешний page padding должен иметь один owner: shell или screen, без двойных больших отступов. Fullscreen shell использует максимальные iOS `env(safe-area-inset-*)`, Telegram CSS vars и SDK `safeAreaInset`/`contentSafeAreaInset`; floating glass bottom navigation имеет фиксированную визуальную высоту 64px, смещается выше bottom safe area и не увеличивается вместе с inset, а общий main reserve гарантирует, что последний content/action остаётся выше navbar на всех product routes.
- **Основание:** пользователь указал на исчезающий navbar, `?tab=...`, inconsistent back placement, visible navigation flicker/re-auth и двойные padding как системные UX-ошибки, требующие обязательных правил и детального review.
- **Обязательная проверка:** перед user review любого routing/layout/shell изменения: click navigation matrix, shell/nav persistence, no auth flicker, no `?screen=`/`?tab=`, one-padding-owner check, consistent back placement, console errors 0, overflow 0.
- **PRD:** §44.2–44.5, §55.
- **Влияет на:** `apps/web/app/**`, `apps/web/components/providers/telegram-safe-area.tsx`, `apps/web/components/shell/**`, `packages/ui/src/tokens.css`, `packages/ui/src/styles.css`, all product screen routes, `docs/design/FRONTEND_REVIEW.md`, `AGENTS.md`, E2-D2-T06, E2-D2-T07 and future UI tasks.

### DEC-033 — Product screen UI consistency primitives

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** все product screens Flowly должны использовать единые screen primitives/tokens для повторяемых layout atoms and typography hierarchy: page width/gutter/top padding/bottom padding/mobile density/vertical rhythm, top/back row, page eyebrow/title/subtitle, section title, card title, body/meta text, cards, list rows, controls, avatar/icon sizes, status text and semantic colors. Произвольные локальные значения для повторяемых отступов, цветов, радиусов, размеров и позиционирования запрещены без явного approved exception. First implementation lives in `apps/web/app/globals.css` as app-level primitives (`.flow-screen`, `.flow-top`, `.flow-back`, `.flow-card`, `.flow-list-row`, etc.) because текущая проблема находится в app screens; перенос в `packages/ui` требует отдельного решения о public API.
- **Основание:** пользователь указал, что `/profile` и `/settings` визуально прыгают из-за разных padding/back placement, и что такая проблема вероятна на всех страницах. Это systemic UI drift, а не локальный баг.
- **Обязательная проверка:** перед user review production UI агент должен выполнить global drift audit по всем route-accessible product screens: page edge/top/back/card/list geometry, typography hierarchy (`.flow-eyebrow`, `.flow-title`, `.flow-subtitle`, `.flow-section-title`, `.flow-card-title`), arbitrary spacing/color/radius/font values, light/dark, 360–430px, overflow 0, console errors 0, touch targets ≥44. Соседние экраны одного shell не должны менять page edge/top/back позицию без approved exception. Mobile screens must not compound global screen gap with local vertical margins; repeated vertical rhythm has one owner. Back/cancel/navigation controls must be content-width and never stretch full-width unless that exact full-width pattern is approved as a primary mobile action.
- **PRD:** §44.2–44.5, §55.
- **Влияет на:** `apps/web/app/globals.css`, `apps/web/features/**/ui/*.module.css`, `apps/web/features/**/ui/*.tsx`, `docs/design/FRONTEND_REVIEW.md`, `AGENTS.md`, E2-D2-T07 and all future frontend tasks.

### DEC-034 — Durable production onboarding и Telegram launch gate

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** production onboarding использует nullable `users.onboarding_completed_at`; `NULL` означает incomplete для новых и уже существующих пользователей, timestamp ставится только idempotent completion mutation после обязательного финального gate. Incomplete authenticated user не видит product shell и направляется в fullscreen routes `/onboarding/welcome -> preferences -> capabilities -> bot`; completed user больше не видит onboarding. По явному выбору пользователя DEC-014 gate в этой реализации считается подтверждённым фактом ранее валидированного Telegram Mini App launch/session, без отдельного `getChat`. Habit/invite controls на S-MA-004 остаются visible disabled без fake mutation до E4-D5-T02/E7-D8-T01; эти downstream cards обязаны включить controls только вместе с реальными mutations. Home/Profile/Settings используют authenticated `/me`; Flowly name остаётся отдельно редактируемым, Telegram username/photo read-only и обновляются при auth.
- **API/data contract:** `GET /me` возвращает boolean `onboardingCompleted`; `POST /api/v1/onboarding/complete` требует session + same-origin, idempotently ставит timestamp и возвращает updated public user. Client calls идут через React Query.
- **Основание:** пользователь после production auth verification выбрал «Профиль + onboarding», onboarding для любого incomplete user, plan `.temp/E1-D1-T13/plan.md`, launch-fact bot gate и disabled habit/invite с downstream TODO; plan approved командой «делай».
- **PRD:** §10.1–10.2, §38, §43.1–43.2, §44.1, §55.1.
- **Влияет на:** E1-D1-T13, E4-D5-T02, E7-D8-T01, `users`, `/api/v1/me`, `/api/v1/onboarding/complete`, `apps/web/app/onboarding/**`, Home/Profile/Settings, DEC-014 implementation semantics.

## Открытые решения

### DEC-006 — Operational thresholds

- **Статус:** open
- **Вопрос:** какие численные пороги ошибок, D1/R2 usage и owner alerts использовать?
- **Почему нельзя предположить:** PRD требует уведомлять при превышении установленного порога, но не задаёт числа.
- **PRD:** §52.3, §56.1.
- **Блокирует:** финальную конфигурацию E8-D9-T04.

### DEC-007 — Retry и rate limits

- **Статус:** open
- **Вопрос:** какие точные retry limits и rate limits использовать там, где PRD не задаёт чисел?
- **PRD:** §35, §45.4, §47.1.
- **Блокирует:** финальную настройку E5-D6-T06 и E7-D8-T07.

### DEC-008 — Механизм backup schedule

- **Статус:** open
- **Вопрос:** использовать отдельный Cron handler/deployment или расширить scheduler?
- **PRD:** §41.4, §51.1.
- **Блокирует:** E8-D9-T03.

### DEC-009 — Retention share-cards

- **Статус:** superseded
- **Дата:** 2026-07-13
- **Решение:** срок хранения утверждён как 30 дней в DEC-018; механизм очистки реализуется в рамках этой policy без нового продуктового выбора.
- **PRD:** §30.5, §46.1, §47.3.
- **Заменено:** DEC-018.

### DEC-010 — Размер и проверка стартового каталога

- **Статус:** approved
- **Дата:** 2026-07-14
- **Решение:** для E2-D2-T01 использовать широкий стартовый каталог: примерно 10 категорий, 20 тренировок и 60 упражнений. Качество подтверждает пользователь по чеклисту перед `done`: название, описание, категории, длительность, формат, сложность, противопоказания, YouTube ID/источник, упражнения, изображения/placeholder keys; импорт должен быть повторяемым и давать evidence counts + sample records. Для программ отдельный объём уточняется на этапе 3; E2-D2-T01 закрывает только workout catalog.
- **Основание:** выбор пользователя при старте E2-D2-T01.
- **PRD:** §53, §55.2.
- **Влияет на:** E2-D2-T01, E8-D9-T07.

### DEC-011 — Актуальные внешние квоты

- **Статус:** open
- **Вопрос:** когда и по каким официальным источникам перепроверять Cloudflare free tier и YouTube API quota перед инфраструктурным планированием?
- **PRD:** §42, §56.1–56.2.
- **Блокирует:** production validation E8-D9-T06.

## Шаблон нового решения

```markdown
### DEC-NNN — Название

- **Статус:** open
- **Вопрос:**
- **Варианты:**
- **Влияние:**
- **PRD:**
- **Блокирует:**
- **Ответ пользователя:**
- **Дата:**
```
