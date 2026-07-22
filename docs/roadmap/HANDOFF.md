# Flowly — AI handoff

> Этот файл должен позволять продолжить работу без истории чата и независимо от agent harness.

## Текущее состояние

- **Обновлено:** 2026-07-22
- **Текущий этап:** **4. Мой ритм**.
- **Текущая задача:** E4-D5-T08 — закрыть DoD привычек, `backlog`.
- **Последняя закрытая задача:** E4-D5-T07 — генерация occurrences и reminder jobs; acceptance и self-verification закрыты.
- **Статус:** E4-D5-T01/T02/T03/T04/T05/T06/T07 `done`; E4-D5-T08 `backlog`. T03 S-MA-062 завершила migration 0017, schedule API, exact_times/weekdays config/validation/expansion; DEC-069 теперь делает profile timezone единственным источником для habit generation. T07 материализует текущие локальные slots и policy jobs без Telegram delivery; slot identity реализован и проверен в T05.
- **README sync:** активный этап 4; task counts синхронизированы: 45 done / 1 blocked / 32 backlog / 0 in_progress / 0 review.
- **DEC-068:** canonical `weekly_target={target,days,time}` и `interval={every,unit,anchorLocalDate,anchorLocalTime}` и local-calendar semantics остаются действующими; timezone ownership portion superseded DEC-069.
- **DEC-069:** пользователь 2026-07-22 утвердил: habit не хранит/не показывает отдельный timezone; новые slots/jobs используют `users.timezone`, уже созданные occurrence rows сохраняют timezone snapshot и history immutable. T07 должен провести совместимый schema/API/UI cleanup.
- **План:** `.temp/E4-D5-T05/plan.md`, plan confidence 91%, implementation confidence 90%; scope ограничен T05 и screen slices S-MA-011, S-MA-064, S-MA-065.
- **T05 реализация:** migration `0018_habit_occurrence_slots.sql` делает uniqueness slot-safe по local time; canonical `/api/v1/occurrences` reads/status actions, status_history/manual correction, policy-gated skip/rest и habit pause/resume добавлены; `/rhythm/[id]` получил detail/history/progress/action/lifecycle Sheets; `/rhythm` показывает generated-slot progress и paused habits.
- **T05 verification:** local D1 migration/index PASS; two same-date slots coexist; HTTP matrix 200/400/404, status history и concurrent PATCH idempotency PASS; pause/resume browser flow PASS; fixture удалён, habit restored active; 360/390/430 light/dark overflow 0, targets ≥44, console errors 0; web typecheck/build PASS, lint PASS с одним pre-existing warning `step-session-screen.tsx:449`, raw fetch/controls/CSS-module audits 0.
- **Deep review T05:** `.temp/E4-D5-T05/plan-review.md`; oversized mutation bodies и нейтральное оформление archive action исправлены, повторные typecheck/lint/build PASS; critical/high findings отсутствуют.
- **T06 implementation:** `.temp/E4-D5-T06/plan.md`; `.temp/E4-D5-T06/plan-review-1.md`; `.temp/E4-D5-T06/plan-review-2.md`. Migration 0019 добавила habit policy linkage и presets; S-MA-063 policy Sheet и owner-safe API реализованы; local D1/API/browser/typecheck/lint/build checks PASS. User review pending; T07 остаётся owner final reminder UTC/quiet-hours job semantics.
- **T06 UI correction:** `.temp/E4-D5-T06/ui-review.md` и screenshots `ui-policy-list-after-fix.png`, `ui-policy-editor-after-fix.png`, `ui-policy-editor-bottom-after-fix.png`, `ui-habit-form-policy-gap-after-fix.png`; user feedback по padding, Back placement, hierarchy, action clarity и лишнему gap policy→CTA addressed; final responsive matrix/typecheck/lint/build PASS.
- **T06 reviewer result:** user предоставил `.temp/E4-D5-T06/user-review-steps.png`; независимый reviewer `.pi-subagents/artifacts/outputs/33e0cc7a/.temp/E4-D5-T06/reviewer-delegate.md` подтвердил 6 проблем editor steps. После user approval реализован one-row-per-step Konsta redesign с inline value и trailing 44px destructive action; nested horizontal padding в policy list/editor удалён, list/CTA/section text выровнены по единому 16px inset, redundant steps copy удалён. Screenshots `.temp/E4-D5-T06/ui-policy-editor-redesign-390.png`, `ui-policy-editor-redesign-390-bottom.png`, `ui-policy-list-after-horizontal-fix.png`, `ui-policy-editor-after-horizontal-fix.png`; browser matrix/typecheck/lint/build PASS.
- **Последнее воспроизведение:** `/rhythm/019f8082-2956-754c-84a2-5a319faf4533/edit` API возвращает `ruleType=weekdays`, но UI показывал `Каждый день`; причина — форма монтировалась до завершения schedule query и фиксировала default `exact_times`.
- **Исправление в работе:** `apps/web/features/rhythm/ui/habit-form-screen.tsx` теперь ждёт `schedule.isPending` перед initial mount; typecheck и browser rerun подтвердили `По дням недели` для persisted `weekdays` rule.
- **Apple Design workflow:** загружен `.pi/skills/apple-design/SKILL.md` из upstream `emilkowalski/skills`, оставлены только применимые для Konsta/Flowly принципы; обязательное чтение добавлено в `.pi/skills/flowly-task-workflow/SKILL.md` и `AGENTS.md`.
- **Последняя UI-коррекция:** frequency block возвращён к единому Konsta List; time rows стали компактными ListItem с regular 17px label, 16px value, clock и trash. Start-date row получил компактную штатную field geometry с той же typography; time rows сохраняют 44px action targets. Убраны перекрывающиеся native/clear icons; единственная оставшаяся time row сохраняет disabled trash slot без layout shift. Clock теперь является прямой доступной Konsta Button `Изменить время N`, а hidden native ListInput исключён из tab order; click по row/button вызывает native time picker; add/delete проверены в browser. Footer больше не использует `mt-auto`, поэтому CTA следует за поясняющим текстом без большого пустого пространства.
- **Deep review:** UI accessibility finding про несемантичный click-only time row устранён direct clock Button. Matrix 360/390/430 × light/dark: overflow 0, date row compact, time action targets 44px, console errors 0. Schedule PUT теперь заменяет правило одним D1 `batch`; локальный concurrent HTTP repro двумя одновременными PUT завершился двумя `200`, а SQL-проверка подтвердила ровно одну current rule; исходная habit восстановлена на `weekdays`.
- **Локальная timezone-проверка:** временный `activity_occurrences` fixture был создан локально, schedule timezone изменён `Europe/Samara → America/New_York → Europe/Samara`, после mutation у occurrence сохранились `scheduled_local_date/time`, timezone, `scheduled_at_utc`, status и completedAt; fixture удалён, current rule снова `weekdays/Europe-Samara`, open rule count = 1.
- **Локальная atomic-create проверка:** POST с валидным weekly schedule создал habit и schedule одним запросом; GET подтвердил canonical config, затем обе локальные строки удалены. POST с `target=0` вернул `400`, SQL подтвердил `0` созданных habit rows.
- **Остаточный риск T04:** ambiguous/nonexistent local-time policy для hourly DST не расширялась за approved DEC-068 local-calendar semantics.
- **План T07:** `.temp/E4-D5-T07/plan.md`; расписание пользователя выполняется буквально: `каждый день` создаёт выполнение каждого календарного дня, остальные типы следуют своим правилам. Фиксированный пользовательский горизонт не вводится; техническая пачка скрыта внутри генератора. Profile timezone и final-local-time handling зафиксированы в плане.
- **Deep review T07:** critical/high findings отсутствуют. Исправлено: API reads больше не создают D1-записи; generation вызывается mutation paths и scheduler; interval с давним anchor оптимизирован без длинного цикла. Повторные typecheck/lint/build/deploy-check и scheduler test D1 Cron repro PASS.
- **Дополнительная self-verification:** HTTP matrix PASS для exact/duplicates, weekdays current/next, weekly target, interval, invalid schedule, read-only повторного GET, terminal skip/idempotence и profile timezone snapshot. Pure DST summer/winter и старый interval anchor PASS. Browser form `/rhythm/new`: timezone picker отсутствует, console errors 0. Все локальные fixtures удалены, профиль восстановлен.
- **Закрытие T07:** пользователь подтвердил перевод `review -> done`. После этого исправлен lint warning `apps/web/features/workout-session/ui/step-session-screen.tsx:449` через `next/image` с `unoptimized` для GIF; web/root lint, typecheck и build PASS, предупреждений 0.
- **Следующее точное действие:** начать E4-D5-T08; перед production T07 остаются deploy/real-device scheduler checks и E5 Telegram delivery.
- **Последний подтверждённый результат:** DEC-041 Profile/Settings code+screenshot pass выполнен без Playwright по прямому запрету пользователя. `/help`/S-MA-096 route, HelpScreen/CSS и profile entry удалены; current inventory 68 IDs/96 pairs/68 states. Profile/Settings используют action-free fixed/blurred safe-area PrimaryNavbar; web Back удалён и заменён route-aware native Telegram BackButton (`DEC-048`), native List spacing, identity row и future sections disabled с Badge `Скоро`; Settings — тот же Navbar contract и grouped BlockTitle/List/ListInput/Segmented/Toggle/BlockFooter. TimezonePicker вынесен в единый `@/components/timezone-picker` и используется onboarding/settings. Profile/Settings CSS Modules и legacy Select/TextField/Card wrappers удалены. Konsta 5.2.0 ListInput `title:null` crash закрыт documented `title=""` workaround. Web typecheck, targeted lint, production build (20 routes после Help removal), source audits и diff-check PASS. Browser/Playwright validation намеренно не выполнялась; пользователь проверяет screenshots/runtime вручную. Latest screenshot corrections: `Профиль` → `Имя в Flowly`, input switched to direct Konsta outlined ListInput, week title/control gap added, `Оформление` → `Тема оформления` with duplicate inner label removed, neutral autosave footer removed and final List bottom margin collapsed. Targeted typecheck/lint/diff-check PASS. Follow-up screenshot correction: week selector `mt-2`; theme outer List surface removed, then restored by explicit user request; name input List changed to non-inset `mt-8 mb-2` after screenshot showed BlockTitle overlap; theme List surface restored by explicit user request. Focus screenshot confirmed direct Konsta `ListInput`; double ring came from Flowly global `:focus-visible`. По прямому user request global focus rule и its component exceptions removed entirely; Konsta native focus rendering remains. DEC-042: configurable week start removed from onboarding/settings and public `/me`; Monday is fixed and re-auth normalizes DB. Settings bottom gap reduced by removing local `pb-safe-4` and forcing final List `!mb-0`; shared shell nav reserve remains. DEC-043: shared AppShell Navbar owns action-free top-level headers; Home centers Flowly name in fixed safe area and exposes Profile only in content row `Твой план`; remaining titles use domain names. Typecheck/lint/build/diff-check PASS. Settings persistence audit: direct authenticated PATCH name/timezone works and survives GET, but dev UI intentionally skips mutation; report toggles are local-only and contradict D1 (UI weekly=true, DB weekly/monthly=false, API fields 400); theme is localStorage-only. Values used for HTTP repro restored. User approved DEC-044 fix: dev/prod now share real PATCH autosave; weekly/monthly settings load/save through existing D1 fields; theme remains localStorage-only. Exact authenticated PATCH+GET rerun persisted name/timezone/reports, then canonical values restored. Typecheck, targeted lint, build and diff-check PASS. Local 777001 is temporarily onboarding-complete for current main-page manual review; restore NULL after review. Bottom Tabbar labels were 11px, then superseded to exact 9px by latest user request. User requested commit+push of the full current working tree for real-device deployment. Full tree committed as `1a8bf3a` (`feat(web): migrate frontend to Konsta UI`) and pushed to `origin/main`; GitHub Actions Deploy web run 29393979325 completed success in 1m27s, including typecheck, lint, D1 migrations and web worker deploy. Fullscreen sticky offset fix `300f7d9` deployed successfully, then real-device screenshots exposed unblurred safe area. DEC-047 implementation (`ce35676`) moves primary title into the blurred composed safe area; follow-up `239ae28` removes fixed Settings/Profile actions, collapses the empty row, adds Home `Твой план` + Profile action and renames `Твой прогресс на сегодня` to `Прогресс на сегодня`; internal Navbars own inset through Konsta. Same runtime commit removes Telegram avatar storage/proxy/rendering via migration 0005 (DEC-046), changes Tabbar labels to 9px and includes latest Home visual refinements. Deploy web run 29395082940 PASS, including migration 0005; follow-up `239ae28` Deploy web run 29395715390 PASS. DEC-048 runtime `8633c9c`: native `BackButton.show/onClick/offClick/hide` manager, internal visible/top-level hidden, click=`router.back()`, Close/X not interceptable per official docs. Real Settings → Profile Back showed Close/X flash; `031de99` keeps BackButton visible across internal cleanup and hides only in next top-level effect. Deploy web runs 29396177091/29396563266 PASS. Latest mobile header `429beb9` hides PrimaryNavbar on desktop and restores iPhone title below notch/native controls; Deploy web run 29398306357 PASS; real-device rerun pending.

- **Latest navigation update (supersedes DEC-048 top-level hide):** DEC-052 реализован в `telegram-back-button.tsx`: session/index/url markers сохраняют Next history state, push/replace/pop и reload/back/forward работают в одной Mini App session; distinct tabs входят в history, active tab — no-op; rapid native Back выполняет один переход; direct Settings→Profile, workout/YouTube/author/safety→Catalog, Profile/tabs→Home используют contextual replace. Back скрывается только на Home boundary index 0, где включается Bot API 6.2 closing confirmation. Browser mock PASS: Home→Yoga→Back, Settings→Tracks→Back→Settings→Profile→Home, workout direct-entry→Catalog→Home, rapid 5×Back, reload/back/forward и marker persistence. Typecheck/lint/production build/diff-check PASS. Native Close/X официально не interceptable; real-device rerun pending.

- **Latest real-device correction:** catalog filter count was clipped because Konsta Button owns `overflow-hidden`; Badge is now a direct Konsta sibling in a minimal relative wrapper and browser confirms visible count/geometry/colors. DEC-055 syncs resolved Flowly light/dark canvas to Telegram `setHeaderColor`/`setBackgroundColor`/supported `setBottomBarColor`; SDK mock sends `#f7f6f2` and `#101713`. Telegram has no direct status-icon foreground setter, so native time/signal/battery contrast requires user real-device rerun.

- **Latest keyboard correction:** DEC-056 approved from real iPhone Settings/Catalog/YouTube screenshots. Shared AppShell document focus manager hides/unmounts bottom Konsta Tabbar and changes reserve `pb-safe-24`→`pb-safe-4` for mobile text-entry focus; blur restores both. Non-text controls and desktop focus preserve navigation. Browser PASS: Catalog desktop/mobile, Settings ListInput, timezone Sheet Searchbar, checkbox exclusion, YouTube 360/390/430 light/dark, overflow 0, console errors 0. Real iPhone Telegram rerun confirmed by user: Settings/Catalog/YouTube/timezone text-entry keyboard hides Tabbar correctly and restores it after editing; DEC-056 device gate PASS.

- **Latest player safe-area correction:** DEC-058 approved after real iPhone landscape repro on workout `019f6a1f-fcca-7875-b38c-282f16685e00`. Shared player on Telegram mobile now uses action-free `SafeAreaTitleNavbar`, reserves the full composed top inset, removes local Close from status/battery chrome and contains 16:9 iframe below inset in portrait/landscape. `TelegramBackButton` now exposes a LIFO modal override stack; native Back closes player without route/history change and restores trigger focus. Mock iOS safe=84px: title inside inset, iframe begins y84, landscape 289×163/portrait 520×293, Popup/main overflow 0; workout and YouTube Search PASS; desktop Navbar/44px Close preserved. Real-device rerun pending.

- **Latest exact Glass correction:** DEC-059 approved by screenshot feedback. Shared `GlassIconButton` exactly reuses Konsta Navbar source composition (`Glass` native colors/shadow/blur/highlight → clear rounded Button 44×44 → inherited-primary icon 20×20). YouTube Search cards and YouTube detail use `YoutubePlayButton`; Catalog cards show no play and open detail. Catalog filter and Home Profile use the same Glass action. Timezone Sheet Searchbar has 16px symmetric inset. Browser computed geometry/style, screenshots, Catalog no-play and console checks PASS; real-device review pending.

- **Latest media-paint correction:** DEC-060 approved after canonical Catalog→Programs→Catalog repro. External `/icons/lucide.svg` produced initial 200 plus route-level 304 and was replaced by one root inline `IconSprite`; all production icons now use same-document `#icon-*`, external sprite responses are zero. User explicitly selected only official Next.js 16 image behavior, without custom session cache: hero/LCP images use `preload`, above-fold cards use eager, remaining cards stay lazy with shared blur placeholder, and all five production Image sites use sync decode. Post-fix first captured Catalog route frame has complete images; repeated YouTube thumbnail comes from disk cache. Typecheck/lint/build/OpenNext deploy-check/diff-check PASS; real Telegram WebView confirmation pending.

- **Latest Tabbar hierarchy correction:** DEC-061 approved from Home→Profile→Settings UX feedback. AppRouteShell centrally marks only `/`, `/catalog`, `/programs`, `/rhythm`, `/calendar` as tab roots; all other current/future paths hide Tabbar on every platform and use `pb-safe-4`. Query params preserve root status. Browser 12/12 route matrix + Home→Profile→Settings→Back×2 PASS: internal nav count 0, root count 1, reserve 4/24, overflow 0, shared shell persists. Real-device review pending.

- **Latest video-session correction v2:** migration `0006`, one-open lifecycle API, atomic occurrence/history, shared controlled IFrame API, `/sessions/[id]`, Home/detail integration remain. Rejected Dialogs replaced by bottom Konsta Sheets; same-active detail shows marker/full elapsed/direct Continue; exercises use number→title→duration→description; Home resume is compact; final Sheet reopens with default `completed`, collapsed comment and enabled Done. Per-second monotonic local snapshots + StrictMode-armed unmount flush + stale-response rebase fix the actual 0:03 loss; technical copy/manual retry removed. Evidence `.temp/E2-D3-T01/checkpoint-{repro,postfix}.json`: pre 0:03→0/0, post 0:03→local/server3→restored0:03. Pause geometry exact before/after: iframe y/height 70/354.375, Card 516.375. Muted 360/390/430: overflow 0, targets ≥44, Tabbar 0, default checked=1, errors 0; screenshots `/tmp/flowly-home-resume-corrected.png`, `/tmp/flowly-session-review-shots/{finish-sheet-390-dark,active-conflict-sheet}.png`. Root typecheck/lint/build/OpenNext deploy-check/diff-check PASS. User chose no elapsed cap (only PLAYING grows) and E2-D3-T02 immediately after T01. Browser and mocked native Back prior-detail→Home→Continue both return Home index1→0; reported workout detail target needs exact preceding Home-entry sequence.

