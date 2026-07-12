# IA overview

> Trace: §9–10, §36, DEC-013.
> Rendered node IDs: `S-BOT-003`, `S-BOT-004`, `S-BOT-005`, `S-BOT-006`, `S-BOT-007`, `S-BOT-008`, `S-MA-001`, `S-MA-010`, `S-MA-020`, `S-MA-050`, `S-MA-060`, `S-MA-070`, `S-MA-080`, `S-WEB-001`, `S-WEB-002`.

```mermaid
flowchart TD
  TG[Telegram / bot links] --> AUTH[S-MA-001 Auth]
  WEB[Browser] --> FALL[S-WEB-001 + S-WEB-002 Fallback]
  AUTH --> HOME[S-MA-010 Главная]
  HOME --> NAV{5 tabs}
  NAV --> W[S-MA-020 Тренировки]
  NAV --> P[S-MA-050 Программы]
  NAV --> H[S-MA-060 Мой ритм]
  NAV --> C[S-MA-070 Календарь]
  HOME --> PROFILE[S-MA-080 Профиль]
  PROFILE --> EXTRA[Друзья · Челленджи · Избранное · Отчёты · Настройки · Уведомления · Данные]
  BOT[S-BOT-003 + S-BOT-004 + S-BOT-005 + S-BOT-006 + S-BOT-007 + S-BOT-008] --> TARGET[Exact target + auth/access check]
  TARGET --> AUTH
```

Ошибки не скрывают введённые данные; back/cancel не выполняет mutation; restricted targets повторно проверяют auth/permission. Общие состояния и accessibility: [`../screen-inventory.md`](../screen-inventory.md).
