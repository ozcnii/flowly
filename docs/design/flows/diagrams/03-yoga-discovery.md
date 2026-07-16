# F03 — yoga discovery

> Trace: §12–13, §18–19; DEC-016, DEC-021.
> Canonical screen IDs: `S-MA-020`, `S-MA-021`, `S-MA-022`, `S-MA-023`, `S-MA-024`, `S-MA-088`.
> Rendered node IDs: `S-MA-020`, `S-MA-021`, `S-MA-022`, `S-MA-023`, `S-MA-024`, `S-MA-088`.

```mermaid
flowchart TD
  A[S-MA-020 catalog] --> F[Search / filters / sources]
  F -->|none| E[Empty + reset filters]
  F --> Y{YouTube?}
  Y -- yes --> C{Valid cache/API?}
  C -- valid cache keyed by all filters, retained at least 24h / API --> R[S-MA-021 results]
  C -- unavailable --> U[Unavailable + retry/alternative]
  Y -- no --> D[S-MA-022 workout detail]
  R -->|cover play| P[Fullscreen in-app YouTube player]
  R --> D
  D -->|YouTube cover play| P
  D -->|favorite| Q[S-MA-023]
  D -->|UGC| G[Warning + report/hide/author]
  G --> X[S-MA-088 / S-MA-024]
  D -->|start| W[F04]
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