- **Active YouTube-workout expansion:** DEC-063/user choices: YouTube result card main opens a materialized/reused private workout detail; Play remains shared popup and does not create; generated empty YouTube detail reuses Hero/ActionPanel/session but omits Exercises/Details; report data source is canonical occurrence→workout join with future text Badge `YouTube`; visible calendar/report UI remains E6. E2-D2-T08 plan `.temp/E2-D2-T08/plan.md` approved (95%/92%); T01 done, T08 `blocked -> in_progress`. Runtime draft implemented without duplicate detail/player/session/materialization logic. Evidence: concurrent Save/Create same ID, generated detail Start/Finish, occurrence join `youtube`, matrix overflow/targets/errors PASS; screenshot `/tmp/flowly-youtube-generated-detail.png`. Awaiting UI approval before deploy.

## Что сделано

- E0-D0-T05 final closeout: S-MA-006, S-WEB-001/002, S-MA-088, shell error и Programs/Rhythm/Calendar placeholders migrated to direct Konsta; пять remaining CSS Modules и legacy `feedback/field/select` exports/styles deleted; `/ui-kit` reduced to the sole approved DEC-037 Icon/IconSprite composite. Final audits: raw interactive 0, legacy UI 0, legacy flow visual classes 0, CSS Modules 0, external sprite refs 0, deprecated Next Image priority 0. Typecheck/lint/build PASS (20/20 static pages). Card moved `in_progress -> review -> done` by explicit user approval.

- DEC-057/S-MA-025 approved: removed legacy `/authors/flowly|youtube` without redirects and deleted `AuthorProfileScreen` + CSS/Skeleton/InlineError/raw header/back/mini-cards. New `/sources` combines Flowly and YouTube as independent React Query sections with 3-card horizontal snap previews via shared `WorkoutMediaCard` and real `/catalog?source=...` links; future `/authors/[id]` is reserved for real user profiles. Browser 360/390/430 light/dark, loading/error/empty/flowly-error/youtube-error partial-success, 200% text, card→detail and filtered Catalog PASS: document overflow 0, targets ≥44, console errors 0; old routes HTTP 404. Follow-up heading audit fixed shared-card semantics: H1 `Источники` → H2 Flowly/YouTube → H3 workout titles; visual typography unchanged. Follow-up screenshot exposed default Konsta BlockTitle `pl-safe-4` double-inset; source H2 now use `!px-0` and align with description/card page edge. Evidence `.temp/E0-D0-T05/screenshots/sources-390-dark.png`; root typecheck/lint/build/diff-check PASS. Pre-push user-requested code-only header audit (no Playwright MCP) confirms exact `/youtube` parity: shared direct PrimaryNavbar before main/outside padding, mobile gating, additive insets, max-44 ownership, compensation/title/blur selector and native Back fallback PASS; found/fixed missing `/sources` workouts-tab mapping in AppRouteShell.

- DEC-054 workout detail redesign approved by user («мне все нравится»): all Flowly/YouTube/saved/UGC details now use media-first Cover→H1≤3→metadata→meaningful description. Exercises remain visible as real List or compact disabled `Будут добавлены позже` + `Скоро`; Start/Favorite/Share/UGC future functions are compact disabled rows, not giant CTA/error Cards. Removed chips/hero quick-actions and compounded List/BlockTitle margins. `Сведения` is now an explicit 68px info/subtitle/chevron disclosure with correct direct summary (`contentWrap={false}`). Saved/Flowly/seeded YouTube and loading/error/offline/hidden 360/390/430 light/dark PASS: overflow 0, targets ≥44, console errors 0; 200% text PASS; player 390×219/inert/focus PASS. Evidence `.temp/E0-D0-T05/screenshots/workout-saved-youtube-{before,after}-390-dark.png`, `workout-flowly-after-360-light.png`.

- DEC-053 approved unified Catalog/YouTube correction: one `WorkoutMediaCard` owns 16:9 cover, one timecode, two-line visual/full accessible title, one compact metadata line and 44px domain icon action; redundant badges and reserved title-space are removed. Catalog keeps open+disabled bookmark; YouTube keeps real bookmark/check Save and cover Play. Duplicate duration/external Watch/raw gradient removed; results/views/date localized; native 32px Searchbar clear replaced by direct 44px Button. Shared fullscreen `YoutubePlayerPopup` serves Search and YouTube workout detail via `youtube-nocookie` iframe/CSP with autoplay+playsinline, Close/Escape, inert/aria-hidden, scroll lock, focus restore and iframe unmount. Browser 360/390/430 light/dark base and all Catalog/YouTube forced states PASS: overflow 0, targets ≥44, content-driven card heights = 276/298px at 390 without empty slabs, shell persistent, console errors 0; 200% text Catalog/YouTube overflow/card-overflow/small-targets = 0; visual title clamp is intentional. 390 player 390×219; open/close/focus and detail reuse PASS. Actual Save reached `Сохранено`; created local verification workout was deleted afterward. Typecheck/lint/build/diff-check PASS. Residual: real Telegram WebView autoplay/embed and YouTube-controlled branding/external affordance require device review.

- Historical S-MA-020 vertical/full-title pass (superseded by DEC-053 final YouTube-like two-line title/icon-action correction): covers no longer stretch with content and shared anatomy is stable. Browser 360/390/430 light/dark targeted pass: overflow 0, targets ≥44, console errors 0, 23/23 images loaded; only one longest title adapts +22px at 360/390, all cards equal at 430. Web typecheck/lint/build/diff-check PASS.

- S-MA-022 screenshot follow-up approved: workout name moved from hero Card into direct Konsta large semantic H1 above the Card; hero now starts with cover and keeps metadata/description/actions. Web typecheck/lint/diff-check PASS; evidence `.temp/E0-D0-T05/screenshots/workout-title-outside-card-390-dark.png`.

- DEC-049 production YouTube repair: canonical pre-fix HTTP repro returned `invidious/unavailable/0`; runtime `286d597` migrated server search/save metadata to Piped, renamed env/API provider and cache namespace, preserved D1 TTL/stale fallback. Deploy web 29402655934 PASS. Exact production rerun: `piped/miss/12`, repeat `hit/12`; edge queries return 12/10/6, warning null.

- Catalog `/catalog` standalone code/browser/Apple HIG correction 2026-07-15: gate **PASS** for approved scope. Пользователь выбрал compact horizontal Konsta Cards, `Radio` single-select + `Toggle` independent filters и сохранение disabled favorite controls. `catalog-screen.module.css` (480 строк/30 classes/4 dead selectors) удалён; Searchbar/Card/Sheet/Button/Skeleton visual recreation заменён direct Konsta `Searchbar/Card/Sheet/Navbar/List/ListItem/Radio/Toggle/Button/Badge/Preloader`. Cards показывают source/format/difficulty/category и UGC cue, auto-grow at 200% text, entire main area opens detail, disabled bookmark остаётся отдельным sibling control. Filter Sheet moves focus to Close, traps Tab/Shift+Tab, closes on Escape/backdrop, sets screen/Navbar/Tabbar inert+aria-hidden, restores focus, uses shape/check state instead of color-only. Offline loads available data instead of eternal skeleton; loading uses accessible Preloader; result count is live. Searchbar has one documented DEC-050 focus-owner wrapper because Konsta 5.2.0 drops `className`; all catalog keyboard controls have visible focus. Browser matrix: 30/30 (360/390/430 × light/dark × base/loading/empty/error/offline), overflow 0, visible targets ≥44, console errors 0, custom skeleton 0, offline cards visible, last-card clearance 32px; 200% text card/body overflow 0; filter focus/selection/apply/reset/Escape/ARIA PASS. Desktop/web Navbar absence follows mobile-only safe-area contract `429beb9`; sr-only H1 `Йога` remains. Evidence `.temp/E0-D0-T05/screenshots/catalog-konsta-*`, `catalog-konsta-filter-snapshot-final.md`, `catalog-konsta-final-console-errors.md`. Web typecheck/lint/build, raw controls/fetch, legacy class and diff-check PASS.

- DEC-051 `/youtube` + `/workouts/[id]` Konsta/Apple HIG correction: approved titles `Поиск YouTube`/`Тренировка` via action-free PrimaryNavbar; web Back/raw YouTube header removed, native Telegram Back remains DEC-048. Deleted both CSS Modules (271+357=628 lines), legacy Skeleton/InlineError/OfflineBanner and custom Searchbar/Card/action/surface/focus recreation. Historical first pass (superseded by DEC-053 for cards/player): YouTube used direct 16:9 Card/Image/Badge/Button/Link composition and Save/Watch; current UI uses shared Card + Save + in-app player, fixed stale/saved states, accessible Preloader/error/empty; workout uses direct Card/Badge/Chip/List/ListItem/Button/Link/Preloader, text-first exercises, semantic details and user-approved disabled Start/Favorite/Share + applicable UGC actions with `Скоро`. Matrices PASS: YouTube 36/36 (6 states), workout 30/30 (5 states), each 360/390/430 light/dark; overflow 0, targets ≥44, console errors/custom Skeleton 0, last-content clearance PASS. Dynamic Type 200% internal overflow 0 after long-title/exercise wrapping fixes; keyboard focus, H1/H2 semantics, catalog→YouTube/workout click and shared-shell persistence PASS. Evidence `.temp/E0-D0-T05/{youtube,workout}-konsta-*`; typecheck/lint/build, raw controls/header/fetch, legacy class and diff-check PASS. Residual: exact Telegram native header/Back placement still requires real-device rerun; missing workout goal/media remain upstream data scope, no fake content added.

- DEC-041 Profile/Settings: shared full-width Navbar/history-back contract закреплён в AGENTS/FRONTEND_REVIEW; ListItem button rows use `contentClassName=w-full` + `innerClassName=text-left`; native List margins восстановлены. `/help` и all current runtime references removed; future profile rows visible disabled. Shared timezone picker direct Konsta composition extracted and deduplicated.

- Home DEC-039/040: удалены верхняя дата, categories и «Ещё для вас» вместе с obsolete model/scenario code; новая hierarchy — greeting → compact circular day progress + nearest action → current program → habits → bottom primary workout action. Пользователь явно approved Home-only circular SVG exception; реализация inline, без CSS Module/dependency/shared wrapper, с semantic colors, clamp и visible percentage. После HIG screenshot feedback progress Card уплотнён: устранён двойной Card header/content padding, summary собран в одну 96px row, nearest action примыкает отдельной Konsta row. Tabbar использует чистый documented `Tabbar → ToolbarPane → TabbarLink` без custom visual CSS/width/padding; DEC-045 фиксирует выбранные display labels `Треки` и `Дневник` при неизменных routes/domain titles. Home follow-up унифицировал три основных блока через один direct Konsta `Card` contract: одинаковые 17px semibold headers, `p-4`, border/radius/width и screen gap. Current program целиком кликабельна и следует documented styled-card pattern: full-bleed image, program title overlay, metadata+Progressbar footer; отдельные button/badge удалены. Habits используют такой же Card header и uncluttered List с media icons + circle-check/circle вместо pills; primary workout action остаётся последним. Evidence: `.temp/E0-D0-T05/screenshots/home-unified-cards-390-light.png`; 390 light overflow 0, program link active, three habit rows, console errors 0.

- Reload loading chain unified: `AuthGate`, both onboarding guards and root `app/loading.tsx` use direct Konsta `Preloader`; removed white auth loading Card, visible «Входим…», brand image, legacy Skeleton blocks and custom circular `.shell-skeleton` from the real route transition. Before/after screenshots: `.temp/E0-D0-T05/auth-loader-{before,after,transition-after}-390-dark.png`.

- Strict Konsta cleanup: official documented `ToolbarPane` restored the native iOS Tabbar active glass highlight; custom Tabbar position/background/border/radius/shadow/blur/active selectors removed. Onboarding imports direct Konsta `Searchbar` and has zero CSS/module files; layout remains only as utility classes on semantic wrappers/Konsta props. `TimezonePicker` remains the sole domain composite because Konsta has no timezone picker; internally it is direct `Sheet/Navbar/Searchbar/List/ListItem`.

- Home S-MA-010 Konsta/HIG correction pass: removed `home-screen-v2.module.css`, fake controls/mutations and technical copy; rebuilt required Home modules from direct Konsta primitives; restored program photography by explicit user choice; fixed global icon-only selector to require accessible icon-only control (`aria-label`), so text+icon buttons no longer collapse to 44px. Evidence: `.temp/E0-D0-T05/home-review-after-*.png`, CDP state/matrix/interaction checks; targeted Home typecheck/lint and diff-check PASS. User `777001` restored to `onboarding_completed_at=NULL` after browser review.

- Onboarding S-MA-002–005 Konsta/HIG correction pass после user screenshots: titles выровнены по shared content edge; лишний Telegram hint удалён; preferences footer возвращён в document flow; selections унифицированы neutral/selected; timezone — direct Konsta Sheet/Navbar/Searchbar/List/ListItem с Flowly group surfaces, 8px stack gap и symmetric 16px row insets; icon+label controls получили explicit gap, включая disabled capabilities, правило закреплено в AGENTS/DEC-035/FRONTEND_REVIEW; добавлен approved Lucide sunrise. Evidence `.temp/E0-D0-T05/screenshots/onboarding-*-fixed.png`; targeted 360/390/430 light/dark 12/12, overflow/console/small-target/footer-overlap 0; web typecheck/lint/build/diff-check PASS. Status E0-D0-T05 остаётся `in_progress` до full frontend matrix.

- E2-D2-T06 и E2-D2-T07 закрыты `review -> done` по явному подтверждению пользователя «уже сделаны». Обе карточки имели полностью отмеченный acceptance, detailed verification evidence, production/real-device confirmation для T07 и не имели unresolved blockers; stage 2 summary и roadmap index синхронизированы.

- System-theme live sync fix: `apps/web/components/providers/konsta-provider.tsx` теперь является reactive owner resolved theme; слушает browser media и Telegram Mini App `themeChanged`, обновляет `<html data-theme>`/`.dark` и Konsta `dark`. `profile-settings-screen.tsx` уведомляет provider о same-tab preference changes; `telegram.d.ts` содержит official event type. Real browser before/after evidence и static checks PASS. Это explicit user-approved interruption, не approval full migration.

- E0-D0-T05 planning/execution: DEC-035 approved; `AGENTS.md` requires direct Konsta and prior approval for gaps; DEC-023/025 superseded; DEC-024 one-batch exception applies. Later user decisions superseded the initial onboarding defer: S-MA-002–005 completed inside E0 by DEC-036/037, and focused S-MA-010 completed by DEC-038. Konsta governance remains: zero unexplained raw controls/visual wrappers/legacy UI; exceptions require prior approval + DEC; Apple HIG and per-control state evidence mandatory.

- E1-D1-T12 production verification PASS: deploy `5b714a7`; Telegram Desktop SDK `macos/9.6`, signed initData validated, session created, Home visible. Пользователь подтвердил revoke/regenerate token, Cloudflare secret update и webhook/auth recheck («это тоже сделано»); карточка `blocked -> done`, security blocker закрыт.
- E1-D1-T13 implementation: DEC-034; `users.onboarding_completed_at` + migration 0004; `GET /me.onboardingCompleted`; idempotent session+Origin protected `POST /api/v1/onboarding/complete`; React Query completion mutation; product/onboarding guards; `/onboarding/[step]`; welcome/preferences/capabilities/bot sequence; real name/username/photo on Home/Profile/Settings; settings initializes from `/me`; S-MA-004 controls disabled with TODO(E4-D5-T02/E7-D8-T01); red `InlineError` distinguishes 401/offline/server failures. Local dev works without Telegram via separate `flowly-dev-session` over HTTP; production retains `__Host-flowly-session; Secure`. Checks: migration/API matrix, typecheck, targeted lint, build, fetch/hardcode audits, diff-check PASS; local user approval received. Commit `00d1069` pushed; GitHub Actions `29382146616` PASS (typecheck/lint/remote migration/deploy); production health `/` 200, `/onboarding/welcome` 200, unauthenticated `/api/v1/me` 401. Live `onboarding.*` tail запущен. Next: production Telegram flow review PASS по подтверждению пользователя «да все работает»; пользователь выбрал закрытие без deep review, E1-D1-T13 `review -> done`.

- E2-D2-T07 shell/catalog follow-up deployed и подтверждён пользователем на real iPhone Telegram fullscreen: catalog использует compact horizontal cards и icon-only filter; favorite control унифицирован между catalog/detail через shared disabled `bookmark` button; Home leaf-icon удалён. Fullscreen safe-area provider синхронизирует Telegram `safeAreaInset` и `contentSafeAreaInset`; после real iPhone repro исправлена формула по официальной вложенной модели Telegram: system safe и content-safe складываются, а CSS `--tg-*` vars используются напрямую с SDK fallback; `requestFullscreen()` вызывается только при Telegram API >=8.0, старые clients остаются на `expand()` без SDK console error. Floating glass navbar fixed 64px; bottom inset меняет только offset; AppShell main reserve применяется ко всем product routes. Emulation evidence: top=64px, bottom=34px → main reserve=122px, navbar=64px/bottom≈42px, последний catalog card остаётся на ≈32px выше navbar; favorite controls 44×44, одинаковые bookmark/label; web/UI typecheck и targeted lint PASS, console errors 0. Commit `f65b287` pushed; GitHub Actions run `29382506441` PASS and production `/`, `/catalog`, `/workouts/wo-balance-basic-15` return 200. Safe-area fix commit `1d790e5`, GitHub Actions run `29382959191` PASS; пользователь подтвердил real iPhone Telegram fullscreen: «работает». Final-content clearance и catalog/detail favorite parity остаются отдельными visual checks, если обнаружится новый feedback.

- Workflow update: `AGENTS.md` теперь требует `[skip ci]` для docs/design-only commits после проверки staged diff; marker запрещён для runtime code/assets, config/env, lockfiles, migrations, seeds и CI/CD, чтобы не скрывать обязательные build/deploy checks.

- Для E1-D1-T12 прочитаны auth client/server flow, verifier, request helper, CSP и webhook; сверены официальные Telegram Mini Apps docs. Подтверждено: HMAC key derivation в `verifyInitData` соответствует документации; production CSP не разрешает Telegram SDK; код запускает auth после failed `/me` без отдельного ожидания SDK; текущий fallback вручную декодирует `tgWebAppData` один раз. Пользователь выбрал план только в чате, отдельную roadmap bug-card и утвердил deep plan («делай»). Phase 1 diagnostic patch готов: source/SDK metadata, field-presence flags, exact validation error, client/server truncated SHA-256 fingerprints; raw initData/token/user/hash/signature не логируются. Synthetic fake-token repro до fix: подписанный payload с `signature` → `invalid hash`; diagnostic production deploy и Telegram Desktop rerun подтвердили тот же сценарий. Fix готов: `signature` включён в HMAC, CSP разрешает только `https://telegram.org`, SDK переведён на `beforeInteractive`, fallback использует один outer query decode, `WebApp.ready()` вызывается после mount. После fix fake-token signed payload ACCEPTED, tampered payload отклонён; root typecheck, web/telegram lint и Next build PASS. Следующее действие — production deploy и финальный `/start` rerun.

