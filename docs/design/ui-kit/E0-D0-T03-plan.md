# E0-D0-T03 — план UI-kit и дизайн-системы

> Статус: утверждён пользователем для реализации.
> Дата утверждения: 2026-07-13.
> Нормативная база: PRD §40, §55.1; DEC-012–DEC-023; `docs/design/flows/**`; утверждённые wireframes `docs/design/wireframes/**`.

## 1. Проблема

Flowly имеет утверждённые IA/user flows и low-fi wireframes 69 surfaces, но ещё не имеет нормативной визуальной системы для финальных макетов и production UI. Нужны переносимые, проверяемые токены, компоненты, темы и правила состояний без расширения продуктового scope.

## 2. Текущее поведение и исходные данные

- E0-D0-T01 и E0-D0-T02 завершены: 69 surfaces, F01–F11, 15 state profiles, 38 critical frames.
- Wireframes проверяют структуру в grayscale и не утверждают palette, typography или component styling.
- Concept A покрывает только четыре экрана и не является финальным дизайном, но пользователь утвердил его мягкое wellness-направление как visual reference для UI-kit.
- PRD требует mobile-first 360–430 px, wider layouts, Telegram light/dark themes, safe area, крупные touch targets, отсутствие horizontal scroll и сохранение сложных drafts.
- DEC-022 требует contextual states: skeleton loading, inline module errors, full-screen shell/auth errors, input-preserving retry и offline draft.

## 3. Целевое состояние

Создать в `docs/design/ui-kit/` self-contained UI-kit, который:

1. использует утверждённое в DEC-023 направление: развитие Concept A, Inter + Cormorant Garamond, Lucide;
2. содержит единый machine-readable token source и сгенерированные CSS custom properties;
3. показывает компоненты, варианты, размеры, состояния и composition patterns в HTML-каталоге;
4. поддерживает Telegram light/dark, responsive 360/430/1280 и safe-area tokens;
5. проверяем по contrast, focus, touch targets, text scaling, overflow и отсутствию runtime external dependencies;
6. предоставляет versioned PNG evidence и достаточные contracts для E0-D0-T04.

## 4. Подтверждённые решения

- Отдельный план хранится в этом файле.
- Visual direction: развить Concept A, не признавая исходный mockup финальным дизайном.
- Typography: локальные WOFF2 Inter для UI и Cormorant Garamond для display headings, с кириллицей.
- Iconography: локально закреплённый Lucide с зафиксированной версией и лицензией.
- Формат: HTML + CSS + JSON tokens + PNG.
- Runtime: без CDN, Google Fonts и других сетевых зависимостей.

Решения синхронизированы в DEC-023 и metadata E0-D0-T03–T06.

## 5. Открытые вопросы

Блокирующих продуктовых вопросов нет. Точные значения palette, type scale, spacing, radius, elevation и motion будут предложены внутри утверждённого направления и принимаются только вместе с review результата E0-D0-T03. Если проверка контраста требует отклонения от цветов Concept A, приоритет имеет доступность; изменение фиксируется в validation evidence.

## 6. Ограничения и non-goals

- Не проектировать финальные 69 high-fi screens: это E0-D0-T04.
- Не строить интерактивные end-to-end flows: это E0-D0-T05.
- Не создавать production component library/framework code.
- Не менять navigation, permissions, statuses, destructive flows, bot gate или иные DEC-013–DEC-022 contracts.
- Не добавлять функции, отсутствующие в PRD/flows.
- Не считать Concept A или UI-kit финальным approval всего UX/UI-пакета; общий approval остаётся E0-D0-T06.
- Автоматические тесты не добавлять; выполнить документированные task-specific validation commands и browser checks.

## 7. Затрагиваемые области

### Новые артефакты

