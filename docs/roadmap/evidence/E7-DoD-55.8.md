# Stage 7 DoD — PRD §55.8 (2026-07-28)

| Criterion | Status | Evidence |
|---|---|---|
| Можно добавить нескольких друзей | PASS | friends multi-friend HTTP edge |
| Приглашение работает | PASS | invite create/accept/auto-accept |
| Друг видит только расшаренные данные | PASS | habit-share 42/42 stranger 404 |
| Доступ можно отозвать | PASS | revoke + unfriend cascade |
| Работают совместные программы | PASS | enrollment share/join/leave/joint API |
| Работают челленджи | PASS | challenges HTTP matrix |
| Работают реакции | PASS | challenge reactions toggle |
| Партнёрские напоминания ограничены | PASS | 2h rate_limit 429 |
| Sharing user-created workouts | **N/A** | DEC-064 / E2-D3-T03 deferred |

Scripts: `scripts/friends-*.mjs`, `habit-share-http-test.mjs`, `challenges-http-test.mjs`, `stage7-final-http-test.mjs`.