- **Historical, superseded by DEC-046:** Параллельный Home UI follow-up по production Telegram screenshots: Home использовал `/me.photoUrl` (`t.me/i/userpic/**`) в 44px circular avatar с `user-round` fallback; direct `.flow-screen` children получили `flex-shrink:0`, screen margin стал horizontal-only, section gap приведён к shared 12px. Home CSS module переименован в `home-screen-v2.module.css`, чтобы Telegram WebView получил новый asset вместо stale cached CSS. Fresh current-HEAD checks 360/390/430: overflow 0, avatar 44×44/radius 50%, все top-level gaps ровно 16px, section slices не сжимаются; typecheck/targeted lint/build PASS; новый CSS asset `1lnn4ocqof_yw.css`.

- Проанализирован `docs/PRD.md`.
- Зафиксированы восемь этапов разработки из §54.
- Исторический общий design gate DEC-012 superseded решением DEC-024: production UI теперь создаётся в реальном Next.js по одному screen slice со всеми states/интеракциями и отдельным approval.
- Провальный monolithic E0-D0-T04 package и его review artifacts удалены; T00–T03 сохранены как normative requirements/reference.
- Подтверждены npm workspaces и pinned bootstrap stack: Next.js 16.2.10, React 19.2.7, Tailwind 4.3.2, TypeScript 5.9.3.
- Concept A перенесён в `docs/design/screens/concept-a/`: четыре экрана, визуальное направление, логотип, standalone HTML и browser preview.
- В `STATUS.md` зафиксированы покрытие Concept A и пробелы относительно PRD; approval отсутствует.
- Реализован и скорректирован пакет E0-D0-T01: 69 screen/surface IDs, F01–F11, 12 Mermaid diagrams, explicit per-ID state profiles, atomic observable traceability и механически симметричные 98 screen↔flow membership pairs.
- Реализован E0-D0-T02: 13 HTML pages по F01–F11, 69 canonical surfaces, 15 profiles/105 state demos, 38 tailored critical frames, 39 canonical + 3 evidence PNG, pinned reproducible Playwright capture и 69-row coverage matrix.
- Deep-review corrections: безопасные F04/F08 terminal branches, F01 browser recovery, F10 relationship/revoke/permission paths, F11 deletion-grace re-auth; §19.4 cache and §51.2 export contents made observable.
- Workshop decisions зафиксированы как DEC-013–DEC-022; DEC-009 заменён DEC-018.
- Linked decisions синхронизированы с downstream metadata; 40 UI-bearing карточек имеют `ui_slices`, DEC-024/025 и обязательный последовательный approval; все 69 canonical surface IDs назначены хотя бы одной карточке.
- Во все 9 stage-файлов добавлены обязательные contracts; `AGENTS.md` требует реальный `apps/web`, запрещает design generation и требует утверждённый public API `packages/ui` до product screens.
- В корневом `README.md` полный wordmark заменён на icon Flowly.
- Согласованы границы программных напоминаний и совместных программ.
- Согласовано выполнение проверок по ходу этапов.
- Согласован workflow из пяти статусов.
- Созданы индекс, stage boards, decision log, handoff и правила агентов.

## Что делать следующим

1. Провести deep review T07 и проверить residual risks.
2. После review получить user confirmation для перехода `review -> done`.

## Открытые блокеры

Открыты `DEC-006`, `DEC-007`, `DEC-008`, `DEC-010`, `DEC-011` в [`DECISIONS.md`](DECISIONS.md); DEC-009 и DEC-012 superseded. Закрытую E0-D0-T05 они не затрагивают; применяются к соответствующим downstream-карточкам.
- **Deploy secrets:** GitHub Actions secrets `CLOUDFLARE_ACCOUNT_ID` и stable `CLOUDFLARE_API_TOKEN` установлены; manual `Deploy web` workflow прошёл успешно. Cloudflare Worker secret `TELEGRAM_BOT_TOKEN` установлен для production/test, но текущий локально найденный source value из `apps/web/.dev.vars` проверен через Telegram `getMe` и невалиден (`401 Unauthorized`) — нужен rotate на реальный BotFather token в Cloudflare Worker settings. DEC-049 superseded Invidious: `PIPED_BASE_URL=https://api.piped.private.coffee` configured for production/test. Runtime `286d597`, Deploy web 29402655934 PASS; production canonical search now Piped miss/hit with 12 results and no warning.
- ~~Внешний blocker по визуалу для S-MA-004 (чек-маркер/расположение)~~ — **resolved**: блокер был по Главной (S-MA-010, галочка `.habitAction`), починен другим агентом в 3 коммитах; S-MA-004 чек-иконок не имел. Evidence оставлен: `docs/roadmap/evidence/check-spacing-blocker-2026-07-14.png`.

## Изменённые артефакты

- `AGENTS.md`
- `.pi/skills/apple-design/SKILL.md`
- `.pi/skills/flowly-task-workflow/SKILL.md`
- `apps/web/features/rhythm/model/schedule.ts`
- `apps/web/features/rhythm/model/occurrences.ts`
- `apps/web/features/rhythm/ui/habit-form-screen.tsx`
- `apps/web/features/rhythm/ui/habit-detail-screen.tsx`
- `apps/web/app/(app)/rhythm/[id]/page.tsx`
- `apps/web/app/api/v1/occurrences/**`
- `apps/web/app/api/v1/habits/[id]/pause/route.ts`
- `apps/web/app/api/v1/habits/[id]/resume/route.ts`
- `apps/web/lib/habits/occurrence-status.ts`
- `apps/web/lib/habits/ensure-habit-schedule.ts`
- `packages/core/src/habit-schedules.ts`
- `apps/scheduler/src/habit-generation.ts`
- `migrations/0018_habit_occurrence_slots.sql`
- `migrations/0020_habit_schedule_profile_timezone.sql`
- `apps/web/app/api/v1/habits/route.ts`
- `docs/roadmap/DECISIONS.md`
- `docs/roadmap/stages/04-my-rhythm.md`
- `docs/roadmap/README.md`
- `docs/roadmap/HANDOFF.md`
- `.temp/E4-D5-T04/plan.md`
- `README.md`
- `docs/roadmap/README.md`
- `docs/roadmap/DECISIONS.md`
- `docs/roadmap/HANDOFF.md`
- `docs/roadmap/stages/00-design.md` … `08-stabilization.md`
- `docs/roadmap/stages/01-foundation.md`
- `docs/design/README.md`
- `docs/design/flows/**` — план, inventories, traceability, validation и 12 diagrams
- `docs/design/wireframes/**` — утверждённый план, HTML, CSS/JS registry, coverage, validation, capture toolchain и 42 PNG
- `docs/design/ui-kit/**` — утверждённый plan, HTML, JSON/CSS tokens, local fonts/icons, inventory, accessibility/validation, capture toolchain и 22 PNG
- `docs/design/screens/concept-a/**`
- `.temp/E0-D0-T04/next-interactive-plan.md` — утверждённый migration/implementation plan
- `apps/**`, `packages/**`, `migrations/`, `seeds/`, `scripts/` — E1-D1-T01/T02
- `apps/web/features/home/**`, `apps/web/public/media/**` — E0-D0-T04 full state set visual-approved и done
- `docs/roadmap/evidence/check-spacing-blocker-2026-07-14.png` — blocker proof для текущего UI-issue
- `packages/ui/**`, `apps/web/app/ui-kit/**` — E1-D1-T11 production UI-kit; final E0 closeout retains only approved DEC-037 Icon/IconSprite and its gallery
- `apps/web/lib/image.ts`, production Next/Image call sites — shared Next-native blur/preload/eager/lazy/sync media-paint contract
- `apps/web/{open-next.config.ts,wrangler.jsonc,.dev.vars.example,public/_headers}` — OpenNext web deployment; production D1 `flowly-db` and test D1 `flowly-db-test` bound in wrangler; `PIPED_BASE_URL` configured as env var (DEC-049); R2 binding removed until Cloudflare R2 is enabled/needed.
- `apps/web/app/api/v1/telegram/webhook/route.ts` — минимальный Bot API webhook: `/start` отвечает кнопкой `Открыть Flowly` (`web_app.url` = deployed origin).
- `apps/web/features/profile/ui/profile-hub-screen.{tsx,module.css}`, `apps/web/features/profile/ui/profile-settings-screen.{tsx,module.css}`, `apps/web/features/profile/ui/help-screen.{tsx,module.css}`, `apps/web/components/shell/app-shell.tsx`, `apps/web/lib/auth/{schemas,users}.ts` — E1-D1-T10 slices
- `apps/web/app/api/v1/workouts/route.ts`, `apps/web/features/catalog/**`, `apps/web/public/media/catalog/covers/*.webp`, `seeds/catalog/starter-catalog.v1.json`, `seeds/0002_starter_catalog.sql`, `scripts/build-starter-catalog-sql.mjs`, `apps/web/next.config.ts` — E2-D2-T02 catalog/search/filters + covers + YouTube seed
- `apps/web/app/api/v1/workouts/[id]/route.ts`, `apps/web/features/workout-detail/**`, `apps/web/features/workout-author/**`, `apps/web/features/ugc-safety/**`, `apps/web/app/page.tsx`, `docs/design/FRONTEND_REVIEW.md` — E2-D2-T03 detail/author/UGC safety + mandatory frontend review checklist
- `apps/web/components/providers/query-provider.tsx`, `apps/web/lib/api/client.ts`, `apps/web/features/profile/model/me-queries.ts`, `apps/web/features/catalog/model/catalog-queries.ts`, migrated `AuthGate`/catalog/detail/author/settings/preferences — React Query migration DEC-029
- `apps/scheduler/{src/index.ts,habit-generation.ts,wrangler.jsonc,.dev.vars.example,worker-configuration.d.ts}` — scheduler habit generation Cron; Telegram delivery remains deferred to E5
- root/workspace manifests, `.gitignore`, `README.md` — Cloudflare toolchain и documented commands

## Проверка текущего изменения

### E4-D5-T07 — generation verification

- Clean local D1 reset/apply including migration `0020_habit_schedule_profile_timezone.sql` PASS; `habit_schedule_rules` no longer has a timezone column.
- Pure schedule checks PASS: daily two-slot, weekday, interval, and `America/New_York` local-to-UTC conversion.
- Authenticated dev HTTP repro PASS: daily habit with two local slots produced 2 occurrences and 6 policy jobs during mutation; repeated GET kept 2 occurrences and 6 distinct idempotency keys without D1 writes; skip changed occurrence and cancelled its 3 pending jobs; profile timezone Europe/Samara→America/New_York produced a new `09:00` at `13:00Z` while old rows remained unchanged; fixture was removed and profile restored.
- Browser `/rhythm/new` showed the schedule form without a habit timezone picker, 0 console errors and no new raw controls; onboarding fixture was restored.
- Root/workspace typecheck PASS; scheduler lint/deploy-check PASS; web lint PASS with pre-existing `step-session-screen.tsx:449` warning; web production build PASS; `git diff --check` PASS.
- Scheduler local scheduled-event repro PASS: `/__scheduled?cron=*+*+*+*+*` created 2 occurrences and 6 jobs in test D1; repeated event preserved 2 occurrences/6 distinct keys; fixture removed. No Telegram delivery was executed.

Roadmap migration / bootstrap verification:

- [x] провальный `docs/design/screens/final/**`, старый T04 plan/reviews и `.pi-subagents` удалены;
- [x] DEC-024 approved; DEC-012 superseded;
- [x] старые T05/T06 удалены; T04 ограничен S-MA-010 и зависит от E1-D1-T02;
- [x] E1-D1-T01 `in_progress`; E1-D1-T02 разблокирован последовательностью T01 → T02;
- [x] 40 UI-bearing cards имеют `ui_slices`, sequential approval contract и покрывают все 69 canonical surface IDs;
- [x] E1-D1-T01: 9 npm workspaces, root lockfile, `npm install` 0 vulnerabilities, workspace query/build/typecheck/lint PASS;
- [x] E1-D1-T02: pinned stack, clean install, typecheck/lint/build/audit PASS; 24 browser runs, 2 screenshots, focus/overflow/nav/theme/dev-production isolation PASS;
- [x] E0-D0-T04 base checkpoint существует, но должен быть пересобран из approved `@flowly/ui`;
- [x] E1-D1-T11 package/public API: Button/IconButton/Card/Badge/Progress/AppHeader/BottomNavigation/Skeleton/EmptyState/InlineError/OfflineBanner;
- [x] `/ui-kit` browser matrix: 360/430/1280, light/dark, keyboard/focus, ≥44px targets, no overflow, interactions и reduced motion PASS;
- [x] `/ui-kit` visual approval: пользователь подтвердил «утверждаю ui kit» 2026-07-13;
- [x] E0-D0-T04 пересборка, full state set и visual approval Главной — done; deep review явно отклонён пользователем.
- [x] E1-D1-T03 local workerd/dry-run, typecheck/lint/build/audit/diff-check и candidate-file secret scan PASS;
- [x] `flowly-scheduler-test` deployed, version `cbca80ee-1d97-4c33-811b-12fdf282b38a`, Cron `* * * * *`;
- [x] `flowly-web-test` deployed, version `f482628c-a193-499d-b595-fc223cb15aab`;
- [x] remote Chromium: scheduler `/health`, web `/`, web `/ui-kit` = 200; production Workers untouched.

## Журнал handoff

### 2026-07-21 — E4-D5-T04 / weekly target + interval implementation and edit initialization bug

- `weekly_target` and `interval` configs added to schedule model; `weekBounds`, `weeklyTargetFacts` and local-calendar `expandLocalSlots` cover table-driven examples.
- S-MA-062 now exposes all four schedule types through direct Konsta options; weekly target fields and interval amount/unit/explicit local anchor are present. `/api/v1/habits` summary supports the new rule types.
- Reproduced and fixed edit race: persisted `weekdays` rule was loaded after HabitFormInner mounted with default `exact_times`; form now gates initial mount on `schedule.isPending`. URL repro confirms `По дням недели`, weekday controls, console errors 0.
- Verification: web typecheck PASS; lint PASS with one pre-existing unrelated `step-session-screen.tsx` `<img>` warning; build PASS; pure schedule examples PASS; `git diff --check` PASS; 390 viewport overflow 0; light/dark 360/430 checks overflow 0 and console errors 0; persisted weekdays radio selected.
- Apple Design upstream skill loaded and adapted to `.pi/skills/apple-design/SKILL.md`; mandatory use added to `.pi/skills/flowly-task-workflow/SKILL.md` and root `AGENTS.md`. Frequency UI was corrected after user feedback: all four types now use one consistent 2×2 direct-Konsta segmented block; screenshots saved in `.temp/E4-D5-T04/screenshots/`. Light/dark 360/390/430 matrix is PASS, while direct timezone/history mutation rerun remains unperformed.

### 2026-07-21 — E4-D5-T02 S-MA-061: фикс даты + расширение иконок + поле emoji

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E4-D5-T02 `review` (API/DB/onboarding без структурных изменений, кроме новой колонки).
- **User feedback → сделано:**
  - **Date fix:** native `<input type=date>` value в Telegram Mini App был со сдвигом (Chromium/WebKit не позволяет позиционировать `::-webkit-date-and-time-value` через CSS — padding/line-height/display/appearance проверены и игнорируются). Значение input теперь прозрачное (`!text-transparent` + скрытый `calendar-picker-indicator`), поверх — центрированный overlay-текст `formatDateRu` («21 июля 2026 г.»); DOM-замер подтвердил совпадение центра overlay и строки input. Дата вынесена в отдельный `List` внутри `relative`-обёртки.
  - **Icon catalog +12:** в спрайт DEC-037 добавлены точные Lucide-пути (`pill, footprints, brain, book-open, coffee, apple, activity, droplet, wind, flame, zap, smile, pencil`); `ICON_OPTIONS` теперь 25.
  - **Emoji identity (user decision: отдельное поле + миграция):** `habits.emoji TEXT` + migration `0016_habits_emoji.sql`; schema/zod/POST/PATCH/GET/list обновлены; `EMOJI_OPTIONS` (38 wellness-эмодзи); `HabitCardVM.emoji` + HabitCard рендерит emoji вместо Lucide-иконки когда задан; Sheet «Внешний вид» получил секцию «Эмодзи» (grid 6-col + «Без эмодзи»), row media/subtitle/aria-label отражают выбор.
- **Проверки:** typecheck PASS; eslint `features/rhythm/` + `app/api/v1/habits` PASS; production build PASS; migration 0016 applied (local D1, 2 commands OK); browser create→list с emoji 💊 PASS (тестовая привычка удалена); overflow 0 + min target ≥44 (base 48 / Sheet-open 44) + 0 console errors в матрице 360/390/430 × light/dark. Audits: 0 raw interactive HTML, 0 raw `fetch` (только `lib/api/client.ts`), 0 CSS modules, `@flowly/ui` только approved Icon.
- **Residual:** real-device/Telegram WebView проверка фикса даты и emoji-рендера не выполнялась (головной Chromium — вебките-подобный, но реальный TMA может отличаться в рендере emoji/шрифтов); emoji хранится как string (без валидации набора — любой эмодзи ≤16 char проходит через API, UI предлагает curated `EMOJI_OPTIONS`). **commit/push не выполнялись** по прямому запрету пользователя.
- **Следующее точное действие:** user review даты/иконок/emoji → approval → `done` + commit/push по разрешению; затем E4-D5-T03.

### 2026-07-20 — E4-D5-T02 S-MA-061: user выбрал V3 без preview → единая production-форма

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E4-D5-T02 `review` (API/DB/onboarding без изменений); экран S-MA-061 теперь единый.
- **Решение user:** из 3 концепций выбран **V3** (row-based editor + Konsta Sheet), preview-карточка отклонена («зачем предпросмотр — он не нужен»).
- **Сделано:** удалены `habit-form-compact.tsx` (V1), `habit-form-guided.tsx` (V2), `habit-form-shared.ts` и `?variant=` из роутов; V3 без preview слит в единый `habit-form-screen.tsx` (inline `todayLocal`/`createInitial`/`focusRing` + edit loading/error wrapper + row-based форма + Konsta Sheet для icon/color). Роуты `/rhythm/new` и `/rhythm/[id]/edit` — без `?variant`.
- **Проверки:** typecheck PASS; targeted lint PASS; production build PASS; **overflow = 0 и targets ≥48px** во всex 6 комбинациях ({360,390,430} × {light,dark}); **0 console errors**; Sheet open→select→close, title→CTA enable, medical §39 warning по keywords проверены в browser. Audits: 0 raw interactive HTML, 0 raw `fetch` (только `lib/api/client.ts`), 0 CSS modules, `@flowly/ui` только approved Icon. Konsta `ListInput title=""` workaround применён. Screenshot: `.temp/E4-D5-T02/screenshots/habit-form-final.png` (390px light, DPR 1).
- **Residual:** real-device/Telegram WebView проверка не выполнялась; edit-mode prefill работает через общий `createInitial`; полный create→list→edit flow уже верифицирован ранее (HTTP + browser). **commit/push не выполнялись** по прямому запрету пользователя.
- **Следующее точное действие:** user review единой формы → approval → `done` + commit/push по разрешению; затем E4-D5-T03.

