# Flowly v1.0 — информационная архитектура и user flows

> Артефакт E0-D0-T01. Источник истины — [`docs/PRD.md`](../../PRD.md); Concept A остаётся неутверждённым референсом.

## Пакет

- [`screen-inventory.md`](screen-inventory.md) — surfaces, стабильные screen IDs и матрица состояний.
- [`flow-inventory.md`](flow-inventory.md) — роли, entry points и F01–F11.
- [`traceability-matrix.md`](traceability-matrix.md) — двунаправленная PRD ↔ screen/flow traceability.
- [`validation-report.md`](validation-report.md) — evidence проверок и остаточные риски.
- [`diagrams/00-overview.md`](diagrams/00-overview.md) — обзор IA.
- [`diagrams/01-onboarding-auth.md`](diagrams/01-onboarding-auth.md) … [`diagrams/11-settings-data-privacy.md`](diagrams/11-settings-data-privacy.md) — 11 доменных диаграмм.

## Идентификаторы и легенда

- `S-MA-NNN` — экран/overlay Telegram Mini App; `S-BOT-NNN` — bot message/callback surface; `S-WEB-NNN` — browser fallback.
- `F01`–`F11` — стабильные flow families; новые ветки расширяют существующий flow, а новый ID выдаётся только новому пользовательскому результату.
- `L/E/ER/R/O/S/D` — loading / empty / error / retry / offline / successful-save / disabled.
- `A` — применимо; `N/A: причина` — состояние неприменимо; состояния не умножаются механически.
- `covered`, `partial`, `blocked: DEC-*`, `N/A: причина` — допустимые статусы traceability.

## Общие инварианты

- Основная навигация строго: **Главная / Йога / Треки / Ритм / Дневник** (domain sections: Тренировки / Программы / Мой ритм / Календарь; DEC-045); профиль открывается avatar с Главной ([DEC-013](../../roadmap/DECISIONS.md#dec-013--ia-навигация-и-deep-links)).
- Shell/auth failures — full-screen; ошибки модулей — inline; mutation сохраняет ввод и даёт retry; offline сохраняет draft; loading использует skeleton ([DEC-022](../../roadmap/DECISIONS.md#dec-022--контекстная-модель-ui-состояний)).
- Все экраны проектируются mobile-first 360–430 px, без horizontal scroll, с wide-screen adaptation, safe-area, light/dark, keyboard access, text scaling, labelled icons, non-color status cues, stoppable GIF и reduced motion (§40).
- Privacy by default, явное подтверждение результата, отсутствие скрытых автокоррекций (§8); каждый restricted deep link проверяет auth и доступ заново.
- Concept A покрывает `S-MA-010`, `S-MA-020`, `S-MA-060`, `S-MA-070` и selected-day summary `S-MA-072` частично; это четыре visual screens, но пять mapped surfaces, gap-reference, не approval.

## Границы

Пакет описывает observable IA/flows, но не содержит wireframes, UI-kit, final layouts, API/backend design или кода. Operational детали `DEC-006`–`DEC-011` отмечены как downstream constraints и не меняют IA.
