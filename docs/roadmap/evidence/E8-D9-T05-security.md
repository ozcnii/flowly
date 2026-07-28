# E8-D9-T05 — Security & privacy validation

> 2026-07-28

## Checklist (§47 / stage 8)

| Check | Result | Evidence |
|---|---|---|
| Unauth `/api/v1/me` | **401** | prod curl |
| Unauth `/api/v1/habits` | **401** | prod curl |
| Unauth `/api/v1/friends` | **401** | prod curl |
| Public catalog `/api/v1/workouts` | **200** (public content) | prod curl total=24 |
| Auth without safe Origin | **403** | `POST /auth/telegram` no Origin |
| Session cookie Secure policy | prod uses Host-only secure session (E1 evidence); local dev cookie `flowly-dev-session` | historical + code |
| Client raw `fetch` | only helper `apps/web/lib/api/client.ts` (+ server telegram outbound) | `rg fetch` audit |
| Secrets in git | `.dev.vars` gitignored; only `.dev.vars.example` tracked | `git check-ignore`, `git ls-files` |
| Bot token pattern scan | no live tokens in tracked non-md files | rg scan |
| Ownership / share isolation | stranger 404, revoke, unfriend cascade | stage7 HTTP 32/42 PASS 2026-07-28 |
| Invite claim atomic / used | edge suite PASS | friends-edge 32/32 |
| Partner remind rate limit | 429 after first | E2E + stage7-final |
| Webhook secret | production set (stage5/7 ops) | HANDOFF residual |
| Health content warnings | contraindications on seed workouts | catalog seed fields |
| Account deletion | **NOT IMPLEMENTED** | no API — deferred E8-D9-T03 / DEC-008 |
| User export | **NOT IMPLEMENTED** | deferred T03 |

## Permission matrix (summary)

| Actor | Own private habit | Shared habit (toggle off) | Shared history on | Friend list | Catalog public |
|---|---|---|---|---|---|
| Owner | R/W | — | — | R/W | R |
| Friend shared | — | limited meta | occurrences if toggles | mutual | R |
| Stranger | 404 | 404 | 404 | 404 | R public |

## Residual

1. Deletion/export grace not implemented (T03).
2. DEC-007 broader rate limits still open (partner 2h done).
3. Real-device Telegram auth replay not re-run this card (prod webhook previously PASS).
