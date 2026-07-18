# Flowly — правила работы AI-агентов

Этот файл обязателен для любого AI-агента и любого agent harness, работающего с проектом.

## Источники истины

1. `docs/PRD.md` — утверждённые требования Flowly v1.0.
2. `docs/roadmap/README.md` — индекс, общий статус и текущий фокус.
3. `docs/roadmap/stages/*.md` — kanban-задачи этапов и критерии готовности.
4. `docs/roadmap/DECISIONS.md` — подтверждённые и ожидающие решения.
5. `docs/roadmap/HANDOFF.md` — точка продолжения работы другим агентом.

Нельзя расширять требования PRD по предположению. Неясность фиксируется в `DECISIONS.md`, а задача переводится в `blocked`.

## Обязательный workflow каждой задачи

### Перед работой

1. Прочитать `docs/roadmap/README.md` и `docs/roadmap/HANDOFF.md`.
2. Найти карточку по ID в файле этапа.
3. Проверить `depends_on`, `prd_refs`, acceptance criteria и поле `decisions`.
4. Полностью прочитать каждую связанную запись `DEC-*`; для superseded-решения применять заменивший DEC. Для UI/UX-задачи также прочитать `docs/design/flows/README.md`, связанные screen/flow diagrams и state contracts.
5. Убедиться, что нет другой задачи со статусом `in_progress` у текущего исполнителя.
6. Изменить статус выбранной задачи с `backlog` на `in_progress` и сразу обновить:
   - `updated` карточки;
   - сводку этапа;
   - общий индекс;
   - `HANDOFF.md`.

### Во время работы