### 2026-07-20 — E4-D5-T02 S-MA-061: 3 UI-концепции формы привычки

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E4-D5-T02 остаётся `review` (API/DB/onboarding без изменений); экран S-MA-061 перепроектирован в 3 разные концепции.
- **Сделано:** одна форма заменена тремя концепциями с разной информационной архитектурой, композицией, приоритетами и interaction model:
  - **V1 Compact iOS Form** (`habit-form-compact.tsx`, `?variant=1`) — классическая grouped iOS-форма: 4 BlockTitle-секции (Основное / Иконка / Цвет / Дата и правило), title+description в одной List-группе, icon/color как компактные inline горизонтальные scroll-полоски (одна строка, snap), один primary CTA внизу.
  - **V2 Guided Flow** (`habit-form-guided.tsx`, `?variant=2`) — пошаговый wizard: один вопрос на шаг (title → icon → color → details → review), виден только текущий шаг, Progressbar + «Шаг N из 5», Continue/Back/Done с локальной per-step validation, крупные selection tiles (не inline strips), live HabitCard-preview перед созданием.
  - **V3 Preview-first** (`habit-form-preview.tsx`, `?variant=3`) — composition вокруг live preview: живой HabitCard-preview сверху (обновляется при изменении title/icon/color), title/description как List rows, icon/color через настоящий Konsta Sheet (открывается из row «Внешний вид»), «Правила» (date + allowSkip) отдельно, CTA «Создать «{title}»».
  - Роуты `/rhythm/new` и `/rhythm/[id]/edit` читают `?variant=1|2|3` (default 1). Business-логика/submit/redirect вынесены в `habit-form-shared.ts` (`useHabitFormSubmit`, `buildPayload`, `createInitial`, `focusRing`, `todayLocal`); `habit-form-screen.tsx` — dispatcher + edit loading/error. Ни API, ни DB, ни schedule/occurrences/reminders/sharing не затронуты.
- **Проверки:** typecheck PASS; targeted lint PASS (7 файлов); production build PASS (`/rhythm/new`, `/rhythm/[id]/edit` ƒ dynamic); **0 console errors** во всex вариантах; **overflow = 0 и min target ≥44px** во всex 18 комбинациях (3 variants × {360,390,430} × {light,dark}); validation states (CTA disabled до заполнения, Konsta-native error border+text после blur, medical §39 warning по keywords, выбранные icon/color) проверены в browser; V2 wizard transition step 1→5 + Back и V3 Sheet open/select/close + live-preview update проверены. Audits: 0 raw interactive HTML, 0 raw `fetch` в client (только `lib/api/client.ts`), 0 CSS modules, `@flowly/ui` только approved Icon (DEC-037). Konsta `ListInput title=""` workaround применён во всex 3 вариантах. Screenshots: `.temp/E4-D5-T02/screenshots/form-variant-{1,2,3}.png` (390px light, DPR 1).
- **Residual risks / notes:** (1) Playwright actionability давал ложные click-timeout на Continue (V2) и icon-in-Sheet (V3) из-за nested `<main>` (shell + flow-screen — существующий паттерн) + Konsta transitions; `elementFromPoint` подтверждает корректный top-элемент, реальные клики работают через evaluate. (2) edit-mode во V2 стартует с шага title (предсказуемо); во всех вариантах edit prefill работает через общий `createInitial`. (3) Real device/Telegram WebView проверка не выполнялась. (4) Все 3 концепции используют одни mutation/API/ownership contracts.
- **Открытые вопросы для user review:** какая из трёх концепций становится production (или нужна доработка конкретного варианта). Выбор определяет, какие файлы остаются; остальные можно удалить после approval.
- **Следующее точное действие:** user review 3 концепций → approval одной → оставить её как единственную S-MA-061 (удалить switcher/остальные варианты) → `done` + commit/push по разрешению; затем E4-D5-T03.

### 2026-07-19 — E4-D5-T02 CRUD привычки реализован → `review`

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E4-D5-T02 (CRUD привычки, иконки/цвета, onboarding S-MA-004) `in_progress -> review`; ждёт DEC-024 user approval.
- **Сделано (autonomy-итерация: plan → 2 self-reviews → implement):**
  - **DB:** `habits` table (§43.16) в `packages/database/src/schema.ts` + migration `0015_habits.sql` (CREATE TABLE + index owner/status).
  - **API:** `app/api/v1/habits/route.ts` (GET list owner-only active, POST create zod-validated private) и `app/api/v1/habits/[id]/route.ts` (GET/PATCH/DELETE, ownership → 404 для чужого/несуществующего, DELETE=archive DEC-017). CSRF `isSafeOrigin`, `rejectOversizedBody`, `audit`.
  - **Model:** `features/rhythm/model/{habits,habits-queries,habit-card-vm,rhythm-types}.ts` — zod schemas, ICON_OPTIONS (12 Lucide), COLOR_OPTIONS (8 palette, static Tailwind classes), react-query hooks (DEC-029), `habitsToCards` mapper.
  - **UI S-MA-061:** `habit-form-screen.tsx` — Konsta List/ListInput/Toggle/Button + icon/color Button-grid picker (aria-pressed) + §39 medical warning (keyword heuristic) + start date + allow_skip + privacy footer. Создание/редактирование (lazy initial state из props, без setState-in-effect).
  - **/rhythm:** real `useHabitsQuery` + loading/error/empty/list states; CTA «Добавить привычку» активна; HabitCard с identity color cell + edit nav + «Расписание скоро» при todayTotal=0.
  - **Onboarding S-MA-004:** реальная «Создать привычку» → `/rhythm/new?return=onboarding`; «Продолжить» честный skip; «Пригласить друга» disabled (E7).
- **Проверки:** migration 0015 applied (local D1); HTTP CRUD matrix (dev-session, dev D1 `32bcd6ed…sqlite`): 401/400/201/200/404/400/200/n=0 — auth/validation/CRUD/ownership-privacy/archive; browser real-auth create→list→edit-prefill flow PASS; typecheck/lint/build PASS; 0 console errors (только Telegram SDK mock warnings); overflow 0; audits — 0 raw interactive/fetch/css-modules, `@flowly/ui` только Icon. Screenshots: `.temp/E4-D5-T02/screenshots/*`. Plan: `.temp/E4-D5-T02/plan.md`.
- **Residual risks (явно вне T02):** schedule types (T03/T04), occurrences/completion (T05/T07), reminder policies (T06), sharing реализация (E7), emoji picker, real delete (E8). S-MA-064 full detail/history — T05+.
- **Открытые вопросы для user review:** picker использует Konsta Button с aria-pressed (toggle) вместо radio — Konsta не имеет icon/color picker; semantics acceptable. Medical heuristic по keywords (таблетк/лекар/…) — может давать false positive/negative, но честная формулировка.
- **Следующее точное действие:** user review T02 → approval → `done` + commit/push; затем E4-D5-T03 (schedule «конкретное время» + дни недели, S-MA-062).

### 2026-07-19 — E4-D5-T01 HabitCard: ring (DEC-067) зафиксирован как production

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E4-D5-T01 (slice S-MA-060) остаётся `review`; HabitCard переработан — ring как единственный production-вариант.
- **Сделано:** после feedback о пустоте под identity-иконкой в layout с Progressbar, предложены 3 варианта карточки (ring / full-width bar / compact row) с dev-switcher. **User выбрал v1 ring** → оформлен **DEC-067** (inline SVG progress-ring вокруг иконки, exception к DEC-035, тот же gap что DEC-040 для Home). Варианты v2/v3 и switcher удалены; `HabitCard` упрощён до одного ring-layout + icon-only quick-complete `Button` 44×44 (disabled в T01, активен в T05). Добавлена 3-я demo-привычка «Прогулка» (pending, streak 0) для полноты состояний.
- **Проверки:** typecheck/lint PASS; production build PASS (`/rhythm` ƒ dynamic); browser `:3002` — 0 console errors, overflowX 0, cards 93px равновысокие, circle-check 44×44 с `aria-label`, ring SVG рендерится; audits чисты (0 raw/fetch/css-modules/legacy; `@flowly/ui` только approved Icon). Screenshots: `.temp/E4-D5-T01/screenshots/rhythm-{empty,demo}-{light,dark}.png`.
- **Ответ на вопрос пользователя:** quick-complete галочка станет кликабельной в **T05** (completion/occurrences, DEC-017): один клик = одно выполнение слота (multi-slot) или полный done (single-slot).
- **Следующее точное действие:** user review slice S-MA-060 → approval → `done`; затем E4-D5-T02 (CRUD привычки + API GET/POST /habits + ownership + identity color §22.3 + loading/error/offline states).

### 2026-07-19 — E4-D5-T01 slice S-MA-060 реализован → `review`

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E4-D5-T01 (экран «Ритм», slice S-MA-060) `in_progress -> review`; ждёт DEC-024 user approval.
- **Сделано:**
  - **Реализация slice S-MA-060** в `apps/web/features/rhythm/**` (`model/rhythm-types.ts`, `ui/habit-card.tsx`, `ui/rhythm-screen.tsx`) + `apps/web/app/(app)/rhythm/page.tsx`. Direct Konsta composition (DEC-035): `Card`, `BlockTitle`, `Button`, `Badge`, `Chip`, `Progressbar`, `@flowly/ui` `Icon` (DEC-037).
  - **Empty state** (§21.1): Card с приветствием «Небольшие шаги каждый день» + объяснение; секция «Идеи для начала» с 8 не кликабельными Konsta Chips (§21.2 примеры — не создаются автоматически); primary CTA «Добавить привычку» disabled (создание — T02) с подписью «Создание привычки скоро».
  - **Dev-preview** `?rhythm=demo` (dev-only, в production игнорируется): Badge «Предпросмотр» + mock HabitCard list (Вода 3/4 partial, Сон вовремя 1/1 done). 
  - **HabitCard §21.3**: icon-cell (accent-soft), title h2, следующий срок, Badge-статус (Готово/Частично — non-color cue), Progressbar + «N из M» для multi-slot (DEC-017), серия текстом, quick-complete `Button inline disabled` «Скоро»/«Готово» с `aria-label` контекста привычки. Identity color (§22.3) отложен до T02.
- **Проверки:** typecheck PASS; eslint PASS; production build PASS (`/rhythm` ƒ dynamic); browser `:3002` через preview-bypass `?onboarding=preview`: 0 console errors, overflowX 0 (empty + demo, 100 % и 200 % text), targets ≥44 (CTA 48, quick-complete 44; 88 @200 %), chips wrap (4+4); audits — 0 raw controls, 0 CSS modules, 0 raw `fetch`, 0 legacy flow-visual, `@flowly/ui` только approved Icon.
- **Изменённые файлы:** `apps/web/features/rhythm/{model/rhythm-types,ui/habit-card,ui/rhythm-screen}.tsx`, `apps/web/app/(app)/rhythm/page.tsx`, `docs/roadmap/{README,HANDOFF}.md`, `docs/roadmap/stages/04-my-rhythm.md`, `.temp/E4-D5-T01/screenshots/*`.
- **Residual risks:** AppShell Navbar/Tabbar не валидировались в этом slice (preview-bypass без auth session; shell покрыт другими slices). GET /habits API, CRUD, DB-level ownership `WHERE user_id`, loading/error/offline states (DEC-022 для fetch), identity color (§22.3) и completion (quick-complete) — T02/T05. Local dev server на `:3002` (PID 68786) оставлен запущенным; запускал отдельный `npm run dev` упал из-за занятого порта (без вреда).
- **Следующее точное действие:** user review slice S-MA-060 (screenshots `.temp/E4-D5-T01/screenshots/`, опционально живой `/rhythm` на dev-сервере) → approval → `done`; затем E4-D5-T02 (CRUD привычки + API GET/POST /habits + ownership + loading/error/offline states).

### 2026-07-19 — README sync + E4-D5-T01 `backlog -> in_progress`

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** README расхождение исправлено; E4-D5-T01 (экран «Ритм», slice S-MA-060) `in_progress`, research завершён, план slice готовится к user approval по DEC-024.
- **Сделано:**
  - **README sync:** таблица этапа 3 была «4 backlog / 3 done», по карточкам T01–T07 все `done`. Приведено в соответствие: этап 3 `done` (7), итоги пересчитаны (38 done / 1 blocked / 40 backlog), «Текущий фокус» переключён на этап 4 / E4-D5-T01.
  - **E4-D5-T01 research:** PRD §21 (раздел «Мой ритм»: §21.1 empty, §21.2 примеры, §21.3 карточка), §44.7 (habits API — CRUD относится к T02, не T01), DEC-017 (habit lifecycle/weekly target/timezone future-only), DEC-022 (контекстные UI-состояния), DEC-024 (per-slice approval), DEC-029 (react-query обязателен), DEC-035 (Konsta-only). F07 diagram (habits flow): S-MA-060 — P-COLLECTION «empty Rhythm explains and offers add», пустое состояние является primary для T01 (привычек нет до T02). Существующий `/rhythm` placeholder (простой Card), AppRouteShell уже мапит `/rhythm` как tab-root с Navbar title «Ритм» и tabbar label «Ритм» (icon `leaf`). Reference patterns: ProgramsCatalogScreen (collection Card/Segmented/loading-error-empty), Home (Card/List/ListItem/Progressbar/Badge).
