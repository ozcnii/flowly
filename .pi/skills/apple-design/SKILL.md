---
name: apple-design
description: Apple interaction, motion, hierarchy, typography and accessibility guidance adapted for Flowly's Konsta UI frontend.
---

# Apple Design для Flowly

Источник: [emilkowalski/skills — apple-design](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md).

Этот проектный вариант сохраняет применимые принципы Apple Design и удаляет web-specific implementation recipes, которые конфликтуют с Flowly's Konsta-first contract.

## Обязательное применение

Перед анализом, реализацией или ревью любого Flowly UI/UX screen slice прочитать этот skill вместе с `AGENTS.md`, связанными `DEC-*`, flow contracts и `FRONTEND_REVIEW.md`. Применять только в пределах утверждённого task scope.

## Konsta-first граница

- `konsta/react` 5.2.0 с `theme="ios"` — единственный базовый источник controls, lists, fields, surfaces, sheets, navigation, typography and feedback.
- Не переносить из исходного skill примеры с raw HTML/CSS, Motion/Framer Motion, custom spring libraries, custom glass, custom controls или отдельными animation tokens.
- Не создавать замену Konsta-анатомии. Если Konsta предоставляет нужный component/interaction, использовать его напрямую и только его props/utilities.
- Custom gesture/motion допустимы только для Flowly-specific behaviour, которого нет в Konsta, и требуют заранее подтверждённого scope/DEC. Не добавлять новую motion dependency самостоятельно.

## Принципы проверки

### 1. Response

- Feedback начинается на pointer-down/press и не ждёт лишней задержки.
- Loading, mutation, selection and error feedback должны быть причинно понятными и не создавать layout shift.
- Во время drag/swipe content следует за жестом 1:1; input остаётся interruptible.

### 2. Direct manipulation и interruptibility

- Drag сохраняет точку захвата и не перескакивает к центру.
- Движение можно остановить и развернуть в любой момент без скачка от текущего visual value.
- Enter/exit reversible interaction использует симметричный путь и остаётся привязанной к trigger. Для Konsta Sheet/Popup не переопределять native anatomy без approved exception.

### 3. Spatial consistency и hierarchy

- Панель, sheet или popup появляется из пространственно связанного trigger; Back/Cancel/Done предсказуемы.
- Материал/blur/shadow выражают иерархию, а не декорируют интерфейс. Не складывать несколько translucent surfaces и не ухудшать contrast.
- Один явный primary action; обычные options не должны выглядеть как CTA.
- Рядом с control находится объясняющий текст или status, а не разрозненный технический блок.

### 4. Accessibility и reduced motion

- `prefers-reduced-motion: reduce`: не добавлять резкие, пружинящие или бесконечные движения; сохранять понятный static/fade feedback через Konsta.
- Проверять keyboard/focus, Dynamic Type/text scaling, contrast, non-color cues, labelled icons и targets минимум 44×44pt.
- Не использовать цвет как единственный сигнал состояния. Error, selected, success and disabled имеют text/icon/shape cue.
- System iOS typography остаётся под контролем Konsta; не добавлять custom font, произвольный tracking или line-height поверх component contract.

### 5. Restraint и craft

- Каждый control, wrapper, animation, surface и copy должен иметь ясную пользовательскую цель.
- Предпочитать знакомый Konsta pattern и существующий Flowly shared component; не дублировать component family.
- Сначала проверять mobile 360–430px, затем wide viewport; отсутствие horizontal overflow обязательно.
- Проверять base/pressed/selected/focus/disabled/loading/error и light/dark states, если они применимы.

## Минимальный review checklist

- Konsta component используется напрямую; raw interactive HTML и visual wrapper-аналогов нет.
- Press feedback немедленный, transition/gesture не блокирует пользователя и не ломает focus.
- Geometry не скачет от transient state; safe-area и shared shell contract сохранены.
- Motion отсутствует, если он не добавляет понимания; reduced-motion path проверен.
- Hierarchy, typography, spacing, contrast, labels and touch targets проходят Apple HIG и `FRONTEND_REVIEW.md`.
- Evidence содержит URL, states, viewport/theme, overflow, console и residual risks.
