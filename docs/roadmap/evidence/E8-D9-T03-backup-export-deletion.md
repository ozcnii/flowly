# E8-D9-T03 — Backup, export, deletion

> 2026-07-28 · DEC-008 extend scheduler · R2 not enabled on CF account (fallback D1 payload)

## Decisions applied

- **DEC-008 approved:** weekly backup inside `flowly-scheduler` (Sunday 03:00–03:04 UTC).
- **DEC-020:** 7-day grace, clear-history scope, re-auth cancel + explicit cancel.

## System backup

| Item | Result |
|---|---|
| Module | `apps/scheduler/src/backup.ts` |
| Force test | `POST /admin/backup` → `{ ran:true, ok:true, sizeBytes:3242 }` |
| Storage | D1 `system_backups.payload` when R2 unavailable; R2 `STORAGE` key `backups/d1/YYYY-MM-DD.json` when bound |
| Retention | last **4** ok backups pruned |
| Owner notify | via DEC-006 `notifyBackupResult` |

**Restore check (local):** dump is full JSON of tables; restore = re-import SQL/JSON on test D1 (ops). Manual force backup verified on local `flowly-db-test`.

**Residual:** enable R2 in Cloudflare Dashboard to move payload off D1; until then backups stay in D1.

## User export §51.2

| Item | Result |
|---|---|
| API | `POST /api/v1/me/export` |
| HTTP | 200, sizeBytes=1903, keys: profile/workouts/habits/schedules/history/friends/reports… |
| Bot notice | best-effort `sendMessage` |
| UI | `/profile/data` download blob |

## Clear history

| Item | Result |
|---|---|
| API | `POST /api/v1/me/clear-history` |
| HTTP | 200 `removedOccurrences:1` (fixture) |
| Scope | occurrences, status_history, sessions, reminder_jobs; habits/settings kept |

## Account deletion

| Item | Result |
|---|---|
| Request | `POST /api/v1/me/deletion` → deletedAt + purgeAt +7d |
| Cancel | `DELETE /api/v1/me/deletion` 200 while grace |
| Re-auth cancel | `findOrCreateUser` clears `deletedAt` in grace |
| Purge | scheduler `purgeExpiredDeletions` anonymizes after 7d |
| UI | S-MA-092 hub `/profile/data`, confirm sheets S-MA-094/095 |

## Migration

`0026_data_lifecycle.sql` applied local + prod remote + scheduler test local.