- `docs/design/ui-kit/index.html` — каталог foundations/components/patterns.
- `docs/design/ui-kit/tokens/tokens.json` — canonical token source.
- `docs/design/ui-kit/tokens/tokens.css` — детерминированно сгенерированные CSS variables.
- `docs/design/ui-kit/assets/ui-kit.css` — layouts и component recipes.
- `docs/design/ui-kit/assets/ui-kit.js` — theme/state/demo controls без backend logic.
- `docs/design/ui-kit/assets/fonts/**` — локальные WOFF2 и лицензии.
- `docs/design/ui-kit/assets/icons/**` — выбранный Lucide subset/sprite и лицензия/version metadata.
- `docs/design/ui-kit/component-inventory.md` — component → variant/state/surface mapping.
- `docs/design/ui-kit/accessibility-checklist.md` — нормативы и фактические результаты.
- `docs/design/ui-kit/snapshot-manifest.md` и `snapshots/v1/**` — versioned PNG evidence.
- `docs/design/ui-kit/validation-report.md` — команды, browser matrix, результаты и residual risks.
- минимальный локальный toolchain для generation/capture, если он необходим для JSON→CSS и воспроизводимых snapshots.

### Синхронизируемые артефакты

- `docs/design/README.md`.
- `docs/roadmap/DECISIONS.md`.
- `docs/roadmap/stages/00-design.md`.
- `docs/roadmap/README.md`.
- `docs/roadmap/HANDOFF.md`.

## 8. Token model и data flow

`tokens.json` является canonical source. Generation step детерминированно строит `tokens.css`; validation сравнивает semantic paths и CSS variables, чтобы не допустить drift.

Token layers:

1. **Primitive:** color ramps, font families/weights, numeric spacing, radius, border, elevation, duration/easing, opacity, z-index.
2. **Semantic:** canvas/surface/text/border/accent/status/focus/overlay для light и dark themes.
3. **Component:** control heights, paddings, icon sizes, navigation/card/dialog/runtime-control values только там, где semantic tokens недостаточны.
4. **Telegram environment:** safe-area/viewport/theme fallbacks с явным mapping на Telegram-provided values.

HTML загружает только локальные generated CSS/assets. Theme switch меняет semantic layer; component markup остаётся одинаковым.

## 9. Component inventory

Каталог должен покрыть реальные contracts 69 surfaces, а не абстрактный showcase:

- app shell: top bar, avatar/profile entry, ровно 5 bottom-nav tabs, badges, safe-area containers;
- actions: primary/secondary/tertiary/destructive buttons, icon buttons, links, Telegram CTA;
- selection: chip, filter chip, segmented control, tabs, checkbox, radio, switch;
- input: text, textarea, search, select, date/time, numeric/stepper, validation/help/counter;
- content: module/card, list row, metadata, stat, progress/ring, calendar cell, report block, media/YouTube placeholder;
- runtime: timer, workout controls, checkpoint/sync indicator;
- feedback: skeleton, inline/full-screen error, empty state, offline/cache marker, success, disabled reason, toast/banner;
- overlays: dialog, destructive confirm, bottom sheet;
- social/privacy: avatar group, permission/read-only marker, share/revoke/block/report patterns;
- bot/browser: message block, command/action row, safe fallback panel.

Для каждого компонента фиксируются anatomy, variants, sizes, states, token dependencies, keyboard/focus behavior и surface references.

## 10. UX states и accessibility contracts

Каждый применимый interactive component показывает default, hover (где применимо), focus-visible, pressed, disabled, loading, error и success. Domain state patterns соответствуют 15 profiles и critical contracts без state explosion.

Проверяемые нормативы:

- WCAG AA text contrast: 4.5:1 для обычного текста, 3:1 для крупного;
- 3:1 для meaningful non-text boundaries/icons и focus indicator;
- visible focus не зависит только от цвета и не обрезается;
- interactive target не меньше 44×44 CSS px, кроме документированных inline exceptions;
- интерфейс сохраняет содержимое и функции при 200% text scale;
- нет horizontal overflow на 360/430/1280;
- light/dark используют одинаковую semantic hierarchy;
- reduced-motion mode отключает необязательное движение;
- safe-area fallback и ненулевые inset simulation не перекрывают controls;
- icon-only controls имеют accessible name; state не кодируется только цветом.

