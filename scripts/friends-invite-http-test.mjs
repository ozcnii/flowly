#!/usr/bin/env node
/**
 * Local HTTP matrix for friends invite (no Telegram UI).
 * Requires: next dev or wrangler preview with FLOWLY_DEV_EMULATION=1 and local D1.
 *
 * Usage: node scripts/friends-invite-http-test.mjs [baseUrl]
 */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const origin = base;

const devUser = (id, firstName) =>
  encodeURIComponent(JSON.stringify({ id, first_name: firstName, username: `u${id}` }));

async function auth(telegramId, name) {
  const res = await fetch(`${base}/api/v1/auth/telegram`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "x-flowly-dev-user": devUser(telegramId, name),
    },
    body: "{}",
  });
  const text = await res.text();
  assert.equal(res.status, 200, `auth ${name}: ${res.status} ${text}`);
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ") || res.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "session cookie missing");
  return cookie;
}

async function json(cookie, method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Origin: origin,
      Cookie: cookie,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

const a = await auth(900001, "Alice");
const b = await auth(900002, "Bob");

const invite = await json(a, "POST", "/api/v1/friends/invites", {});
assert.equal(invite.status, 200, JSON.stringify(invite.data));
assert.ok(invite.data.code, "code");
const code = invite.data.code;
console.log("invite", code);

const beforeA = await json(a, "GET", "/api/v1/friends");
assert.equal(beforeA.status, 200);
assert.ok(beforeA.data.friends.some((f) => f.inviteCode === code && f.status === "pending"));

const accept = await json(b, "POST", `/api/v1/friends/invites/${code}/accept`, {});
assert.equal(accept.status, 200, JSON.stringify(accept.data));
assert.equal(accept.data.ok, true);

const afterA = await json(a, "GET", "/api/v1/friends");
const afterB = await json(b, "GET", "/api/v1/friends");
const friendsA = afterA.data.friends.filter((f) => f.status === "accepted");
const friendsB = afterB.data.friends.filter((f) => f.status === "accepted");
assert.equal(friendsA.length, 1, `A accepted: ${JSON.stringify(afterA.data)}`);
assert.equal(friendsB.length, 1, `B accepted: ${JSON.stringify(afterB.data)}`);
assert.ok(friendsA[0].peer?.firstName === "Bob" || friendsA[0].peer?.id);
assert.ok(friendsB[0].peer?.firstName === "Alice" || friendsB[0].peer?.id);

const used = await json(b, "POST", `/api/v1/friends/invites/${code}/accept`, {});
assert.equal(used.status, 200);
assert.equal(used.data.idempotent, true);

console.log("PASS friends invite HTTP matrix", { code, friendshipId: accept.data.friendshipId });
