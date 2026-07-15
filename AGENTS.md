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
- По `DEC-024` production UI проектируется в реальном `apps/web` итерациями «один screen slice + все применимые states/интеракции». Scripts не генерируют дизайн. Следующий screen slice нельзя начинать до явного approval текущего; route/component, scenarios, screenshots/checks и формулировка approval фиксируются в карточке/HANDOFF.
- По `DEC-025` shared production UI сначала реализуется и утверждается в `packages/ui` через интерактивный `/ui-kit`. Product screen обязан использовать утверждённый public API; app-local компонент не переносится в shared автоматически. До approval UI-kit E0-D0-T04 и следующие screen slices blocked.
- По `DEC-028` любой production frontend screen slice до показа пользователю обязан пройти самостоятельный UI/UX quality pass агентом по чеклисту [`docs/design/FRONTEND_REVIEW.md`](docs/design/FRONTEND_REVIEW.md). Нельзя сдавать экран как техническую заготовку: служебные ID/roadmap-тексты, огромные заглушечные блоки, нерелевантные disabled-actions, fake-buttons/fake-mutations, избыточные рамки/пустоты, плохая визуальная иерархия, несогласованные отступы с соседними экранами и карточки без реального смысла должны быть исправлены до user review. Обязательная браузерная проверка: 360–430px, light/dark, primary content first, адекватная плотность/отступы, релевантные actions, no horizontal overflow, touch targets ≥44px, console errors 0. Если UI вызывает сомнения — сначала провести собственное UI/UX ревью и исправить, не перекладывая разбор на пользователя.
- По `DEC-029` все client-side запросы из `apps/web` к Flowly API должны идти через `@tanstack/react-query` (`useQuery`/`useMutation`) и общий typed API helper. Raw `fetch` в client components/features запрещён; допустим только в общем API helper и server route handlers. После frontend/API изменений проверять audit: `rg -n "\\bfetch\\(" apps/web/app apps/web/components apps/web/features apps/web/lib --glob '!app/api/**' --glob '!**/*.module.css' --glob '!**/*.d.ts'` — ожидаемый raw `fetch` только в `apps/web/lib/api/client.ts`.
- По `DEC-032` product routes обязаны использовать устойчивый shared app shell/layout. Нельзя делать standalone product pages, где пропадает bottom navigation/header/avatar, если flow не approved как immersive. Нельзя использовать `?screen=`/`?tab=` как product routing. Навигация между product routes не должна вызывать full reload feeling, auth flicker, повторный auth-error/loading screen или remount общего shell. Для Next.js использовать nested `layout.tsx`/route groups, когда это сохраняет shell. Back/cancel placement и page padding должны быть консистентны: один owner внешних отступов (shell или screen), без двойных больших padding. Fullscreen shell обязан использовать max iOS `env()` + Telegram CSS vars + SDK safe/content insets. Floating bottom navbar имеет fixed visual height 64px, safe inset меняет только bottom offset; общий main reserve обязан оставлять последний content/action выше navbar на каждой product page. Перед user review routing/layout changes обязательны click matrix, nav persistence, safe-area `0/34/48`, last-content clearance, no auth flicker, no `?screen=`/`?tab=`, console errors 0, overflow 0.
- По `DEC-033` product screen CSS обязан использовать approved UI primitives/tokens для повторяемых atoms: `.flow-screen`, `.flow-top`, `.flow-back`, `.flow-eyebrow`, `.flow-title`, `.flow-subtitle`, `.flow-section-title`, `.flow-card-title`, `.flow-card`, `.flow-list-row`, controls, avatar/icon/status patterns and existing `--primitive-*`/`--component-*`/`--color-*` tokens. Запрещено вводить произвольные локальные значения для page padding, top/back placement, card/list spacing, colors, radii, avatar sizes, font sizes or semantic action colors, если это повторяемый паттерн. Любое отклонение требует approved exception and comment. Перед user review frontend changes обязательны global drift audit по route-accessible screens: sibling pages must have identical page edge/top/back geometry and typography hierarchy; no arbitrary spacing/color/font drift; no compounded vertical margins on top of `.flow-screen` gap; no mobile empty-space slabs; back/cancel/navigation controls must not stretch full-width unless approved; browser 360/390/430 checks; overflow 0; console errors 0; touch targets ≥44.
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
