# Flowly — UX/UI design artifacts

Этот каталог хранит нормативные design references Flowly v1.0 согласно `docs/roadmap/stages/00-design.md`. `DEC-012` superseded; production UI и его approval выполняются поэкранно в `apps/web` по `DEC-024`.

## Структура

- [`flows/`](flows/) — утверждённый к review пакет E0-D0-T01: [screen inventory](flows/screen-inventory.md), [F01–F11](flows/flow-inventory.md), [traceability](flows/traceability-matrix.md), [Mermaid diagrams](flows/diagrams/00-overview.md) и [validation evidence](flows/validation-report.md).
- [`wireframes/`](wireframes/) — HTML+PNG wireframes 69 surfaces, F01–F11, state profiles, coverage и versioned snapshots.
- [`ui-kit/`](ui-kit/) — E0-D0-T03: HTML-каталог, JSON/CSS tokens, локальные fonts/icons, components/states, accessibility evidence и 23 versioned snapshots; [план](ui-kit/E0-D0-T03-plan.md) реализован.
- `screens/` — визуальные концепты и финальные versioned snapshots макетов.
  - [`screens/concept-a/`](screens/concept-a/) — предоставленный пользователем исходный HTML-концепт; покрытие и пробелы описаны в [`STATUS.md`](screens/concept-a/STATUS.md).

T00–T03 остаются requirements/reference и не являются production UI. Провальный monolithic T04 удалён; отдельный общий prototype больше не создаётся.

Каталоги артефактов создаются соответствующими карточками. Любая продуктовая неясность фиксируется в `docs/roadmap/DECISIONS.md`, а не решается внутри UI по предположению.

## Правило approval

Каждый production screen slice реализуется вручную в `apps/web` вместе со всеми применимыми states и интеракциями. Approval должен содержать route/component, список scenarios, screenshots/checks, дату и дословную формулировку пользователя. Следующий screen slice не начинается до approval текущего.
