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
- **Решение:** нижняя навигация содержит ровно пять вкладок PRD; профиль открывается постоянной `user-round` action из shared Navbar (`DEC-046`). Bot links ведут в точную цель, `/app` — на Главную. Недоступная цель показывает безопасную причину, recovery/auth при необходимости и релевантный выход. Прежний `/help` → S-MA-096 contract удалён по DEC-041.
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
- **Решение:** выход owner из совместного объекта требует передачи ownership либо завершения объекта. Flowly name редактируется отдельно от Telegram; avatar URL/изображение Telegram не сохраняется, не проксируется и не отображается (`DEC-046`), profile entry всегда использует `user-round` icon. Удаление аккаунта имеет 7-дневный grace period и сохраняет обезличенную целостность результатов других участников. «Очистить историю» удаляет occurrences, статусы и отчётные результаты, сохраняя аккаунт, настройки и созданные объекты. Экспорт — скачиваемый архив с bot notification.
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

- **Статус:** superseded by DEC-035
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
- **Исключение:** DEC-035 разрешает E0-D0-T05 мигрировать все текущие frontend surfaces одним batch без промежуточного user approval каждого screen; future feature slices после миграции продолжают обычный DEC-024 workflow.
- **Заменяет:** DEC-012.

### DEC-025 — Production UI-kit до продолжения screen slices

- **Статус:** superseded by DEC-035
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
  - **users** — `id` (text PK, UUIDv7 app-side), `telegram_id` (text NOT NULL UNIQUE), `username` (text nullable), `first_name` (text NOT NULL), `last_name` (text nullable), `timezone` (text NOT NULL), `week_starts_on` (integer NOT NULL, 0–6, 0=Sunday), `locale` (text NOT NULL), `created_at`/`updated_at` (text NOT NULL ISO-8601 UTC), `deleted_at` (text nullable, soft-delete).
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

- **Статус:** superseded by DEC-049
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
- **Решение:** все product routes Flowly должны использовать устойчивый shared app shell/layout pattern. Bottom navigation/header/profile action не должны пропадать между обычными product screens. Нельзя делать standalone product pages, которые обходят shell, если flow не approved как immersive/fullscreen. Нельзя использовать `?screen=`/`?tab=` как product routing. Навигация внутри приложения не должна показывать re-auth/auth-error/loading flicker при уже установленной сессии. Для Next.js нужно использовать route groups/nested `layout.tsx` там, где это сохраняет shell и предотвращает remount общего layout. Back/cancel placement должен быть консистентным внутри раздела; нельзя прыгать между верхней и нижней кнопкой без UX-основания. Внешний page padding должен иметь один owner: shell или screen, без двойных больших отступов. Fullscreen shell использует официальную вложенную модель Telegram: system inset вычисляется как максимум iOS `env(safe-area-inset-*)`, Telegram safe-area CSS vars и SDK `safeAreaInset`, content inset — как максимум Telegram content-safe CSS vars и SDK `contentSafeAreaInset`, после чего system и content insets складываются; floating glass bottom navigation имеет фиксированную визуальную высоту 64px, смещается выше bottom safe area и не увеличивается вместе с inset, а общий main reserve гарантирует, что последний content/action остаётся выше navbar на всех product routes.
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

### DEC-035 — Konsta UI как обязательная production UI foundation

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** весь текущий и будущий production frontend Flowly обязан использовать pinned `konsta@5.2.0` (`konsta/react`) как единственную базовую component/design library. Активная тема всегда `ios`; typography переводится на системный iOS font stack; Flowly sage/sand semantic colors сохраняются через Tailwind v4 `@theme` и Konsta color contract. Каждый standard visual/interactive element (controls, fields, cards/surfaces, lists, feedback, navigation, titles/group labels) использует прямой Konsta component, если он существует. Raw interactive HTML и visual `<div>`/`<span>` + CSS аналоги запрещены; structural semantic/layout HTML допускается только без дублирования visual contract.
- **`packages/ui`/legacy contract:** migration удаляет все usages и implementations `packages/ui`, app-local wrappers, `.flow-*`/custom CSS, которые дублируют Konsta; запрещено сохранять их временно, оборачивать legacy API или имитировать Konsta CSS-ом. Любой Flowly-specific composite либо отсутствующий icon/control contract требует до реализации явного user approval, отдельной DEC-записи, code comment с DEC-ID и evidence отсутствия Konsta equivalent. Если package становится пустым, удалить `packages/ui`, workspace/dependency references и `/ui-kit`; approved composites, если останутся, представлены только в их gallery.
- **Migration contract:** E0-D0-T05 обновляет все текущие route-accessible product screens, onboarding/auth/recovery/web-fallback states, overlays, shell и navigation одним implementation pass непосредственно в production code — без отдельного spike и без промежуточного user approval каждого screen. Любой user signal о лишнем CSS/wrapper или отличии от documented Konsta behavior запускает полный code-first audit затронутого component family: exact official composition восстанавливается, а дублирующие CSS Modules/global selectors/local visual wrappers/decorative layers удаляются целиком вместо точечного patch. User review проводится один раз после полного browser/behavior/accessibility verification pass. Это явное исключение из per-screen approval DEC-024 только для E0-D0-T05; дальнейшие feature slices снова следуют DEC-024.
- **Сохраняемые инварианты:** product behavior, routes, React Query/API contracts, Telegram auth/onboarding, persistent shell и официальная additive safe-area model DEC-032 не меняются; DEC-028 quality gate остаётся обязательным. DEC-033 geometry/consistency constraints сохраняются, но Konsta становится first/final source для repeated UI atoms, а legacy CSS остаётся только как доказанный minimum app-specific shell/domain layout.
- **Apple HIG contract:** каждый screen/control проходит explicit iOS review: один primary action, семантически правильный single/multiple selection control, targets ≥44×44pt, safe-area, system typography/text scaling, contrast, non-color state cues, predictable Back/Cancel/Done, concise labels и density без CTA-like option rows. Любой control с icon + label явно задаёт consistent 8pt gap через component utility/API; Konsta 5.2.0 не добавляет такой gap автоматически, соприкосновение icon/text запрещено. Evidence содержит raw HTML/packages-ui/CSS audits, per-control enabled/pressed/selected/focus/disabled/loading/error matrix и browser 360/390/430 light/dark. User review запрещён при любом standard element вне Konsta или необоснованном visual wrapper/CSS.
- **Основание:** пользователь отклонил отдельный prototype и явно выбрал прямую полную миграцию проекта на Konsta, wrappers только при необходимости, удаление пустого `packages/ui` и `/ui-kit`, batch implementation, системную iOS-типографику и обязательное правило в `AGENTS.md` использовать эту библиотеку всегда. Затем пользователь ужесточил contract: абсолютно все available visual elements брать из Konsta, legacy/package UI удалять, DOM/CSS сводить к minimum, любые исключения согласовывать заранее и каждый element проверять по Apple standards.
- **Plan:** `.temp/E0-D0-T05/plan.md`.
- **PRD:** §9–40, §41.3, §55.
- **Влияет на:** E0-D0-T05; все current/future UI-bearing cards; `apps/web/**`; `packages/ui/**`; `apps/web/app/ui-kit/**`; `AGENTS.md`; `docs/design/FRONTEND_REVIEW.md`; roadmap/HANDOFF.
- **Заменяет:** DEC-023 как active visual/typography foundation и DEC-025 как mandatory custom `packages/ui`/`/ui-kit` gate.

