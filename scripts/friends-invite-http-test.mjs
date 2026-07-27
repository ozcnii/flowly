#!/usr/bin/env node
/**
 * Full local HTTP matrix: invite / accept / reject / self / used / remove / share revoke.
 * Requires next dev with FLOWLY_DEV_EMULATION=1.
 *
 * Usage: node scripts/friends-invite-http-test.mjs [baseUrl]
 */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "");
const origin = base;
let n = 0;
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label, detail) => {
  console.error(`  ✗ ${label}`, detail ?? "");
  throw new Error(label);
};

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
  const cookie =
    setCookie.map((c) => c.split(";")[0]).join("; ") || res.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "session cookie missing");
  const body = JSON.parse(text);
  return { cookie, userId: body.userId, name };
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

const accepted = (list) => (list?.friends ?? []).filter((f) => f.status === "accepted");
const pending = (list) => (list?.friends ?? []).filter((f) => f.status === "pending");

console.log(`\nFriends social HTTP matrix @ ${base}\n`);

// --- users
const a = await auth(910001 + Math.floor(Math.random() * 1000), "Alice");
const b = await auth(920001 + Math.floor(Math.random() * 1000), "Bob");
const c = await auth(930001 + Math.floor(Math.random() * 1000), "Cara");
ok(`auth A=${a.userId.slice(0, 8)}… B=${b.userId.slice(0, 8)}… C=${c.userId.slice(0, 8)}…`);

// --- 1 create invite
const invite = await json(a.cookie, "POST", "/api/v1/friends/invites", {});
assert.equal(invite.status, 200, JSON.stringify(invite.data));
assert.ok(invite.data.code);
assert.ok(invite.data.botDeepLink?.includes(`invite_${invite.data.code}`));
const code = invite.data.code;
ok(`create invite ${code}`);

// --- 2 list shows pending open link for A
const listA1 = await json(a.cookie, "GET", "/api/v1/friends");
assert.equal(listA1.status, 200);
assert.ok(pending(listA1.data).some((f) => f.inviteCode === code));
assert.equal(accepted(listA1.data).length, 0);
ok("A sees pending open link");

// --- 3 B empty
const listB0 = await json(b.cookie, "GET", "/api/v1/friends");
assert.equal(accepted(listB0.data).length, 0);
ok("B has no friends yet");

// --- 4 self-accept forbidden
const self = await json(a.cookie, "POST", `/api/v1/friends/invites/${code}/accept`, {});
assert.equal(self.status, 400, JSON.stringify(self.data));
ok("self-accept → 400");

// --- 5 accept by B
const accept = await json(b.cookie, "POST", `/api/v1/friends/invites/${code}/accept`, {});
assert.equal(accept.status, 200, JSON.stringify(accept.data));
assert.equal(accept.data.ok, true);
assert.equal(accept.data.idempotent, false);
ok(`B accept → friendship ${accept.data.friendshipId}`);

// --- 6 both see accepted peer
const listA2 = await json(a.cookie, "GET", "/api/v1/friends");
const listB2 = await json(b.cookie, "GET", "/api/v1/friends");
assert.equal(accepted(listA2.data).length, 1, JSON.stringify(listA2.data));
assert.equal(accepted(listB2.data).length, 1, JSON.stringify(listB2.data));
assert.equal(accepted(listA2.data)[0].peer?.id, b.userId);
assert.equal(accepted(listB2.data)[0].peer?.id, a.userId);
assert.ok(!pending(listA2.data).some((f) => f.inviteCode === code && f.status === "pending"));
ok("A↔B mutual accepted peers");

// --- 7 idempotent re-accept
const again = await json(b.cookie, "POST", `/api/v1/friends/invites/${code}/accept`, {});
assert.equal(again.status, 200);
assert.equal(again.data.idempotent, true);
ok("re-accept → idempotent");

// --- 8 third party cannot use spent invite (maxUses=1)
const third = await json(c.cookie, "POST", `/api/v1/friends/invites/${code}/accept`, {});
assert.equal(third.status, 400, JSON.stringify(third.data));
ok("C used invite → 400");

// --- 9 new invite for reject path
const invite2 = await json(a.cookie, "POST", "/api/v1/friends/invites", {});
assert.equal(invite2.status, 200);
const code2 = invite2.data.code;
const rej = await json(c.cookie, "POST", `/api/v1/friends/invites/${code2}/reject`, {});
assert.equal(rej.status, 200, JSON.stringify(rej.data));
const listC1 = await json(c.cookie, "GET", "/api/v1/friends");
assert.equal(accepted(listC1.data).length, 0);
ok(`C reject ${code2}`);

// --- 10 unknown code
const nf = await json(b.cookie, "POST", "/api/v1/friends/invites/ZZZZZZZZ/accept", {});
assert.equal(nf.status, 404);
ok("unknown code → 404");

// --- 11 share habit requires owned habit — create habit then share
const habit = await json(a.cookie, "POST", "/api/v1/habits", {
  title: "Test habit",
  icon: "leaf",
  color: "sage",
  startLocalDate: "2026-07-27",
  schedule: {
    ruleType: "exact_times",
    validFrom: "2026-07-27",
    configuration: { times: ["09:00"] },
  },
});
assert.ok(habit.status === 200 || habit.status === 201, `habit create: ${habit.status} ${JSON.stringify(habit.data)}`);
const habitId = habit.data?.habit?.id ?? habit.data?.id;
assert.ok(habitId, JSON.stringify(habit.data));
ok(`habit created ${String(habitId).slice(0, 8)}…`);

const share = await json(a.cookie, "POST", `/api/v1/habits/${habitId}/share`, { userId: b.userId });
assert.equal(share.status, 200, JSON.stringify(share.data));
ok("A shares habit with B");

const viewB = await json(b.cookie, "GET", `/api/v1/habits/${habitId}`);
assert.equal(viewB.status, 200, JSON.stringify(viewB.data));
assert.equal(viewB.data.access, "shared");
ok("B GET shared habit");

const stranger = await json(c.cookie, "GET", `/api/v1/habits/${habitId}`);
assert.equal(stranger.status, 404);
ok("C GET shared habit → 404");

const fid = accepted(listA2.data)[0].id;
const rem = await json(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
assert.equal(rem.status, 200, JSON.stringify(rem.data));
ok("A removes B");

const afterRemA = await json(a.cookie, "GET", "/api/v1/friends");
const afterRemB = await json(b.cookie, "GET", "/api/v1/friends");
assert.equal(accepted(afterRemA.data).length, 0);
assert.equal(accepted(afterRemB.data).length, 0);
ok("both lists empty after remove");

const viewB2 = await json(b.cookie, "GET", `/api/v1/habits/${habitId}`);
assert.equal(viewB2.status, 404);
ok("B loses shared habit after unfriend");

const ownerStill = await json(a.cookie, "GET", `/api/v1/habits/${habitId}`);
assert.equal(ownerStill.status, 200);
assert.equal(ownerStill.data.access, "owner");
ok("A still owns habit data");

// --- 12 unauth
const unauth = await json("", "GET", "/api/v1/friends");
assert.equal(unauth.status, 401);
ok("unauth friends → 401");

console.log("\nPASS all friends social HTTP checks\n");
