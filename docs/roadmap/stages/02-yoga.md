# Этап 2 — Йога

> PRD: §11–19, §43.6–43.12, §43.23, §43.28, §44.2–44.5, §46, §53, §54 этап 2, §55.2.

## Цель

Дать пользователю каталог йоги, поиск и выполнение тренировок, собственный контент, избранное и ручные записи без автоматического подтверждения результата.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 7 | 0 | 0 | 0 | 3 |

## Зависимости и инварианты

- Зависит от этапа 1: auth, D1, R2 и UI shell.
- Сессия не завершается автоматически; итоговый статус выбирает пользователь.
- Пошаговый таймер поддерживает `+30 секунд`; ручная запись допускает прошлую дату; избранное без папок.

## Обязательные подтверждённые contracts

- По `DEC-024` каждый указанный `ui_slices` screen slice выполняется строго по одному ID в реальном `apps/web`; все states/интеракции и явный approval обязательны до следующего ID.
- По `DEC-025` production UI-kit из `packages/ui` и его public API обязательны для всех screen slices; app-local дубли shared primitives запрещены.
- По `DEC-028` frontend screen slices нельзя показывать пользователю без самостоятельного UI/UX quality pass по [`docs/design/FRONTEND_REVIEW.md`](../../design/FRONTEND_REVIEW.md): визуальная иерархия, плотность/отступы, релевантность actions, отсутствие служебного текста/fake controls, 360–430px, light/dark, overflow=0, targets ≥44px, console errors=0.
- Home/content errors локальны; YouTube использует cache ≥24h с key по всем filters и явный fallback (`DEC-016`).
- Active workout хранит offline checkpoint; status выбирается явно по контекстной матрице (`DEC-015`, `DEC-016`).
- Первое сохранение своей тренировки требует title, duration, difficulty и executable content; sharing создаёт копию только явным действием (`DEC-016`, `DEC-019`).
- UGC report/hide/block разделены (`DEC-021`); все UI states следуют `DEC-022` и [`docs/design/flows/`](../../design/flows/).

## Deliverable E2-D2 — Каталог и просмотр

### E2-D2-T01 — Подготовить стартовый каталог
- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-14
- **prd_refs:** §12.1, §43.6–43.10, §53, §55.2 · **depends_on:** E1-D1-T04, E1-D1-T08 · **decisions:** DEC-010, DEC-029
- **scope:** seed/import категорий, тренировок, упражнений и связей.
- **acceptance:** [x] структура соответствует моделям; [x] импорт повторяем; [x] источники и редакционная проверка фиксируются.
- **validation/evidence:** schema `workout_categories`/`workouts`/`workout_category_links`/`exercises`/`workout_exercises`; migration `migrations/0002_long_spiral.sql`; catalog source `seeds/catalog/starter-catalog.v1.json`; generated SQL `seeds/0002_starter_catalog.sql`; script `scripts/build-starter-catalog-sql.mjs`; counts: users=4, categories=10, workouts=20, exercises=60, category_links=46, workout_exercises=115; sample records queried from local D1.
- **journal:** 2026-07-14 — `backlog -> in_progress`; dependencies E1-D1-T04/E1-D1-T08 done, активных карточек нет. DEC-010 approved: широкий каталог (~10 категорий, 20 тренировок, 60 упражнений), качество подтверждает пользователь по checklist перед `done`. Deep plan `.temp/E2-D2-T01/plan.md` approved пользователем; реализация начата. 2026-07-14 — реализовано: schema + migration + JSON catalog + SQL builder + local-only seed scripts. Проверки PASS: `npm run catalog:build-seed`; `npm run db:reset && npm run db:migrate && npm run db:seed && npm run db:seed:catalog && npm run db:seed:catalog`; counts/sample queries; `npm run typecheck --workspace @flowly/database`; `npm run lint --workspace @flowly/database`; повторный `npm run db:generate` = no schema changes; root `npm run typecheck`/`npm run lint` PASS. E2-D2-T01 `in_progress -> review`. 2026-07-14 — self deep review PASS: 0 блокеров/bugs; catalog consistency audit PASS; DB invariants PASS (`no_category_workouts=0`, `broken_workout_exercise_refs=0`, `source_type=flowly:20`); schema drift/typecheck/lint PASS. Пользователь разрешил закрыть без дополнительных правок; E2-D2-T01 `review -> done`.

