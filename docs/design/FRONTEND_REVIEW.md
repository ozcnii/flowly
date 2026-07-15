# Frontend UI/UX review checklist

Этот чеклист обязателен для каждого production frontend screen slice Flowly до показа пользователю. Он дополняет `DEC-028`, `DEC-024`, `DEC-033`, `DEC-035` и applies to any UI surface: экран, overlay, форма, карточка, список, состояние ошибки, empty state, runtime screen.

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

## 3. App shell, routing and navigation architecture

- [ ] Product screen использует общий route/layout/shell паттерн Next.js, а не standalone page, если это часть приложения.
- [ ] Нижняя навигация, header/profile action и общий shell не исчезают при переходе между product routes, кроме явно immersive/fullscreen flows.
- [ ] Fullscreen shell использует вложенную модель Telegram: system safe inset и content-safe inset складываются; top content не уходит под Telegram chrome.
- [ ] Floating navbar остаётся 64px при bottom safe area `0/34/48`, меняет только offset, а последний content/action при максимальном scroll остаётся выше navbar.
- [ ] Навигация не вызывает видимый full reload, re-auth flicker или повторный auth/error/loading screen при обычном переходе внутри app.
- [ ] AuthGate не должен пересоздаваться на каждом product route, если пользователь уже внутри authenticated shell; session check не должен мигать UI.
- [ ] Product routes — нормальные paths, не `?screen=...`/`?tab=...`; query params допустимы только для настоящего state (`q`, filters) или временных dev forced states.
- [ ] Internal page header — full-width direct Konsta `Navbar` вне page-padding container; title задан через `Navbar.title`, optional right action через Konsta `Link/Icon`.
- [ ] Internal route не содержит web Back control; official Telegram `BackButton` visible only off the five exact top-level routes, click invokes `router.back()`, `onClick/offClick` cleanup is symmetric and does not hide between internal routes; only top-level effect hides it, so Close/X never flashes during internal Back; native Close/X is never treated as interceptable (DEC-048).
- [ ] Нет outer padding вокруг Navbar, custom header/title/back Button или CSS navbar imitation.
- [ ] Telegram fullscreen root Navbar следует DEC-047: Navbar absent on desktop/web and present only for Telegram `ios|android|android_x`; mobile effective inset `max(44px, composed top)` owned once with title centered in the final 44px to avoid notch/native controls, safe-area blur covers the full top inset, title/action-free primary geometry and action-free internal title geometry match their approved contracts at initial and scrolled positions; Home content alone owns the `Твой план` + 44px `user-round` Profile action per DEC-043/046.
- [ ] Back/cancel placement консистентен внутри раздела: не прыгать между верхом/низом без причины.
- [ ] Если экран открыт из shared shell, back action не дублирует bottom nav и не нарушает ожидаемый history/back паттерн.
- [ ] Для Next.js использовать nested `layout.tsx`/route groups там, где это предотвращает remount общего shell, повторную авторизацию и мигание.
- [ ] Перед сдачей routing/layout changes проверены реальные clicks между разделами, не только прямое открытие URL.

## 4. Layout and spacing