### DEC-036 — Compact Konsta-first onboarding review внутри E0-D0-T05

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** onboarding S-MA-002–005 ревьюится и улучшается точечно внутри активной E0-D0-T05 до продолжения broad migration; отдельная E1-D1-T14 и отдельный plan file не используются. Standalone Flowly icon overlay удаляется с hero S-MA-002. `Начать` ведёт в preferences, clear-action `Пропустить` сразу ведёт к обязательному Telegram gate. S-MA-003 остаётся одним compact scroll-screen: timezone — Konsta Sheet + Searchbar + grouped List; week start — 2-option Segmented; duration — 4-option Segmented; interests — compact multi-select options с non-color selected cue; weekdays — compact 7-day grid с target ≥44px и accessibility labels; convenient time — три equal options с icon+label, explicit 8pt gap и `aria-pressed`; safe-area-aware footer находится в document flow, содержит primary `Далее` и clear `Пропустить` и не перекрывает controls. S-MA-004 сохраняет обе видимые disabled capabilities по явному решению пользователя, но layout можно радикально менять под HIG. S-MA-005 сохраняет mandatory Telegram gate; technical copy удаляется.
- **UX/HIG основание:** один primary visual/action focus; correct single/multiple selection semantics; minimum 44×44pt targets; selected state не кодируется только цветом; predictable skip/gate behavior; меньше scroll и CTA-like option rows; disabled controls явно объясняют будущую доступность и не имитируют mutation.
- **Основание:** пользователь сначала выбрал compact preferences follow-up, затем остановил broad migration и явно решил выполнить onboarding-review сейчас внутри E0-D0-T05 без отдельного plan file; дополнительно утвердил `Пропустить к gate`, сохранение disabled capabilities и разрешил радикально менять композицию ради Apple HIG.
- **PRD:** §10.1, §40, §55.1.
- **Влияет на:** E0-D0-T05, S-MA-002–005, `apps/web/features/onboarding/ui/**`, roadmap/HANDOFF.

### DEC-037 — Lucide artwork для Konsta Icon contract

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** Konsta UI предоставляет `Icon` layout/container, но не поставляет icon artwork. Разрешён локальный versioned Lucide inline SVG sprite `packages/ui/src/icon-sprite.tsx`, один раз отрендеренный root layout; единственный минимальный `packages/ui/Icon` composite использует same-document fragment `#icon-*`, без внешнего sprite fetch/revalidation. Другие icon sources и app-local icon wrappers запрещены без нового approval. Composite не меняет Konsta control anatomy, SVG всегда decorative (`aria-hidden`, `focusable=false`), accessible name принадлежит control.
- **Основание:** source audit Konsta 5.2.0 подтвердил отсутствие bundled icon artwork; пользователь явно выбрал «Разрешить Lucide» после обязательного вопроса по AGENTS.md.
- **PRD:** §40, §55.1.
- **Влияет на:** E0-D0-T05, `packages/ui/src/icon.tsx`, `packages/ui/src/icon-sprite.tsx`, root layout, все Konsta controls с icon artwork, `/ui-kit`.

### DEC-038 — Konsta Preloader для loading state Главной

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** в S-MA-010 loading state использовать прямой Konsta `Preloader`, не сохранять и не создавать custom `Skeleton`. Это явное точечное отклонение от DEC-022 requirement «loading использует skeleton» для Главной ради strict DEC-035 Konsta-only contract; другие screen slices не наследуют исключение автоматически.
- **Основание:** source/export audit подтвердил, что Konsta UI 5.2.0 не содержит Skeleton. На обязательном вопросе пользователь явно выбрал «Использовать Preloader», отклонив approved custom Skeleton exception.
- **PRD:** §11, §40.2, §55.1.
- **Влияет на:** E0-D0-T05, S-MA-010, `apps/web/features/home/ui/home-screen.tsx`, DEC-022 implementation semantics только для Главной.

### DEC-039 — Сокращённый состав Главной

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** S-MA-010 не показывает дату над приветствием, отдельный модуль «Категории йоги» и секцию «Ещё для вас» целиком. Вместе с «Ещё для вас» с Главной удаляются недельный прогресс, простые рекомендации, friend activity и отдельный recommendation module-error state. Главная сохраняет приветствие, прогресс дня, ближайшее действие, быстрый запуск, текущую программу, привычки, contextual offline/resume/loading/empty states и persistent navigation. Категории остаются данными/фильтром каталога S-MA-020, но не Home-модулем.
- **Основание:** пользователь явно указал, что дата, категории и «Ещё для вас» на Главной не нужны, и поручил удалить их без замены.
- **PRD:** supersedes состав Home в §11.1 для categories/weekly progress/recommendations/friend activity и Home-placement §11.3; catalog taxonomy сохраняется.
- **Влияет на:** E0-D0-T05, S-MA-010, F02/F03 traceability, `apps/web/features/home/**`, `docs/PRD.md`, design flows/roadmap/HANDOFF.

### DEC-040 — Круговой прогресс дня на Главной

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** S-MA-010 использует Home-only круговой индикатор прогресса дня с видимым процентом и accessible label. Это явное исключение из strict direct-Konsta contract DEC-035: Konsta UI 5.2.0 предоставляет только линейный `Progressbar` и не имеет circular progress. Реализация ограничена минимальным inline SVG `DayProgressRing` без CSS Module, external dependency или shared wrapper; цвет берётся только из Flowly semantic variables, значение clamp 0–100, процент является non-color cue. Остальной Home остаётся direct Konsta.
- **Основание:** после показа двух вариантов пользователь явно выбрал «Custom круговой», понимая необходимость approved SVG/CSS exception.
- **PRD:** §11.2, §40, §55.1.
- **Влияет на:** E0-D0-T05, S-MA-010, `apps/web/features/home/ui/home-screen.tsx`, DEC-035 exception registry, roadmap/HANDOFF.

### DEC-041 — Удалить Help и оставить будущие разделы профиля disabled

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** production route `/help`, S-MA-096, `HelpScreen` и весь profile entry/help-specific UI удаляются. `/help` исключается из минимальных bot commands и больше не имеет app target. Profile hub сохраняет только реальный переход в `/settings`; будущие Friends/Challenges/Favorites/Reports/Notifications/Export/Delete rows остаются видимыми, но не интерактивными, с явным non-color cue `Скоро`. Технические stage/preview notices запрещены. Profile header/identity/sections строятся direct Konsta `Navbar/List/ListItem/BlockTitle/Badge`, custom CSS module и отдельный oversized Edit CTA удаляются. Profile, Settings и все будущие internal child pages используют action-free fixed/blurred `PrimaryNavbar` title contract DEC-047; прежний web `NavbarBackLink` superseded native Telegram `BackButton` contract DEC-048. Optional web right/left actions отсутствуют. `ListItem` с `linkComponent="button"` получает `contentClassName="w-full"` и `innerClassName="text-left"`, чтобы вся строка/chevron занимали доступную ширину без съезда subtitle; `linkProps.className` запрещён, поскольку перезаписывает Konsta anatomy. Settings UI использует direct Konsta grouped `List/ListInput/Segmented/Toggle/BlockFooter`; timezone picker вынесен в единый shared `@/components/timezone-picker` и переиспользуется onboarding/settings, дублирующие реализации и legacy `packages/ui` Select/TextField удаляются. Для pinned Konsta 5.2.0 `ListInput` используется `title=""`: upstream component иначе передаёт `title:null` в `cls()` и падает на `null.constructor`; workaround удаляется только после подтверждённого upstream fix.
- **Основание:** пользователь явно поручил удалить `/help` и всё связанное, вернуть прежние неработающие разделы disabled и указал на визуальные проблемы native hierarchy/spacing текущего Profile.
- **PRD:** supersedes `/help` в §36.2 и удаляет S-MA-096; §9 profile sections сохраняются как будущие disabled destinations до реальных mutations/routes.
- **Влияет на:** DEC-013, E0-D0-T05, historical E1-D1-T10/E2-D2-T06/T07 evidence, S-MA-080, S-MA-096 (removed), F01/F11, stage 5 Telegram command scope, `apps/web/app/(app)/help/**`, `apps/web/features/profile/ui/**`, design flows/traceability, roadmap/HANDOFF.