### E2-D2-T02 — Реализовать категории, поиск и фильтры
- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-14
- **prd_refs:** §11.3, §12.2–12.3, §44.2–44.3 · **depends_on:** E2-D2-T01 · **decisions:** DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-020 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** API и UI каталога с определёнными PRD фильтрами.
- **acceptance:** [x] комбинации фильтров работают; [x] empty/loading/error states есть; [x] результаты не выходят за критерии.
- **validation/evidence:** API canonical query set (`base=23`, `source=youtube=3` + фильтры), browser checks 390 light/dark, generated covers, Playwright snapshots/evaluate checks; screenshots через `page.screenshot` в текущей сессии таймаутят.
- **journal:** 2026-07-14 — `backlog -> in_progress`; dependency E2-D2-T01 done, активных карточек нет. Прочитаны stage contracts, DEC-016/022/024/025, S-MA-020 contract и PRD refs. Deep plan `.temp/E2-D2-T02/plan.md` approved пользователем; реализация начата. 2026-07-14 — **S-MA-020 catalog preview implemented**: `GET /api/v1/workouts`, `features/catalog/ui/catalog-screen.{tsx,module.css}`, `features/catalog/model/catalog.ts`, route `?screen=catalog`. Фильтры: search/category/duration/difficulty/format/source/equipment/favorite; source `youtube` и favorite честно дают empty/explanation до downstream tasks. После user feedback UX упрощён: base показывает search + horizontal category chips + compact `Фильтры`, extended filters раскрываются по нажатию. Добавлены 3 стартовые YouTube-тренировки (`BU2iL0mz858`, `o29nP-jH3eA`, `qiKJRoX_2uo`), YouTube thumbnails через `https://i.ytimg.com`, CSP `img-src` обновлён. Проверки PASS: API canonical query set (`base=23`, `source=youtube=3`); browser 390 light/dark base: overflow 0, min target 44px, console errors 0; filter panel opens; YouTube filter shows 3 cards with thumbnail backgrounds; ChatGPT-generated Flowly covers added under `apps/web/public/media/catalog/covers/*.webp`, all 23 catalog cards have real image backgrounds (0 text-only/fake icon covers); separate chevron open button removed, whole card is clickable/keyboard-accessible; card layout changed to top row image+title/meta and full-width details below; empty/error forced states render; web `npm run typecheck --workspace @flowly/web`/`npm run lint --workspace @flowly/web` PASS; `npm run catalog:build-seed` PASS; local D1 `npm run db:seed:catalog` PASS. Screenshot capture в текущей Playwright-сессии таймаутит на `page.screenshot`; evidence — browser snapshots/evaluate + API output. Пользователь approved финальный card UI («кайф мне нравится»); E2-D2-T02 `in_progress -> review`. 2026-07-14 — пользователь отказался от deep review и разрешил закрыть; E2-D2-T02 `review -> done`.

