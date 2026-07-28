# E8-D9-T02 — E2E §50.3 + Cron §50.4

> 2026-07-28 · local `next dev -p 3010` (`FLOWLY_DEV_EMULATION=1`) · scheduler `wrangler dev --env test --test-scheduled --port 8788`

## Environment

| Piece | Value |
|---|---|
| Web | `http://localhost:3010` Next 16.2.10 + `.dev.vars` |
| Scheduler | `http://localhost:8788` env `test`, local D1 `flowly-db-test` |
| Script | `scripts/stage8-e2e-http-test.mjs` |
| Social suites | `scripts/friends-*.mjs`, `habit-share-http-test.mjs`, `challenges-http-test.mjs`, `stage7-final-http-test.mjs` |

## §50.3 E2E flows

| Flow | Result | Notes |
|---|---|---|
| Habit | **PASS** | create exact_times×2 → 2 occurrences → complete → calendar day 200 → weekly report 200 |
| Video workout | **PASS** | catalog YT → start video → pause/resume checkpoint → finish completed → calendar |
| Step-by-step | **PASS** | `wo-morning-10` step mode 6 exercises → pos/acc checkpoints +30s → finish partial → calendar |
| Friends | **PASS** | invite/accept → share habit → B shared list only → partner remind 200 then **429** 2h rate limit |

Command: `node scripts/stage8-e2e-http-test.mjs http://localhost:3010` → **EXIT 0**

## Supporting social re-run (same env)

| Suite | Result |
|---|---|
| friends-invite | PASS |
| friends-edge | **32/32** PASS |
| habit-share | **42/42** PASS |
| challenges | PASS |
| stage7-final | PASS |

## §50.4 Cron

| Check | Result |
|---|---|
| `GET /health` | 200 `status:ok` delivery/generation enabled |
| `GET /__scheduled?cron=*+*+*+*+*` | 200 `Ran scheduled event` (twice, idempotent surface) |

Commands:

```bash
curl -sS http://localhost:8788/health
curl -sS 'http://localhost:8788/__scheduled?cron=*+*+*+*+*'
```

## Environment limits

1. E2E is **HTTP API** closest-to-product path under dev emulation — not Telegram WebView UI automation.
2. Scheduler test env uses **local** `flowly-db-test`; service binding `WEB` not connected in local wrangler (delivery may mock/no-op outbound).
3. Mock Telegram mode for local web; production cron continues on CF `* * * * *` separately.
4. Habit flow does not start real Telegram mock message delivery in this script (covered stage 5 + scheduler cron handler).

## Acceptance

- [x] each of 4 E2E flows has reproducible result
- [x] Cron evidence saved
- [x] environment limits stated
