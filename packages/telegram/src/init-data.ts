/**
 * Telegram Mini App `initData` validation.
 * Reference: Telegram "Validating data received via the Mini App".
 *
 * Algorithm:
 *   secret_key  = HMAC_SHA256(key = "WebAppData", message = bot_token)
 *   hash        = HMAC_SHA256(key = secret_key,  message = data_check_string)
 *   data_check_string = received fields (except `hash`/`signature`),
 *                       sorted by key, joined as `key=value` lines with `\n`.
 *
 * The received `hash` is compared to the calculated one in constant time.
 * `auth_date` is checked against a freshness window, and `user` is parsed.
 */

const encoder = new TextEncoder();

async function hmacSha256(key: BufferSource, data: BufferSource): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, data);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface TelegramInitUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  [key: string]: unknown;
}

export interface VerifiedInitData {
  user: TelegramInitUser;
  authDate: Date;
  raw: Record<string, string>;
}

export class InitDataValidationError extends Error {}

export async function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeMs: number,
): Promise<VerifiedInitData> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new InitDataValidationError("missing hash");
  params.delete("hash");

  const entries = [...params.entries()];
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).sort().join("\n");

  const secret = await hmacSha256(encoder.encode("WebAppData"), encoder.encode(botToken));
  const calculated = toHex(await hmacSha256(secret, encoder.encode(dataCheckString)));
  if (!timingSafeEqual(calculated, hash)) {
    throw new InitDataValidationError("invalid hash");
  }

  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) throw new InitDataValidationError("missing auth_date");
  const authDateSec = Number(authDateRaw);
  if (!Number.isFinite(authDateSec)) throw new InitDataValidationError("invalid auth_date");
  const authDate = new Date(authDateSec * 1000);
  if (Date.now() - authDate.getTime() > maxAgeMs) {
    throw new InitDataValidationError("expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new InitDataValidationError("missing user");
  let user: TelegramInitUser;
  try {
    user = JSON.parse(userRaw) as TelegramInitUser;
  } catch {
    throw new InitDataValidationError("invalid user json");
  }
  if (typeof user.id !== "number" || typeof user.first_name !== "string") {
    throw new InitDataValidationError("invalid user payload");
  }

  return { user, authDate, raw: Object.fromEntries(entries) };
}