- **Открытые вопросы (к user approval):** (1) scope T01 — только empty-state screen, или + типизированный HabitCard с dev-preview для проверки card state; (2) CTA «Добавить привычку» в empty — disabled «Скоро» или ведёт к placeholder создания T02; (3) примеры §21.2 — статичные chips или список.
- **Изменённые файлы:** `docs/roadmap/README.md`, `docs/roadmap/stages/04-my-rhythm.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки:** diffs docs-only; runtime не затронут.
- **Следующее точное действие:** получить user approval scope T01 → реализовать slice S-MA-060 (empty/loading/error/offline + опционально HabitCard dev-preview) → browser 360/390/430 light/dark → typecheck/lint/build → user review по DEC-024.

### 2026-07-18 — E2-D2-T08 re-verification → done / commit+push

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E2-D2-T08 `in_progress -> review -> done` после независимой re-verification; commit+push по явному разрешению пользователя.
- **Сделано:** перепроверена реализация YouTube-результата-как-тренировки, выполненная другой нейронкой. Подтверждено: shared `handleYoutubeWorkoutPost` (Save + create-workout без copy-paste), partial unique index 0008, card main-open → `/workouts/[id]`, Play остаётся DEC-053 popup без materialization, generated empty detail (`sourceType=youtube && exercises.length===0`) скрывает Exercises/Details и переиспользует общий Hero/ActionPanel/session. Occurrence→workout JOIN возвращает `source_type=youtube` — report-source data contract для E6 подтверждён.
- **Проверки:** root typecheck/lint/build PASS; dev `:3002` HTTP — concurrent real-video Save+Create один ID, fresh `created=true`, repeat `created=false`; generated detail API `sourceType=youtube/format=video/exercises0/start.enabled=true`; browser `/youtube` 390px ровно 3 действия на карточку (Открыть/Воспроизвести/Сохранить), 0 console errors, click «Открыть» → `/workouts/<id>` без reload; generated-detail DOM `hasExercises=false/hasDetails=false/Начать enabled/Hero Play/overflow=0`; UI идентичен user-reference `/workouts/019f6a1f-...`; Start→Finish создал occurrence, SQL join `source_type=youtube` PASS.
- **Изменённые файлы:** `apps/web/lib/youtube-workouts.ts` (новый shared service), `apps/web/app/api/v1/youtube/videos/[videoId]/{save,create-workout}/route.ts`, `apps/web/features/youtube-search/{model/youtube-queries,ui/youtube-search-screen}.tsx`, `apps/web/features/workout-detail/ui/workout-detail-screen.tsx`, `packages/database/src/schema.ts`, `migrations/0008_clumsy_stingray.sql` + meta, docs (AGENTS/DECISIONS/README/HANDOFF/stages 02+06/design flows+review).
- **Residual risks:** production duplicate preflight — remote migration 0008 может упасть, если в prod уже есть дублейкаты (старый save имел pre-check, маловероятно); CI deploy при ошибке безопасно прерывается. Visible report UI (Badge `YouTube`) остаётся E6 (экраны backlog). Real Telegram WebView autoplay/player — device-check.
- **Следующее точное действие:** следить за production deploy CI после push; затем E2-D3-T02 (step/mixed session) поверх того же DEC-062 runtime.

### 2026-07-14 — E1-D1-T06 / Slice S-MA-005 preview + fix(habit select)

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T06 `in_progress` (S-MA-005 — preview, ждёт approval).
- **Сделано:**
  - **S-MA-005 (bot connection gate)** — `features/onboarding/ui/bot-connection-screen.{tsx,module.css}`, route `?onboarding=bot` в `app/page.tsx`; mandatory P-GATE (DEC-014, §10.1 step 9, §36), состояния `checking|linked|error`, dev-force `?bot=checking|linked|error`; completion disabled до верификации; дефолт авто checking→linked ~1.2с; убран `padding-left` у `.diagnostics`. Реальный `getChat` — этап 5.
  - **fix(habit):** нативная стрелка `<select>` поля «Время напоминания» не двигалась `padding-right` → `appearance:none` + `.selectWrap`/`.selectCaret` (chevron-down из `@flowly/ui`, тема-адаптивный, ~14px от края).
  - **S-MA-004 approved** пользователем; уточнено, что блокер «чек-иконки» был по Главной (S-MA-010), починен другим агентом.
  - Создан vision-субагент `code-analysis.vision-checker` на `openai-codex/gpt-5.3-codex-spark` для анализа скриншотов.
- **Проверки:** typecheck/lint PASS (`@flowly/web`); browser-verify 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors на экранах; select-caret confirmed (`appearance:none`, caret 14px от края).
- **Evidence:** `.temp/E1-D1-T06/screenshots/sma005-{checking,error}-430-light.png`, `sma005-linked-430-{light,dark}.png`, `sma004-select-caret-430-light.png`.
- **Блокеры / решения:** S-MA-005 ждёт явного approval (пользователь смотрит вживую); реальный `getChat` verify и Telegram WebView — этап 5/downstream.
- **Следующее точное действие:** approval S-MA-005 → запуск S-MA-006 (safe reason + auth/recovery/exit).

### 2026-07-14 — E1-D1-T06 / S-MA-005 approved + S-MA-006 approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `in_progress`; S-MA-005 (bot gate) и S-MA-006 (deep-link recovery) одобрены пользователем.
- **Сделано:**
  - **S-MA-006 (deep-link recovery)** — `features/recovery/ui/deep-link-recovery-screen.{tsx,module.css}`, отдельный dev-route `?recovery=unavailable|auth|permission` в `app/page.tsx` (не onboarding). Full-screen recovery (DEC-022): безопасная причина без раскрытия + recovery/auth + релевантный выход. 3 варианта: unavailable (→ Главная/Открыть в Telegram), auth (→ Войти заново loading→home / Главная), permission (→ Главная/Справка). Интеракция «Войти заново» проверена.
- **Проверки:** typecheck/lint PASS (`@flowly/web`); browser-verify 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors на экранах; «Войти заново» → loading → `/?tab=home` confirmed.
- **Evidence:** `.temp/E1-D1-T06/screenshots/sma006-{unavailable,auth,permission}-430-light.png`, `sma006-unavailable-430-dark.png`.
- **Блокеры / решения:** реальный access-recheck и Telegram WebView — downstream этапов; S-WEB-001/002 остались.
- **Следующее точное действие:** S-WEB-001 (open via Telegram).

### 2026-07-14 — E1-D1-T06 / S-WEB-001 approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `in_progress`; S-WEB-001 (outside-Telegram fallback) одобрен пользователем («чотко»). Остался S-WEB-002.
- **Сделано:** `features/web-fallback/ui/open-via-telegram-screen.{tsx,module.css}`, route `?web=open`. P-WEB (§10.3, unauthenticated): одна badge-иконка + «Откройте Flowly через Telegram» + «Открыть в Telegram»/«Справка»; данных приложения не показывается. Логотип убран по просьбе пользователя (был избыточен вместе с badge).
- **Проверки:** typecheck/lint PASS; 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors, 0 `<img>`.
- **Evidence:** `.temp/E1-D1-T06/screenshots/sweb001-open-430-{light,dark}.png`, `sweb001-open-430-light-nologo.png`.
- **Следующее точное действие:** S-WEB-002 (unavailable deep link).

### 2026-07-14 — E1-D1-T06 / S-WEB-002 approved → все 8 slice готовы, T06 в review

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `in_progress -> review`; все 8 UI slice approved (S-MA-001…006, S-WEB-001/002); acceptance закрыт.
- **Сделано:** S-WEB-002 `features/web-fallback/ui/unavailable-deep-link-screen.{tsx,module.css}`, route `?web=unavailable`. P-WEB (§10/§32/§36): safe reason без утечки target + «Открыть в Telegram»/«Справка».
- **Проверки:** typecheck/lint PASS; 430 light/dark: overflow 0, таргеты ≥44px, 0 console errors.
- **Evidence:** `.temp/E1-D1-T06/screenshots/sweb002-unavailable-430-{light,dark}.png`.
- **Следующее точное действие:** решение пользователя по T06 (review→done) и выбор следующей задачи (foundation T05/T07/T08/T09/T10 либо этап 2).

### 2026-07-14 — E1-D1-T06 done (без deep review) / старт E1-D1-T05 (R2)

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T06 `review -> done` (пользователь «Закрыть без review»); следующая — E1-D1-T05 (R2 storage), `backlog -> in_progress` после deep plan.
- **Сделано:** T06 закрыт: Phase 0 backend auth + 8 UI slice approved (S-MA-001…006, S-WEB-001/002), acceptance подтверждён evidence.
- **Остаточные риски T06:** реальный Telegram WebView/safe-area и end-to-end delivery — downstream; rate limit in-memory per-isolate; dev-emulation path не runtime-тестировался в production build.
- **Следующее точное действие:** deep plan E1-D1-T05 (R2).

### 2026-07-14 — E1-D1-T05 (R2) реализован, переведён в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T05 `in_progress -> review`.
- **Сделано:** `@flowly/storage` (adapter `put/get/delete/exists` + `storageKey`, типы выведены из R2-интерфейсов), `r2_buckets` (`STORAGE` / `flowly-storage`, local-only) в `apps/web/wrangler.jsonc`, `getStorage()` в `apps/web/lib/cloudflare.ts`, web deps `@flowly/storage` + `@cloudflare/workers-types`. README — раздел «Storage (R2)».
- **Проверки:** clean `npm install`; root typecheck/lint PASS; `@flowly/web` next build PASS; `deploy:check` (wrangler dry-run парсит `r2_buckets`) PASS; **local R2 roundtrip smoke PASS** (miniflare, `.temp/E1-D1-T05/r2-smoke.mjs`); secret scan 0.
- **Residual risks:** реальный test/prod bucket — отдельный scope; `getStorage()` runtime через OpenNext request context — downstream этап 2 (как D1 в T04→T06); upload/access flows — этап 2.
- **Следующее точное действие:** решение пользователя по T05 (review→done) → T07 (envs).

### 2026-07-14 — E1-D1-T05 done (deep review PASS) / старт E1-D1-T07 (envs)

- **От кого / кому:** пользователь + субагент-reviewer → AI agent / следующий агент.
- **Статус задачи:** T05 `review -> done` (независимый deep review: PASS gate, 0 багов; warning `MEDIA`→`STORAGE` в README исправлена). Следующая — E1-D1-T07 (envs).
- **Следующее точное действие:** deep plan E1-D1-T07.

### 2026-07-14 — E1-D1-T07 (envs) in_progress + правка счётчиков

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T07 `backlog -> in_progress`; deep plan утверждён (явный TELEGRAM_MODE+fallback; mock=console+buffer).
- ** правка счётчиков:** обнаружен наследованный off-by-one (stage 1 и глобальный индекс). Пересчёт по картам: stage 1 = 3 backlog/1 in_progress/7 done (11); глобально 59 backlog/1 in_progress/12 done (72). Исправлено в stage summary, README index и «Итого».
- **Следующее точное действие:** реализовать T07 (mode resolver + mock logger + env-matrix docs).

### 2026-07-14 — E1-D1-T07 (envs) реализован, переведён в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T07 `in_progress -> review`.
- **Сделано:** `@flowly/telegram` `mode.ts` (TelegramMode, `resolveTelegramMode` — явный `TELEGRAM_MODE`+fallback, `createTelegramLogger` — mock→console+buffer, 0 сети); `getTelegramMode()` в `lib/cloudflare.ts`; `TELEGRAM_MODE` в `.dev.vars.example`; README «Среды и режимы» (таблица local/test/prod + режимы + команды + изоляция).
- **Проверки:** root typecheck/lint PASS; `@flowly/web` next build PASS; **mode-check PASS** (tsx, 6 случаев resolve + mock buffer/drain + «mock makes 0 fetch»); `.gitignore` покрывает `.wrangler/`/`.dev.vars`; secret scan 0.
- **Residual risks:** реальные test/prod D1/R2/test-bot — отдельный scope; реальный outbound sender — этап 5; `test`/`test:e2e` — stab; test обязан ставить `TELEGRAM_MODE=test`.
- **Следующее точное действие:** решение пользователя по T07 (review→done) → T08 (seeds).

### 2026-07-14 — E1-D1-T07 done (deep review PASS) / старт E1-D1-T08 (seeds)

- **От кого / кому:** пользователь + субагент-reviewer → AI agent / следующий агент.
- **Статус задачи:** T07 `review -> done` (deep review PASS gate, 0 багов; пункт process.env-in-Worker robust; закрыты W1 README-уточнение + S1 mock-ID счётчик). Следующая — E1-D1-T08 (seeds).
- **Следующее точное действие:** deep plan E1-D1-T08.

### 2026-07-14 — E1-D1-T08 (seed) реализован, переведён в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T08 `backlog -> in_progress -> review`. Scope — foundation-only (entity-seed на этапы 2–4 по решению пользователя).
- **Сделано:** `seeds/0001_test_users.sql` (4 test-пользователя: Анна/Мария/Олег/Игорь + `user_settings`, INSERT OR IGNORE); `db:seed` в `apps/web/package.json` (`wrangler d1 execute --local`) + root `package.json` → web; убран stub `db:seed` из `@flowly/database`; README seed-нота.
- **Проверки:** reset→migrate→seed PASS; **users=4, user_settings=4**; re-seed idempotent (без дублей); root typecheck/lint PASS; production-защита через `--local`.
- **Residual risks:** entity-seed §49.5 — этапы 2–4; auth_sessions не сижятся (dev login через FLOWLY_DEV_EMULATION); production D1 — отдельный scope.
- **Следующее точное действие:** решение пользователя по T08 (review→done) → T09 (security/DoD gate).

### 2026-07-14 — E1-D1-T08 done / старт E1-D1-T09 (security/DoD gate)

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T08 `review -> done` (без deep review). Следующая — E1-D1-T09 (security/DoD gate, разблокирована: T02–T08 done).
- **Следующее точное действие:** deep plan E1-D1-T09.

### 2026-07-14 — E1-D1-T09 (security/DoD gate) реализован, переведён в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T09 `backlog -> in_progress -> review`.
- **Сделано:** security headers в `apps/web/next.config.ts` (nosniff/frame SAMEORIGIN/referrer/permissions + CSP baseline dev-aware); `apps/web/lib/auth/http.ts` (`rejectOversizedBody` 64 KiB + `audit()`); size-limit+audit в 3 маршрутах (auth/telegram, me, auth/logout); evidence report `docs/roadmap/evidence/T09-dod.md` (§55.1 5/5 + §47.1 mapping); README «Безопасность».
- **Проверки:** typecheck/lint/build PASS; **headers curl -I PASS**; **PATCH /me >64 KiB → 413** (curl-repro); app loads без CSP-нарушений (browser-verify, 0 console errors); secret scan 0.
- **Residual risks:** per-object ownership (#5/#6) — этапы 2–7; webhook/cb-idem (#10/#11) — этап 5; prod rate limit + full audit/observability (#7/#14) + nonce-CSP — этап 8.
- **Следующее точное действие:** решение пользователя по T09 (review→done) → T10 (profile/help).

### 2026-07-14 — E1-D1-T09 done (deep review PASS) / старт E1-D1-T10 (profile/help)

- **От кого / кому:** пользователь + субагент-reviewer → AI agent / следующий агент.
- **Статус задачи:** T09 `review -> done` (deep review PASS gate, 0 багов; закрыты HSTS/X-Frame-DENY/me.patch-audit; W1 unsafe-inline + nonce-CSP — residual этап 8). Следующая (последняя foundation) — E1-D1-T10 (profile/help).
- **Следующее точное действие:** deep plan E1-D1-T10.

### 2026-07-14 — E1-D1-T10 / Slice S-MA-080 (profile hub) approved

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T10 `backlog -> in_progress`; S-MA-080 approved, T10 остаётся `in_progress` до S-MA-090/S-MA-096.
- **Сделано:** `features/profile/ui/profile-hub-screen.{tsx,module.css}`, route `?screen=profile` в `app/page.tsx`. P-COLLECTION-READ (§9, §38; DEC-013/020): header (Flowly name + Telegram username) + 9 секций с честным stage-mapping (friends/challenges→7, favorites→2, reports→6, settings→S-MA-090, notifications→5, export/delete→8, help→S-MA-096); hub только навигирует. UX-fix по пользовательскому замечанию: убран избыточный badge `Telegram`; длинное имя clamp до 2 строк; длинный username ellipsis; на узком экране `Изменить` переносится вниз. Исправлен avatar entry: `/?section=profile` → `/?screen=profile`.
- **Проверки:** `npm run typecheck --workspace @flowly/web` PASS; `npm run lint --workspace @flowly/web` PASS; browser 390 light: avatar→profile PASS, long-name/username layout PASS, console errors 0.
- **Evidence:** `.temp/E1-D1-T10/screenshots/sma080-profile-430-{light,dark}.png`, `.temp/E1-D1-T10/screenshots/sma080-profile-long-name-390-light.png`.
- **Approval:** пользователь: «круто» / «сделай так» после удаления Telegram badge и long-name UX-fix.
- **Следующее точное действие:** S-MA-090 (settings).

### 2026-07-14 — E1-D1-T10 / Slice S-MA-090 (profile settings) preview

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T10 `in_progress`; S-MA-090 approved, T10 остаётся `in_progress` до S-MA-096.
- **Сделано (historical E1 evidence; week-start later superseded by DEC-042):** `features/profile/ui/profile-settings-screen.{tsx,module.css}`, route `?screen=settings` в `app/page.tsx`; profile hub/«Изменить» ведут в settings. Настройки покрывали Flowly name, timezone, week start, theme, report toggles, save/saved/offline/error draft states. По решению пользователя DEC-020 уточнён: аватар Flowly не редактируется и не загружается; актуальная аватарка берётся из Telegram при входе/проверке. API foundation расширен: PATCH `/api/v1/me` принимает `firstName`; re-auth обновляет Telegram `username`/`photoUrl`, не перетирая Flowly name.
- **Проверки:** `npm run typecheck --workspace @flowly/web` PASS; `npm run lint --workspace @flowly/web` PASS; browser 390 light/dark: overflow 0, min target 44px, save/offline states PASS, timezone RU search `сама`→Samara PASS, console errors 0.
- **Evidence:** `.temp/E1-D1-T10/screenshots/sma090-settings-no-timeformat-theme-390-dark.png`, `.temp/E1-D1-T10/screenshots/sma090-settings-saved-390-light.png`, `.temp/E1-D1-T10/screenshots/sma090-settings-timezone-ru-search-390-dark.png`.
- **Approval:** пользователь: «так лучше апрув» после удаления time-format, лишних avatar-текстов/поля подписи и compact theme tabs.
- **Блокеры / решения:** нет технических блокеров. Delivery отчётов — downstream этап 6.
- **Следующее точное действие:** S-MA-096 (help).

### 2026-07-14 — E1-D1-T10 / Slice S-MA-096 (help) preview

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T10 `in_progress -> review`; S-MA-096 approved, все 3 slice T10 approved.
- **Сделано:** `features/profile/ui/help-screen.{tsx,module.css}`, route `?screen=help`; profile hub/«Справка» ведёт в help. Help покрывает product topics, bot diagnostics check/retry, safe exits to profile/home/settings/open bot; `?help=bot-error` forced error state.
- **Проверки:** `npm run typecheck --workspace @flowly/web` PASS; `npm run lint --workspace @flowly/web` PASS; browser 390 dark: profile→help PASS, overflow 0, min target 44px, bot diagnostic checking→ok PASS, console errors 0.
- **Evidence:** `.temp/E1-D1-T10/screenshots/sma096-help-390-dark.png`, `.temp/E1-D1-T10/screenshots/sma096-help-bot-ok-390-dark.png`.
- **Approval:** пользователь: «арпув идем дальше».
- **Блокеры / решения:** нет технических блокеров; deep review отклонён пользователем.
- **Следующее точное действие:** E2-D2-T01 (стартовый каталог).

### 2026-07-14 — E1-D1-T10 done без deep review

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** T10 `review -> done`; этап 1 закрыт полностью.
- **Сделано:** пользователь подтвердил, что все S-MA-080/S-MA-090/S-MA-096 протестированы и approved; deep review не проводится.
- **Проверки и результаты:** ранее зафиксированы typecheck/lint PASS; browser evidence по profile/settings/help PASS; остаточные downstream — реальные отчёты/Telegram delivery/другие разделы профиля по этапам 2–8.
- **Следующее точное действие:** E2-D2-T01 — стартовый каталог.

### 2026-07-14 — E2-D2-T01 start

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** E2-D2-T01 `backlog -> in_progress`.
- **Проверено:** roadmap/HANDOFF, карточка E2-D2-T01, dependencies E1-D1-T04/E1-D1-T08 done, активных карточек нет.
- **Решения:** DEC-010 approved пользователем: широкий каталог (~10 категорий, 20 тренировок, 60 упражнений), качество подтверждает пользователь по checklist перед `done`; plan file — `.temp/E2-D2-T01/plan.md`.
- **Следующее точное действие:** выдать deep plan и получить approval перед кодом.

### 2026-07-14 — E2-D2-T01 implemented → review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E2-D2-T01 `in_progress -> review -> done`.
- **Сделано:** добавлены таблицы §43.6–43.10 в `packages/database/src/schema.ts`; миграция `migrations/0002_long_spiral.sql`; широкий catalog source `seeds/catalog/starter-catalog.v1.json` (10 категорий, 20 тренировок, 60 упражнений); deterministic builder `scripts/build-starter-catalog-sql.mjs`; generated SQL `seeds/0002_starter_catalog.sql`; root/web scripts `catalog:build-seed`, `db:seed:catalog`; README seed/import docs.
- **Проверки и результаты:** `npm run catalog:build-seed` PASS; `npm run db:reset && npm run db:migrate && npm run db:seed && npm run db:seed:catalog && npm run db:seed:catalog` PASS; local D1 counts: users=4, categories=10, workouts=20, exercises=60, workout_category_links=46, workout_exercises=115; sample workout/category queries PASS; `npm run typecheck --workspace @flowly/database` PASS; `npm run lint --workspace @flowly/database` PASS; повторный `npm run db:generate` = no schema changes; root `npm run typecheck`/`npm run lint` PASS.
- **Deep review:** self review PASS, 0 blockers/bugs. Проверены catalog consistency, DB invariants, schema drift, typecheck/lint.
- **Residual risks:** media object keys are placeholders; actual R2 images/GIF/upload/access downstream.
- **Следующее точное действие:** E2-D2-T02 — категории, поиск и фильтры.

### 2026-07-14 — E2-D2-T02 start

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** E2-D2-T02 `backlog -> in_progress`.
- **Проверено:** roadmap/HANDOFF, карточка E2-D2-T02, dependency E2-D2-T01 done, активных карточек нет, DEC-016/022/024/025, S-MA-020 contract, PRD refs.
- **Блокеры / решения:** нет блокеров; перед кодом нужен deep plan approval.
- **Следующее точное действие:** спросить plan file, затем выдать deep plan.

### 2026-07-14 — E2-D2-T02 / S-MA-020 catalog preview

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E2-D2-T02 `done`; S-MA-020 approved пользователем («кайф мне нравится»), deep review отклонён.
- **Сделано:** `GET /api/v1/workouts` с filters search/category/duration/difficulty/format/source/equipment/favorite; D1 primary + dev-only JSON fallback for plain `next dev`; `features/catalog/ui/catalog-screen.{tsx,module.css}`; `features/catalog/model/catalog.ts`; route `?screen=catalog`. Source `youtube` и favorite честно показывают empty/explanation до downstream E2-D2-T04/T05. После user feedback UX упрощён: base показывает search + horizontal category chips + compact `Фильтры`; extended filters раскрываются по нажатию. Добавлены 3 стартовые YouTube-тренировки (`BU2iL0mz858`, `o29nP-jH3eA`, `qiKJRoX_2uo`), thumbnails через `https://i.ytimg.com`; CSP `img-src` обновлён.
- **Проверки:** API canonical query set PASS (`base=23`, `source=youtube=3`); browser 390 light/dark base PASS (overflow 0, min target 44px, console errors 0); YouTube filter shows 3 cards with thumbnail backgrounds; ChatGPT-generated Flowly covers added under `apps/web/public/media/catalog/covers/*.webp`; all 23 catalog cards have real image backgrounds (0 text-only/fake icon covers); separate chevron open button removed, whole card is clickable/keyboard-accessible; card layout changed to top row image+title/meta and full-width details below; filter panel opens; forced `?catalog=empty` and `?catalog=error` render PASS; web `npm run typecheck --workspace @flowly/web` PASS; web `npm run lint --workspace @flowly/web` PASS; `npm run catalog:build-seed` PASS; local D1 `npm run db:seed:catalog` PASS.
- **Evidence:** API output from context-mode; Playwright snapshots/evaluate checks. Note: `page.screenshot`/CDP screenshot timed out in this session despite render success, so no PNG artifact for S-MA-020 yet.
- **Следующее точное действие:** утвердить deep plan E2-D2-T03 перед кодом.

