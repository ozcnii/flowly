# Flowly — UX/UI design artifacts

Этот каталог хранит переносимые дизайн-артефакты Flowly v1.0 и evidence их утверждения согласно `docs/roadmap/stages/00-design.md` и `DEC-012`.

## Структура

- [`flows/`](flows/) — утверждённый к review пакет E0-D0-T01: [screen inventory](flows/screen-inventory.md), [F01–F11](flows/flow-inventory.md), [traceability](flows/traceability-matrix.md), [Mermaid diagrams](flows/diagrams/00-overview.md) и [validation evidence](flows/validation-report.md).
- [`wireframes/`](wireframes/) — HTML+PNG wireframes 69 surfaces, F01–F11, state profiles, coverage и versioned snapshots.
- [`ui-kit/`](ui-kit/) — E0-D0-T03: HTML-каталог, JSON/CSS tokens, локальные fonts/icons, components/states, accessibility evidence и 23 versioned snapshots; [план](ui-kit/E0-D0-T03-plan.md) реализован.
- `screens/` — визуальные концепты и финальные versioned snapshots макетов.
  - [`screens/concept-a/`](screens/concept-a/) — предоставленный пользователем исходный HTML-концепт; покрытие и пробелы описаны в [`STATUS.md`](screens/concept-a/STATUS.md).
- `prototype/` — переносимый интерактивный прототип и сценарии проверки.
- `APPROVAL.md` — явное утверждение конкретных версий пользователем; создаётся в E0-D0-T06.

Каталоги артефактов создаются соответствующими карточками. Любая продуктовая неясность фиксируется в `docs/roadmap/DECISIONS.md`, а не решается внутри макета по предположению.

## Правило approval

Разработка этапов 1–8 начинается только после явного утверждения UX/UI-пакета. Approval должен содержать дату, формулировку пользователя и точный список утверждённых файлов/версий. Изменение утверждённого артефакта требует повторного approval затронутого пакета.
