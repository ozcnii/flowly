/** ISO-8601 UTC timestamp helpers (DEC-027: timestamps = text ISO-8601 UTC). */
export const nowIso = (): string => new Date().toISOString();

export const isoFromNowMs = (ms: number): string =>
  new Date(Date.now() + ms).toISOString();

/** Session lifetime + sliding renewal window (approved E1-D1-T06: 30 days). */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** initData auth_date freshness window (approved E1-D1-T06: 24 hours). */
export const INIT_DATA_FRESHNESS_MS = 24 * 60 * 60 * 1000;