### 2026-07-14 — E2-D2-T03 start

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E2-D2-T03 `done`; S-MA-022 detail API/UI approved пользователем («норм пойдет»); S-MA-024 author/source profile approved пользователем («нормальное кайф»); S-MA-088 UGC safety approved пользователем («ок идем дальше»); пользователь подтвердил закрытие без отдельного deep review («E2-D2-T03 переводи в done все нормально»).
- **Проверено:** roadmap/HANDOFF, карточка E2-D2-T03, dependency E2-D2-T02 done, активных карточек нет, DEC-016/021/022/024/025, PRD §12.4/§13/§44.3–44.4, design flows README, S-MA-022/S-MA-024/S-MA-088 contracts, F03/F04/F10 diagrams, current catalog/API implementation.
- **Сделано:** `GET /api/v1/workouts/[id]` with D1+dev fallback, `features/workout-detail/ui/workout-detail-screen.{tsx,module.css}`, route `?screen=workout&id=...`, catalog card navigation. UI/UX review corrections after user doubts: detail got catalog-like padding/max-width, large meta blocks replaced by compact summary chips, exercises moved directly after hero/summary, contraindications/source moved into bottom `Дополнительно`, actions moved below exercises, internal roadmap text removed, UGC-only actions hidden for Flowly/YouTube, exercise list text-first without repeated fake media placeholders. S-MA-024 implemented: `features/workout-author/ui/author-profile-screen.{tsx,module.css}`, route `?screen=author&source=...`, public workouts by source, user empty state, safe block/hide explanation without fake mutation for Flowly/YouTube. S-MA-088 implemented: `features/ugc-safety/ui/ugc-safety-screen.{tsx,module.css}`, route `?screen=ugc-safety&action=report|hide|block`, report reason required validation, separate hide/block outcomes, linked from user author profile. After user UI/UX feedback: top nav compacted, header/form visually merged into one compact panel, alternate actions changed from huge pills to lightweight links, service label replaced with user-facing `Безопасность`, author/safety actions visually differentiated by meaning (report neutral, hide accent, block danger) and changed to a predictable vertical action list to avoid random wrapping at 390px.
- **Проверки:** API Flowly/YouTube/404 PASS; catalog click -> detail PASS; author Flowly=20 cards, YouTube=3 cards, user=empty PASS; S-MA-088 report empty validation/success, hide success, block success PASS; web `typecheck` PASS; web `lint` PASS; browser 390 light/dark overflow 0, targets >=44px, console errors 0.
- **Следующее точное действие:** выполнить deep analysis и подготовить deep plan для полного перевода проекта на `@tanstack/react-query` перед кодом.

### 2026-07-14 — React Query migration DEC-029

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Решение:** пользователь потребовал полностью перевести проект на `@tanstack/react-query`; план `.temp/react-query-migration/plan.md` approved вариантом «Внедрять по плану».
- **Сделано:** добавлен `QueryProvider`, общий `apiJson` helper, `me` mutations/query, catalog/detail/author query hooks; migrated `AuthGate`, `CatalogScreen`, `WorkoutDetailScreen`, `AuthorProfileScreen`, `ProfileSettingsScreen`, `PreferencesScreen`; catalog card navigation переведена с `window.location.href` на `router.push`, чтобы не сбрасывать in-memory query cache.
- **Правило дальше:** raw `fetch` в client components/features запрещён; новые API calls оформлять через `useQuery`/`useMutation` и query keys. Audit: raw `fetch` ожидается только в `apps/web/lib/api/client.ts` и server routes.
- **Проверки:** `npm run typecheck --workspace @flowly/web` PASS; `npm run lint --workspace @flowly/web` PASS; raw fetch audit PASS; browser smoke catalog/detail/author/settings 390px PASS (overflow 0, targets >=44, console errors 0); API detail reasons не содержат service text.
- **Follow-up polish:** после user feedback на `?screen=workout&id=wo-yt-malova-vinyasa-24` `favorite/share` убраны из нижних bulk actions и перенесены в compact disabled overlay icon buttons на обложку; проверка 390 dark PASS: overflow 0, targets >=44px, console errors 0, no service text.
- **Catalog debounce fix:** после user feedback поиск каталога исправлен: `searchInput` обновляет UI мгновенно, query key получает `debouncedSearch` через 350ms; React Query сохраняет previous data через `placeholderData`. Проверка: быстрый ввод `zz68289` дал `earlyCount=0`, после debounce `lateCount=1` (`/api/v1/workouts?q=...`), typecheck/lint PASS, overflow 0, targets >=44px, console errors 0.
- **Catalog search/filter redesign:** после user design review верх каталога переработан: убрана тяжёлая outer-card, header compact, copy сокращён, search+filter в одной строке, chips легче, reset secondary text-action. Проверка 390 dark base: first card y≈260 вместо y≈359, overflow 0, targets >=44px, no service text. Проверка 390 light active search: overflow 0, targets >=44px, console errors 0.
- **Следующее точное действие:** E2-D2-T04 уже реализована и находится в `review`; перед `done` провести или явно отклонить deep review.

### 2026-07-14 — E2-D2-T04 implementation draft

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E2-D2-T04 `done`, S-MA-021 approved пользователем: «кайф давай дальше чо там у нас»; deep review explicitly skipped: «не надо и так заебись».
- **Plan:** `.temp/E2-D2-T04/plan.md` approved пользователем как `Approve v1 scope`.
- **Historical Decision (provider superseded by DEC-049):** DEC-030 added/updated — Invidious-compatible provider via `INVIDIOUS_BASE_URL`, no hardcoded public instance contract, dev without provider does not show fixture as real results, S-MA-021 uses free input + filters with debounce, `save` creates private workout-copy, create-workout CTA hidden until editor, unsuitable action removed from S-MA-021 by user UI review. DEC-031 added — normal route paths after E2-D2-T04, not inside current YouTube scope.
- **Сделано:** DB `youtube_search_cache` schema + migration `0003_green_firestar.sql`; `@flowly/youtube` provider/query builder/normalizer; `GET /api/v1/youtube/search`; `POST /api/v1/youtube/videos/:videoId/save`; React Query hooks; `features/youtube-search/ui/youtube-search-screen`; route `?screen=youtube`; catalog entry `Найти видео`; `.dev.vars.example` historically documented `INVIDIOUS_BASE_URL`; DEC-049 now documents `PIPED_BASE_URL`; public catalog/detail visibility now excludes private saved copies unless owner. Design-review fixes applied: forced states fixed; compact header/summary; free user input with 350ms debounce; selected category prefills input (`Йога Спина`) instead of rendering below; query hidden in `Как искали`; global language note; no disabled `Создать`; removed `Не подходит`; removed visible cache state; removed `на русском` from query; cache key bumped to v2; dev fixture disabled as real-results fallback; card layout changed to YouTube-like large 16:9 thumbnail + duration overlay + title/channel/views/date + Flowly save/watch actions; unavailable descriptions hidden.
- **Проверки:** root `npm run typecheck` PASS; root `npm run lint` PASS; `npm run db:generate` no drift after index fix; `npm run db:migrate` applied 0003 locally; raw client fetch audit PASS; HTTP search query returns `пилатес для шеи до 10 минут` and `йога спина 20 минут` without `на русском`; browser debounce PASS: initial request + one debounced request after typing `йога шея`, no request per character; without `INVIDIOUS_BASE_URL` API returns controlled unavailable with HTTP 200 and no fake results; local `.dev.vars` configured to `https://inv.zoomerville.com` for dev verification (not product contract); real HTTP search PASS: `q=йога&duration=short` returns 12 results; thumbnail URLs normalized to `https://i.ytimg.com/...`; browser real results PASS: 12 cards, input `йога`; category route `?screen=youtube&category=back` PASS: input `Йога Спина`, first thumb 327x184, card YouTube-like, no `Описание недоступно`, no category label below input, overflow 0, console errors 0, no unavailable state, no visible cache text, no `на русском`; save create/idempotent/401/403 PASS; `?youtube=error` and `?youtube=empty` forced states PASS.
- **Следующее точное действие:** получить approval `.temp/routing-cleanup/plan.md`; до approval код routing cleanup не писать.

### 2026-07-14 — E2-D2-T06 routing cleanup plan

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** E2-D2-T06 `done`; implementation/evidence complete, пользователь подтвердил закрытие 2026-07-15.
- **User choices:** plan file yes (`.temp/routing-cleanup/plan.md`), новая roadmap card, no legacy redirects for `?screen=...`, keep dev query params temporarily but remove later.
- **Plan:** `.temp/routing-cleanup/plan.md`, approved by user: «делай».
- **Implemented:** added app route pages `/catalog`, `/youtube`, `/workouts/[id]`, `/authors/[source]`, `/profile`, `/settings`, `/help`, `/safety/[action]`; removed root `params.screen` product router; replaced product `?screen=` links/router.push.
- **Verification:** web typecheck/lint PASS; `rg "?tab=|tab=|params.tab|screen=|params.screen|?screen="` audit PASS in app/components/features; browser route matrix PASS for `/`, `/catalog`, `/youtube?q=йога&duration=short`, `/workouts/wo-yt-malova-vinyasa-24`, `/authors/youtube`, `/profile`, `/settings`, `/help`, `/safety/report`, `/programs`, `/rhythm`, `/calendar`; click smoke PASS catalog→youtube, catalog card→workout, profile→settings; legacy `/?screen=catalog` no longer opens catalog. Follow-up PASS: local `FLOWLY_DEV_EMULATION=1` from `.dev.vars` now creates mock user session on clean-cookie `/` without Telegram; auth error/loading card polished with safe margins; forced `?auth=error` console errors 0/overflow 0/targets >=44.
- **DEC-032 fix:** product routes moved into shared Next route group `apps/web/app/(app)` with persistent `layout.tsx`; `AppRouteShell` owns single `AuthGate + AppShell`; individual route pages no longer wrap standalone shell; old `RouteShell` removed; bottom nav uses client-side `router.push`, not document reload; nav hrefs are paths only; visible dev scenario label hidden. Browser click matrix PASS: same `.safe-shell` DOM node survives bottom-nav clicks `/ -> /catalog -> /programs -> /rhythm -> /calendar -> /`, no query params, one bottom nav, console errors 0, overflow 0, no auth error, no visible dev copy. Follow-up UX fixes: global header with Flowly/avatar removed from every product page; profile entry moved to compact button on Home intro; profile back moved to top; nested page `safe-shell` removed from product screens to avoid double safe-area/padding; `/settings` bottom `Сохранить`/`Отмена` removed and replaced with debounced autosave + compact status. Verification PASS: `/settings` 390px no save/cancel buttons, autosave status after input change, nav visible, global header absent, overflow 0, console errors 0, web typecheck/lint PASS.
- **New blocker candidate:** E2-D2-T07 created after user reported `/profile` vs `/settings` padding/back placement drift and arbitrary local CSS values. User clarified this must be treated as a global all-pages problem, not only reported screens. Plan: `.temp/ui-consistency-system/plan.md`. Task scope: define shared UI primitives/tokens, global audit of arbitrary spacing/color/layout drift across all `apps/web/features/**/ui` and route pages, align all product screens, record DEC-033/governance in `AGENTS.md` and `FRONTEND_REVIEW.md`.
- **Home review pass:** user chose `Today focus`. Implemented Home simplification: removed category chips, moved primary action into first viewport, compacted program, removed friend/social activity from Home, fixed global bottom whitespace and empty live-region gap. Follow-up: fixed Home profile entry that looked like bare `А`; now a visible circular accent avatar button with `user-round` icon. Verification PASS: web typecheck/lint; Home 360/390/430 overflow 0, console 0, min target 44, bottom gap 16px, primary action visible in first viewport, scroll height ~2.1 screens; `/` and `/?theme=dark` at 390px show 44x44 profile link at top right with 22x22 icon.
- **Catalog review pass:** reduced pre-list controls: quick categories removed from main page, YouTube action moved into compact result bar, mobile thumbnails restored. Reworked filters into bottom sheet/drawer with grouped controls (`Категория`, `Длительность`, `Сложность`, `Формат`, `Дополнительно`), draft selection and explicit `Готово`/`Сбросить`; active count includes category and extra filters. Follow-up: inline reset removed to prevent layout jumps, drawer header/footer fixed while middle body scrolls, rejected media-row cards due awkward lower-left empty space and switched to vertical banner cards with full-width thumbnail + compact metadata + 1-line description + max 3 tags; empty live-region hidden and `.flow-screen` no longer adds a second viewport inside persistent shell. Settings follow-up: duplicate `Настройки` eyebrow removed; `/settings` now has single H1 `Настройки`. Verification PASS: web typecheck/lint; `/catalog` 360/390/430 overflow 0, min target >=44, result copy uses declension and compact count + inline video search (`23 тренировки · Искать видео`), catalog subtitle removed, first card y≈223 after final image sizing, first card padding/gap aligned with YouTube cards (`16px` / `12px`), thumbnail uses pure 16:9 aspect ratio and same geometry as YouTube (`316x178` at 390), bottom scroll gap last card -> nav = 16px; drawer 390px overflow 0/targets >=44; header/footer y positions unchanged during body scroll; last chip row has 23px gap before fixed footer; `Спина` + `11–20 мин` => `Фильтры · 2`, 4 results; reset clears active filters; empty state no longer exposes roadmap/stage text. `/settings` 390px overflow 0, min target 44, visible `Настройки` count = 1; explicit theme persistence PASS: selecting `Светлая` stores `flowly-theme=light` and reload remains light even from `?theme=dark`; `Авто` stores `system` and returns to Telegram/system/dev fallback. `/youtube` first review pass started: removed subtitle, removed visible search label and technical language note, clamped result titles to 2 lines; YouTube cards aligned with approved catalog rhythm (vertical 16:9 preview, compact source/duration pills, title clamp, channel/meta one-line, save/watch actions below). Follow-up after screenshot review: removed broken double-frame search card; search now matches catalog-style single pill with search icon, and card internals got more breathing room. 360/390/430 overflow 0, min target >=44, search block reduced 92px->46px, first result y≈223 instead of y≈331, first card 390px = 350x393 with 316x178 thumbnail and 2 cards visible in first viewport; dark theme PASS.
- **Closure:** E2-D2-T07 `done`; implementation, browser/production/real-iPhone evidence complete, пользователь подтвердил закрытие 2026-07-15.

### 2026-07-14 — Frontend quality gate DEC-028

- **От кого / кому:** пользователь → AI agent / все следующие агенты.
- **Решение:** пользователь резко указал, что frontend screen slices нельзя делать как непроработанные технические заготовки. Зафиксирован DEC-028, обновлён `AGENTS.md`, создан обязательный чеклист [`docs/design/FRONTEND_REVIEW.md`](../design/FRONTEND_REVIEW.md): перед показом пользователю каждый production UI slice обязан пройти самостоятельный UI/UX quality pass агентом.
- **Обязательная проверка:** 360–430px, light/dark, visual hierarchy, primary content first, плотность/отступы, отсутствие служебных ID/roadmap-текстов/fake controls, релевантные actions, overflow=0, touch targets ≥44px, console errors=0.
- **Следующее точное действие:** текущий S-MA-088 и все дальнейшие UI slices проверять по `docs/design/FRONTEND_REVIEW.md`/DEC-028 до user review.

