# Этап 0 — UX/UI-контракты и первый интерактивный screen slice

> PRD: §8–10, §11–39, §40, §54–55. Текущий процесс утверждён в `DEC-024`; `DEC-012` superseded.

## Цель

Сохранить проверенные IA/wireframe/UI-kit contracts как нормативную основу и утвердить первый реальный интерактивный экран в Next.js без единовременной генерации всех surfaces.

## Сводка

| Backlog | In progress | Blocked | Review | Done |
|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 5 |

## Зависимости и границы

- T00–T03 остаются утверждёнными requirements/reference и не превращаются в production UI автоматически.
- E0-D0-T04 начинается после Next.js bootstrap E1-D1-T01/T02 и реализуется непосредственно в `apps/web`.
- UI развивается по одному screen slice; следующий экран не начинается до явного approval текущего.
- Этап не расширяет продуктовый scope PRD: неясности фиксируются в `DECISIONS.md` и блокируют соответствующую карточку.
- Monolithic generated final screens и отдельный общий prototype/approval gate отменены `DEC-024`.

## Обязательные подтверждённые contracts

- `DEC-013`–`DEC-024` и [`docs/design/flows/`](../../design/flows/) — нормативная основа production UI; `DEC-024` задаёт iterative approval workflow.
- `DEC-025` требует утверждённый production UI-kit в `packages/ui` до продолжения E0-D0-T04.
- `DEC-023` задаёт visual foundation, но каждую композицию нужно проектировать вручную в реальном screen slice.
- Concept A остаётся неутверждённым visual reference; он не заменяет screen/state/flow inventory.
- Новая продуктовая неоднозначность требует `DEC-*`; нельзя молча менять утверждённые navigation, statuses, permissions, destructive flows или bot gate.

## Deliverable E0-D0 — UX/UI contracts и утверждённая интерактивная Главная

### E0-D0-T00 — Зафиксировать исходный HTML-мокап

- **status:** done · **priority:** high · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §9, §11–12, §21, §28, §40 · **depends_on:** — · **decisions:** DEC-012
- **scope:** перенести предоставленный пользователем HTML-концепт в `docs/design/`, сохранить переносимую версию, логотип и preview, описать фактическое покрытие и пробелы без признания концепта утверждённым дизайном.
- **acceptance:** [x] исходные файлы сохранены без функциональных изменений; [x] системный мусор исключён; [x] локальный запуск документирован; [x] preview и логотип доступны; [x] покрытие и ограничения зафиксированы.
- **validation/evidence:** 13 файлов / 1,2 MB в `docs/design/screens/concept-a/`; HTTP 200 для `index.html`, standalone HTML, логотипа и JPG; [`preview.png`](../../design/screens/concept-a/preview.png); [`STATUS.md`](../../design/screens/concept-a/STATUS.md).
- **residual risks:** Concept A покрывает только четыре экрана, не содержит полных flows/обязательных состояний/тёмной темы и не имеет design approval; детали перечислены в `STATUS.md`.
- **journal:** 2026-07-13 — пользовательский каталог перенесён из корня, `.DS_Store` удалён, визуальное и функциональное покрытие проанализировано.

### E0-D0-T01 — Спроектировать информационную архитектуру и user flows

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §8–10, §11–39, §40 · **depends_on:** — · **decisions:** DEC-012–DEC-022
- **scope:** инвентарь экранов и состояний, карта навигации, роли и end-to-end user flows для всех функций v1.0.
- **acceptance:** [ ] независимый re-review должен подтвердить атомарную PRD traceability каждого экрана/flow; [ ] независимый re-review должен подтвердить happy/error/empty/loading/disabled applicability; [x] продуктовые неясности вынесены в `DECISIONS.md`; [x] артефакты сохранены в `docs/design/flows/`.
- **validation/evidence:** [`README`](../../design/flows/README.md), [69 screen/surface IDs + per-ID states](../../design/flows/screen-inventory.md), [F01–F11 + canonical membership](../../design/flows/flow-inventory.md), [atomic PRD traceability](../../design/flows/traceability-matrix.md), [12 Mermaid diagrams](../../design/flows/diagrams/00-overview.md), [validation report with reproducible commands/output](../../design/flows/validation-report.md). Internal validation PASS: 69 IDs; F01–F11; 98 bidirectional screen↔flow pairs with empty symmetric difference; 69 per-ID state assignments/15 profiles; canonical and Rendered diagram IDs; 0 broken links; 12 Mermaid blocks; roadmap 72 = 70 backlog/1 review/1 done; `git diff --check`; 0 staged files. Автотесты не создавались.
- **residual risks:** независимый semantic re-review ещё не выполнен, поэтому первые два acceptance-пункта не отмечены; Mermaid не рендерился CLI/parser; runtime permissions/offline и state copy пока только design contracts; Concept A не утверждён; DEC-006/007/008/010/011 остаются downstream constraints.
- **journal:** 2026-07-13 — deep review выявил и закрыл ошибки F04/F08, privacy/recovery gaps, 13 асимметрий membership, blanket states и неатомарную traceability; финальный независимый gate: blockers/warnings отсутствуют, кроме принятого residual risk отсутствия Mermaid renderer. Задача переведена `review -> done`; E0-D0-T02 разблокирована. Ранее: утверждённый план реализован без wireframes/UI-kit/code; DEC-013–DEC-022 записаны, DEC-009 superseded.