### DEC-042 — Неделя Flowly всегда начинается в понедельник

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** Flowly ориентирован на РФ; начало недели является фиксированным продуктовым инвариантом Monday (`weekStartsOn=1`). Пользовательский выбор начала недели удаляется из onboarding и Settings. Public `/api/v1/me` больше не экспонирует и не принимает `weekStartsOn`; новые и повторно авторизованные пользователи нормализуются к `1`. Колонка D1 временно сохраняется для совместимости схемы, но не является пользовательской настройкой.
- **Основание:** пользователь явно указал, что для РФ выбор между понедельником и воскресеньем не имеет смысла и неделя должна всегда начинаться в понедельник.
- **PRD:** уточняет locale/calendar contract §10.1 и profile settings §27.
- **Влияет на:** E0-D0-T05, S-MA-003, S-MA-090, `/api/v1/me`, `users.week_starts_on`, onboarding/settings flow documentation, HANDOFF.

### DEC-045 — Короткие display labels для Tabbar

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** persistent Tabbar показывает `Треки` для conceptual section/route «Программы» (`/programs`) и `Дневник` для conceptual section/route «Календарь» (`/calendar`). Routes, shared Navbar screen titles (`Программы`/`Календарь`), PRD domain names и semantics не меняются; это только compact mobile navigation labels и явное исключение из требования DEC-043 о буквальном совпадении Navbar title с Tabbar label. Остальные labels остаются `Главная / Йога / Ритм`. Custom width/padding fixes запрещены и удалены; active state полностью принадлежит documented Konsta `ToolbarPane/TabbarLink`.
- **Основание:** полные labels выходили за native active highlight при пяти tabs; пользователь отклонил custom layout fixes и после раздельного выбора явно утвердил `Треки` и `Дневник`.
- **PRD:** уточняет display labels основной навигации §9 без переименования разделов §20/§28.
- **Влияет на:** E0-D0-T05, DEC-013/032/035, `apps/web/components/shell/app-shell.tsx`, roadmap/HANDOFF.

### DEC-043 — Единая верхняя панель основных tab pages

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** exact top-level routes `/`, `/catalog`, `/programs`, `/rhythm`, `/calendar` используют один full-width direct Konsta `Navbar`, который рендерит shared `AppShell` вне page padding. На Home centered title показывает только Flowly name пользователя; прежний greeting/subtitle block удаляется. На остальных основных pages centered title совпадает с bottom tab: `Йога`, `Программы`, `Ритм`, `Календарь`. Fixed Navbar всех пяти основных pages не содержит left/right actions. Только Home content начинает строка `Твой план` с постоянной icon-only `user-round` profile action справа (`/profile`, accessible label, target ≥44px); Settings доступен через Profile. Bottom Tabbar labels используют единый exact font-size 9px. Fullscreen root Navbar geometry superseded by DEC-047: primary title/safe-area blur and action row have separate vertical ownership. Back запрещён на top-level pages и остаётся только у вложенных routes по DEC-041. Собственные raw headers и duplicate Chip/page labels на top-level pages удаляются; новые основные pages регистрируются в shared shell mapping.
- **Основание:** пользователь потребовал унифицировать top-level Navbar, затем по real-device review удалил из fixed header обе action icons. Финальный contract оставляет профиль только в Home content row `Твой план`; Settings открывается через Profile.
- **PRD:** уточняет shared shell/navigation §38 и production UI contract.
- **Влияет на:** DEC-032, DEC-041, E0-D0-T05, S-MA-010, S-MA-020 и top-level placeholders Programs/Rhythm/Calendar, `AppShell`, `AppRouteShell`, AGENTS, HANDOFF.

### DEC-044 — Persistence настроек профиля

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** autosave имени и timezone обязан вызывать typed `PATCH /api/v1/me` одинаково в local/dev и production. Weekly/monthly report toggles читаются из существующих `user_settings.weekly_report_enabled/monthly_report_enabled`, принимаются тем же PATCH и возвращаются в GET/PATCH/onboarding-complete response; локальный optimistic-only state запрещён. Theme остаётся device-local в `localStorage` и не расширяет backend schema/API.
- **Основание:** canonical local repro подтвердил, что backend name/timezone работал, но Settings пропускал mutation вне production; report toggles были fake/local-only и противоречили D1. Пользователь выбрал исправить реальные баги, сохранив theme локальной настройкой устройства.
- **PRD:** реализует §27 и §38.1 report/profile settings persistence без расширения theme contract.
- **Влияет на:** E0-D0-T05, S-MA-003, S-MA-090, `/api/v1/me`, onboarding-complete response, `user_settings`, React Query `me` contract, HANDOFF.

### DEC-046 — Не хранить Telegram avatar

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** Flowly не сохраняет, не возвращает, не проксирует и не рендерит Telegram `photo_url`. `users.photo_url` физически удаляется migration 0005 вместе с существующими значениями; re-auth игнорирует входной `photo_url`; `/api/v1/me/photo`, Telegram image CSP/allowlist и frontend photo fallback удаляются. Все profile entry/identity surfaces всегда используют approved `user-round` icon. Входной Telegram init-data type может содержать `photo_url`, но application layer его не потребляет.
- **Основание:** пользователь явно отказался от хранения и отображения Telegram avatar и выбрал физическое удаление D1 column.
- **PRD:** удаляет `photo_url` из §43.1; supersedes avatar clause DEC-020 и schema field DEC-023.
- **Влияет на:** E0-D0-T05, E1-D1-T13 historical evidence, S-MA-010, S-MA-080/090, `/api/v1/me`, D1 users schema, CSP/Next image config, shared Navbar/Profile, HANDOFF.

### DEC-047 — Fullscreen primary Navbar внутри composed safe area

