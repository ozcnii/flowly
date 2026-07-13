import { SESSION_TTL_MS } from "@flowly/core";

/** Session cookie. HttpOnly + Secure + SameSite=Lax, Path=/. */
export const SESSION_COOKIE = "__Host-flowly-session";

const COOKIE_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);
const COOKIE_ATTRS = "HttpOnly; Secure; SameSite=Lax; Path=/";

export function setSessionCookie(res: Response, token: string): void {
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${COOKIE_ATTRS}; Max-Age=${COOKIE_MAX_AGE}`,
  );
}

export function clearSessionCookie(res: Response): void {
  res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; ${COOKIE_ATTRS}; Max-Age=0`);
}

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
