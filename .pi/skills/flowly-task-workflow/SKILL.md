---
name: flowly-task-workflow
description: Выполнение нетривиальных задач Flowly через deep plan, двойное ревью и последующую реализацию
---

# Flowly Task Workflow

Применяй этот workflow для нетривиальных задач Flowly, особенно для изменений в `apps/web`, API, DB, расписаниях и UI/UX.

## 1. Подготовка

- Сначала прочитай корневой `AGENTS.md` и `docs/roadmap/AGENTS.md` (если существует).
- Обязательно прочитай:
  - `docs/roadmap/README.md`;
  - `docs/roadmap/HANDOFF.md`;
  - карточку задачи в `docs/roadmap/stages/*.md`;
  - все связанные `DEC-*` полностью;
  - для UI/UX — связанные документы `docs/design/flows/**` и `docs/design/FRONTEND_REVIEW.md`.
- Проверь зависимости, текущий статус карточки и отсутствие другой активной задачи.
- Для багов сначала воспроизведи проблему на текущем коде. Для HTTP-багов используй canonical deep curl workflow.
- Не принимай продуктовые, API, архитектурные, UX или naming-решения без пользователя. Не расширяй scope молча.

## 2. Deep plan

Составь подробный deep plan до написания кода. По умолчанию создай отдельный Markdown-файл:

`.temp/<TASK-ID>/plan.md`

Если ID неизвестен, используй `.temp/<short-task-name>/plan.md`.

План пиши на русском и включи:

- проблему;
- текущее поведение;
- целевое поведение;
- открытые вопросы и решения, требующие пользователя;
- ограничения и non-goals;
- затронутые файлы, API, DB, state/data flow;
- UX-состояния и edge cases;
- пошаговую реализацию;
- verification plan;
- риски и остаточные ограничения;
- `Plan confidence: NN%`;
- `Implementation confidence: NN%`.

Если confidence ниже 90%, явно перечисли причины и необходимые проверки/решения.

До реализации покажи пользователю план и дождись approval, если пользователь не дал явное разрешение реализовать сразу.

## 3. Два ревью плана

После создания плана проведи **два независимых ревью**.

Субагенты разрешены только если пользователь явно разрешил их запуск. При разрешении:

- запускай только субагентов-ревьюеров;
- запрещай им редактировать файлы и реализовывать код;
- используй модель `gpt-5.6-luna`;
- первый ревьюер проверяет полноту, зависимости, scope, контракты, API/DB и риски;
- второй ревьюер проверяет UI/UX, edge cases, verification и соответствие `AGENTS.md`/roadmap/DECISION contracts.

Субагенты не должны быть делегатами-реализаторами и не должны менять рабочее дерево. Их выводы добавь в plan или отдельный review-файл, например:

`.temp/<TASK-ID>/plan-review-1.md`
`.temp/<TASK-ID>/plan-review-2.md`

После двух ревью:

- исправь план по подтверждённым замечаниям;
- спорные продуктовые решения вынеси пользователю;
- не начинай реализацию при нерешённом blocker.

## 4. UI/UX требования

Если задача затрагивает UI/UX:

- **обязательно сначала прочитай и применяй `.pi/skills/apple-design/SKILL.md`;** это обязательная часть workflow для каждого UI/UX analysis, implementation и review;
- следуй всем требованиям корневого и Flowly `AGENTS.md`;
- используй только direct Konsta UI 5.2.0 с `theme="ios"`, если нет заранее одобренного исключения;
- не создавай raw interactive HTML, самописные controls, дублирующие wrappers, legacy `.flow-*` CSS или лишние DOM/CSS layers;
- учитывай Apple HIG: hierarchy, один primary action, правильные controls, safe-area, typography, contrast, focus/keyboard, non-color cues, predictable navigation и targets минимум 44×44;
- учитывай loading/error/empty/disabled/pressed/focus states и отсутствие layout shift от transient states;
- используй shared components и решения из `DEC-*`, не дублируй существующие contracts;
- проверь 360/390/430px, light/dark, overflow, console errors, touch targets и text scaling по применимому frontend checklist;
- не добавляй лишний текст, decorative surfaces, fake actions, технические ID или placeholder UI, не предусмотренные scope.

## 5. Реализация

После approval плана и разрешения на реализацию:

- реализуй только утверждённый scope;
- синхронно обновляй карточку, stage summary, roadmap README, `HANDOFF.md`, DECISIONS и downstream metadata, если изменились факты/контракты;
- не пиши тесты без явного запроса пользователя, кроме обязательных полезных проверок, уже предусмотренных карточкой;
- выполняй минимальные релевантные проверки: typecheck, lint/build, HTTP/browser/UI matrix и audits по acceptance criteria;
- для UI запускай приложение на `localhost:3002`, если это предусмотрено проектом, и проверяй реальные маршруты.

## 6. Завершение

В финальном отчёте на русском укажи:

- что реализовано;
- как спроектировано и какие решения приняты;
- изменённые файлы;
- выполненные проверки и их результаты;
- остаточные риски или невыполненные проверки;
- локальные ссылки для проверки, например:
  - `http://localhost:3002/`;
  - `http://localhost:3002/<route>`;
- как воспроизвести ключевой пользовательский сценарий.

После deep plan implementation обязательно спроси: `Провести deep review?`

Перед завершением обнови `docs/roadmap/HANDOFF.md`, чтобы следующий агент мог продолжить работу без истории чата.