### E0-D0-T02 — Создать wireframes всех экранов

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §9–39, §40.2 · **depends_on:** E0-D0-T01 · **decisions:** DEC-012–DEC-022
- **scope:** wireframes всех экранов и ключевых состояний Mini App, Telegram-сценариев и responsive-вариантов, требуемых PRD.
- **acceptance:** [x] покрыт инвентарь E0-D0-T01; [x] переходы соответствуют user flows; [x] ключевые состояния различимы; [x] snapshots сохранены в `docs/design/wireframes/`.
- **validation/evidence:** [`README`](../../design/wireframes/README.md), [69-row coverage matrix](../../design/wireframes/coverage-matrix.md), [39 canonical + 3 evidence PNG manifest](../../design/wireframes/snapshot-manifest.md), [validation report](../../design/wireframes/validation-report.md). Validation PASS: 69 unique surfaces (59/8/2), 15 profiles/105 state demos, F01–F11/98 symmetric memberships, 38 tailored critical frames, 69 Russian title/action contracts, 0 hidden declared items, 0 content-label primary CTAs, 0 broken links, 78 light/dark browser runs + 13 runs at 200% text, 0 overflow/console/unlabelled controls, reproducible 39+3 snapshot hashes, `git diff --check`.
- **plan:** [`E0-D0-T02-plan.md`](../../design/wireframes/E0-D0-T02-plan.md) — утверждён пользователем 2026-07-13; реализация выполнена строго в согласованном scope.
- **residual risks:** ненулевые safe-area inset не проверены в реальном notched Telegram WebView; full-page PNG достигают ~23.3k px; финальный UX copy/UI-kit не входит в T02; staged `AGENTS.md` — внешнее состояние worktree и этой задачей не изменялось.
- **journal:** 2026-07-13 — план утверждён; HTML+PNG wireframes по F01–F11 реализованы. Findings независимых review по states, observable content, shell, keyboard, CTA, critical branches и snapshot reproducibility закрыты. После последней точечной правки bot CTA выполнена финальная механическая проверка; задача переведена `in_progress -> review`. Пользователь явно подтвердил «всё ок» и дал добро закрыть задачу; выполнен переход `review -> done`.

### E0-D0-T03 — Создать UI-kit и дизайн-систему

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §40, §55.1 · **depends_on:** E0-D0-T01 · **decisions:** DEC-012–DEC-023
- **scope:** design tokens, типографика, цвета, spacing, iconography, компоненты, светлая/тёмная темы и правила доступных состояний.
- **acceptance:** [x] токены и компоненты документированы; [x] темы покрыты; [x] состояния компонентов заданы; [x] контраст, focus и touch targets проверяемы; [x] артефакты сохранены в `docs/design/ui-kit/`.
- **validation/evidence:** [`README`](../../design/ui-kit/README.md), [canonical JSON/CSS tokens](../../design/ui-kit/tokens/tokens.json), [component inventory](../../design/ui-kit/component-inventory.md), [Telegram mapping](../../design/ui-kit/telegram-environment.md), [accessibility checklist](../../design/ui-kit/accessibility-checklist.md), [23 snapshot manifest](../../design/ui-kit/snapshot-manifest.md), [validation report](../../design/ui-kit/validation-report.md). Deep-review corrections complete: per-family contracts/state laboratory, selected ARIA semantics, Telegram environment mapping, reproducible `npm run validate`, true 200% reflow, four-sided safe area, pinned browser setup, safe capture-server root guard and complete interactive-target audit. Validation PASS: generated drift 0; 22/22 contrast pairs; 69/69 surfaces; 18 canonical + 5 evidence PNG; overflow/labels/selection/touch/console PASS; two captures byte-identical.
- **plan:** [`E0-D0-T03-plan.md`](../../design/ui-kit/E0-D0-T03-plan.md) — явно утверждён пользователем 2026-07-13; реализован с закрытием всех findings одного independent deep review.
- **residual risks:** реальный Telegram iOS/Android WebView/notch и production async announcements не проверены; cross-OS font rasterization может менять PNG bytes; high-fi composition всех 69 surfaces относится к E0-D0-T04.
- **journal:** 2026-07-13 — после review FAIL задача возвращалась `review -> in_progress`. По подтверждению пользователя все 5 blockers и 4 warnings исправлены одним проходом; corrected generation/capture/validation PASS, новый review не запускался; выполнен переход `in_progress -> review`. Пользователь явно подтвердил завершение и поручил перевести задачу, закоммитить и запушить; выполнен переход `review -> done`.