- **Статус:** approved exception
- **Дата:** 2026-07-15
- **Решение:** primary Navbar renders only when Telegram `platform` is `ios`, `android` or `android_x`; desktop/web renders no safe-area title. On mobile it starts at viewport top, owns Konsta `--k-safe-area-top: max(44px, var(--component-safe-area-top))` and compensates parent padding with an equal negative margin. Its title is fixed 22px above the effective inset bottom (center of the final 44px), avoiding iPhone notch/native controls while remaining visible when a mobile client reports inset 0; the now-empty Konsta action row is collapsed to zero height. Blur is limited to the composed safe-area layer via the only approved `.primary-navbar > :first-child` anatomy selector because Konsta 5.2.0 exposes no blur-element sizing prop. Internal Profile/Settings use the same action-free fixed title/blur contract; back navigation is native-only per DEC-048. Bottom Tabbar labels use exact 9px.
- **Основание:** real Telegram iOS fullscreen screenshots after commit 300f7d9 confirmed sticky offset was fixed, but scrolling content remained visible through the unblurred safe-area layer. Пользователь явно выбрал title inside safe area + blur and controls below Telegram controls, accepting the Telegram-overlay risk after warning.
- **Ограничение:** mobile title placement still requires real-device verification across Telegram clients; real-device matrix remains required. The CSS exception may be removed only when Konsta exposes a supported blur sizing hook.
- **Влияет на:** DEC-032/035/043, E0-D0-T05, AppShell/PrimaryNavbar, Profile/Settings root Navbar, globals.css, FRONTEND_REVIEW/HANDOFF.

### DEC-048 — Native Telegram BackButton для внутренних routes

