# F10 — social and sharing

> Trace: §20.6, §32–35, §37; DEC-019–021.
> Canonical screen IDs: `S-MA-022`, `S-MA-024`, `S-MA-043`, `S-MA-052`, `S-MA-053`, `S-MA-054`, `S-MA-064`, `S-MA-080`, `S-MA-081`, `S-MA-082`, `S-MA-083`, `S-MA-084`, `S-MA-085`, `S-MA-086`, `S-MA-087`, `S-MA-088`, `S-BOT-001`, `S-BOT-007`.
> Rendered node IDs: `S-BOT-001`, `S-BOT-007`, `S-MA-022`, `S-MA-024`, `S-MA-043`, `S-MA-052`, `S-MA-053`, `S-MA-054`, `S-MA-064`, `S-MA-080`, `S-MA-081`, `S-MA-082`, `S-MA-083`, `S-MA-084`, `S-MA-085`, `S-MA-086`, `S-MA-087`, `S-MA-088`.

```mermaid
flowchart TD
  HUB[S-MA-080 profile] --> A[S-MA-081 create one-use 7-day invite]
  A --> B[S-BOT-001 / S-BOT-007 / S-MA-082]
  B -->|accept| F[Confirmed friendship]
  B -->|reject| R[No friendship; not blocked]
  B -->|expired or used| X[Safe recovery]
  F --> S[S-MA-043 / S-MA-084 visibility and explicit object share]
  S --> V[S-MA-083 read-only original]
  V -->|save myself| C[Explicit saved copy]
  S -->|visibility changed or revoke| Z[Recheck; access closes immediately where no longer allowed]
  F -->|remove friend| RF[Revoke private shares and future notifications; preserve joint history and public access]
  F -->|block| BL[Reversible block; revoke current relationship access]
  BL -->|unblock| UB[Unblocked; no implicit friendship/share restoration]
  F --> J[S-MA-052 / S-MA-085 / S-MA-086 joint program or challenge]
  J -->|accept| P[S-MA-053 / S-MA-087 participants, progress, feed, reactions]
  P -->|owner removes participant| RM[Participant access revoked; retained joint history follows approved contract]
  P -->|participant leaves| LV[S-MA-054 leave confirmation]
  LV -->|owner leaves| O[Transfer ownership or end object]
  P -->|remind| L{Friend/participant + shared current object + notifications enabled + 2h limit?}
  L -- yes --> N[Fixed partner notification; action logged]
  L -- no, including link-only viewer --> ND[Remind disabled with reason; no notification]
  V -->|report/hide/block author| U[S-MA-022 / S-MA-024 / S-MA-088 distinct outcomes]
  P --> H[S-MA-064 shared habit fields respect owner toggles]
```

Visibility/revoke and relationship changes recheck access immediately. `S-MA-083` never grants partner-remind merely from a link: friendship or accepted participation, a shared current object, enabled notifications and rate limit are all required. Back/cancel performs no mutation. Common states and accessibility: [`../screen-inventory.md`](../screen-inventory.md).
