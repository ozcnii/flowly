# F11 — settings, data and privacy

> Trace: §27, §38, §47, §51.2; DEC-020, DEC-022.
> Canonical screen IDs: `S-MA-080`, `S-MA-090`, `S-MA-091`, `S-MA-092`, `S-MA-093`, `S-MA-094`, `S-MA-095`, `S-BOT-008`.
> Rendered node IDs: `S-BOT-008`, `S-MA-080`, `S-MA-090`, `S-MA-091`, `S-MA-092`, `S-MA-093`, `S-MA-094`, `S-MA-095`.

```mermaid
flowchart TD
  A[S-MA-080 Profile] --> P[S-MA-090 profile settings]
  A --> N[S-MA-091 notifications]
  A --> D[S-MA-092 data]
  P -->|timezone change| F[Future occurrences only]
  D --> E[S-MA-093 protected JSON archive: profile, workouts, habits, schedules, history, friends, reports]
  E --> BOT[S-BOT-008 export ready/error notification]
  D --> H[S-MA-094 clear history confirmation]
  H -->|confirm| K[Delete occurrences/statuses/reports; retain account, objects and settings]
  D --> X[S-MA-095 delete account confirmation]
  X --> G[7-day grace; sessions and reminders revoked; personal surfaces hidden]
  G -->|Telegram re-auth/deep link during grace| RA[Validate identity and pending-deletion state]
  RA -->|cancel deletion| C[Reactivate account; restore sessions and reminders]
  RA -->|do not cancel| G
  G -->|expires| Z[Delete/anonymize; preserve joint integrity]
```

Cancellation remains reachable after revocation only through validated Telegram re-auth/reactivation during the seven-day grace period. Until cancellation, normal personal access and reminders stay revoked; successful cancellation restores both sessions and reminders. Common states and accessibility: [`../screen-inventory.md`](../screen-inventory.md).