### E2-D2-T03 — Реализовать карточку и страницу тренировки
- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-14
- **prd_refs:** §12.4, §13, §44.3–44.4 · **depends_on:** E2-D2-T02 · **decisions:** DEC-016, DEC-021, DEC-022, DEC-024, DEC-025, DEC-028, DEC-029
- **ui_slices:** S-MA-022, S-MA-024, S-MA-088 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** обязательные элементы, упражнения, источник, действия старта/сохранения.
- **acceptance:** [x] все обязательные поля отображены; [x] отсутствующие optional данные безопасны; [x] ownership пользовательского контента соблюдён.
- **validation/evidence:** detail API Flowly/YouTube/404; catalog card click -> detail; author/source profile Flowly=20, YouTube=3, user empty; S-MA-088 report empty validation/report success/hide success/block success; browser 390 light/dark overflow 0, targets >=44px, console errors 0; web typecheck/lint PASS; screenshots via Playwright page.screenshot still timeout in this session, evidence uses snapshots/evaluate/API output.
- **journal:** 2026-07-14 — `backlog -> in_progress`; dependency E2-D2-T02 done, активных карточек нет. Прочитаны roadmap/HANDOFF, карточка E2-D2-T03, stage contracts, DEC-016/021/022/024/025, PRD §12.4/§13/§44.3–44.4, design flows README, S-MA-022/S-MA-024/S-MA-088 contracts and F03/F04/F10 diagrams. Deep plan сохранён в `.temp/E2-D2-T03/plan.md`; пользователь approved план, реализация S-MA-022 начата. 2026-07-14 — реализованы detail API/UI draft и затем UI/UX review corrections по запросу пользователя: detail получил catalog-like padding/max-width, крупные meta-блоки заменены compact summary chips, exercises подняты сразу после hero/summary, противопоказания/источник убраны вниз в `Дополнительно`, actions перенесены после exercises, внутренние roadmap/formulation texts убраны, UGC-only actions скрыты для Flowly/YouTube, fake media placeholders заменены на текстовый step plan с единым честным notice. Проверки PASS: `GET /api/v1/workouts/{id}` Flowly/YouTube/404, catalog card click -> detail, web typecheck/lint, browser 390 light/dark overflow 0, target >=44px, console errors 0. Пользователь approved S-MA-022: «норм пойдет». 2026-07-14 — пользователь попросил доделать оставшиеся slices карточки; начат S-MA-024. Реализован author/source profile route `?screen=author&source=flowly|youtube|user`, список публичных тренировок источника, empty user-content state, safe block/hide explanation without fake mutation for Flowly/YouTube. Проверки PASS: Flowly=20 cards, YouTube=3 cards, user=empty, 390 light/dark overflow 0, targets >=44px, console errors 0, web typecheck/lint. Пользователь approved S-MA-024: «нормальное кайф». 2026-07-14 — пользователь подтвердил старт S-MA-088 report/hide/block; реализация начата. Реализован route `?screen=ugc-safety&action=report|hide|block`: report reason required validation, separate hide outcome, separate block outcome, error/success forced states. Подключены действия из user author profile. После user UI/UX feedback выполнен polish: top nav поднят и уплотнён, header/form объединены визуально в один compact panel, нижние alternate actions стали лёгкими links вместо больших кнопок, service label заменён на пользовательский `Безопасность`, author/safety actions визуально разведены по смыслу (report neutral, hide accent, block danger) и переведены в предсказуемый vertical action list без случайного wrap на 390px. Проверки PASS: report empty validation, report success, hide success, block success, author user links, 390 light/dark overflow 0, target >=44px, console errors 0, web typecheck/lint. Пользователь approved S-MA-088 / продолжение: «ок идем дальше». E2-D2-T03 `in_progress -> review`. 2026-07-14 — пользователь подтвердил закрытие без отдельного deep review: «E2-D2-T03 переводи в done все нормально»; E2-D2-T03 `review -> done`. 2026-07-14 — follow-up polish workout detail: `favorite/share` убраны из нижних bulk actions и перенесены в compact disabled overlay icon buttons на обложку; проверен `?screen=workout&id=wo-yt-malova-vinyasa-24&theme=dark`: overflow 0, targets >=44px, console errors 0, no service text, нижняя action-секция содержит только start.

### E2-D2-T04 — Реализовать YouTube search, cache и save
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §19, §43.28, §44.5, §56.2–56.3 · **depends_on:** E2-D2-T02 · **decisions:** DEC-011, DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-021 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** запрос из фильтров, русскоязычные результаты, кэширование и сохранение видео.
- **acceptance:** [ ] query формируется по PRD; [ ] cache используется; [ ] неподходящий результат можно отметить; [ ] quota errors обработаны.
- **validation/evidence:** сохранённые HTTP-примеры cache hit/miss/error.

