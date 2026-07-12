# F08 — reminders and Telegram

> Trace: §24–26, §36–37; DEC-014–015.
> Canonical screen IDs: `S-MA-005`, `S-MA-011`, `S-MA-063`, `S-MA-091`, `S-BOT-003`, `S-BOT-004`, `S-BOT-005`.
> Rendered node IDs: `S-BOT-003`, `S-BOT-004`, `S-BOT-005`, `S-MA-005`, `S-MA-011`, `S-MA-063`, `S-MA-091`.

```mermaid
flowchart TD
  P[S-MA-063 policy + S-MA-091 quiet-hours settings] --> A[Relevant due occurrence]
  A --> Q{Quiet hours?}
  Q -- no --> M[S-BOT-003 habit / S-BOT-004 yoga reminder]
  Q -- yes --> B{Configured behavior and still relevant after quiet?}
  B -- delay and relevant --> M
  B -- skip or stale --> C[Cancel delivery only; no status or schedule mutation]
  M --> X{Callback after user + idempotency validation}
  X -->|done or already done| DONE[Set completed; update message/calendar/streak; cancel slot repeats]
  X -->|skip| SKIP[Set skipped; cancel slot/day repeats; future schedule unchanged]
  X -->|rest, only where allowed| REST[Set rest; cancel repeats; distinct from completion/skip]
  X -->|preset snooze| SN[Create deferred reminder for current occurrence only]
  X -->|custom snooze| CT[S-MA-011 choose deferred time for current occurrence]
  SN --> KEEP[Occurrence remains pending/snoozed; permanent schedule unchanged]
  CT --> KEEP
  X -->|Start| START[Handoff to F04; no terminal status or repeat cancellation]
  X -->|stale or duplicate| ST[S-BOT-005 current state + deep link; no repeated mutation]
  M -->|bot/link error| G[S-MA-005 diagnostics and retry]
  M -->|no answer until local day closes| N[Set no_response; never skipped automatically]
```

Terminal paths are separate: done/already-done, skip and allowed rest. Snooze only defers the current occurrence; Start only hands off to F04. Stale/duplicate callbacks remain idempotent. Common states and accessibility: [`../screen-inventory.md`](../screen-inventory.md).
