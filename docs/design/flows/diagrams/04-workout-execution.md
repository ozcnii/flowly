# F04 — workout execution

> Trace: §14–15, §26; DEC-015–016, DEC-062.
> Canonical screen IDs: `S-MA-012`, `S-MA-022`, `S-MA-030`, `S-MA-031`, `S-MA-032`, `S-MA-033`, `S-MA-034`, `S-MA-072`, `S-MA-073`.
> Rendered node IDs: `S-MA-012`, `S-MA-022`, `S-MA-030`, `S-MA-031`, `S-MA-032`, `S-MA-033`, `S-MA-034`, `S-MA-072`, `S-MA-073`.

```mermaid
flowchart TD
  A[S-MA-022 Start, including F08 Start handoff without terminal mutation] --> C{Active session exists?}
  C -- no --> M{Format}
  C -- yes --> O[S-MA-012 choose one conflict outcome]
  O -->|continue current| CUR[S-MA-034 resume current session]
  O -->|close current| NC[S-MA-033 explicitly confirm не завершено]
  NC --> CLOSED[Current session terminal; zero active sessions]
  CLOSED --> NEW{Start the newly requested workout?}
  NEW -- yes --> M
  NEW -- no --> BACK[Return; no new session]
  O -->|cancel new launch| CANCEL[Return to previous screen; no mutation; current remains active]
  M --> V[S-MA-030 video]
  M --> S[S-MA-031 steps]
  M --> X[S-MA-032 mixed chooser]
  CUR --> RUN{Current format}
  RUN --> V
  RUN --> S
  RUN --> X
  V --> F[Finish]
  S --> F
  X --> F
  V -->|app closed| P[S-MA-034 open checkpoint]
  S -->|offline| P
  X -->|offline| P
  P -->|sync/conflict shown| RUN
  F --> Q[S-MA-033 explicit allowed final status]
  Q --> K[S-MA-072 calendar]
  K --> H[S-MA-073 status history/correction]
```

Only `M` may create a new session, and it is reachable only with zero active sessions. Continue keeps the current session; close requires explicit `не завершено`; cancel-new performs no mutation. Back/app-close preserves the open checkpoint until explicit closure. DEC-062 maps video runtime to `/sessions/[id]`, real IFrame API active-time, 15-second server + monotonic local checkpoint, independent YouTube playback-position restore, `<1s` auto-server/`>=1s` explicit server-device conflict and atomic occurrence/history finish. Common states and accessibility: [`../screen-inventory.md`](../screen-inventory.md).
