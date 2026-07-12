# F01 — onboarding, auth and recovery

> Trace: §10, §32, §36; DEC-013–014.
> Canonical screen IDs: `S-MA-001`, `S-MA-002`, `S-MA-003`, `S-MA-004`, `S-MA-005`, `S-MA-006`, `S-MA-082`, `S-MA-096`, `S-BOT-001`, `S-BOT-002`, `S-WEB-001`, `S-WEB-002`.
> Rendered node IDs: `S-BOT-001`, `S-BOT-002`, `S-MA-001`, `S-MA-002`, `S-MA-003`, `S-MA-004`, `S-MA-005`, `S-MA-006`, `S-MA-082`, `S-MA-096`, `S-WEB-001`, `S-WEB-002`.

```mermaid
flowchart TD
  A[S-BOT-001 / S-BOT-002 launch or deep link] --> T{Inside Telegram?}
  T -- no, generic launch --> W[S-WEB-001 Open via Telegram]
  T -- no, target link --> WT[S-WEB-002 safe unavailable target; open Telegram or exit]
  T -- yes --> V[S-MA-001 Validate initData]
  V -->|error| R[Full-screen retry]
  R --> V
  V --> O{Profile/onboarding complete?}
  O -- no --> S[S-MA-002 welcome]
  S --> P[S-MA-003 optional timezone/preferences]
  P --> I[S-MA-004 optional habit/invite prompts]
  I --> G[S-MA-005 mandatory bot gate]
  G -->|failed| D[S-MA-096 diagnostics + retry]
  D --> G
  G -->|linked| X{Target accessible?}
  O -- yes --> X
  X -- yes --> Z[Exact target or Home]
  X -- no --> U[S-MA-006 safe reason + auth/recovery/exit]
  U -->|invite target recovered| IV[S-MA-082 accept/reject]
  U -->|outside Telegram| WT
```

Errors preserve entered data; back/cancel performs no mutation. Auth and permission are rechecked before rendering target data; unavailable/expired/revoked targets use `S-WEB-002` or `S-MA-006` without disclosure. Common states and accessibility: [`../screen-inventory.md`](../screen-inventory.md).
