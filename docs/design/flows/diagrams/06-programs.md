# F06 — programs

> Trace: §20; DEC-016, DEC-019–020.
> Canonical screen IDs: `S-MA-023`, `S-MA-050`, `S-MA-051`, `S-MA-052`, `S-MA-053`, `S-MA-054`, `S-MA-087`.
> Rendered node IDs: `S-MA-050`, `S-MA-051`, `S-MA-052`, `S-MA-053`, `S-MA-054`.

```mermaid
flowchart TD
  A[S-MA-050 Programs] --> D[S-MA-051 detail]
  D --> S[S-MA-052 date/time/policy]
  S -->|with friends| I[F10 invitation + explicit accept]
  S --> E[S-MA-053 enrollment]
  I --> E
  E --> T{Program day}
  T -->|workout| W[F04]
  T -->|planned rest| R[Neutral rest day]
  T -->|missed| M[Record miss; do not shift]
  E --> L[S-MA-054 leave]
  L -->|owner| O[Transfer ownership or end]
  E -->|restart| N[New enrollment]
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
