/**
 * CSRF protection for mutating requests: the Origin (or Referer) host must
 * match the request's own host (same-origin cookie app). See PRD §47.1.
 */
export function isSafeOrigin(request: Request): boolean {
  const ownHost = new URL(request.url).host;
  const origin = request.headers.get("origin");
  if (origin) return hostEquals(origin, ownHost);
  const referer = request.headers.get("referer");
  if (referer) return hostEquals(referer, ownHost);
  return false;
}

function hostEquals(url: string, expected: string): boolean {
  try {
    return new URL(url).host === expected;
  } catch {
    return false;
  }
}