- Linked `DEC-*`, stage-level «Обязательные подтверждённые contracts» и `docs/design/flows/**` являются обязательной частью scope карточки, а не рекомендациями.
- По `DEC-024` production UI обычно проектируется в реальном `apps/web` итерациями «один screen slice + все применимые states/интеракции». Scripts не генерируют дизайн. Следующий screen slice нельзя начинать до явного approval текущего; route/component, scenarios, screenshots/checks и формулировка approval фиксируются в карточке/HANDOFF. Исключение: approved системная миграция E0-D0-T05 по `DEC-035` выполняет все текущие frontend surfaces одним проходом и получает единый user review только после полного migration/verification pass.
- По `DEC-035` **Konsta UI 5.2.0 (`konsta/react`) обязательна как единственная базовая component/design library для всего текущего и будущего production frontend Flowly**. Использовать только `theme="ios"`, системную iOS-типографику и Flowly brand colors через официальный Tailwind/Konsta theme contract. Каждый визуальный или интерактивный элемент — button, link-action, input, textarea, select/picker, searchbar, list/list item, card/surface, dialog/sheet/popup, segmented control, chip, badge, toggle, radio, checkbox, progress/preloader, navbar/tabbar, title/block title и feedback state — обязан использовать прямой Konsta component, если он существует. Запрещены raw `<button>`, `<input>`, `<select>`, `<textarea>` и самописные visual controls/surfaces через `<div>`/`<span>` + CSS при наличии Konsta-аналога.
- **Konsta migration обязана удалять, а не оборачивать legacy UI.** Любой код/CSS из `packages/ui`, app-local wrappers, legacy `.flow-*`, самописные cards/buttons/fields/chips/badges/navigation и связанные styles, которые дублируют Konsta, удаляются вместе со всеми usages. Нельзя сохранять старый component «временно», делать wrapper с тем же API или стилизовать raw HTML так, чтобы он имитировал Konsta. `packages/ui` допустим только для действительно Flowly-specific composite/contract, которого нет в Konsta; каждое исключение заранее останавливает работу и требует явного approval пользователя, записи в `DECISIONS.md`, code comment с DEC-ID и evidence отсутствия эквивалента в Konsta. Если package пуст — удалить package, workspace/dependency references и `/ui-kit`; если approved composites остаются — `/ui-kit` содержит только их.
- **Минимизировать DOM и CSS.** Лишние `<div>`/`<span>`/wrapper layers запрещены. Семантический HTML (`main`, `section`, `header`, `nav`, headings, text) и layout wrapper допустимы только когда Konsta не предоставляет нужную структуру и элемент действительно нужен для semantics/layout; visual role таким wrapper не назначается без approved exception. CSS Modules разрешены только для domain layout/geometry, отсутствующих в Konsta, Telegram safe-area/shell composition и Flowly brand bridge. Запрещено CSS-ом заново задавать Konsta component anatomy, states, padding, radius, typography, colors, shadows или control sizing.
- **Apple HIG — обязательный quality contract, а не вдохновение.** Каждый screen и каждый control до user review проверяется на iOS visual hierarchy, один явный primary action, правильный control для single/multiple selection, minimum target 44×44pt, safe-area, system typography/text scaling, readable contrast, non-color state cues, focus/keyboard, concise labels, predictable Back/Cancel/Done placement, content density и отсутствие CTA-like styling у обычных options. Каждая кнопка, иконка и interactive state проверяются отдельно в enabled/pressed/selected/focus/disabled/loading/error. Если Konsta не предоставляет нужный icon/contract, нельзя выбирать замену самостоятельно: остановиться и запросить approval конкретного исключения и icon source у пользователя.
- **Icon + label spacing обязателен.** Konsta 5.2.0 не гарантирует gap между вложенной artwork-иконкой и текстом кнопки/option/action, поэтому любой control с icon + label обязан явно задать единый iOS-consistent gap (обычно `gap-2`/8pt) через component utility/API и визуально проверить его во всех применимых states. Иконка и текст не могут соприкасаться, сливаться или выглядеть как один glyph; icon-only controls являются отдельным случаем и обязаны иметь доступный label.
- **Glass icon actions (`DEC-059`):** standalone Profile, Catalog filter и YouTube play actions используют только shared `@/components/glass-icon-button`, exact Konsta source composition `Glass → clear rounded Button 44×44 → inherited-primary Lucide icon 20×20` с native light/dark glass, shadow, blur, iOS highlight/pressed/focus behavior. YouTube Search cards и YouTube detail hero используют `YoutubePlayButton`; Catalog cards play не показывают и открывают detail. Local Glass/Button copies, bare play, custom circles/colors/sizes и disabled highlight запрещены. Timezone Sheet Searchbar всегда имеет symmetric 16px horizontal layout inset.
- **User cleanup signal требует полного code-first удаления мусора.** Если пользователь указывает, что элемент не похож на documented Konsta example, замечает лишний CSS/wrapper/самописный state или прямо просит «вычистить мусор/CSS», агент не патчит один симптом и не изобретает новый стиль. Нужно сразу проверить весь затронутый screen/component family по коду, сверить exact official Konsta composition, удалить все дублирующие CSS Modules/global selectors/local visual wrappers/decorative layers и перейти на прямые Konsta components/props/utilities. Сохраняется только доказанно необходимая domain layout/Telegram safe-area bridge; каждый остаток объясняется. Browser-проверка не подменяет code audit и не запускается, если пользователь явно попросил только анализ/cleanup кода.
- По `DEC-028` любой production frontend screen slice до показа пользователю обязан пройти самостоятельный UI/UX quality pass агентом по чеклисту [`docs/design/FRONTEND_REVIEW.md`](docs/design/FRONTEND_REVIEW.md). Нельзя сдавать экран как техническую заготовку: служебные ID/roadmap-тексты, огромные заглушечные блоки, нерелевантные disabled-actions, fake-buttons/fake-mutations, избыточные рамки/пустоты, плохая визуальная иерархия, несогласованные отступы с соседними экранами и карточки без реального смысла должны быть исправлены до user review. Обязательная браузерная проверка: 360–430px, light/dark, primary content first, адекватная плотность/отступы, релевантные actions, no horizontal overflow, touch targets ≥44px, console errors 0. Если UI вызывает сомнения — сначала провести собственное UI/UX ревью и исправить, не перекладывая разбор на пользователя.
- По `DEC-029` все client-side запросы из `apps/web` к Flowly API должны идти через `@tanstack/react-query` (`useQuery`/`useMutation`) и общий typed API helper. Raw `fetch` в client components/features запрещён; допустим только в общем API helper и server route handlers. После frontend/API изменений проверять audit: `rg -n "\\bfetch\\(" apps/web/app apps/web/components apps/web/features apps/web/lib --glob '!app/api/**' --glob '!**/*.module.css' --glob '!**/*.d.ts'` — ожидаемый raw `fetch` только в `apps/web/lib/api/client.ts`.
- По `DEC-032` product routes обязаны использовать устойчивый shared app shell/layout. Нельзя делать standalone product pages или remount shared shell; persistence shell не означает persistence Tabbar: по DEC-061 bottom navigation рендерится только на exact roots `/`, `/catalog`, `/programs`, `/rhythm`, `/calendar`, а любой иной текущий/будущий pathname является internal и скрывает Tabbar на всех platforms. Query params не меняют root classification; новый tab root требует approved shared mapping, local page-level show/hide запрещён. Нельзя использовать `?screen=`/`?tab=` как product routing. Навигация между product routes не должна вызывать full reload feeling, auth flicker, повторный auth-error/loading screen или remount общего shell. Для Next.js использовать nested `layout.tsx`/route groups, когда это сохраняет shell. Back/cancel placement и page padding должны быть консистентны: один owner внешних отступов (shell или screen), без двойных больших padding. Fullscreen shell обязан вычислять inset по официальной вложенной модели Telegram: `max(iOS env, Telegram safe CSS, SDK safe) + max(Telegram content-safe CSS, SDK content-safe)`; `safeAreaInset` и `contentSafeAreaInset` нельзя объединять через общий `max()`. Floating bottom navbar имеет fixed visual height 64px и exact label font-size 9px на всех пяти tabs; safe inset меняет только bottom offset; общий main reserve обязан оставлять последний content/action выше navbar на exact tab roots (`pb-safe-24`); internal routes без Tabbar используют `pb-safe-4`. Перед user review routing/layout changes обязательны click matrix, nav persistence, safe-area `0/34/48`, last-content clearance, no auth flicker, no `?screen=`/`?tab=`, console errors 0, overflow 0. По DEC-056 на mobile text-entry focus shared AppShell обязан полностью скрывать bottom Konsta Tabbar и сокращать main reserve до `pb-safe-4`, возвращая оба после blur; top Navbar остаётся. Contract централизован и автоматически применяется ко всем будущим text `input`/`textarea`/`contenteditable` в AppShell/Sheets; local keyboard handlers, VisualViewport thresholds и Telegram `viewportChanged` как keyboard detector запрещены без нового approved DEC. Non-text controls и desktop focus Tabbar не скрывают.
- **Header contract внутренних product pages:** Profile, Settings и все будущие дочерние/внутренние страницы используют full-width direct Konsta `Navbar` вне page-padding container; page title — только `Navbar.title`, optional right action — Konsta `Link`/`Icon` в `right`. Web back action внутри internal Navbar запрещён (`DEC-048`): Profile/Settings и будущие internal routes используют тот же action-free fixed/blurred safe-area title contract, а native Telegram `WebApp.BackButton` следует app-owned history contract `DEC-052`: показывается на любом route, включая tabs, когда есть предыдущая session entry или contextual direct-entry fallback; click выполняет один guarded `router.back()` либо approved fallback. Push/replace/pop маркируются session/index state, active-tab tap не создаёт entry, rapid Back не может перескочить несколько routes; handler регистрируется/снимается симметрично без промежуточного `hide()`. Back скрывается только на Home boundary index 0, где включается Bot API 6.2 closing confirmation. Нельзя пытаться перехватить native Close/X — Telegram не предоставляет такой API, а подтверждённое закрытие всегда завершает Mini App. Запрещены самописные `<header>`, отдельные back `Button`, raw title rows, outer padding вокруг Navbar и CSS, имитирующий navbar. Для Konsta `ListItem` с `linkComponent="button"` clickable content обязан занимать всю строку через `contentClassName="w-full"`, а text alignment сохраняется через `innerClassName="text-left"`; запрещено передавать `linkProps.className`, потому что оно заменяет внутренние Konsta anatomy classes.
- **Header contract основных tab pages (`DEC-043`):** exact top-level routes Главная `/`, Йога `/catalog`, Программы `/programs`, Ритм `/rhythm`, Календарь `/calendar` получают один full-width direct Konsta `Navbar` из shared `AppShell`, до page content и вне его padding. На Home centered `Navbar.title` показывает только Flowly name пользователя; отдельный greeting/subtitle block запрещён. На остальных основных pages centered title использует domain title (`Йога`, `Программы`, `Ритм`, `Календарь`); compact bottom-tab aliases `Треки`/`Дневник` разрешены только DEC-045 и не переименовывают route/screen. Fixed primary Navbar не содержит `left`/`right` actions; Telegram avatar URL нельзя сохранять, проксировать или рендерить (`DEC-046`). Только Home content начинает отдельная строка `Твой план` + справа direct Konsta icon-only profile action с постоянной `user-round` artwork (`aria-label="Открыть профиль"`, `/profile`, target ≥44px); Settings доступен через Profile. Visual web Back на top-level pages запрещён; native Telegram Back может быть видим на любом tab route по app-history contract DEC-052. Нельзя дублировать route title в raw header/Chip над content; новые top-level tab pages добавляются через shared shell mapping, а не собственный Navbar. Fullscreen Navbar следует DEC-047: root starts at `top-0`, рендерится только при Telegram platform `ios|android|android_x`, владеет `--k-safe-area-top: max(44px, var(--component-safe-area-top))` и компенсирует parent padding отрицательным margin. Primary title sits 22px above the effective inset bottom (center of its final 44px), avoiding iPhone notch/native controls while remaining visible at mobile inset 0; desktop/web Navbar is absent, пустой Konsta action row collapsed to 0; approved `.primary-navbar > :first-child` selector ограничивает blur только safe-area из-за отсутствия Konsta API. Любое другое вмешательство в Navbar anatomy запрещено. По DEC-055 resolved Flowly canvas theme обязательно синхронизируется с native Telegram `setHeaderColor`/`setBackgroundColor`/applicable `setBottomBarColor`; отдельного status-icon foreground API нет, поэтому контраст native time/signal/battery проверяется на real device.
- **Fullscreen overlay contract (`DEC-058`):** каждый fullscreen Popup обязан назвать одного owner composed Telegram safe area и проверить portrait/landscape. На Telegram mobile media overlay использует action-free shared `SafeAreaTitleNavbar` в final 44px composed top inset, не рендерит local Close рядом с status/battery/native controls, резервирует inset перед content и содержит media ниже него без overflow. Native Back обязан закрывать top overlay через shared LIFO override stack, не менять route/history и после close восстанавливать trigger focus; desktop/web сохраняет direct Konsta Navbar + 44px Close. Generic Popup Navbar с default 16px inset, raw fixed header и per-overlay BackButton handlers запрещены.
- **Timezone picker contract:** onboarding preferences и profile settings переиспользуют единый `@/components/timezone-picker` (DEC-036/041), собранный только из direct Konsta `Sheet/Navbar/Searchbar/List/ListItem`. Запрещены дублирующие app-local реализации и legacy `packages/ui` `Select`/`TextField` для этого flow.
- **Workout media card + YouTube player contract (DEC-053):** Catalog и YouTube results обязаны переиспользовать единый `@/components/workouts/workout-media-card`; дублирующие card anatomy/spacing/cover/timecode/title/meta реализации запрещены. Composite использует direct Konsta primitives, two-line visual title clamp, one compact metadata line containing applicable source/format/domain attributes, с полным accessible/native title и compact domain icon action; normal-state cards use content-driven compact height without reserved empty title space; one-line and two-line titles may differ by exactly one text line. YouTube cover в Search и YouTube workout detail открывает только shared `@/components/youtube/youtube-player-popup`; app-owned external Watch links запрещены. Единственный raw iframe разрешён только внутри shared `@/components/youtube/youtube-iframe-player` family по DEC-053/062 (`youtube-nocookie`, CSP allowlist); Popup сохраняет focus/inert/Escape/scroll-lock/unmount contract, session route переиспользует тот же player. Другие iframe/player implementations требуют нового approval.
- **Workout detail contract (DEC-054):** все Flowly/YouTube/saved/UGC details используют одну media-first hierarchy: 16:9 cover → H1≤3 visual lines/full accessible title → one-line metadata → meaningful description. Separate chips, duplicated badges, hero quick-actions, unavailable/error cards и giant disabled CTA запрещены. Exercises и future actions не скрываются: реальные exercises — compact Konsta List; отсутствующие exercises и Start/Favorite/Share/UGC future functions — compact disabled ListItem rows с text Badge `Скоро`. Section wrappers own only 8px internal gap; BlockTitle/List margins обнуляются, чтобы `.flow-screen` оставался единственным owner inter-section rhythm. `Сведения` — единственный DEC-051 semantic details exception внутри direct Card `contentWrap={false}`, с ≥44px summary, info/subtitle/chevron и visible focus.
- **Video session contract (DEC-062):** единственный video runtime route — `/sessions/[id]`; Start enabled только для `video` workouts с `youtubeVideoId`. Максимум одна `open` session обеспечивается D1 partial unique index. Shared YouTube IFrame API events являются единственным owner active-time; ended/back/app-close/player-error не закрывают session и не выбирают status. Server checkpoint каждые 15 секунд + pause/resume/pagehide/unmount дополняется monotonic per-second local snapshot; StrictMode rehearsal не может flush-ить session, stale response не уменьшает время, equal-token local автоматически восстанавливается/retry-ится, divergent token показывает explicit server/device choice без cross-version merge. Active elapsed не capped, растёт только на `PLAYING` и форматируется `m:ss`/`h:mm:ss`; YouTube playback position является отдельным server+local полем и восстанавливается `seekTo`. Divergent token при elapsed delta `<1s` автоматически принимает server без Sheet; delta `>=1s` требует explicit server/device choice. Finish Sheet каждый раз starts with `completed`, позволяет явно сменить любой из пяти DEC-015 statuses и атомарно создаёт occurrence/history. Step/mixed runtime расширяет этот же contract в E2-D3-T02, не создаёт параллельную session/player architecture.
- **YouTube result→workout contract (DEC-063):** `/youtube` result main-open materialize/reuse private `source_type=youtube` workout через один shared server service + DB uniqueness и ведёт в существующий `/workouts/[id]`; Play остаётся shared Popup и не создаёт workout. Save/create endpoints не дублируют metadata/insert logic. Generated YouTube detail переиспользует Hero/ActionPanel/DEC-062 session и скрывает только empty Exercises/Details; seeded workout с real exercises их сохраняет. Occurrence provenance остаётся `workout_session`, а calendar/report source определяется join к workout и отображается text Badge `YouTube`; partial fake reports до E6 запрещены.
- **Sources/Authors contract (DEC-057):** Flowly и YouTube — catalog sources, не authors; единственный current screen — `/sources`/S-MA-025 с independent sections, ровно 3 shared WorkoutMediaCard previews и real `/catalog?source=...` links. `/authors/flowly|youtube` и source-based AuthorProfileScreen запрещены; future `/authors/[id]` резервируется только для реальных public user author profiles S-MA-024. Source sections обязаны сохранять partial success, direct Konsta loading/error/empty states и internal horizontal snap без document overflow. Heading outline фиксирован: semantic H1 `Источники` → H2 `Flowly`/`YouTube` → H3 workout titles; shared `WorkoutMediaCard` получает explicit `headingLevel="h3"` только в nested source sections. Source H2 are top-level page-edge headings and must neutralize Konsta BlockTitle safe padding via `!px-0`, aligning exactly with description/card outer edge; default inset is forbidden here.
- По `DEC-033` + `DEC-035` Konsta является first and final source для repeated controls/surfaces/typography; app-level CSS разрешён только для shared shell/safe-area/page geometry, brand-variable bridge и domain layout, которых нет в Konsta. Legacy `.flow-*`/custom tokens не являются основанием сохранять самописный аналог и должны быть удалены или сведены к доказанному minimum. Перед user review обязателен audit всего затронутого frontend: (1) raw interactive HTML — ожидается 0 без approved exceptions; (2) каждый оставшийся visual `<div>`/`<span>` и CSS class обоснован semantics/domain layout; (3) каждый `packages/ui` usage удалён либо связан с approved DEC exception; (4) global drift audit route-accessible screens; (5) browser 360/390/430 light/dark, overflow 0, console errors 0, targets ≥44px; (6) per-control matrix enabled/pressed/selected/focus/disabled/loading/error; (7) Apple HIG review записан в evidence. Нельзя просить user review, пока хотя бы один standard element реализован не через Konsta или выглядит/ведёт себя как непроверенная техническая заготовка.
- Любой подтверждённый факт, решение, ограничение или изменение автоматически синхронизировать во всех связанных артефактах, не ожидая отдельного напоминания пользователя: task metadata (`decisions`, `depends_on`, `ui_slices`, scope, acceptance), `DECISIONS.md` и его `Влияет на`, stage contracts/summary, downstream-карточки, design flows/traceability, общий roadmap и `HANDOFF.md`. Если изменение затрагивает workflow агентов — обновить также `AGENTS.md`.
- Работа не считается завершённой, пока связанные представления не синхронизированы и не проверены на противоречия, устаревшие ссылки и superseded `DEC-*`.
- Выполнять только scope карточки.
- Каждый новый факт, ограничение, отклонение или блокер фиксировать в артефактах.
- Не принимать продуктовые, архитектурные, API-, UX- и бизнес-решения самостоятельно.
- При блокере: поставить `blocked`, заполнить причину и создать/связать запись `DEC-*`.
- Если scope должен измениться — остановиться и запросить подтверждение пользователя.
- Автотесты можно писать, но только полезные — на реальный функционал (поведение, инварианты, миграции, edge-cases), а не бойлерплейт или ради процента покрытия; при этом обязательные проверки из карточки нужно перечислять и фиксировать как выполненные, не выполненные или отложенные.

