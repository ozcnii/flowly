# Frontend UI/UX review checklist

Этот чеклист обязателен для каждого production frontend screen slice Flowly до показа пользователю. Он дополняет `DEC-028`, `DEC-024`, `DEC-025` и applies to any UI surface: экран, overlay, форма, карточка, список, состояние ошибки, empty state, runtime screen.

## Правило

Не показывать пользователю UI, пока агент сам не прошёл этот чеклист в реальном браузере и не исправил очевидные проблемы.

Если хотя бы один пункт ниже вызывает сомнения — сначала исправить UI, затем повторить проверку.

## 1. Product clarity

- [ ] Пользователь сразу понимает, где он и что может сделать.
- [ ] Primary content идёт первым, вторичные настройки/служебные действия не забивают первый экран.
- [ ] Основной сценарий очевиден без объяснений в чате.
- [ ] Нет внутренних терминов: task ID, roadmap, slice, stage, TODO, mock, stub, dev, next task.
- [ ] Нет фраз, которые звучат как техническая заглушка.
- [ ] Если функция ещё недоступна — причина написана человечески и коротко.

## 2. Visual hierarchy

- [ ] Есть один главный визуальный фокус.
- [ ] Заголовки, текст, действия и metadata имеют разный вес.
- [ ] Secondary content не выглядит важнее primary content.
- [ ] Опасные действия визуально отличаются от обычных.
- [ ] Все действия с разной семантикой различаются визуально: primary / secondary / neutral / danger.
- [ ] Нет набора одинаковых кнопок для разных по смыслу действий.

## 3. Layout and spacing

- [ ] Отступы согласованы с соседними экранами того же раздела.
- [ ] Нет случайных больших пустот.
- [ ] Нет “карточек ради карточек”. Рамка нужна только если она группирует смысл.
- [ ] Нет вложенных рамок, если они не помогают пониманию.
- [ ] Контент не выглядит как набор независимых технических блоков.
- [ ] На 360–430px экран выглядит спроектированным, а не сжатым desktop layout.
- [ ] На wide viewport layout не разваливается и не становится слишком растянутым.

## 4. Content density

- [ ] На первом экране нет второстепенной информации, которую можно убрать вниз.
- [ ] Metadata компактна: chips/inline summary вместо больших секций, если это не primary content.
- [ ] Empty/error/help текст короткий и полезный.
- [ ] Нет повторяющихся notice у каждого item, если достаточно одного общего notice.
- [ ] Нет длинных disabled reason в больших кнопках, если можно показать compact explanation.
- [ ] Списки легко сканируются.
- [ ] Search/filter input, который запускает API-запрос, имеет debounce/throttle и не отправляет запрос на каждый символ.

## 5. Actions and states

- [ ] Primary action один и визуально понятен.
- [ ] Disabled action используется только если действие действительно должно быть видно сейчас.
- [ ] Нерелевантные actions скрыты, а не показаны disabled “на всякий случай”.
- [ ] Fake buttons/fake mutations запрещены.
- [ ] Back/cancel не выполняют mutation.
- [ ] Destructive action требует отдельного visual treatment и понятного текста.
- [ ] Report / hide / block / delete / revoke не смешаны и не выглядят одинаково.
- [ ] Success/error outcomes различимы и не скрывают введённые данные без причины.

## 6. Cards and lists

- [ ] Карточка кликабельна только если это ожидаемо для пользователя.
- [ ] В карточке нет лишних кнопок, дублирующих клик по карточке.
- [ ] Картинка есть только если это реальный asset/thumbnail, не fake icon pretending to be image.
- [ ] Если картинки нет — layout не оставляет странную пустоту.
- [ ] Card metadata не раздута: title + 2–4 ключевых атрибута максимум.
- [ ] List item height/spacing consistent; соседние карточки выглядят как один паттерн.

## 7. Forms

- [ ] Required fields явно отмечены смыслом, не только ошибкой после submit.
- [ ] Validation появляется рядом с полем.
- [ ] Ошибка объясняет, как исправить.
- [ ] Введённые данные не теряются после error/retry.
- [ ] Submit disabled/validation states понятны.
- [ ] Cancel/Back явно не сохраняют изменения.

## 8. Empty, loading, error, offline

- [ ] Loading использует skeleton/placeholder той же формы, что итоговый контент.
- [ ] Empty state объясняет, почему пусто и что можно сделать.
- [ ] Error state не выглядит как empty state.
- [ ] Retry есть там, где он применим.
- [ ] Offline state честно говорит, что доступно без сети.
- [ ] Restricted/hidden content — error/recovery state, не empty list.

## 9. Accessibility and interaction

- [ ] Все интерактивные элементы доступны с keyboard.
- [ ] Focus visible и не обрезан.
- [ ] Touch targets ≥44px.
- [ ] Иконки имеют label или являются decorative с `aria-hidden`.
- [ ] Form fields имеют label.
- [ ] Status messages используют `role=status`, `role=alert` или `aria-live`, где нужно.
- [ ] Не используется один цвет как единственный носитель смысла.

## 10. Responsive/theme checks

Обязательные browser checks:

- [ ] 360px light.
- [ ] 390px light.
- [ ] 390px dark.
- [ ] 430px dark.
- [ ] Wide viewport if screen can be used outside phone width.
- [ ] `document.documentElement.scrollWidth - document.documentElement.clientWidth === 0`.
- [ ] Min target size ≥44px for `button,a,input,textarea,summary,[role=button]`.
- [ ] Console errors = 0.

## 11. Copywriting

- [ ] Текст для пользователя, не для разработчика.
- [ ] Нет “появится в следующей задаче”, “slice”, “roadmap”, “stub”, “mock”.
- [ ] Нет агрессивных или пугающих формулировок там, где достаточно нейтральных.
- [ ] Safety/medical text нейтральный и не делает персональных рекомендаций.
- [ ] Error text короткий, без раскрытия внутренних деталей.

## 12. Project consistency

- [ ] Используются approved tokens/components из `packages/ui`, если компонент уже есть.
- [ ] Новый app-local компонент не маскируется под shared UI-kit.
- [ ] Визуальный язык совпадает с уже approved соседними экранами.
- [ ] Route/dev forced states задокументированы в карточке/HANDOFF.
- [ ] Evidence записан: URL, состояния, проверки, residual risks.

## Required evidence format

Перед user review агент фиксирует в карточке/HANDOFF:

```text
UI/UX review: PASS
Checked URLs:
- ...
States:
- base / loading / empty / error / offline / relevant contextual states
Browser:
- 390 light: overflow 0, min target >=44, console 0
- 390 dark: overflow 0, min target >=44, console 0
Commands:
- npm run typecheck --workspace @flowly/web
- npm run lint --workspace @flowly/web
Residual risks:
- ...
```

## Stop conditions

Нельзя просить user approval, если:

- есть horizontal overflow;
- есть console errors;
- touch target <44px;
- UI содержит служебный/roadmap/dev текст;
- разные по смыслу actions выглядят одинаково;
- primary content не первый;
- screen выглядит как техническая заготовка;
- не проверены light/dark и 360–430px;
- не записан evidence.