### E0-D0-T04 — Спроектировать и утвердить интерактивную Главную

- **status:** done · **priority:** blocker · **owner:** AI agent · **updated:** 2026-07-13
- **prd_refs:** §9, §11, §40, §44.2, §55.1 · **depends_on:** E1-D1-T02, E1-D1-T11 · **decisions:** DEC-013, DEC-016, DEC-022, DEC-023, DEC-024, DEC-025
- **ui_slices:** S-MA-010
- **scope:** вручную реализовать в `apps/web` реальную Главную и применимые base/loading/empty/module-error/offline/resume states; не создавать другие product screens или registry-генератор.
- **acceptance:** [x] экран отвечает «что мне нужно сделать сегодня»; [x] independent modules и empty-day CTA соответствуют DEC-016; [x] states соответствуют DEC-022; [x] интеракции, пять tabs и avatar entry работают; [x] light/dark, 360–430/wide, safe area, keyboard/focus проверены; [x] пользователь явно утвердил Главную до начала следующего screen slice.
- **validation/evidence:** `apps/web/features/home/**`, `apps/web/public/media/home-{resume,program}.webp`, production `@flowly/ui`; generated originals/prompts `.temp/E0-D0-T04/generated/**`; base screenshots `.temp/E0-D0-T04/screenshots/home-concept-a-contracts-{360-dark-viewport,430-light,1280-light}.png`; state screenshots `.temp/E0-D0-T04/screenshots/home-state-{loading,empty,module-error,offline,resume}-430.png` и `home-states-contact-sheet.jpg`. Root typecheck/lint/build PASS; `?home=loading|empty|module-error|offline|resume` проверены на 360/430/1280 light/dark; overflow 0, targets ≥44px, console errors 0, five tabs/current/avatar, focus, reduced-motion и non-zero safe-area PASS. Empty-day 3 CTA, isolated error→loading→retry success, offline local habit notice и resume action PASS. Финальный visual approval пользователя 2026-07-13: «заебись».
- **plan:** [`.temp/E0-D0-T04/next-interactive-plan.md`](../../../.temp/E0-D0-T04/next-interactive-plan.md) — утверждён пользователем 2026-07-13.
- **residual risks:** mock view-model не доказывает backend behavior; Telegram device/WebView проверяется отдельно.
- **journal:** 2026-07-13 — прежний generated 69-screen scope удалён как неудовлетворительный; после завершения E1-D1-T02 вручную реализован base state. Пользователь потребовал сначала production UI-kit; выполнен переход `in_progress -> blocked` до E1-D1-T11 и visual approval `/ui-kit`. 2026-07-13 — пользователь явно утвердил production UI-kit фразой «утверждаю ui kit»; E1-D1-T11 завершена, выполнен переход `blocked -> in_progress`. 2026-07-13 — base state Главной пересобран из approved `@flowly/ui`, дополнен нормальными модулями S-MA-010 и проверен на 360/430/1280; пользователь отклонил длинный dashboard и векторные изображения, выбрал направление `Concept A + contracts` и фотореалистичную генерацию через ChatGPT MCP. Композиция упрощена, обязательные модули сохранены компактно, сгенерированы и локально оптимизированы два изображения реальных людей; остановка на повторном пользовательском review base state. Пользователь подтвердил base state фразой «главная теперь выглядит замечательно»; реализованы loading skeleton, empty day с тремя CTA, isolated module error/retry, offline local actions и resume variant в направлении Concept A; browser matrix PASS. Пользователь дал финальный visual approval полного state set фразой «заебись»; выполнен переход `in_progress -> review`. Пользователь явно отказался от deep review фразой «не стоит, можешь закрывать»; выполнен переход `review -> done`, следующий screen slice разблокирован.

## Handoff этапа

T00–T03 остаются нормативными references. Для T04 фиксировать route/component, все применимые scenarios, screenshots, browser checks и дословный approval. Следующий screen slice не начинать до завершения текущего.