### 2026-07-13 — E1-D1-T06 / Slice S-MA-004 preview implemented

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Сделано:** добавлен экран `features/onboarding/ui/habit-invite-screen.tsx` + `habit-invite-screen.module.css`, подключён route `?onboarding=habit` в `apps/web/app/page.tsx`. Экран даёт два prompt в рамках S-MA-004: `create/skip habit` и `invite/skip`, без принудительной мутации при skip.
- **Проверки:** `npm run lint --workspace @flowly/web` и `npm run typecheck --workspace @flowly/web` PASS, локальный browser-preview `/?onboarding=habit` (http://localhost:3002) без console-errors.
- **Следующее точное действие:** получить подтверждение/approval на S-MA-004 и только после него переходить к S-MA-005.

### 2026-07-13 — E1-D1-T06 / Slice S-MA-003 approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Сделано:** S-MA-003 (preferences) одобрен как вариант «A»; `features/onboarding/ui/preferences-screen.tsx` с searchable Select по таймзонам (+ `packages/ui/src/select.tsx`, экспорт через `packages/ui/src/index.ts`), route-hook `?onboarding=preferences` в `apps/web/app/page.tsx`.
- **Технические детали:** поиск по городу/региону/времени, live-счётчик результатов, clear, фокус/keyboard скролл и сохранение timezone как PATCH /me.
- **Проверки:** typecheck/lint PASS (`@flowly/ui`, `@flowly/web`).
- **Следующее точное действие:** запускать следующий onboard-скрин **S-MA-004** только после короткого preview по UX.

### 2026-07-13 — E1-D1-T06 / Phase 0 (backend auth core) done

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** T06 `in_progress` (Phase 0 — milestone done; 8 UI slices впереди).
- **Сделано:** `@flowly/core` (UUIDv7, ISO-time, константы TTL/freshness); `@flowly/telegram` (`verifyInitData` HMAC-SHA256 WebAppData + constant-time + freshness + parse user; `hasUserStartedBot` getChat); `apps/web/lib/{cloudflare.ts,auth/{session,cookies,csrf,rate-limit,schemas,users,session-user,dev}.ts}`; API routes `/api/v1/{auth/telegram,auth/logout,me}/route.ts`; `.dev.vars.example` (TELEGRAM_BOT_TOKEN, FLOWLY_DEV_EMULATION); README auth-раздел.
- **Проверки и результаты:** typecheck/lint/build PASS во всех workspaces. Runtime curl-repro (workerd preview, default env + D1, тестовый bot token): valid initData→200+HttpOnly/Secure `__Host-flowly-session` cookie+user created; tampered hash→401; tampered user→401; expired auth_date→401; GET /me cookie→200 / no-cookie→401; mutating без Origin→403 (CSRF); PATCH onboarding→200; logout→200. `git diff --check` PASS; secret scan 0 (.dev.vars gitignored, тестовый токен не в репо).
- **Архитектурные решения (утверждены):** cookie `__Host-flowly-session` (HttpOnly/Secure/SameSite=Lax); token=random32B, в БД SHA-256 hash (UNIQUE); CSRF=Origin-check; rate limit=min in-memory (prod→этап 8/DEC-007); id=UUIDv7 в `@flowly/core`; PATCH /me=onboarding-поля; freshness 24ч; сессия 30д+sliding.
- **Residual risks:** dev-emulation path (`FLOWLY_DEV_EMULATION`, gate `NODE_ENV!=='production'`) не runtime-тестировался в Phase 0 (workerd preview=production build); активируется в `next dev` после `initOpenNextCloudflareForDev`. `getChat` bot gate (S-MA-005) использует real bot — stage 5. Cookie в реальном Telegram WebView/device — residual (slices). Rate limit in-memory per-isolate (слабый, documented).
- **Следующее точное действие:** Phase 1 — UI slice S-MA-001 (auth bootstrap) по DEC-024 с approval.

### 2026-07-13 — E1-D1-T06 / старт Phase 0 (backend auth core)

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; Phase 0 plan approved, реализация начата.
- **Решено:** фазирование backend-first; бот gate = getChat verify (bot-cmds → этап 5); архитектура §5 (cookie __Host-/HttpOnly/Secure/Lax, token=random32B+SHA-256, CSRF=Origin-check, RL=min in-memory, UUIDv7 в packages/core, PATCH /me=onboarding-поля); freshness auth_date 24ч; сессия 30д+sliding.
- **Проверено:** PRD §10.2–10.3/§43.1–43.3/§44.1/§47.1/§55.1, F01 auth flow, screen inventory S-MA-001…006/S-WEB-001/002, DEC-013/014/022/027; canonical Telegram initData algorithm (HMAC-SHA256 WebAppData).
- **Plan:** [`.temp/E1-D1-T06/plan.md`](../../.temp/E1-D1-T06/plan.md); Plan confidence 85%, Phase 0 implementation confidence 82%.
- **Следующее точное действие:** реализовать Phase 0 (packages/core id, packages/telegram init-data+bot, apps/web lib/auth + API routes), затем verify (typecheck/lint/build + curl-repro валидного/невалидного initData).

### 2026-07-13 — E1-D1-T04 done

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `review -> done`; автотесты для T04 не добавлялись (политика тестов смягчена, но пользователь решил, что ручная comprehensive verification достаточна).
- **Comprehensive verification (по запросу пользователя «проверь всё целиком»):** `npm ci` / typecheck / lint / `next build` / `deploy:check` (OpenNext + wrangler dry-run `--env test`) — все PASS. Закрыло прежний residual #7 (build/deploy теперь реально запущены). Зафиксировано ожидаемое wrangler-warning: `d1_databases` на top-level, но не в `env.test` — нормально для local-only scope; добавляется при создании test D1 (отдельный scope, без фейковых `database_id`).
- **AGENTS.md (проект):** политика тестов обновлена — автотесты разрешены, но только полезные на реальный функционал, не бойлерплейт.
- **Итог по T04:** `@flowly/database` (Drizzle schema 3 таблиц + client + drizzle.config); миграции `0000_foundation.sql` + `0001_token_hash_unique.sql`; D1 binding `DB` в `apps/web/wrangler.jsonc` (local-only); root/web `db:*` скрипты; README rollback/forward; DEC-027 nullability-контракт; deep review 0 багов. T06/T08/T10 разблокированы.
- **Следующее точное действие:** выбрать E1-D1-T05 (R2) или E1-D1-T06 (Telegram auth/sessions).

### 2026-07-13 — E1-D1-T04 / deep review пройден, fixes применены

- **От кого / кому:** субагент (reviewer, fresh context) → AI agent → пользователь / следующий агент.
- **Статус задачи:** `review`; deep review завершён, post-review fixes применены, ждёт `review -> done`.
- **Deep review:** 0 багов; подтверждено schema↔PRD §43.1–43.3 (1:1), конвенции, FK CASCADE + orphan-reject (проверено эмпирически на local D1), `db:generate` идемпотентен, `db:reset`→`db:migrate` чистый, local-only scope, пиннинг, pattern-консистентность, roadmap sync.
- **Закрытые находки (по решению пользователя):** (1) `auth_sessions.token_hash` → UNIQUE — правка `schema.ts`, миграция `0001_token_hash_unique.sql`, forward-apply и dup-insert reject проверены. (2) nullability/types-контракт 3 foundation-таблиц зафиксирован в DEC-027 (approved), слинкован с E1-D1-T06/T10. (3) residual-risk #2 смяггчён: FK enforcement активен в local D1 (проверено), production подтвердить downstream.
- **Проверки:** typecheck/lint PASS; `git diff --check` CLEAN; secret scan 0; evidence `.temp/E1-D1-T04/evidence/schema-snapshot.json` обновлён (включает `auth_sessions_token_hash_unique`).
- **Изменённые артефакты:** `packages/database/src/schema.ts`, `migrations/0001_token_hash_unique.sql` + meta, `docs/roadmap/DECISIONS.md` (DEC-027), `docs/roadmap/stages/01-foundation.md` (T04/T06/T10 decisions + journal), `docs/roadmap/HANDOFF.md`, `README.md`.
- **Следующее точное действие:** пользователь решает `review -> done`.

### 2026-07-13 — E1-D1-T04 / реализована, переведена в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> review`; deep review ждёт решения пользователя.
- **Сделано:** `@flowly/database` (Drizzle schema 3 foundation-таблиц + `createDatabase` client + `drizzle.config`); миграция `migrations/0000_foundation.sql` (flat-layout) + `migrations/meta/`; D1 binding `DB` в `apps/web/wrangler.jsonc` (local-only, `migrations_dir: ../../migrations`); `apps/web/scripts/db-reset-local.mjs`; root `db:generate`/`db:migrate`/`db:reset`/`db:seed` скрипты; README — раздел «Database (D1) и миграции» с rollback/forward procedure и schema-конвенциями.
- **Schema-конвенции (утверждены):** id = TEXT UUIDv7 (app-side), timestamps = TEXT ISO-8601 UTC, local dates `YYYY-MM-DD`, local times `HH:MM`, bool = integer 0/1, enums = text+Zod; FK ON DELETE CASCADE; `users.telegram_id` UNIQUE, `auth_sessions.token_hash` index.
- **Проверки и результаты:** clean `npm install`; `npm run typecheck`/`lint` PASS во всех workspaces; `db:generate` идемпотентен («No schema changes»); `db:reset`→`db:migrate` PASS (6 команд, `0000_foundation.sql` ✅); повторный `db:migrate` = «No migrations to apply!»; `.schema` snapshot — ровно `users`/`user_settings`/`auth_sessions`; `git diff --check` PASS; candidate-file secret scan 0. Risk-first: wrangler корректно резолвит `../../migrations` из apps/web без `migrations_pattern` (flat layout drizzle-kit 0.31.10).
- **Evidence:** `.temp/E1-D1-T04/evidence/schema-snapshot.json`, `.temp/E1-D1-T04/plan.md`.
- **Residual risks:** 4 moderate npm audit (esbuild dev-server advisory via drizzle-kit devDep, не применима к `generate`, override ломает tree — принято); FK enforcement активен в локальной D1 (проверено: orphan-INSERT отвергнут, CASCADE сработал), production подтвердить downstream (T06+); `default_reminder_policy_id` FK — этап 3; UUIDv7 app-side; OpenNext `getRequestContext().env.DB` не проверялся (downstream T06); scheduler D1 binding — этап 3; `next build` не запускался (D1 binding не влияет на него).
- **Следующее точное действие:** пользователь решает по deep review; затем `review -> done`.

### 2026-07-13 — E1-D1-T04 / deep plan готов, ждёт approval

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; код/deploy до approval не пишется.
- **Решено (4 развилки):** migration workflow = Drizzle Kit (TS schema → `generate` → SQL → `wrangler d1 migrations apply --local`); scope = 3 foundation-таблицы (`users`, `user_settings`, `auth_sessions`); D1 окружение = local-only; plan-файл создан.
- **Проверено:** изучены PRD §41/§43/§49.1–49.3, текущие `packages/database` (пусто), `migrations/seeds/scripts` (`.gitkeep`), root `package.json` (скрипты `db:*` уже заданы), web/scheduler wrangler.jsonc (D1 binding отсутствует), DEC-006/007/008/010/011 (блокируют только этап 8). Pinned: drizzle-orm 0.45.2, drizzle-kit 0.31.10, wrangler 4.110.0, Node ≥22. Подтверждён canonical workflow из Drizzle D1 get-started и Cloudflare D1 migrations docs.
- **Plan:** [`.temp/E1-D1-T04/plan.md`](../../.temp/E1-D1-T04/plan.md); Plan confidence 92%, Implementation confidence 88%. Главный риск — поведение wrangler с `../` в migrations_dir/pattern (risk-first шаг).
- **Изменённые артефакты:** `.temp/E1-D1-T04/plan.md`, `docs/roadmap/stages/01-foundation.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Следующее точное действие:** пользователь утверждает/корректирует schema-конвенции (§5) и план целиком; затем risk-first верификация wrangler migrations path и реализация.

### 2026-07-13 — E1-D1-T03 done

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `review -> done`.
- **Решение:** пользователь явно отклонил deep review фразой «Нет, закрыть».
- **Итог:** acceptance/evidence подтверждены, test deployments работают, residual risks записаны, production не затронут.
- **Следующее точное действие:** выбрать новую foundation-карточку; текущая задача закрыта.

### 2026-07-13 — E1-D1-T03 / test deployments ready for review

- **От кого / кому:** AI agent → reviewer / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Результат:** scheduler/web test Workers deployed отдельно; scheduler Cron зарегистрирован; remote Chromium smoke 200; финальные проверки PASS.
- **Evidence:** URLs/version IDs и команды записаны в карточке E1-D1-T03; 22 working-tree files относятся к Cloudflare implementation/roadmap.
- **Residual risks:** Cron execution/log не наблюдался; `urllib` блокируется edge 403/1010, Chromium проходит 200; production вне scope и не затрагивался.
- **Следующее точное действие:** провести или отклонить deep review, затем решить `review -> done`.

### 2026-07-13 — DEC-026 approved / getflowly registered

- **От кого / кому:** пользователь + Cloudflare Dashboard/API → AI agent / следующий агент.
- **Статус задачи:** `blocked -> in_progress`; DEC-026 approved.
- **Факт:** `getflowly.workers.dev` проверен как available, выбран пользователем, зарегистрирован через Dashboard и подтверждён API GET.
- **Безопасность:** production Workers не затронуты; OAuth token не выводился/не сохранялся в проект.
- **Следующее точное действие:** test-only scheduler/web deploy и remote smoke.

### 2026-07-13 — DEC-026 / malformed subdomain correction

- **От кого / кому:** Cloudflare Dashboard/API → AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> blocked`; DEC-026 `approved -> open` до корректного выбора.
- **Факт:** interactive prompt сначала отклонил `flowly-wellness`, затем из-за повторного ввода зарегистрировал malformed account subdomain. Последующий API `409` / code `10036` означал «account already has an associated subdomain» и не являлся проверкой доступности нового имени; доступные варианты позже проверены через Dashboard без подтверждения update.
- **Безопасность:** production Workers не затронуты; OAuth token не выводился/не сохранялся в проект.
- **Следующее точное действие:** выбрать подтверждённый Dashboard вариант, выполнить dashboard rename и test-only deploy.

### 2026-07-13 — DEC-026 / first choice

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `blocked -> in_progress`.
- **Решение:** попытаться зарегистрировать `flowly-wellness.workers.dev`; финальным решением позже стал `getflowly.workers.dev`.
- **Следующее точное действие:** повторить только test scheduler/web deploy и remote smoke; production не трогать.

### 2026-07-13 — E1-D1-T03 / workers.dev subdomain blocker

- **От кого / кому:** Cloudflare runtime → AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> blocked`; создан DEC-026.
- **Факт:** OAuth PASS; scheduler bundle upload PASS, publish FAIL до регистрации account-level workers.dev subdomain.
- **Безопасность:** OAuth code/token не сохранён в репозитории; production Workers не затронуты.
- **Следующее точное действие:** пользователь выбирает уникальное `<name>.workers.dev`; после регистрации повторить test deploy.

### 2026-07-13 — E1-D1-T03 / local deployment verification PASS

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; remote test deploy pending OAuth.
- **Сделано:** OpenNext web config, separate scheduler health/no-op cron, test/production Worker identities, generated env types, documented binding/secret contract, Node >=22 toolchain.
- **Checks:** typecheck/lint/build/audit PASS; web workerd `/` + `/ui-kit` 200; scheduler `/health` + `/__scheduled` 200; web/scheduler dry-runs PASS; secret scan 0.
- **Bundle evidence:** web 4711.05 KiB upload / 981.22 KiB gzip; scheduler 0.41 KiB / 0.28 KiB.
- **Blocker:** Cloudflare OAuth callback server работает на localhost:8976; пользователь должен войти/authorize в открытом tab.
- **Следующее точное действие:** после подтверждения пользователя проверить `wrangler whoami` и выполнить только test deploy.

### 2026-07-13 — E1-D1-T03 / plan approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress`; implementation authorized.
- **Approval:** пользователь явно ответил «да» на `.temp/E1-D1-T03/plan.md`.
- **Scope:** OpenNext web, isolated scheduler health/no-op cron, local/dry-run, затем real test deploy; production deploy/D1/R2/business logic запрещены.
- **Следующее точное действие:** установить pinned toolchain и реализовать configs/bootstrap.

### 2026-07-13 — E1-D1-T03 / deep plan ready

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; implementation not started, plan approval pending.
- **Plan:** `.temp/E1-D1-T03/plan.md`; Plan confidence 95%, Implementation confidence 86%.
- **Подтверждено:** real test deploy; canonical worker names; no fake D1/R2 IDs; scheduler health + no-op cron.
- **Evidence:** current repo inspected; official Cloudflare/OpenNext docs and OpenNext commit `97ef330c6c976b15dd870f8cc280540f41e8833b`; current Next 16.2.10 входит в OpenNext 1.20.1 peer range; Wrangler 4.110 requires Node >=22.
- **Blocker:** Wrangler unauthenticated; remote verification needs user OAuth during approved implementation.
- **Следующее точное действие:** получить явный approval плана; до этого code/deploy запрещены.

### 2026-07-13 — E1-D1-T03 / deep analysis started

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; owner `unassigned -> AI agent`.
- **Решение:** следующая задача — Cloudflare deployments; отдельный русский plan-файл обязателен.
- **Границы:** web/scheduler deployments раздельны; production secrets не попадают в репозиторий; реализация до approval плана запрещена.
- **Следующее точное действие:** изучить PRD/DEC-011, текущие manifests/config и актуальные OpenNext/Cloudflare contracts; написать `.temp/E1-D1-T03/plan.md`.

### 2026-07-13 — E0-D0-T04 / closed without deep review

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `review -> done`.
- **Решение:** пользователь явно отказался от deep review: «не стоит, можешь закрывать».
- **Итог:** acceptance полностью закрыт; проверки/evidence сохранены; следующий screen slice разблокирован.
- **Residual risks:** mock data не подтверждает backend behavior; реальный Telegram WebView/device safe-area проверяется downstream.
- **Следующее точное действие:** выбрать E1-D1-T03 либо E1-D1-T04; самостоятельно выбор не делать.

### 2026-07-13 — E0-D0-T04 / final visual approval

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Approval evidence:** дословно: «заебись» после демонстрации base и полного state set.
- **Acceptance:** все пункты закрыты; typecheck/lint/build и browser evidence PASS; residual risk реального Telegram WebView остаётся за device validation.
- **Следующее точное действие:** спросить «Провести deep review?»; без ответа не переводить задачу в `done` и не начинать следующий screen slice.

### 2026-07-13 — E0-D0-T04 / contextual states implemented

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; implementation complete, final visual approval pending.
- **Сделано:** dev-only `home` scenarios `loading`, `empty`, `module-error`, `offline`, `resume`; skeleton modules, empty-day с 3 CTA, local error/retry, offline local-save feedback и distinct resume banner. Все состояния продолжают визуальное направление Concept A и используют production UI-kit.
- **Проверки:** root typecheck/lint/build PASS; 360/430/1280 light/dark; overflow 0; targets ≥44px; console errors 0; reduced motion, non-zero safe-area, empty actions, error retry lifecycle, offline habit mutation и resume action PASS.
- **Evidence:** `.temp/E0-D0-T04/screenshots/home-state-{loading,empty,module-error,offline,resume}-430.png`, `home-state-module-error-card.png`, `home-states-contact-sheet.jpg`.
- **Следующее точное действие:** финальный user review полного state set; не начинать следующий screen slice.

### 2026-07-13 — E0-D0-T04 / base state approved

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress`; base state approved, contextual states ещё не реализованы.
- **Approval evidence:** дословно: «главная теперь выглядит замечательно».
- **Закрыто:** normal/base composition, visual direction `Concept A + contracts`, generated photography, core interactions.
- **Следующее точное действие:** реализовать loading/empty/module-error/offline/resume, затем показать полный state set для финального approval Главной.

### 2026-07-13 — E0-D0-T04 / Concept A + generated photography checkpoint

- **От кого / кому:** пользователь → AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; base state повторно ожидает visual approval.
- **Feedback:** пользователь отклонил длинный dashboard и векторные изображения как непохожие на Concept A; выбрал `Concept A + contracts` и генерацию реальных людей через ChatGPT MCP.
- **Сделано:** Главная возвращена к спокойной mobile-first иерархии Concept A; resume стал компактным условным блоком; progress/categories/current program/habits/primary CTA образуют основной сценарий; weekly/recommendation/shared activity сохранены ниже как компактные contracts. Через ChatGPT сгенерированы 4:3 resume-photo и 1:1 program-photo, скачаны оригиналы, созданы WebP 1200×900 и 1000×1000.
- **Изменённые файлы:** `apps/web/features/home/**`, `apps/web/public/media/home-{resume,program}.webp`, `.temp/E0-D0-T04/generated/**`, task evidence/handoff.
- **Проверки и результаты:** root typecheck/lint/build PASS; Playwright 360/430/1280 light/dark; overflow 0; targets ≥44px; tabs 5/current 1; interactions/live notice PASS; console errors 0.
- **Evidence:** `.temp/E0-D0-T04/screenshots/home-concept-a-contracts-{360-dark-viewport,430-light,1280-light}.png`; generated prompts/originals в `.temp/E0-D0-T04/generated/`.
- **Следующее точное действие:** получить approval или единый пакет замечаний по новому base state; contextual states до этого не начинать.

### 2026-07-13 — E0-D0-T04 / approved-kit base checkpoint

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; остановка на review base state по DEC-024.
- **Сделано:** `/` снова показывает Главную; normal state пересобран на `Card`, `Button`, `IconButton`, `Badge`, `Progress`, `Icon`; shell переведён на production `BottomNavigation` и `OfflineBanner`; представлены day progress, resume, today plan, quick start, current program, habits, weekly rhythm, recommendation и explicitly shared friend activity.
- **Изменённые файлы:** `apps/web/app/page.tsx`, `components/shell/app-shell.tsx`, `features/home/**`, task evidence/handoff.
- **Проверки и результаты:** root typecheck/lint/build PASS; Playwright 360/430/1280 light/dark; overflow 0; interactive targets ≥44px; focus 3px; tabs 5/current 1; profile href, category selection, habit toggle/live notice PASS; console errors 0.
- **Evidence:** `.temp/E0-D0-T04/screenshots/home-approved-kit-base-{360-light-viewport,430-dark-viewport,1280-light}.png`.
- **Блокеры / решения:** технических блокеров нет; contextual states не начинать до пользовательского review base state.
- **Следующее точное действие:** принять пакет визуальных замечаний либо approval base state.

### 2026-07-13 — E1-D1-T11 утверждена / E0-D0-T04 разблокирована

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задач:** E1-D1-T11 `in_progress -> review -> done`; E0-D0-T04 `blocked -> in_progress`.
- **Approval:** дословно: «утверждаю ui kit».
- **Синхронизация:** acceptance T11 закрыт; stage 0/1 summaries, roadmap index, DEC-025 evidence и handoff обновлены.
- **Residual risk:** реальный Telegram WebView/safe-area переносится в device validation product screens.
- **Следующее точное действие:** пересобрать base Главной из `@flowly/ui` и остановиться на пользовательском review base state.

### 2026-07-13 — E1-D1-T11 / production UI-kit ожидает approval

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress`; E0-D0-T04 остаётся `blocked`.
- **Сделано:** создан независимый `@flowly/ui` с canonical tokens/themes и 12 production component families; собран интерактивный `/ui-kit`; заглушка `F` в app shell заменена фирменным знаком Flowly, знак также используется как favicon.
- **Изменённые файлы:** `packages/ui/**`, `apps/web/app/ui-kit/**`, `apps/web/public/brand/flowly-icon.svg`, `apps/web/app/icon.svg`, shell/config/global imports и task evidence.
- **Проверки и результаты:** root typecheck/lint/build PASS; `/ui-kit` static; Playwright 360/430/1280 light/dark, no overflow, ≥44px targets, keyboard focus 3px, loading/disabled/live status, navigation и reduced motion PASS; console errors 0.
- **Evidence:** `.temp/E1-D1-T11/ui-kit-{360-light,430-dark,1280-light}.png`, `.temp/E1-D1-T11/shell-real-logo-430.png`.
- **Блокеры / решения:** требуется только явный visual approval пользователя; Telegram WebView/safe-area остаётся residual risk.
- **Следующее точное действие:** принять пакет визуальных замечаний либо явный approval; product screens до этого не продолжать.

### 2026-07-13 — DEC-025 / production UI-kit gate

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задач:** E0-D0-T04 `in_progress -> blocked`; E1-D1-T11 `backlog -> in_progress`.
- **Причина:** статический reference UI-kit использовался только как tokens/fonts/icons, а `packages/ui` оставался пуст; consistency production screens не гарантировалась.
- **Решение:** сначала создать/утвердить production components и `/ui-kit`, затем пересобрать Главную исключительно из утверждённого public API.
- **Следующее точное действие:** реализовать T11 и остановиться на visual approval `/ui-kit`.

### 2026-07-13 — DEC-024 / переход к интерактивным Next.js screen slices

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** E1-D1-T01 `backlog -> in_progress`; старый T04 scope superseded.
- **Решение:** удалить только провальный generated T04, сохранить T00–T03, bootstrap реальный Next.js через npm workspaces, затем реализовывать по одному экрану + states; первой будет Главная S-MA-010.
- **Roadmap:** DEC-012 superseded DEC-024; E0-D0-T05/T06 удалены; downstream UI cards получили `ui_slices` и per-ID approval contract.
- **План:** `.temp/E0-D0-T04/next-interactive-plan.md`, Plan confidence 94%, Implementation confidence 91%; утверждён пользователем.
- **T01 evidence:** root package/lockfile, 9 workspace manifests, `npm install` и `npm query .workspace` PASS; выполнен `in_progress -> review -> done`.
- **T02 evidence:** `npm ci`, typecheck/lint/build/audit PASS; 24 browser runs; `.temp/E1-D1-T02/screenshots/**`; выполнен `in_progress -> review -> done`.
- **T04 base evidence:** `apps/web/features/home/**`; `.temp/E0-D0-T04/screenshots/home-base-clean-{360-light,430-dark,1280-light}.png`; typecheck/lint/build и browser interaction checks PASS.
- **Следующее точное действие:** показать base state пользователю и остановиться до feedback; никакого review-loop или следующего state заранее.

### 2026-07-13 — E0-D0-T03 / пользователь принял corrected UI-kit

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** `review -> done`.
- **Подтверждение:** пользователь явно поручил перевести задачу, закоммитить и запушить после corrected validation PASS.
- **Evidence:** acceptance закрыт; 5 blockers + 4 warnings исправлены; `npm run validate` и deterministic capture PASS; 23 snapshots зафиксированы.
- **Residual risks:** реальный Telegram WebView/notch, production async announcements и cross-OS rasterization сохранены в карточке/validation report.
- **Следующее точное действие:** начать E0-D0-T04.

### 2026-07-13 — E0-D0-T03 / deep-review findings закрыты

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `in_progress -> review`; дополнительный review не запускался.
- **Исправлено:** per-family state/anatomy/token/keyboard/surface contracts; visual state laboratory/full-screen shell error; `aria-pressed`/`aria-current`; Telegram theme/viewport/four-sided safe-area mapping; поставляемый `npm run validate`; true root 200% reflow без скрытия; browser setup; safe server root guard; полный effective-target audit.
- **Проверки:** `npm run validate` PASS (generated drift 0, 22/22 contrast, 69/69 surfaces, 23 snapshots, links/roadmap PASS); capture 18+5 PASS; два capture byte-identical; `git diff --check` PASS.
- **Evidence:** `component-inventory.md`, `telegram-environment.md`, `accessibility-checklist.md`, `snapshot-manifest.md`, `validation-report.md`.
- **Residual risks:** реальный Telegram WebView/notch, production async announcements и cross-OS rasterization.
- **Следующее точное действие:** пользовательское подтверждение; затем `done` и E0-D0-T04.

### 2026-07-13 — E0-D0-T03 / independent deep review

- **От кого / кому:** fresh-context reviewer → AI agent / пользователь.
- **Статус задачи:** `review -> in_progress`; review gate FAIL.
- **Findings:** 5 blockers — incomplete per-component state/anatomy contract, missing selected ARIA semantics, missing Telegram environment mapping, non-reproducible static/69-surface validation claims, hidden controls/labels in 200% mode. 4 warnings — four-sided safe-area evidence, clean-machine browser setup, capture-server path guard, incomplete interactive-target audit.
- **Артефакт:** `.temp/E0-D0-T03/reviews/deep-review.md`.
- **Изменения реализации:** не применялись; только синхронизированы task status/evidence/handoff.
- **Следующее точное действие:** после подтверждения пользователя исправить findings одним проходом и повторить validation; дополнительный review автоматически не запускать.

### 2026-07-13 — E0-D0-T03 / реализация переведена в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Сделано:** реализован утверждённый self-contained UI-kit: canonical JSON → generated CSS, local Inter/Cormorant/Lucide с лицензиями, responsive light/dark catalog, 24 component families, DEC-022 patterns и 69/69 surface mapping.
- **Изменённые файлы:** `docs/design/ui-kit/**`, `docs/design/README.md`, `docs/roadmap/DECISIONS.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки:** generation PASS; 22 contrast pairs PASS; browser 360/430/1280 light/dark PASS; 200% text/focus/reduced-motion/safe-area PASS; 22 PNG deterministic; links/syntax/`git diff --check` PASS. Автотесты не добавлялись.
- **Evidence:** `docs/design/ui-kit/component-inventory.md`, `accessibility-checklist.md`, `snapshot-manifest.md`, `validation-report.md`.
- **Residual risks:** реальный Telegram WebView/notch и production async semantics не проверены; high-fi composition относится к T04.
- **Следующее точное действие:** пользовательский review; затем `done` либо точечные findings.

### 2026-07-13 — E0-D0-T03 / старт deep analysis

- **От кого / кому:** пользователь → AI agent / следующий агент.
- **Статус задачи:** `backlog -> in_progress`; owner `unassigned -> AI agent`.
- **Проверено:** E0-D0-T01/T02 завершены; другая активная карточка отсутствует; прочитаны roadmap, handoff, PRD §40/§55.1, DEC-012–DEC-022, flows/inventories/diagrams и wireframe contracts.
- **Границы:** Concept A остаётся неутверждённым reference; UI-kit обязан покрыть mobile-first 360–430, wider screens, Telegram light/dark, safe area, touch/focus/contrast и contextual state model DEC-022.
- **Решения:** пользователь выбрал отдельный план, развитие Concept A, локальные Inter + Cormorant Garamond, Lucide и формат HTML + CSS + JSON + PNG; записано в DEC-023 и downstream metadata.
- **План:** [`docs/design/ui-kit/E0-D0-T03-plan.md`](../design/ui-kit/E0-D0-T03-plan.md), Plan confidence 94%, Implementation confidence 91%.
- **Approval:** пользователь явно утвердил план 2026-07-13; реализация разрешена.
- **Следующее точное действие:** собрать token pipeline, local assets и component catalog, затем выполнить validation.

### 2026-07-13 — E0-D0-T02 / пользователь принял wireframes

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** `review -> done`.
- **Подтверждение:** пользователь явно сообщил, что всё ок, и дал добро закрыть задачу; дополнительный review не требуется.
- **Evidence:** acceptance checklist закрыт; validation PASS; `docs/design/wireframes/**` содержит coverage, manifest и reproducible captures.
- **Блокеры / риски:** продуктовых блокеров нет; residual risks сохранены в карточке и validation report.
- **Следующее точное действие:** начать E0-D0-T03 — UI-kit и дизайн-система.

### 2026-07-13 — E0-D0-T02 / реализация переведена в review

- **От кого / кому:** AI agent → пользователь / следующий агент.
- **Статус задачи:** `in_progress -> review`.
- **Сделано:** реализованы 69 canonical wireframes по F01–F11, visual state profiles и tailored critical branches; закрыты review findings по content caps, CTA semantics, shell/accessibility и snapshot reproducibility.
- **Изменённые файлы:** `docs/design/wireframes/**`, `docs/design/README.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки и результаты:** 69/15/98/38 coverage PASS; browser responsive/theme/text-scale PASS; 42 PNG + hashes PASS; два последовательных captures byte-identical; `git diff --check` PASS; автотесты не добавлялись.
- **Evidence:** `docs/design/wireframes/coverage-matrix.md`, `snapshot-manifest.md`, `validation-report.md`.
- **Блокеры / решения:** продуктовых блокеров нет; staged `AGENTS.md` — внешнее состояние worktree; non-zero safe-area остаётся residual risk.
- **Следующее точное действие:** пользовательский review; затем `done` либо точечные замечания.

### 2026-07-13 — E0-D0-T02 / старт deep analysis

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** `backlog -> in_progress`; owner — AI agent.
- **Сделано:** пользователь подтвердил старт E0-D0-T02, отдельный русский deep plan, HTML+PNG, организацию по F01–F11, grayscale low-fi и стратегию «15 profiles + critical states»; deep analysis завершён.
- **Изменённые файлы:** `docs/design/wireframes/E0-D0-T02-plan.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки и результаты:** изучены PRD §9–39/§40.2, DEC-012–DEC-022, 69 surfaces, 15 profiles, F01–F11/98 memberships, diagrams, traceability и Concept A gaps; одновременно других активных карточек нет.
- **Evidence:** отдельный план и синхронизированные карточка, stage summary, общий индекс и handoff.
- **Блокеры / решения:** пользователь явно утвердил план; новые продуктовые решения самостоятельно не принимаются. Findings первого review закрыты: отдельные visual state/critical frames, observable layouts, русская семантика, contextual shell, keyboard semantics и корректные S-MA-094/095; validation report и единый snapshot set созданы.
- **Следующее точное действие:** завершить финальный независимый re-review; затем перевести карточку в `review` либо вернуть findings в реализацию.

### 2026-07-13 — Синхронизация решений с downstream-задачами

- **От кого / кому:** пользователь → AI agent → все следующие агенты.
- **Результат:** DEC-013–DEC-022 связаны с конкретными task cards; stage contracts и agent workflow делают их обязательными для исполнения.
- **Изменённые файлы:** `README.md`, `AGENTS.md`, `docs/roadmap/README.md`, `DECISIONS.md`, `HANDOFF.md`, `stages/00-design.md` … `08-stabilization.md`.
- **Проверки:** 72 cards parsed; 68 cards с decisions; 0 неизвестных DEC; 0 active refs на superseded DEC-009; 9/9 stage contract sections; icon и repository-relative links существуют.
- **Следующее точное действие:** commit/push текущего пакета, затем начать E0-D0-T02.

### 2026-07-13 — E0-D0-T01 / deep review завершён

- **От кого / кому:** AI agent → независимые reviewers → следующий агент.
- **Статус задачи:** done.
- **Findings:** исправлены F04 active-session branching, F08 terminal/snooze/Start, social revoke/permissions, deletion re-auth, bidirectional membership, per-ID states, atomic PRD traceability, Concept A mapping и diagram evidence.
- **Проверки:** финальный независимый gate — blockers отсутствуют; 69 IDs, 98 symmetric pairs, 15 profiles, 250 traceability rows, 12 Mermaid blocks, 0 broken links, roadmap sync и `git diff --check` PASS.
- **Residual risk:** Mermaid не проверялся реальным renderer/CLI; визуальная проверка переносится в E0-D0-T02.
- **Следующее точное действие:** начать E0-D0-T02.

### 2026-07-13 — E0-D0-T01 / реализация IA и flows

- **От кого / кому:** пользователь → AI agent → независимый reviewer.
- **Статус задачи:** review.
- **Сделано:** утверждённый план реализован в Markdown + Mermaid; добавлены 69 surface IDs, F01–F11, overview + 11 diagrams, state/privacy и PRD traceability; workshop decisions перенесены в DEC-013–DEC-022.
- **Изменённые файлы:** `docs/design/README.md`, `docs/design/flows/**`, `docs/roadmap/DECISIONS.md`, `docs/roadmap/stages/00-design.md`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`.
- **Проверки и результаты:** custom Python validation PASS (IDs, F01–F11, state columns, reverse refs, Markdown links, balanced Mermaid fences); roadmap counts PASS; `git diff --check` PASS; tests не добавлялись.
- **Evidence:** [`validation-report.md`](../design/flows/validation-report.md), [`traceability-matrix.md`](../design/flows/traceability-matrix.md), [`diagrams/`](../design/flows/diagrams/).
- **Блокеры / решения:** open DEC-006/007/008/010/011 — downstream; новых UX-блокеров нет. Mermaid не проверялся renderer CLI.
- **Следующее точное действие:** независимый acceptance review E0-D0-T01; затем `done` или возврат замечаний в `in_progress`.

### 2026-07-13 — E0-D0-T01 / deep analysis и план

- **От кого / кому:** пользователь → AI agent.
- **Статус задачи:** in_progress; реализация ожидает approval плана.
- **Сделано:** после commit `cbc5acd` карточка назначена AI agent; проанализированы PRD, Concept A и 11 flow families; проведён UX-workshop; создан `docs/design/flows/E0-D0-T01-plan.md`.
- **Решения:** Markdown + Mermaid, overview + 11 доменов, Concept A как референс; ответы пользователя перечислены в плане и должны быть перенесены в `DECISIONS.md` после approval.
- **Следующее точное действие:** получить явное approval плана E0-D0-T01.

### 2026-07-13 — E0-D0-T00 / импорт Concept A

- **От кого / кому:** пользователь → AI agent → следующий агент.
- **Статус задачи:** done.
- **Сделано:** исходный HTML-мокап перенесён в `docs/design/screens/concept-a/`; сохранены assets, standalone HTML, preview и gap-analysis.
- **Изменённые файлы:** `README.md`, `docs/design/**`, `docs/roadmap/README.md`, `docs/roadmap/HANDOFF.md`, `docs/roadmap/stages/00-design.md`.
- **Проверки и результаты:** HTTP 200 для основной/standalone версий и ключевых assets; browser render успешен; console содержит только необязательный 404 `favicon.ico`.
- **Evidence:** `docs/design/screens/concept-a/preview.png`, `STATUS.md`.
- **Блокеры / решения:** Concept A не утверждён и не закрывает E0-D0-T01–T06.
- **Следующее точное действие:** начать E0-D0-T01 с полной карты экранов и user flows.

### 2026-07-13 — Добавление обязательного UX/UI-этапа

- **От кого:** пользователь / AI agent
- **Кому:** следующий AI agent
- **Результат:** добавлен этап 0 до разработки с обязательными user flows, wireframes, UI-kit, финальными макетами, интерактивным прототипом и явным approval.
- **Изменённые файлы:** `docs/roadmap/README.md`, `DECISIONS.md`, `HANDOFF.md`, `stages/00-design.md`, `stages/01-foundation.md`, `docs/design/README.md`.
- **Следующее действие:** начать E0-D0-T01 и сохранять артефакты в `docs/design/flows/`.
- **Исторический блокер:** этапы 1–8 не начинать до approval E0-D0-T06 — superseded решением DEC-024 от 2026-07-13.

### 2026-07-13 — Инициализация roadmap

- **От кого:** AI agent
- **Кому:** следующий AI agent / пользователь
- **Результат:** создана переносимая kanban-документация.
- **Осталось:** выбрать первую реализационную карточку.
- **Риски:** operational параметры в `DEC-006`–`DEC-011` пока не утверждены.

## Шаблон следующей записи

```markdown
### YYYY-MM-DD HH:MM — TASK-ID / краткое действие

- **От кого / кому:**
- **Статус задачи:**
- **Сделано:**
- **Изменённые файлы:**
- **Проверки и результаты:**
- **Evidence:**
- **Блокеры / решения:**
- **Следующее точное действие:**
```
