# F05 — own and manual workouts

> Trace: §16–17, §40; DEC-016.
> Canonical screen IDs: `S-MA-021`, `S-MA-040`, `S-MA-041`, `S-MA-042`, `S-MA-043`, `S-MA-044`, `S-MA-045`, `S-MA-072`.
> Rendered node IDs: `S-MA-040`, `S-MA-041`, `S-MA-042`, `S-MA-043`, `S-MA-044`, `S-MA-045`, `S-MA-072`.

```mermaid
flowchart TD
  A[S-MA-040 My workouts] --> E[S-MA-041 editor]
  E --> V{Required title, duration, difficulty, executable content?}
  V -- no --> D[Disabled save + field reasons]
  V -- yes --> M[S-MA-042 exercises / S-MA-045 media]
  M -->|offline/error| R[Keep draft + retry]
  M --> S[Save private draft/workout]
  S --> P[S-MA-043 visibility/share]
  A --> H[S-MA-044 manual workout]
  H --> K[S-MA-072 calendar]
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
