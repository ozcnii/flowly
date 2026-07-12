# F09 — calendar and reports

> Trace: §15, §17, §28–30; DEC-015, DEC-018.
> Canonical screen IDs: `S-MA-044`, `S-MA-070`, `S-MA-071`, `S-MA-072`, `S-MA-073`, `S-MA-074`, `S-MA-075`, `S-MA-076`, `S-BOT-006`.
> Rendered node IDs: `S-BOT-006`, `S-MA-044`, `S-MA-070`, `S-MA-071`, `S-MA-072`, `S-MA-073`, `S-MA-074`, `S-MA-075`, `S-MA-076`.

```mermaid
flowchart TD
  A[S-MA-070 month] --> W[S-MA-071 week]
  A --> D[S-MA-072 day]
  W --> D
  D --> E[S-MA-073 allowed status correction]
  E --> C[Confirm + status history]
  D --> M[S-MA-044 manual workout]
  A --> R[S-MA-074 reports]
  R --> P{Completed or current period?}
  P -->|current| X[Mark partial]
  P -->|no data| N[Explain absence]
  P -->|completed| V[S-MA-075 detail]
  V --> S[S-MA-076 choose safe fields]
  S --> B[Generate card; retain 30 days]
  BOT[S-BOT-006 Mon/month-start 09:00] --> V
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