### Перед `review`

1. Заполнить evidence: изменённые файлы, команды, HTTP-repro, screenshots или другие артефакты.
2. Отметить acceptance checklist только по фактическим доказательствам.
3. Записать незакрытые риски.
4. Обновить `HANDOFF.md` так, чтобы проверку мог продолжить новый агент без истории чата.
5. Перевести задачу в `review`.

### Перед `done`

Задача может стать `done`, только если:

- все acceptance-пункты подтверждены;
- выполнены применимые проверки;
- приложены evidence;
- downstream-зависимости обновлены;
- нет скрытых блокеров;
- заполнен итоговый handoff.

После `done` немедленно обновить карточку, этап, индекс и `HANDOFF.md`.

## Kanban-статусы

Допустимы только пять статусов:

```text
backlog -> in_progress -> review -> done
                |
                v
             blocked
```

- `backlog` — задача определена, работа не начата.
- `in_progress` — задача активно выполняется.
- `blocked` — продолжение невозможно без зависимости или решения.
- `review` — реализация завершена, нужны проверка и подтверждение.
- `done` — acceptance и проверки подтверждены evidence.

Возвраты допустимы: `blocked -> in_progress`, `review -> in_progress`. Любой другой переход нужно объяснить в журнале карточки.

## Обязательные поля карточки

