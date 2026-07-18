# E2-D3-T05 — DoD этапа «Йога» (§55.2)

**Дата:** 2026-07-19  
**Закрытие:** explicit user command (close E2-D3-T05 as done after favorites ship `fad6bc2`)

## Checklist §55.2 (applicable)

| Критерий | Status | Evidence |
| --- | --- | --- |
| Есть проверенный каталог | PASS | E2-D2-T02/T07/T08; starter catalog seeds; `/catalog` production |
| Работают категории и фильтры | PASS | `GET /api/v1/workouts` filters; catalog Sheet Radio/Toggle |
| Работает YouTube-поиск | PASS | Piped DEC-049; `/youtube` cache ≥24h |
| Видео можно сохранить | PASS | materialize private workout (Save/create + favorite materialize) |
| Видеотренировку начать и завершить | PASS | E2-D3-T01 DEC-062; `/sessions/[id]` video |
| Пошаговую тренировку можно пройти | PASS | E2-D3-T02 S-MA-031; E2-D3-T06 MP4 media |
| Работает +30 секунд | PASS | step session +30 |
| Статус не устанавливается автоматически | PASS | Finish Sheet explicit status DEC-015/062 |
| Можно создать собственную тренировку | **N/A** | DEC-064 / E2-D3-T03 `blocked` — product defer |
| Можно добавить картинки и GIF (UGC upload) | **N/A** | DEC-064; catalog uses seeded MP4 (T06), not UGC R2 |
| Можно вручную записать тренировку | **N/A stage 2** | DEC-065 → E6-D7-T09 with calendar |
| Работает избранное | PASS | E2-D2-T05 `fad6bc2`; `/favorites`; catalog/detail/YouTube toggle |

## Privacy / security (stage-2 relevant)

- Favorites owner-scoped (`user_id` only); unauth API 401
- Mutations require Origin CSRF
- YouTube private materialized workouts owner-only visibility
- Sessions one-open per user (partial unique index)
- No production secrets in repo (foundation)

## YouTube risks recorded

- Provider/API limits: Piped + 24h cache (DEC-049)
- Language detection imperfect: UX disclosure in search
- Embed branding/external affordances residual real-device

## Residual (not stage-2 DoD blockers)

- **S-MA-032** mixed chooser — **cancelled forever** DEC-066 (never execute)
- **E2-D3-T03** own workouts — blocked DEC-064 until demand
- Manual log — E6-D7-T09
- UGC report/hide full path — partial placeholders

## Stage 2 close decision

Applicable §55.2 criteria have evidence or explicit N/A+DEC. User closed E2-D3-T05 as done 2026-07-19.