- **Статус:** approved; visibility/history portion superseded by DEC-052
- **Дата:** 2026-07-15
- **Решение:** web `NavbarBackLink`/custom Back controls удаляются из Profile, Settings и будущих internal routes. Route-aware `TelegramBackButton` вызывает official `window.Telegram.WebApp.BackButton.show()` на всех routes AppShell кроме exact top-level `/`, `/catalog`, `/programs`, `/rhythm`, `/calendar`; на top-level вызывает `hide()`. Handler регистрируется через `BackButton.onClick` и симметрично удаляется через `offClick`; cleanup internal route не вызывает `hide()`, чтобы Settings → Profile не мигал native Close/X. `hide()` вызывается только effect следующего exact top-level route; действие Back — `router.back()`. Вне Telegram component no-op. Profile/Settings используют action-free `PrimaryNavbar`, поэтому fixed title и safe-area blur совпадают с основными pages.
- **Ограничение Telegram:** native Close/X нельзя перехватить или превратить в Back — Telegram API этого не предоставляет. `BackButton` является отдельным native header control; конкретный клиент может визуально разместить его рядом с Close или заменить часть chrome.
- **Основание:** пользователь потребовал удалить web Back из внутренних страниц и использовать native Telegram navigation после изучения документации.
- **Источник:** official Telegram Mini Apps docs — [`BackButton`](https://core.telegram.org/bots/webapps#backbutton), [`backButtonClicked`](https://core.telegram.org/bots/webapps#events-available-for-mini-apps).
- **Влияет на:** DEC-032/041/043/047, E0-D0-T05, Profile/Settings, AppRouteShell, Telegram SDK typings, AGENTS/FRONTEND_REVIEW/HANDOFF.

### DEC-050 — Konsta/HIG composition каталога

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** S-MA-020 использует approved shared `WorkoutMediaCard` DEC-053 из direct Konsta primitives: стабильная full-width 16:9 cover сверху, timecode на cover, затем visual title максимум в две строки с полным text в DOM/native title/detail, одна compact metadata line (`source · format · domain attributes`) и 44px domain icon action; UGC получает text cue, detail открывает вся основная область. Cover geometry и normal-state Card height не зависят от длины title. Disabled favorite control остаётся видимым по явному выбору пользователя. Filter Sheet использует direct Konsta `Navbar/List/ListItem/Radio/Toggle`: category/duration/difficulty/format являются single-select radio groups с `Любая`, equipment/YouTube/favorite — независимые toggles. Sheet обязан иметь modal focus transfer/trap/restore, inert+aria-hidden background, Escape/backdrop close и один primary `Готово`. Custom catalog Skeleton/CSS recreation запрещены; loading использует direct `Preloader`, offline показывает available data. Единственный Searchbar focus-owner wrapper разрешён как documented workaround: Konsta 5.2.0 принимает, но теряет `className`, поэтому без дополнительного DOM owner невозможно дать keyboard focus cue, не вмешиваясь в internal anatomy. Filter count `Badge` является sibling direct Konsta component в минимальном relative layout wrapper: внутри `Button` он запрещён, потому что documented Konsta anatomy содержит `overflow-hidden` и обрезает вынесенный count/цифру. Native clear button Konsta имеет 32×32 target, поэтому отключён; при непустом input используется отдельный direct Konsta 44×44 clear Button.
- **Основание:** standalone code/browser/Apple HIG review выявил inconsistent custom CSS, color-only toggle chips, вечный offline skeleton, недоступный Sheet и clipping при 200% text. Пользователь явно выбрал `Radio + Toggle` и сохранение disabled favorite. Последующие screenshot reviews сначала перевели cards в vertical composition, затем на фактическом long YouTube title пользователь отклонил full-title result как «ужасно» и approved YouTube-like two-line title + compact icon action при сохранении source/format badges.
- **PRD:** уточняет presentation/interaction S-MA-020 в рамках §12–13 без изменения API/routes/React Query contracts.
- **Влияет на:** DEC-028/029/033/035, E0-D0-T05, S-MA-020, catalog UI/state evidence, HANDOFF.

### DEC-049 — Production YouTube search через Piped

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** Invidious provider DEC-030 заменяется server-side Piped API без ключа. Production/test используют env `PIPED_BASE_URL=https://api.piped.private.coffee`; search вызывает `/search?q=...&filter=videos`, metadata fallback — `/streams/:videoId`. API contract возвращает `provider: "piped"`; thumbnails нормализуются к `i.ytimg.com`; D1 cache/stale fallback и TTL ≥24h сохраняются, cache namespace меняется на `piped:v1`. Клиентский raw fetch не добавляется, видео не скачивается.
- **Основание:** production canonical repro `GET /api/v1/youtube/search?q=йога для спины` стабильно возвращал HTTP 200, `provider=invidious`, `cache=unavailable`, 0 результатов из-за HTML/недоступного Invidious instance. Пользователь ранее выбрал no-key Piped migration; candidate Piped instance подтверждён реальным JSON search.
- **Verification:** commit `286d597`, Deploy web run 29402655934 PASS. Тот же production запрос после deploy: HTTP 200, `provider=piped`, `cache=miss`, 12 результатов, warning null; immediate repeat `cache=hit`, 12. Edge queries: `йога для начинающих + short` = 12, `растяжка + none` = 10, empty/default yoga = 6; все HTTP 200, warning null.
- **Риски:** public Piped instance остаётся best-effort внешней зависимостью; stale cache/unavailable contract обязателен. `/streams/:videoId` может не иметь metadata для отдельных видео, но normal save после search использует cached result.
- **PRD:** §19, §43.28, §44.5, §55.2.
- **Влияет на:** DEC-030, E2-D2-T04 historical provider contract, `packages/youtube`, `/api/v1/youtube/**`, `youtube_search_cache`, wrangler/env, HANDOFF.

### DEC-051 — Konsta/HIG composition YouTube search и workout detail

- **Статус:** approved
- **Дата:** 2026-07-15
- **Решение:** internal routes `/youtube` и `/workouts/[id]` используют action-free shared `PrimaryNavbar` с titles `Поиск YouTube` и `Тренировка`; собственные web Back/header rows запрещены, Back принадлежит native Telegram manager DEC-048. Desktop/web Navbar отсутствует по DEC-047, поэтому страницы сохраняют semantic H1. Оба screen family используют direct Konsta и не имеют CSS Modules/custom Skeleton. YouTube использует тот же shared `WorkoutMediaCard` DEC-053, real Save mutation и in-app fullscreen player вместо внешнего Watch link; stale/saved query остаётся enabled и показывает соответствующий status. Workout detail использует direct Card/Badge/Chip/List/ListItem/Button/Link/Preloader; semantic workout H1 вынесен над hero Card, а Card содержит только обложку, metadata, описание и действия; упражнения text-first, semantic `<details>` разрешён из-за отсутствия Konsta accordion. По явному выбору пользователя disabled Start/Favorite/Share и applicable UGC actions остаются видимыми с text/non-color cue `Скоро`; technical roadmap copy удаляется.
- **Основание:** standalone review выявил 628 строк custom CSS, legacy web Back/raw header, custom Skeleton, сломанные stale/saved states, technical placeholders и несогласованность с последними Profile/Settings header commits. Последующий screenshot review пользователя выявил пустое/невыстроенное начало workout detail; пользователь явно утвердил перенос названия из hero Card в page heading.
- **PRD:** уточняет presentation S-MA-021/022 в рамках §13/§19 без изменения routes, API, React Query, save mutation или visibility contracts.
- **Влияет на:** DEC-028/029/035/041/047/048/050/053, E0-D0-T05, S-MA-021/022, YouTube/workout state evidence, HANDOFF.

### DEC-052 — App-owned navigation history для Telegram BackButton

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** native Telegram BackButton становится history-aware на всех AppShell routes, включая пять tab pages; правило DEC-048 `top-level => hide()` superseded. Provider маркирует Next/browser history entries session-scoped `{session,index,url}` state, сохраняет Next fields, различает push/replace/pop и не выходит за границу запуска Mini App. Distinct Tabbar переходы используют push; повторный tap active tab — no-op. При `index>0` Back выполняет `router.back()`; rapid events блокируются до pop/path completion. При direct entry index 0 используются contextual replace-fallbacks: Settings→Profile, YouTube/workout/author/safety→Catalog, Profile и exact tabs→Home, будущие child routes→свой tab parent. Back скрывается только на Home boundary index 0; там Bot API 6.2+ `enableClosingConfirmation()` защищает Close/X, а при доступном Back confirmation отключается. Native Close/X по-прежнему нельзя перехватить, скрыть или запретить; подтверждённое пользователем закрытие завершает Mini App.
- **Основание:** пользователь потребовал Home→Yoga→Back→Home и Settings→Tracks→Back→Settings, а также защиту от accidental exit после серии Back. Empirical Next App Router probe подтвердил, что push создаёт entry без custom marker, поэтому provider может безопасно stamp state; browser/mock verification закрывает active-tab duplicates, rapid clicks, direct fallbacks, reload/back/forward и root confirmation.
- **Источник:** official Telegram Mini Apps docs — BackButton Bot API 6.1 (`show/hide/onClick/offClick`) и closing confirmation Bot API 6.2 (`enableClosingConfirmation/disableClosingConfirmation`).
- **PRD:** уточняет shared shell/back/close behavior §9/§38 без изменения routes или domain flows.
- **Влияет на:** DEC-032/043/047/048, E0-D0-T05, AppRouteShell/TelegramBackButton/AppShell, Telegram typings, AGENTS/FRONTEND_REVIEW/flow inventory/HANDOFF.

### DEC-053 — Shared workout media card и in-app YouTube player

- **Статус:** approved exception
- **Дата:** 2026-07-16
- **Решение:** S-MA-020/021 используют один Flowly-specific `WorkoutMediaCard`, потому что Konsta не предоставляет domain workout-card component. Composite не переопределяет anatomy Konsta и только размещает direct `Card/Badge/Button`, cover Image, visual two-line title, compact one-line metadata и domain icon-action slot; Catalog и YouTube различаются только behavior/actions. Full title остаётся в DOM/native title/detail; reserved two-line min-height отсутствует, поэтому one-line и two-line cards отличаются ровно на одну строку без пустой slab; cover/timecode/padding/typography/metadata/action geometry едины. S-MA-021 и YouTube workout detail не открывают внешний Watch link: tap по cover открывает shared fullscreen `YoutubePlayerPopup` из direct Konsta `Popup/Navbar/Button/Preloader`. Единственный raw `iframe` — approved minimal media exception из-за отсутствия Konsta player; используется `youtube-nocookie.com`, `autoplay=1`, `playsinline=1`, 16:9 edge-to-edge player ≥200px high at 360px, CSP `frame-src` allowlist, explicit close, Escape, focus restore, background inert/aria-hidden и scroll lock. Popup close unmounts iframe и останавливает playback.
- **UX/content:** один timecode на cover, two-line list title и одна compact metadata line; source/format включаются текстом только где нужны для mixed Catalog, а redundant YouTube badges отсутствуют; localized Russian views/publication metadata; duplicate duration и external `Смотреть` удалены. YouTube Save и Catalog favorite являются compact 44px bookmark/check icon actions вместо большой text-button. YouTube Search cards и YouTube workout detail используют единый `YoutubePlayButton`, собранный через shared `GlassIconButton`: точная documented Konsta Navbar action composition `Glass → clear rounded Button 44×44 → inherited primary Lucide icon 20×20` с native Glass highlight/pressed effects. Catalog cards play не показывают и открывают detail. Local bare/white play icons, custom glass и размерные варианты запрещены. Native 32×32 Konsta Searchbar clear отключён в Catalog/YouTube и заменён conditional direct 44×44 clear Button.
- **Основание:** пользователь указал на drift и разную высоту Catalog/YouTube cards, назвал YouTube лучшим baseline и поручил провести его review/fix. Явно выбраны: YouTube-after-review baseline, затем screenshot-approved YouTube-like two-line title + icon action; финальный screenshot feedback удалил redundant badges и reserved empty title height, domain-specific actions, shared Card exception, fullscreen Popup, Search+Detail scope, autoplay after tap и shared Player/raw iframe exception. Official YouTube embed docs требуют player ≥200×200 и поддерживают `playsinline`; Apple HIG guidance для video предпочитает fullscreen media presentation.
- **Ограничения:** iframe UI/branding контролирует YouTube и может предложить переход на YouTube; Flowly cover/action сами внешнюю навигацию не выполняют. Telegram WebView может заблокировать autoplay, тогда остаётся native Play внутри player; embedding может быть запрещён отдельным видео. Требуется real-device Telegram iOS/Android rerun.
- **PRD:** уточняет presentation/playback S-MA-020/021/022 в рамках §12–13/§19 без изменения API, cache, save mutation или video download/storage contracts.
- **Влияет на:** DEC-028/035/050/051, E0-D0-T05, S-MA-020/021/022, `apps/web/components/workouts/workout-media-card.tsx`, `apps/web/components/youtube/youtube-player-popup.tsx`, Catalog/YouTube/workout detail, CSP, screen contracts, HANDOFF.

### DEC-055 — Native Telegram chrome следует выбранной теме Flowly

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** resolved theme owner `KonstaProvider` при initial sync и каждом browser/Telegram/local theme event передаёт фактический Flowly canvas color в official `WebApp.setHeaderColor` и `setBackgroundColor`, а при Bot API 7.10+ — также `setBottomBarColor`. Для Bot API 6.9+ header принимает точный Flowly RGB; 6.1–6.8 использует supported `bg_color` fallback; ниже 6.1 вызовы не выполняются. Это синхронизирует native Telegram chrome с explicit user-selected Flowly theme, даже если она отличается от Telegram `colorScheme`.
- **Ограничение:** Telegram SDK не предоставляет отдельный API foreground/status-bar icon color. Клиент Telegram обязан автоматически выбрать контрастные native icons по переданному header color; итог на iOS/Android подтверждается только real-device rerun. BotFather loading-screen colors не заменяют runtime SDK sync.
- **Основание:** real iPhone repro в light Flowly theme показал белые status/time/battery icons на `#f7f6f2`, потому что приложение меняло только web DOM/Konsta theme и никогда не уведомляло native Telegram header.
- **Источник:** official Telegram Mini Apps docs — Bot API 6.1 `setHeaderColor`/`setBackgroundColor`, 6.9 arbitrary header RGB, 7.10 `setBottomBarColor`; отдельного status icon foreground setter нет.
- **Влияет на:** DEC-035/047, E0-D0-T05, KonstaProvider, Telegram SDK typings, FRONTEND_REVIEW, AGENTS, HANDOFF.

### DEC-054 — Media-first adaptive workout detail

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** все `/workouts/[id]` используют одну adaptive media-first hierarchy для Flowly/YouTube/saved YouTube/UGC. Hero direct Konsta `Card` начинается cover 16:9; YouTube cover запускает DEC-053 player; ниже — semantic H1 максимум 3 visual lines с full DOM/native title, одна metadata line `source · format · duration · difficulty` и только meaningful description. Separate chips/badge/action clutter удаляется. Exercises остаётся обязательной видимой секцией: реальные exercises используют compact Konsta List; отсутствие данных показывается одной disabled ListItem `Будут добавлены позже` + Badge `Скоро`, а не error/unavailable Card. Start/Favorite/Share и applicable UGC future actions остаются видимыми по прямому требованию пользователя, но собраны в compact disabled Konsta List rows с icons + text cue `Скоро`, без fake mutation и giant disabled CTA. `Сведения` используют approved semantic `<details>` gap DEC-051 внутри direct Card `contentWrap={false}`: 68px summary row с info artwork, subtitle, chevron/open rotation и full focus target; content содержит contraindications/equipment/categories/source/author. Section rhythm принадлежит `.flow-screen`; internal BlockTitle/List margins обнулены, sections используют один 8px internal gap без compounded empty slabs.
- **Основание:** пользователь отклонил весь saved YouTube detail как визуально плохой; exact current screenshot подтвердил title-first duplication, chips, empty exercise error-card, oversized disabled actions и неочевидный collapsed details. Пользователь выбрал весь workout-detail family, Cover→title→meta и потребовал не скрывать будущие функции, а оформлять их корректными disabled states. Follow-up screenshots отдельно потребовали убрать большие пустые интервалы и сделать `Сведения` явно интерактивными.
- **Verification:** saved YouTube ID `019f6a1f-fcca-7875-b38c-282f16685e00`, Flowly `wo-balance-basic-15`, seeded YouTube `wo-yt-malova-vinyasa-24`, forced loading/error/offline/hidden; 360/390/430 light/dark targeted pass: overflow 0, targets <44 = 0, H1 present, shell nav present, console errors 0. Saved player 390×219, background inert, focus Close; 200% text overflow/small targets/hero overflow = 0. Saved detail height fits viewport reserve (940px document, bottom scroll 96px), details summary/card 68/70px after `contentWrap={false}` fix. Evidence `.temp/E0-D0-T05/screenshots/workout-saved-youtube-{before,after}-390-dark.png`, `workout-flowly-after-360-light.png`.
- **PRD:** presentation clarification for §13–14 without changing workout data/action contracts.
- **Влияет на:** DEC-028/035/051/053, E0-D0-T05, S-MA-022, `workout-detail-screen.tsx`, workout state evidence, AGENTS/FRONTEND_REVIEW/HANDOFF.

### DEC-056 — Bottom Tabbar скрывается во время mobile text entry

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** shared `AppShell` централизованно отслеживает document focus. На Telegram `ios|android|android_x` или coarse-pointer device фокус доступного text-entry (`input` кроме non-text types/readonly/disabled, `textarea`, editable content) полностью unmounts direct Konsta `Tabbar` и меняет main reserve `pb-safe-24` → `pb-safe-4`; top Navbar и текущий route сохраняются. После blur (включая переход между controls через next animation frame) Tabbar и полный reserve возвращаются без анимации. Checkbox/radio/toggle и desktop keyboard focus не скрывают navigation. Все будущие inputs внутри AppShell/Sheets наследуют contract автоматически, без local handlers.
- **Основание:** real iPhone Telegram repro на Settings, Catalog и YouTube показал fixed Tabbar непосредственно над software keyboard, где он уменьшает полезную область и выглядит как competing keyboard toolbar.
- **Ограничение:** Telegram SDK не предоставляет keyboard visibility API, а `viewportChanged`/VisualViewport также реагируют на fullscreen, safe-area и native chrome. Поэтому deterministic mobile text-focus является source of truth; если клавиатура закрыта без blur и input остаётся focused, Tabbar остаётся скрыт до blur.
- **Влияет на:** DEC-032/035/043, E0-D0-T05, AppShell, all current/future ListInput/Searchbar/textarea/contenteditable surfaces, AGENTS, FRONTEND_REVIEW, HANDOFF.

### DEC-057 — Unified catalog sources overview

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** source-type pseudo-author pages `/authors/flowly` и `/authors/youtube` удаляются без redirects. Flowly и YouTube — источники каталога, не авторы; они объединяются на одном internal route `/sources` / S-MA-025 с shared PrimaryNavbar `Источники`. Future `/authors/[id]` резервируется только для реальных public user author profiles S-MA-024. `/sources` показывает две независимые sections Flowly/YouTube: concise description, horizontal snap preview из 3 shared DEC-053 `WorkoutMediaCard`, затем direct Konsta link-button `Все тренировки …` в настоящий `/catalog?source=...` filter. Source sections query independently through React Query; loading/error/empty/partial-success не скрывают соседний источник. Semantic outline: H1 `Источники` → H2 source sections → H3 preview workout titles through explicit shared-card heading level. Top-level source H2 neutralize default Konsta BlockTitle safe padding (`!px-0`) and align to the same page edge as description/cards. Legacy `AuthorProfileScreen`, CSS Module, raw header/back, `Skeleton/InlineError`, source hide/block explanatory Cards и mini-card implementation удаляются. Workout details link to `/sources`; current UGC safety cancel/back uses Catalog until real author IDs exist.
- **Основание:** пользователь спросил, зачем Flowly/YouTube представлены двумя author pages, и approved объединение на `/sources`, deletion without redirects, future real-author reservation и previews `3 карточки + все`. Code audit подтвердил, что обе URL уже использовали один `[source]` component, но UX/model были ошибочными и оставались legacy pre-Konsta UI.
- **Verification:** pre-push code-only safe-area/header parity audit (user explicitly prohibited Playwright MCP): `/sources` and `/youtube` both render direct shared `PrimaryNavbar` immediately before `main.flow-screen`, outside page padding; exact mobile gating, additive system+content insets, effective `max(44px, composed top)`, negative parent-inset compensation, final-44 title position and DEC-047 blur-layer selector PASS. Audit also found/fixed `/sources` missing from AppRouteShell workouts-tab mapping; native Back fallback already covered it. `/sources` 360/390/430 light/dark: document overflow 0, targets <44 = 0, Flowly/YouTube headings visible, exactly 3+3 previews, carousels scroll internally without document overflow, shell nav persists. Forced loading/error/empty/flowly-error/youtube-error PASS with independent partial success. 200% text overflow/small/card-overflow = 0. Card click → `/workouts/wo-balance-basic-15`; `/catalog?source=youtube` returns only 5 current YouTube cards; old `/authors/flowly|youtube` HTTP 404; console errors 0. Root typecheck/lint/build/diff-check PASS. Evidence `.temp/E0-D0-T05/screenshots/sources-390-dark.png`.
- **PRD:** уточняет presentation §12.1/§13.2 without changing catalog source or future public-author contracts.
- **Влияет на:** DEC-028/029/032/035/052/053/054, E0-D0-T05, F03, new S-MA-025, S-MA-024 future scope, `/sources`, Catalog source filter, workout detail links, UGC safety fallback, flow inventory/HANDOFF/AGENTS.

### DEC-058 — Telegram-safe fullscreen media overlay

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** shared YouTube player remains a direct Konsta `Popup`, but Telegram mobile composition is action-free: shared `SafeAreaTitleNavbar` places `Видео` inside the final 44px of the composed `--component-safe-area-top`, local Close is absent, Popup reserves the full composed top inset, and the 16:9 iframe is contained below it in portrait/landscape. Desktop/web retains direct Konsta Navbar + 44px Close. `TelegramBackButton` owns a LIFO modal override stack; while player is open, native Back closes only the top overlay, preserves route/history index and restores trigger focus, then normal history behavior resumes.
- **Основание:** real iPhone landscape repro on `/workouts/019f6a1f-fcca-7875-b38c-282f16685e00` showed generic Popup Navbar fixed at Konsta default 16px: title overlapped status area, local Close overlapped battery/native chrome, and full-width 16:9 media could extend above the composed inset. Local canonical repro with `--component-safe-area-top:100px` measured Navbar padding 16px/title y27/Close y16.
- **Ограничение:** native Telegram controls and rotation geometry require final real-device portrait/landscape rerun. Any future fullscreen Popup must name exactly one safe-area owner and register modal Back instead of adding a control inside native chrome.
- **Влияет на:** DEC-047/052/053/055, E0-D0-T05, TelegramBackButton/AppRouteShell, PrimaryNavbar geometry, YoutubePlayerPopup, YouTube Search/workout detail, AGENTS, FRONTEND_REVIEW, HANDOFF.

### DEC-059 — Exact Konsta Glass icon actions

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** standalone icon actions Profile, Catalog filter и YouTube play используют один `GlassIconButton`, точно повторяющий source composition Konsta Navbar action: direct `Glass` с default light/dark glass colors, shadows, backdrop blur и enabled iOS highlight оборачивает direct clear rounded `Button` 44×44 и default inherited-primary Lucide icon 20×20. Play дополнительно использует только absolute centering wrapper в `YoutubePlayButton`; в Catalog cards play отсутствует и cover открывает detail. Timezone Sheet Searchbar получает symmetric 16px horizontal layout inset, поскольку Searchbar `className` не применяется Konsta 5.2.0.
- **Основание:** screenshot review выявил bare play без подложки, затем custom circle, не совпадающий с documented Konsta Close glass по размеру, цвету и interaction effects; отдельные screenshots потребовали тот же Glass contract для filter/Profile и inset для timezone search.
- **Влияет на:** DEC-036/043/050/053, E0-D0-T05, GlassIconButton/YoutubePlayButton, Home/Catalog/YouTube/workout detail/TimezonePicker, AGENTS, FRONTEND_REVIEW, HANDOFF.

### DEC-060 — Next-native media paint without route flicker

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** production artwork icons use the DEC-037 inline same-document SVG sprite, so route remounts never depend on an external sprite request. Production `next/image` instances use only official Next.js 16 behavior: `preload` for unique hero/LCP media, `loading="eager"` for above-the-fold images, default/lazy loading for remaining cards, `placeholder="blur"` with one shared lightweight `blurDataURL`, and `decoding="sync"`. A custom session URL/image cache is explicitly rejected; application routing, media URLs and visual layout remain unchanged.
- **Основание:** canonical Catalog → Programs → Catalog Chromium repro recorded `/icons/lucide.svg` as initial `200` plus repeated route-level `304`; icon `<use>` nodes were recreated on each route. Cached lazy card images could initially expose empty `currentSrc` before the next paint. Пользователь approved inline sprite fix and then explicitly selected «только Next»: official preload/eager/lazy+blur behavior without custom URL cache.
- **Verification:** post-fix frame sampling at 0/16/50/100/250/500ms keeps the previous route until commit and shows complete Catalog images on the first captured new-route frame; all icon refs are local `#icon-*`, `/icons/lucide.svg` responses are zero, repeated YouTube thumbnail is served from disk cache. All five production `Image` sites have sync decode + blur placeholder, deprecated `priority` usages are zero. Root typecheck/lint/build, OpenNext/Cloudflare deploy-check and diff-check PASS.
- **Ограничение:** real Telegram iOS/Android WebView paint still requires device confirmation; below-fold lazy images may briefly show the approved blur placeholder rather than a blank surface.
- **Влияет на:** DEC-037/053/054, E0-D0-T05, root layout, `@flowly/ui/Icon`, Home, onboarding, Catalog, Sources, YouTube Search and workout detail.

### DEC-061 — Tabbar только на exact top-level routes

- **Статус:** approved
- **Дата:** 2026-07-16
- **Решение:** shared bottom Konsta Tabbar рендерится только на пяти exact roots `/`, `/catalog`, `/programs`, `/rhythm`, `/calendar` на всех platforms; query params root classification не меняют. Любой другой текущий или будущий AppShell pathname автоматически internal: `/profile`, `/settings`, `/youtube`, `/workouts/[id]`, `/sources`, `/safety/[action]` скрывают Tabbar и используют `pb-safe-4` вместо navbar reserve `pb-safe-24`. Top/internal Navbar, persistent AuthGate/AppShell и native Telegram Back/history остаются; возврат на exact root восстанавливает Tabbar без full reload/remount.
- **Основание:** пользовательский UX review сценария Home→Profile→Settings показал, что persistent Tabbar делает child pages визуально равноправными основным разделам и конфликтует с Apple-like navigation hierarchy. Пользователь явно выбрал all internal routes на mobile+desktop.
- **Ограничение:** новый top-level tab может появиться только через явное approved изменение exact root set/shared mapping; local page-level hide/show props запрещены.
- **Влияет на:** DEC-032/043/052/056, E0-D0-T05, AppRouteShell/AppShell, all current/future product routes, AGENTS, FRONTEND_REVIEW, HANDOFF.

### DEC-062 — Persisted YouTube video session lifecycle

- **Статус:** approved
- **Дата:** 2026-07-17
- **Решение:** E2-D3-T01 использует отдельную persisted entity route `/sessions/[id]`; Start доступен только workouts формата `video` с `youtubeVideoId`. Единственная open session обеспечивается partial unique D1 index. Реальное active time считается по official YouTube IFrame Player API events; ended/back/app-close/player-error не выбирают final status. Session checkpoint сохраняется server-side каждые 15 секунд active playback и на pause/resume/pagehide/unmount, а monotonic local snapshot — во время active timer и синхронно перед route leave; stale response не может уменьшить local progress, equal-token local state автоматически восстанавливается/retry-ится, divergent `updated_at` показывает явный S-MA-034 выбор server/device без cross-version auto-merge. Session state — `open|closed`, pause определяется `paused_at`. Finish требует явный один из пяти DEC-015 statuses и атомарно создаёт minimal `activity_occurrences` + initial `status_history`; повторный finish идемпотентен. Direct-entry fallback `/sessions/*` ведёт в Catalog, обычный history Back оставляет session open. Same-workout detail показывает `Идёт сейчас` + elapsed + direct `Продолжить`; other-workout conflict и final status используют bottom Konsta Sheets; final status при каждом открытии по умолчанию `completed`, comment раскрывается по запросу, Cancel сбрасывает draft к этому default. Exercise duration располагается под title без right column. Active elapsed не имеет artificial cap и считает только IFrame `PLAYING`, включая повторы; pause/buffering/ended/open-idle не растут, UI использует `m:ss`/`h:mm:ss`. YouTube playback position хранится server+local отдельно от active elapsed и восстанавливается через `seekTo`; при server/device elapsed delta `<1s` server snapshot применяется автоматически без S-MA-034 Sheet, а explicit conflict остаётся для delta `>=1s`. E2-D3-T02 step/mixed начинается отдельной следующей карточкой сразу после acceptance T01.
- **Основание:** пользователь выбрал `/sessions/[id]`, YouTube IFrame API, немедленную occurrence persistence и server+offline checkpoint. PRD §14.1/14.4/15 требует active-time, pause, open-session resume, максимум одну session и отсутствие автозавершения; F04 требует explicit conflict/sync outcomes.
- **Ограничение:** Flowly video без исполняемого media остаётся disabled с причиной; step/mixed runtime относится к E2-D3-T02, calendar visualization/correction — E6-D7. Raw iframe остаётся единственным shared DEC-053 media exception; новый iframe implementation запрещён.
- **Verification:** local migration 0006 PASS; canonical HTTP Start/checkpoint/stale conflict/forced device/finish/idempotency PASS; все пять final statuses создают occurrence, initial history count=1; 360/390/430 session route overflow 0, Tabbar 0, IFrame URL содержит `enablejsapi=1`, `origin`, `playsinline=1`; Home real resume, historical no-default final Dialog и three-way Start conflict PASS; current approved Sheet defaults to `completed`; console errors 0. User screenshot review rejected initial Dialog/exercise/checkpoint UX; approved correction v2 implemented. Canonical pre-fix short-progress repro: actual 0:03 → SPA Back → local/server 0. Post-fix muted controlled Player API rerun: 0:03 → local/server 3 → restored 0:03; Pause preserves exact iframe Y/height and Card height while status changes only `Идёт тренировка`→`Пауза`. Final Sheet has default `completed` and enabled Done; other-active vertical Sheet, compact Home resume, full elapsed and responsive exercises screenshot checks PASS. Exact prior-detail→Home→Continue→session browser Back and mocked native Back both return Home with marker index 1→0; reported unrelated-detail return is not reproduced without the user's exact route into Home. Playback-position/sub-second correction v3 explicitly approved and implemented: migration 0007 adds non-negative `playback_position_seconds`; checkpoint 12s/position37 then 12s/position38 persists independently; finish/repeat keeps position38 and one occurrence. Muted browser stale-token equal-elapsed repro auto-applies server with no dialog, rebases local token/position38 and invokes `seekTo(38)`. Production commit `b69e190`, deploy run `29579333079` PASS including remote migrations 0006/0007; route/API smoke passed. Real iPhone follow-up found final Sheet footer too close to rounded edge and Dynamic Type horizontal scroll; footer now adds one 8pt spacing step (`pb-safe-6`), comment action is width-bounded/wrappable and Sheet/content clamp X overflow. Muted 200% check: document/body/Sheet overflow=0, footer bottom gap=48px at doubled root scale, console errors=0. Real Telegram Player API/autoplay remains required before final done.
- **Влияет на:** DEC-015/016/029/032/035/052/053/061, E2-D3-T01/T02/T05, S-MA-010/012/022/030/033/034/072/073, workout detail, Home, AppRouteShell/TelegramBackButton, database schema, future Calendar.

### DEC-063 — YouTube result materialization и report source mapping

- **Статус:** approved
- **Дата:** 2026-07-17
- **Решение:** основная область `WorkoutMediaCard` на `/youtube` идемпотентно materialize/reuse private published `format=video`, `source_type=youtube` workout и открывает shared `/workouts/[id]`; отдельная Play action сохраняет DEC-053 fullscreen player и не создаёт workout. Existing save и новый PRD `create-workout` endpoints используют один shared service + DB uniqueness invariant. Generated YouTube detail переиспользует Hero/ActionPanel/session и скрывает только empty Exercises/Details; seeded YouTube workouts с реальными exercises их сохраняют. Finish использует общий occurrence/history contract. Calendar/report source определяется relation `activity_occurrences.entity_id → workouts.id → source_type`; E6 обязан возвращать `activitySource=youtube` и показывать text Badge `YouTube`. Partial report UI сейчас не создаётся.
- **Основание:** пользователь явно выбрал card→detail, materialization при первом открытии, сохранение отдельной Play action, отсутствие copy-paste и report data contract сейчас при сохранении полного UI в E6. PRD §19.3/§44.5 требует просмотр, сохранение и создание тренировки из YouTube result.
- **Ограничение:** E2-D3-T01 закрыта `done`, `.temp/E2-D2-T08/plan.md` approved; нельзя создавать virtual detail/player/session ветку или denormalized report source без нового решения.
- **Verification:** migration 0008 local PASS; concurrent Save/Create returns one ID under DB unique index; generated detail/session/Finish PASS; occurrence join returns `source_type=youtube`; 360/390/430 generated detail has no empty Exercises/Details, overflow or small targets; full checks PASS. Production preflight/deploy and user UI approval pending.
- **Влияет на:** DEC-029/053/054/062, E2-D2-T04/T08, E2-D3-T01/T05, E6-D7-T01/T02/T03/T05/T06, S-MA-020/022/030/072, WorkoutMediaCard, YouTube search/save, workout detail, calendar/report selectors.

### DEC-064 — Own workouts constructor (E2-D3-T03) deferred until demand

- **Статус:** approved
- **Дата:** 2026-07-19
- **Решение:** E2-D3-T03 (private own-workout CRUD, exercise editor, R2 media upload, S-MA-040…045) **не выполняется** в текущем v1 path. Карточка в статусе `blocked` с product reason: core product закрыт Flowly catalog + YouTube materialization + step/video sessions; user-built workouts/uploads не нужны, пока не появится явный спрос. Возобновление — только по явному запросу пользователя (`blocked -> in_progress`). Не удалять карточку и PRD §16; sharing/public (S-MA-043 / этап 7) остаётся зависимым от T03, если/когда T03 возобновят.
- **Основание:** user 2026-07-19 после start T03: «функциональность нахуй не нужна… может когда-нибудь потом если появится потребность».
- **PRD:** §16, §44.13, §46 — scope preserved as future, not cancelled from product forever.
- **Влияет на:** E2-D3-T03 (blocked); E2-D3-T05 DoD own-workout criteria N/A; E7-D8-T03 (own-workout share latent; habit share not blocked by T03 alone); E7-D8-T04/T07 notes (transitive / DoD N/A); PRD §16 preserved as future.

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
