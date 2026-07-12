# F02 — Home and today

> Trace: §11, §14, §21, §28; DEC-016.
> Canonical screen IDs: `S-MA-010`, `S-MA-011`, `S-MA-012`, `S-MA-060`, `S-MA-070`, `S-BOT-002`.
> Rendered node IDs: `S-BOT-002`, `S-MA-010`, `S-MA-011`, `S-MA-012`, `S-MA-060`, `S-MA-070`.

```mermaid
flowchart TD
  B[S-BOT-002 /today] --> A[S-MA-010 Home]
  A --> M{Modules load independently}
  M -->|module error| R[Inline retry]
  M -->|empty day| E[CTA workout / program / habit]
  M -->|next action| D[S-MA-011 detail]
  D --> C{Action}
  C -->|workout| W[S-MA-012 / F04 start/resume conflict if needed]
  C -->|habit| H[S-MA-060 / F07 complete allowed slot]
  C -->|calendar| K[S-MA-070 calendar]
  W --> U[Refresh today progress]
  H --> U
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
