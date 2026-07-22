# E4-D5-T08 — закрыть DoD привычек

## Проблема

T01–T07 реализовали создание привычки, четыре типа расписания, occurrences, reminder jobs и lifecycle actions, но DoD привычек (§55.4) ещё не закрыт единым воспроизводимым evidence. Нужно проверить фактическое поведение текущей версии, а не только наличие кода.

## Текущее поведение

- Создание привычки выполняется через owner-scoped API; privacy option в create-flow не предусмотрен.
- Поддерживаются `exact_times`, `weekdays`, `weekly_target`, `interval`.
- Несколько настроенных local-time slots создают отдельные occurrences.
- `allowSkip` и `allowRest` проверяются на сервере; terminal transition отменяет pending reminder jobs.
- Иконка и цвет валидируются через утверждённые списки.
- Access к habit/occurrence проверяется через `ownerId`/`userId`; отдельная sharing-система относится к downstream F10 и не должна добавляться в T08.
- Profile timezone является единственным timezone source; occurrence хранит immutable timezone snapshot.

## Целевое поведение

Получить фактическую scenario matrix и evidence для каждого пункта §55.4:

1. произвольная приватная привычка создаётся и доступна владельцу;
2. все четыре типа расписания дают правильные локальные slots;
3. несколько выполнений в день сохраняются раздельно и могут иметь независимые статусы;
4. иконка и цвет сохраняются и отображаются как identity, не подменяя status cue;
5. skip разрешается/запрещается согласно habit policy;
6. привычка приватна по умолчанию, а чужой пользователь не может читать или менять её данные;
7. timezone/DST и immutable history не нарушают предыдущие результаты.

## Открытые вопросы

- Продуктовое решение не требуется: «можно поделиться только после создания» проверяется как отсутствие privacy/share option во время create и owner-only access. Реальную sharing-функцию не реализуем: она относится к F10/downstream.
- Если проверка обнаружит несоответствие, исправляется только минимальный defect в пределах T08; новый API/UI/социальный scope сначала выносится пользователю.

## Ограничения и non-goals

- Не добавлять новый sharing/friends flow.
- Не реализовывать Telegram delivery.
- Не менять PRD, DEC-015/017/019 и schedule semantics по результатам удобства проверки.
- Не вводить фиксированный generation horizon.
- Не писать boilerplate-тесты; использовать полезные локальные pure/API/D1/browser проверки и сохранять их результаты в evidence.
- Calendar/report UI и полноценный E5 reminder delivery не входят в T08.

## Затронутые области

- `packages/core/src/habit-schedules.ts` — pure expansion matrix.
- `apps/web/app/api/v1/habits/**` — create/update/ownership/privacy.
- `apps/web/app/api/v1/occurrences/**` и `apps/web/lib/habits/occurrence-status.ts` — statuses, skip/rest, idempotence.
- `apps/web/features/rhythm/**` — schedule form, icons/colors and browser states.
- `apps/scheduler/src/habit-generation.ts` — Cron generation/idempotence.
- Local D1 migrations/schema and roadmap evidence.

На первом проходе runtime-файлы не меняются: сначала выполняется verification-first matrix.

## Scenario matrix

### Schedule

- `exact_times`: 1 и 2 times, duplicate input normalization, два occurrence на одной дате.
- `weekdays`: включённый сегодняшний день и соседний день, который сегодня не создаёт slot.
- `weekly_target`: allowed day, target/mandatory-today facts, недопустимый день.
- `interval`: hours/days/weeks, anchor before/current date, старый anchor без длинного цикла.
- Profile timezone: summer/winter DST conversion, смена timezone для новых slots, старые snapshots/history неизменны.

### Occurrences/jobs/lifecycle

- Создание даёт ожидаемое число occurrences и policy jobs.
- Повторные mutation/GET/Cron не создают duplicates; `idempotency_key` unique.
- Два slots одной даты переводятся в статусы независимо.
- Проверить `completed`, `partial`, `rest`, `skipped`, `no_response` и повтор той же команды.
- `allowSkip=false` и `allowRest=false` возвращают 400 без изменения occurrence/jobs.
- `allowSkip=true`/`allowRest=true` разрешают действие и отменяют pending jobs.
- Архивная/чужая привычка не раскрывается через detail/schedule/occurrence/status endpoints.

### Privacy/identity/UI

- Create payload не содержит privacy/share control; созданная habit owner-only.
- Чужой user получает 404 для habit, schedule, occurrence и status mutation.
- Каждая разрешённая icon/color option сохраняется; невалидные значения дают 400.
- `/rhythm/new` и edit/detail показывают identity без отдельного habit timezone picker.
- Browser 360/390/430 light/dark: overflow 0, console errors 0, targets ≥44px, relevant states visible.

## План реализации/проверки

1. Зафиксировать current schema/API contracts и подготовить локальные isolated fixtures для двух пользователей.
2. Запустить pure schedule matrix и DST/interval checks.
3. Выполнить authenticated HTTP matrix создания, schedule types, statuses, skip/rest, ownership и invalid inputs.
4. Проверить SQL counts, slot identity, jobs/status history и отсутствие дублей после повторов.
5. Выполнить scheduler Cron repro в отдельной local test D1 и удалить fixtures.
6. Выполнить browser matrix для create/edit/detail/list identity и relevant error/disabled states.
7. Если найден defect, остановиться на минимальном fix и повторить затронутую матрицу; без расширения scope.
8. Заполнить acceptance/evidence/residual risks в карточке и `HANDOFF.md`, затем перевести T08 в `review`.

## Verification commands/evidence

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:check`
- local D1 migration/apply and SQL assertions
- pure `tsx` matrix for all schedule types and DST
- authenticated API HTTP repro with cookie/session
- scheduler `__scheduled` Cron repro against `flowly-db-test`
- Playwright browser checks for `/rhythm`, `/rhythm/new`, `/rhythm/[id]`, edit states
- `git diff --check`

## Риски

- Sharing реально ещё не является T08 runtime capability; evidence должен явно отделить private-by-default от downstream F10.
- Ambiguous/nonexistent local times в DST для hourly interval остаются ограничены DEC-068 local-calendar semantics; зафиксировать фактический результат, не придумывать новую policy.
- Telegram delivery и production Cron/device behavior не подтверждаются локальной D1-проверкой.

## Confidence

- **Plan confidence: 92%** — PRD §50.1/§55.4/§57, DEC-003/015/017/019/022/029, F07, current API/schema/core/scheduler и T01–T07 evidence изучены; acceptance переводится в воспроизводимую matrix.
- **Implementation confidence: 90%** — вероятен verification-only проход с минимальными defect fixes. Неопределённость остаётся только в фактических gaps UI/privacy и в границе private-by-default versus future sharing, которые будут проверены до изменения кода.
