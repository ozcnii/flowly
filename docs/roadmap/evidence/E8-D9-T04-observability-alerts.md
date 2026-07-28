# E8-D9-T04 — Observability & owner alerts

> 2026-07-28 · DEC-006 approved thresholds

## Logging categories (existing + new)

| Category | Mechanism |
|---|---|
| auth | `audit("…")` structured console JSON |
| telegram_webhook / send | stage 5 delivery logs |
| reminder_scheduler | batch + fatal scheduler logs |
| database | D1 errors via throws/audit |
| security | CSRF/oversized/auth audits |
| backup / owner | `owner.alert.*`, `system_backups` rows |

Wrangler `observability.enabled: true` on web+scheduler.

## Metrics (runtime counters / logs)

Delivery batch returns `{claimed,sent,failed,skipped}`; scheduler fail streak in `ops_state`; backup size in `system_backups`.

## Owner alerts (DEC-006)

| Trigger | Threshold |
|---|---|
| Scheduler uncaught fail streak | ≥ 3 consecutive |
| Delivery batch | claimed≥10 & failed/claimed≥0.5 **or** failed≥20 |
| Bot send all-fail streak | ≥ 5 batches with sent=0 & failed>0 |
| Backup fail | always |
| Backup ok | notify (debounced) |
| Debounce | 60 min per alert key |

Env: `FLOWLY_OWNER_TELEGRAM_ID` (+ bot token). Without owner id, alerts log `owner.alert.skip`.

## Verification

- Backup force run logged ok path.
- Alert skip without owner id (local) documented.
- Code: `apps/scheduler/src/owner-alerts.ts` wired in `index.ts`.
