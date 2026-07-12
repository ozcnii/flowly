# F07 — habits and schedules

> Trace: §21–24, §27, §29, §39; DEC-017.
> Canonical screen IDs: `S-MA-011`, `S-MA-060`, `S-MA-061`, `S-MA-062`, `S-MA-063`, `S-MA-064`, `S-MA-065`.
> Rendered node IDs: `S-MA-060`, `S-MA-061`, `S-MA-062`, `S-MA-063`, `S-MA-064`, `S-MA-065`.

```mermaid
flowchart TD
  A[S-MA-060 Rhythm] -->|empty/add| C[S-MA-061 create private habit]
  C --> H{Medication-related?}
  H -- yes --> W[Neutral health warning]
  H -- no --> S[S-MA-062 schedule]
  W --> S
  S --> T{exact / weekdays / weekly target / interval}
  T --> P[S-MA-063 policy]
  P --> D[S-MA-064 habit detail]
  D --> O[Occurrences / slots]
  O -->|weekly pressure rule| M[Show mandatory today]
  D --> E[S-MA-065 future edit / pause / archive]
  E -->|confirm| F[Future occurrences only; history intact]
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