- [ ] Каждый standard visual/interactive element использует прямой Konsta UI 5.2.0 (`konsta/react`) component с `ios` theme: controls, fields, cards, lists, feedback, navigation, titles/group labels; raw analog отсутствует.
- [ ] Raw `<button>`, `<input>`, `<select>`, `<textarea>` = 0, кроме заранее approved DEC exceptions.
- [ ] Нет visual `<div>`/`<span>` + CSS, имитирующих Konsta component; каждый оставшийся structural wrapper нужен для semantics/domain layout и не задаёт component anatomy.
- [ ] Product screen использует Konsta как first/final source; shared Flowly CSS ограничен shell/safe-area/page geometry, brand bridge и domain layout, отсутствующими в Konsta.
- [ ] DOM минимален: нет лишних wrapper layers, decorative spans и контейнеров без layout/semantic необходимости.
- [ ] CSS не переопределяет Konsta anatomy/states/padding/radius/typography/colors/shadows/control sizing.
- [ ] После user cleanup signal весь затронутый component family проверен code-first: official Konsta composition восстановлена, а неиспользуемые CSS Modules/global selectors/local visual wrappers/decorative layers удалены полностью, не точечно.
- [ ] No arbitrary local values for repeated page padding, back placement, card/list spacing, colors, radii, avatar/icon sizes or semantic action colors.
- [ ] Sibling screens in one shell have identical page edge/top/back geometry unless an approved exception is documented.
- [ ] Back/cancel/navigation controls are content-width, not full-width, unless explicitly approved for a primary mobile action pattern.
- [ ] Global drift audit was run for route-accessible product screens, not only the screen touched by the change.
- [ ] Ровно один уровень page padding отвечает за внешний край: либо shell, либо screen, но не оба одновременно.
- [ ] Ровно один уровень vertical rhythm отвечает за расстояния между крупными блоками: не складывать `.flow-screen` gap с локальными `margin-top`/`margin-bottom`.
- [ ] На мобильном нет больших пустых slabs между content blocks; first meaningful content appears without desktop-like whitespace.
- [ ] Вложенные экраны не добавляют второй большой horizontal padding поверх shell padding.
- [ ] Отступы согласованы с соседними экранами того же раздела.
- [ ] Нет случайных больших пустот.
- [ ] Нет “карточек ради карточек”. Рамка нужна только если она группирует смысл.
- [ ] Нет вложенных рамок, если они не помогают пониманию.
- [ ] Контент не выглядит как набор независимых технических блоков.
- [ ] На 360–430px экран выглядит спроектированным, а не сжатым desktop layout.
- [ ] На wide viewport layout не разваливается и не становится слишком растянутым.

## 5. Content density

- [ ] На первом экране нет второстепенной информации, которую можно убрать вниз.
- [ ] Metadata компактна: chips/inline summary вместо больших секций, если это не primary content.
- [ ] Empty/error/help текст короткий и полезный.
- [ ] Нет повторяющихся notice у каждого item, если достаточно одного общего notice.
- [ ] Нет длинных disabled reason в больших кнопках, если можно показать compact explanation.
- [ ] Списки легко сканируются.
- [ ] Search/filter input, который запускает API-запрос, имеет debounce/throttle и не отправляет запрос на каждый символ.

## 6. Actions and states

- [ ] Primary action один и визуально понятен.
- [ ] Disabled action используется только если действие действительно должно быть видно сейчас.
- [ ] Нерелевантные actions скрыты, а не показаны disabled “на всякий случай”.
- [ ] Fake buttons/fake mutations запрещены.
- [ ] Back/cancel не выполняют mutation.
- [ ] Destructive action требует отдельного visual treatment и понятного текста.
- [ ] Report / hide / block / delete / revoke не смешаны и не выглядят одинаково.
- [ ] Success/error outcomes различимы и не скрывают введённые данные без причины.

## 7. Cards and lists

- [ ] Карточка кликабельна только если это ожидаемо для пользователя.
- [ ] В карточке нет лишних кнопок, дублирующих клик по карточке.
- [ ] Картинка есть только если это реальный asset/thumbnail, не fake icon pretending to be image.
- [ ] Если картинки нет — layout не оставляет странную пустоту.
- [ ] Card metadata не раздута: title + 2–4 ключевых атрибута максимум.
- [ ] `ListItem` с `linkComponent="button"` сохраняет Konsta anatomy, занимает всю строку через `contentClassName="w-full"` и выравнивает title/subtitle через `innerClassName="text-left"`; `linkProps.className` не используется.
- [ ] List item height/spacing consistent; соседние карточки выглядят как один паттерн.

## 8. Forms

- [ ] Required fields явно отмечены смыслом, не только ошибкой после submit.
- [ ] Validation появляется рядом с полем.
- [ ] Ошибка объясняет, как исправить.
- [ ] Введённые данные не теряются после error/retry.
- [ ] Submit disabled/validation states понятны.
- [ ] Cancel/Back явно не сохраняют изменения.

## 9. Empty, loading, error, offline

- [ ] Loading использует skeleton/placeholder той же формы, что итоговый контент.
- [ ] Empty state объясняет, почему пусто и что можно сделать.
- [ ] Error state не выглядит как empty state.
- [ ] Retry есть там, где он применим.
- [ ] Offline state честно говорит, что доступно без сети.
- [ ] Restricted/hidden content — error/recovery state, не empty list.

## 10. Accessibility and interaction