## 11. Шаги реализации

1. Зафиксировать структуру каталога, provenance/version/licenses локальных Inter, Cormorant Garamond и Lucide.
2. Создать canonical JSON token schema и generator JSON→CSS.
3. Сформировать primitive и semantic light/dark tokens, затем проверить все нормативные contrast pairs.
4. Реализовать responsive HTML-каталог foundations: colors, typography, spacing, grid, radii, elevation, iconography, motion, safe area.
5. Реализовать component inventory и все применимые component states.
6. Реализовать domain composition patterns из wireframes/DEC-022: shell, forms, collections, runtime, reports, confirmations, Telegram/browser states.
7. Добавить локальные theme/state/text-scale/safe-area controls только для демонстрации UI-kit.
8. Создать canonical snapshots для 360, 430 и 1280 в light/dark и evidence frames для focus, 200% text, reduced motion и non-zero safe area.
9. Заполнить component inventory, accessibility checklist, manifest и validation report фактическими результатами.
10. Провести task-specific mechanical/browser validation, исправить только findings в утверждённом scope.
11. Синхронизировать roadmap/HANDOFF и перевести E0-D0-T03 в `review`; `done` — только после пользовательского подтверждения.

## 12. Проверка

### Структурная

- JSON parse/schema и уникальность token paths.
- Полное соответствие JSON tokens ↔ generated CSS variables.
- Все assets локальны; external runtime URLs отсутствуют.
- Все component inventory entries ссылаются на существующие surface IDs.
- Локальные ссылки, font/icon files, licenses и snapshot hashes существуют.

### Визуальная/browser

- 360×800, 430×932, 1280×900.
- light и dark для всех catalog sections.
- 200% text, keyboard-only focus traversal, reduced motion.
- safe-area simulation с ненулевыми top/right/bottom/left inset.
- 0 horizontal overflow, clipped controls, console/page errors и unlabeled interactive controls.

### Accessibility

- Contrast matrix по фактическим semantic pairs.
- Touch-target audit.
- Focus visibility/order audit.
- State differentiation без color-only semantics.

### Репозиторий

- `git diff --check`.
- Roadmap/card/HANDOFF counts и status synchronization.
- Автотесты не создаются без отдельного запроса пользователя.

## 13. Риски и edge cases

- Concept A palette не гарантирует AA в исходных значениях; semantic ramps потребуется скорректировать.
- Cormorant Garamond нельзя использовать для плотных controls/body copy; он ограничивается display roles.
- Полный Lucide bundle избыточен; нужен проверяемый subset, но его состав должен покрыть inventory.
- Telegram theme/safe-area можно честно симулировать в browser, но реальный notched Telegram WebView останется residual risk до device validation.
- Generated CSS и JSON могут разойтись без parity check.
- Очень полный component state board может стать непрактично высоким; snapshots делятся по catalog sections, не скрывая declared variants.
- Browser/font rasterization может различаться между средами; capture environment и версии фиксируются.

## 14. Confidence assessment

- **Plan confidence: 94%.** Основание: прочитаны PRD §40/§55.1, DEC-012–DEC-023, все flow/state contracts и diagrams, утверждённые wireframes; формат, visual direction, fonts и icons выбраны пользователем; acceptance измерим.
- **Implementation confidence: 91%.** Основание: deliverable статический и self-contained, подход к generation/capture уже доказан в E0-D0-T02. Неопределённость дают подбор AA-compatible dark/light palette, локальное font/icon packaging и отсутствие реального Telegram device/WebView.

Для повышения implementation confidence после реализации нужны фактическая contrast matrix, deterministic recapture, browser safe-area simulation и последующий device check на этапе финальных макетов/прототипа.

## 15. Approval gate

План явно утверждён пользователем 2026-07-13. Любое изменение scope, visual foundation или artifact format требует остановки и повторного согласования.
