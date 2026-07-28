# E8-D9-T06 — Performance & external quotas

> 2026-07-28 · prod `flowly-web.getflowly.workers.dev`

## PRD target

§42: main API without third-party p95 ≤ **750 ms**.

## Measurements (prod HTTP)

| Endpoint | samples (time_total s) | avg s | size | code |
|---|---|---:|---:|---|
| `GET /api/v1/workouts` | 0.355, 0.398, 0.357, 0.598, 0.351 | **0.41** | 16659 | 200 |
| `GET /api/v1/programs` | 0.341, 0.335, 0.317, 0.327, 0.322 | **0.33** | 2550 | 200 |
| `GET /` | 0.506, 0.383, 0.497, 0.568, 0.376 | **0.47** | 69981 | 200 |

Local auth'd `GET /api/v1/habits` (dev): ~45–66 ms.

**Result:** measured samples well under 750 ms p95 proxy (max workouts sample 598 ms).

## Official quotas (checked 2026-07-28)

Sources: Cloudflare Workers platform limits / pricing docs.

| Resource | Free-tier reference | Note |
|---|---|---|
| Workers requests | 100,000 / day | [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) |
| Workers CPU free | 10 ms / invocation | Paid higher |
| D1 rows read | 5 million / day free | [Pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| D1 rows written | 100,000 / day free | same |
| D1 storage | 5 GB free | same |
| Subrequests / invocation | 50 free | R2/KV/D1 count |
| YouTube | **no Google YT Data API key** | DEC-049 Piped; instance best-effort, no fixed official quota |

## Bottlenecks / capacity risks

1. Free Workers 100k req/day + scheduler every minute + Mini App traffic — monitor dashboard.
2. Piped provider availability/rate unknown third party.
3. D1 write budget if high reminder job churn.
4. DEC-011 remains open for formal re-check cadence; numbers above snapshot 2026-07-28.

## Acceptance

- [x] targets measured on agreed env (prod public API + local habits)
- [x] official limits documented with date
- [x] bottlenecks recorded