- [ ] Все интерактивные элементы доступны с keyboard.
- [ ] Focus visible и не обрезан.
- [ ] Touch targets ≥44×44px/pt.
- [ ] Каждая кнопка/control проверена в применимых enabled/pressed/selected/focus/disabled/loading/error states.
- [ ] Single-select и multi-select используют правильный control/ARIA contract; option не выглядит как primary CTA.
- [ ] Иконки имеют label или являются decorative с `aria-hidden`; icon source approved, если Konsta не предоставляет нужный contract.
- [ ] Каждый control с icon + label явно задаёт consistent 8pt gap (`gap-2` или эквивалент component API); иконка не соприкасается с текстом ни в одном state/viewport.
- [ ] Form fields имеют visible label, понятную value/error/help hierarchy и не теряют draft при retry.
- [ ] Status messages используют `role=status`, `role=alert` или `aria-live`, где нужно.
- [ ] Не используется один цвет как единственный носитель смысла; selected/error/success имеют shape/icon/text cue.
- [ ] Apple HIG pass выполнен: один primary action, predictable Back/Cancel/Done, system typography/text scaling, readable contrast, safe-area и concise copy.

## 11. Responsive/theme checks

Обязательные browser checks:

- [ ] 360px light.
- [ ] 390px light.
- [ ] 390px dark.
- [ ] 430px dark.
- [ ] Wide viewport if screen can be used outside phone width.
- [ ] `document.documentElement.scrollWidth - document.documentElement.clientWidth === 0`.
- [ ] Min target size ≥44px for `button,a,input,textarea,summary,[role=button]`.
- [ ] Console errors = 0.

## 12. Copywriting

- [ ] Текст для пользователя, не для разработчика.
- [ ] Нет “появится в следующей задаче”, “slice”, “roadmap”, “stub”, “mock”.
- [ ] Нет агрессивных или пугающих формулировок там, где достаточно нейтральных.
- [ ] Safety/medical text нейтральный и не делает персональных рекомендаций.
- [ ] Error text короткий, без раскрытия внутренних деталей.

## 13. Project consistency

- [ ] Используются Konsta components напрямую; каждый `packages/ui`/local wrapper usage удалён либо связан с заранее approved DEC exception и code comment.
- [ ] Нет local/custom wrapper, дублирующего существующий Konsta component; «временные» compatibility wrappers запрещены.
- [ ] Legacy `packages/ui` implementations/usages и duplicate CSS удалены вместе, а не скрыты новым wrapper layer.
- [ ] Если `packages/ui` пуст после audit, package/dependencies и `/ui-kit` удалены; если approved composites остались, `/ui-kit` проверяет только их.
- [ ] Onboarding/Settings используют один shared `@/components/timezone-picker`; duplicate timezone Select/Sheet implementations и legacy `packages/ui` Select/TextField отсутствуют.
- [ ] Для каждого исключения зафиксированы: отсутствующий Konsta equivalent, user approval, DEC-ID, минимальный DOM/CSS и отдельная verification evidence.
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
- raw interactive HTML audit: expected 0 or approved DEC exceptions
- packages/ui usage/export audit: expected 0 or approved DEC exceptions
- CSS/visual wrapper audit: every remainder justified by shell/safe-area/domain layout
Control matrix:
- button/icon/field/selection: enabled / pressed / selected / focus / disabled / loading / error as applicable
Apple HIG:
- hierarchy / primary action / 44pt / safe-area / system typography / contrast / non-color cues / Back-Cancel-Done
Residual risks:
- ...
```

## Stop conditions

Нельзя просить user approval, если:

- есть horizontal overflow;
- есть console errors;
- shell/nav исчезает на product route без approved immersive reason;
- navigation между product routes вызывает auth flicker/re-auth/loading flash;
- используются `?screen=` или `?tab=` как product routing;
- back/cancel placement скачет между экранами одного раздела;
- sibling screens have different page gutter/top/back geometry or typography hierarchy without approved exception;
- back/cancel/navigation control stretches full-width without approved exception;
- standard UI control/surface реализован без Konsta при наличии подходящего Konsta component;
- repeated UI primitives use arbitrary local spacing/color/radius/font values instead of approved Konsta/theme/layout contracts;
- mobile screen has compounded vertical margins or large empty slabs between main content blocks;
- touch target <44px;
- UI содержит служебный/roadmap/dev текст;
- разные по смыслу actions выглядят одинаково;
- primary content не первый;
- screen выглядит как техническая заготовка;
- не проверены light/dark и 360–430px;
- не записан evidence.
