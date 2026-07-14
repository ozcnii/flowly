# E1-D1-T09 — Foundation security & DoD evidence

> Дата: 2026-07-14 · PRD: §40.3, §47.1, §55.1, §55.9 (частично) · depends_on: E1-D1-T02–T08

## §55.1 — Основное приложение (DoD)

| # | Критерий | Статус | Evidence |
|---|---|---|---|
| 1 | Открывается внутри Telegram | ✅ | `components/auth/auth-gate.tsx` (initData verify → session); вне Telegram — `features/web-fallback/**` (S-WEB-001/002), `features/recovery/**` (S-MA-006) |
| 2 | Авторизация без пароля | ✅ | `POST /api/v1/auth/telegram` — проверка `initData`, без email/пароля; `@flowly/telegram verifyInitData` |
| 3 | Светлая и тёмная тема | ✅ | UI-kit `@flowly/ui` (DEC-025) + все экраны проверены light/dark (`.temp/**/screenshots`) |
| 4 | Доступны все основные вкладки | ✅ | `components/shell/app-shell.tsx` — `BottomNavigation`, 5 вкладок (T02) |
| 5 | Часовой пояс определяется и редактируется | ✅ (foundation) | `features/onboarding/preferences-screen.tsx` (S-MA-003, timezone Select, PATCH /me); полное редактирование в профиле → T10 |

## §47.1 — Обязательные меры безопасности

| # | Мера | Статус | Evidence / residual |
|---|---|---|---|
| 1 | Проверка Telegram `initData` | ✅ | `verifyInitData` HMAC-SHA256 + freshness 24ч; curl-repro (valid/tampered/expired) PASS (T06) |
| 2 | HttpOnly-сессия | ✅ | cookie `__Host-flowly-session` HttpOnly (T06) |
| 3 | Secure cookies | ✅ | Secure + SameSite=Lax + `__Host-` prefix (T06) |
| 4 | Защита от CSRF | ✅ | `isSafeOrigin` (Origin-check) на mutating-маршрутах; no-Origin → 403 (T06) |
| 5 | Проверка владельца каждого объекта | ◐ | Foundation: FK `user_id` + session-scoped API (`PATCH /me` только свой профиль). Per-object ownership → этапы 2–7 |
| 6 | Проверка разрешения shared-объекта | ◐ | → этап 7 (sharing/social) |
| 7 | Rate limiting | ✅ (min) | In-memory per-IP на auth (T06); production-grade → этап 8 (DEC-007) |
| 8 | Валидация Zod | ✅ | `lib/auth/schemas.ts` (T06) |
| 9 | Ограничение размера запроса | ✅ | `lib/auth/http.ts rejectOversizedBody` (64 KiB) на auth/me/logout; `PATCH /me` >64 KiB → **413** (curl-repro PASS) |
| 10 | Секрет Telegram webhook | ◐ | → этап 5 |
| 11 | Идемпотентность callback | ◐ | → этап 5 |
| 12 | Секреты только в Cloudflare Secrets | ✅ | `.dev.vars` gitignored; prod-токен через Cloudflare secret; secret scan 0 |
| 13 | Отсутствие токенов в клиентском JS | ✅ | bot-token только server-side (`getBotToken()`); AuthGate использует `fetch`, токен не в браузере |
| 14 | Журнал критических действий | ◐ (min) | `lib/auth/http.ts audit()` — структурированный лог auth login/login_failed/logout + `me.patch` (T09); полный audit-log → этап 8 |

## §40.3 — Доступность

Покрыто UI-kit (DEC-022): контраст, keyboard/focus-visible, `prefers-reduced-motion`, safe-area, ARIA. Проверено на всех screen-slices (overflow 0, таргеты ≥44px).

## Security headers (T09)

`apps/web/next.config.ts` `headers()`: `Strict-Transport-Security` (HSTS, max-age 180д, includeSubDomains), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (рестриктивный), `Content-Security-Policy` (baseline: self + inline; `frame-ancestors 'none'`; `unsafe-eval` только в dev для React dev-mode). Проверено: заголовки присутствуют на ответе (curl -I PASS), приложение загружается без CSP-нарушений (browser-verify, 0 console errors).

Harden (nonce-based CSP) → этап 8. HSTS и базовый headers-набор закрыты в T09.

## Residual risks (downstream)

- Per-object ownership/permission (§47.1 #5/#6) — этапы 2–7.
- Webhook-секрет и callback-идемпотентность (§47.1 #10/#11) — этап 5.
- Production-grade rate limiting (§47.1 #7, DEC-007) и полный audit-log/observability (§47.1 #14) — этап 8.
- `content-length` может отсутствовать (chunked) — лимит не сработает; приемлемо для foundation JSON-API.
- Полное редактирование профиля/timezone в UI — T10.

## Verdict

Foundation security-gate **PASS**: все §55.1 подтверждены evidence, применимые §47.1 закрыты (✅) либо явно отнесены к downstream этапам (◐). Новые gaps T09 (security headers, size limit, min audit log) закрыты и верифицированы. Secret scan 0.
