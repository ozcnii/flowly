/**
 * UUIDv7 generator (time-sortable) using Web Crypto.
 * Used for all primary keys (DEC-027): D1/SQLite has no native UUID function,
 * so ids are generated app-side before insert.
 */
export function generateId(now: number = Date.now()): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const ms = BigInt(now);
  bytes[0] = Number((ms >> 40n) & 0xffn);
  bytes[1] = Number((ms >> 32n) & 0xffn);
  bytes[2] = Number((ms >> 24n) & 0xffn);
  bytes[3] = Number((ms >> 16n) & 0xffn);
  bytes[4] = Number((ms >> 8n) & 0xffn);
  bytes[5] = Number(ms & 0xffn);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70; // version 7
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // variant 10xx
  return toUuid(bytes);
}

const HEX = "0123456789abcdef";

function toUuid(bytes: Uint8Array): string {
  // 8-4-4-4-12 with dashes after positions 3,5,7,9.
  let out = "";
  for (let i = 0; i < 16; i++) {
    const b = bytes[i] ?? 0;
    out += HEX[b >> 4] ?? "0";
    out += HEX[b & 0x0f] ?? "0";
    if (i === 3 || i === 5 || i === 7 || i === 9) out += "-";
  }
  return out;
}