```yaml
id: E1-D1-T01
title: Краткий проверяемый результат
status: backlog
priority: blocker | high | normal | low
owner: unassigned
updated: YYYY-MM-DD
prd_refs: [docs/PRD.md:...]
depends_on: []
decisions: []
```

Карточка также должна содержать: scope, acceptance checklist, validation, evidence, residual risks и журнал изменений.

## Правила синхронизации

Синхронизация выполняется агентом автоматически как часть любого изменения; пользователь не должен отдельно напоминать обновить связанные документы или карточки.

Любое изменение статуса считается незавершённым, пока не синхронизированы все четыре места:

- карточка в `stages/*.md`;
- сводка соответствующего этапа;
- таблица в `docs/roadmap/README.md`;
- `docs/roadmap/HANDOFF.md`.

Если обнаружено расхождение, источником детального статуса считается карточка задачи; агент обязан сразу восстановить остальные представления и записать исправление в handoff.

## Docs-only commits и CI

Если staged diff содержит только документацию (`*.md` и design evidence/assets), не влияет на runtime, build, tests, dependencies, migrations, seeds, конфигурацию или workflows, commit перед push обязан содержать `[skip ci]`, чтобы не запускать deploy pipeline без необходимости.

Перед использованием `[skip ci]` обязательно проверить `git diff --cached --name-only` и `git diff --cached --check`. Нельзя использовать `[skip ci]`, если staged diff содержит код приложения/пакетов, runtime assets, config/env, lockfiles, migrations, seeds, CI/CD или любые файлы, способные изменить build/deploy/runtime behavior.

## Завершение сессии

Перед остановкой агент обязан обновить `HANDOFF.md`:

- текущая задача и статус;
- что фактически сделано;
- что проверить следующим шагом;
- изменённые файлы;
- выполненные команды и их результат;
- блокеры и ожидаемые решения;
- рекомендуемое следующее действие.

Нельзя оставлять единственную важную информацию только в чате, памяти агента, todo-инструменте harness или локальном незадокументированном состоянии.
