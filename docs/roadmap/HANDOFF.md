# Flowly — AI handoff

> Этот файл должен позволять продолжить работу без истории чата и независимо от agent harness.

## Текущее состояние

- **Обновлено:** 2026-07-13
- **Текущий этап:** 1. Основа
- **Активная задача:** не выбрана
- **Статус:** E0-D0-T04 `done`; E1-D1-T11 `done`
- **Последний завершённый результат:** интерактивная Главная S-MA-010 со всеми states утверждена и закрыта; пользователь явно отказался от deep review

## Что сделано

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

1. Согласовать следующую foundation-карточку: E1-D1-T03 (Cloudflare deployments) или E1-D1-T04 (D1 и миграции) готовы по зависимостям.
2. Перед стартом прочитать связанные decisions/acceptance и перевести только выбранную карточку в `in_progress`.
3. Для следующего UI slice продолжать направление Concept A и workflow DEC-024; Главную не переоткрывать без нового подтверждённого scope.

## Открытые блокеры

Открыты `DEC-006`, `DEC-007`, `DEC-008`, `DEC-010`, `DEC-011` в [`DECISIONS.md`](DECISIONS.md); DEC-009 и DEC-012 superseded. Они не блокируют E0-D0-T04. Production UI-kit утверждён; сохраняется обязательный per-screen approval по DEC-024.

## Изменённые артефакты

- `README.md`
- `AGENTS.md`
- `docs/roadmap/README.md`
- `docs/roadmap/DECISIONS.md`
- `docs/roadmap/HANDOFF.md`
- `docs/roadmap/stages/00-design.md` … `08-stabilization.md`
- `docs/design/README.md`
- `docs/design/flows/**` — план, inventories, traceability, validation и 12 diagrams
- `docs/design/wireframes/**` — утверждённый план, HTML, CSS/JS registry, coverage, validation, capture toolchain и 42 PNG
- `docs/design/ui-kit/**` — утверждённый plan, HTML, JSON/CSS tokens, local fonts/icons, inventory, accessibility/validation, capture toolchain и 22 PNG
- `docs/design/screens/concept-a/**`
- `.temp/E0-D0-T04/next-interactive-plan.md` — утверждённый migration/implementation plan
- `apps/**`, `packages/**`, `migrations/`, `seeds/`, `scripts/` — E1-D1-T01/T02
- `apps/web/features/home/**`, `apps/web/public/media/**` — E0-D0-T04 full state set visual-approved и done
- `packages/ui/**`, `apps/web/app/ui-kit/**` — E1-D1-T11 production UI-kit

## Проверка текущего изменения

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

## Журнал handoff

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
