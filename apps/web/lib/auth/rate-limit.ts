/**
 * Minimal best-effort in-memory rate limiter (per Workers isolate).
 * NOT shared across isolates — adequate only to blunt abuse on the auth path.
 * Production-grade shared rate limiting is deferred to stage 8 / DEC-007.
 *
 * @returns true when the request is allowed.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}