### E2-D2-T05 — Реализовать избранное
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §18, §43.12, §55.2 · **depends_on:** E2-D2-T03 · **decisions:** DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-023 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** добавить, удалить и показать единый список без папок.
- **acceptance:** [ ] операции идемпотентны; [ ] список приватен владельцу; [ ] folders отсутствуют.
- **validation/evidence:** API/UI сценарий add/remove/reload.

## Deliverable E2-D3 — Выполнение и создание тренировок

### E2-D3-T01 — Реализовать видеосессию
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §14.1, §14.4, §15, §43.23 · **depends_on:** E2-D2-T03 · **decisions:** DEC-015, DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-012, S-MA-030, S-MA-033, S-MA-034 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** start/resume/finish lifecycle и явный итоговый статус.
- **acceptance:** [ ] открытая сессия сохраняется; [ ] автозавершения нет; [ ] итог подтверждает пользователь.
- **validation/evidence:** lifecycle sequence и persisted records.

### E2-D3-T02 — Реализовать пошаговую и смешанную сессию
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §14.2–14.4, §15 · **depends_on:** E2-D2-T03 · **decisions:** DEC-015, DEC-016, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-012, S-MA-031, S-MA-032, S-MA-033, S-MA-034 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** шаги, таймер, pause/resume, `+30 секунд`, mixed media и незавершённость.
- **acceptance:** [ ] переходы шагов корректны; [ ] +30 не ломает состояние; [ ] mixed flow поддержан; [ ] статус не автоматический.
- **validation/evidence:** UI walkthrough и session state trace.

### E2-D3-T03 — Реализовать собственные тренировки и media uploads
- **status:** backlog · **priority:** high · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §13.2, §16, §43.7–43.11, §44.3–44.4, §44.13, §46 · **depends_on:** E1-D1-T05, E2-D2-T03 · **decisions:** DEC-016, DEC-019, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-040, S-MA-041, S-MA-042, S-MA-043, S-MA-045 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** private CRUD, упражнения, изображения/GIF через безопасный R2 flow.
- **acceptance:** [ ] ownership обязателен; [ ] ограничения загрузки соблюдены; [ ] удаление/доступ корректны; [ ] публичность не включается скрыто.
- **validation/evidence:** CRUD/upload cases и permission failures.

### E2-D3-T04 — Реализовать ручную запись тренировки
- **status:** backlog · **priority:** normal · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §17, §43.21, §43.23, §55.2 · **depends_on:** E2-D3-T01 · **decisions:** DEC-015, DEC-022, DEC-024, DEC-025, DEC-029
- **ui_slices:** S-MA-044 — выполнять последовательно; approval каждого ID обязателен до следующего.
- **scope:** ручное добавление выполнения, включая прошлую дату.
- **acceptance:** [ ] дата и timezone корректны; [ ] запись видна владельцу; [ ] дубликаты обрабатываются явно.
- **validation/evidence:** текущая/прошлая дата и timezone examples.

### E2-D3-T05 — Закрыть DoD этапа «Йога»
- **status:** backlog · **priority:** blocker · **owner:** unassigned · **updated:** 2026-07-13
- **prd_refs:** §50, §55.2, §57 · **depends_on:** E2-D2-T01–T05, E2-D3-T01–T04 · **decisions:** DEC-003, DEC-011, DEC-015, DEC-016, DEC-019, DEC-021, DEC-022, DEC-029
- **scope:** проверить все критерии §55.2 и инварианты §57.
- **acceptance:** [ ] каждый критерий имеет evidence; [ ] privacy/security проверены; [ ] риски YouTube и user content записаны.
- **validation/evidence:** итоговый checklist и ссылки на сценарии.

## Handoff этапа

При остановке указать активную карточку, состояние данных/миграций, проверенные пользовательские flows и следующий точный сценарий.
