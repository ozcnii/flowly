#!/usr/bin/env node
/**
 * Habit share HTTP matrix (T03). Local next + FLOWLY_DEV_EMULATION=1.
 * Usage: node scripts/habit-share-http-test.mjs [baseUrl]
 */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "");
const origin = base;
const results = [];
const pass = (l) => {
  results.push({ l, ok: true });
  console.log(`  ✓ ${l}`);
};
const check = (l, cond, d) => {
  if (!cond) {
    console.error(`  ✗ ${l}`, d ?? "");
    throw new Error(l);
  }
  pass(l);
};

const rnd = () => 960000 + Math.floor(Math.random() * 9000);
const devUser = (id, firstName) =>
  encodeURIComponent(JSON.stringify({ id, first_name: firstName, username: `u${id}` }));

async function auth(telegramId, name) {
  const res = await fetch(`${base}/api/v1/auth/telegram`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", "x-flowly-dev-user": devUser(telegramId, name) },
    body: "{}",
  });
  const text = await res.text();
  assert.equal(res.status, 200, `auth ${name}: ${res.status} ${text}`);
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie =
    setCookie.map((c) => c.split(";")[0]).join("; ") || res.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  return { cookie, userId: JSON.parse(text).userId, name };
}

async function api(cookie, method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Origin: origin,
      Cookie: cookie || "",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

console.log(`\nHabit share HTTP matrix @ ${base}\n`);

const a = await auth(rnd(), "Alice");
const b = await auth(rnd(), "Bob");
const c = await auth(rnd(), "Cara");
pass("auth A/B/C");

// friendship A↔B
const inv = await api(a.cookie, "POST", "/api/v1/friends/invites", {});
assert.equal(inv.status, 200, JSON.stringify(inv.data));
const acc = await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.data.code}/accept`, {});
assert.equal(acc.status, 200, JSON.stringify(acc.data));
pass("A↔B friends");

// C not friend
const invC = await api(a.cookie, "POST", "/api/v1/friends/invites", {});
// leave unused

// create habit as A
const habit = await api(a.cookie, "POST", "/api/v1/habits", {
  title: "Share test",
  icon: "leaf",
  color: "sage",
  startLocalDate: "2026-07-27",
  schedule: { ruleType: "exact_times", validFrom: "2026-07-27", configuration: { times: ["09:00"] } },
});
check("habit create", habit.status === 200 || habit.status === 201, habit);
const hid = habit.data.habit.id;
pass(`habit ${hid.slice(0, 8)}…`);

// default: B cannot see
let r = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
check("B before share → 404", r.status === 404, r);

// stranger C
r = await api(c.cookie, "GET", `/api/v1/habits/${hid}`);
check("C stranger → 404", r.status === 404, r);

// A owner
r = await api(a.cookie, "GET", `/api/v1/habits/${hid}`);
check("A owner access", r.status === 200 && r.data.access === "owner", r);

// share with non-friend C → 400
r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: c.userId });
check("share non-friend → 400", r.status === 400, r);

// share with self → 400
r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: a.userId });
check("share self → 400", r.status === 400, r);

// share with B (no toggles)
r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId });
check("share B → 200", r.status === 200, r);

// list shares
r = await api(a.cookie, "GET", `/api/v1/habits/${hid}/share`);
check("list shares has B", r.status === 200 && r.data.shares?.some((s) => s.userId === b.userId), r);
const shareRow = r.data.shares.find((s) => s.userId === b.userId);
check("default toggles off", shareRow && shareRow.showStreak === false && shareRow.showHistory === false, shareRow);

// B GET shared
r = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
check("B GET access=shared", r.status === 200 && r.data.access === "shared", r);
check("B share toggles off", r.data.share?.showStreak === false && r.data.share?.showHistory === false, r.data);
check("B no private fields", r.data.habit && r.data.habit.ownerId === undefined && r.data.habit.reminderPolicyId === undefined, r.data.habit);

// B shared list
r = await api(b.cookie, "GET", "/api/v1/habits/shared");
check("B /habits/shared contains habit", r.status === 200 && r.data.items?.some((i) => i.habit.id === hid), r);

// A shared list empty (not recipient)
r = await api(a.cookie, "GET", "/api/v1/habits/shared");
check("A /habits/shared empty of own", r.status === 200 && !r.data.items?.some((i) => i.habit.id === hid), r);

// C still 404
r = await api(c.cookie, "GET", `/api/v1/habits/${hid}`);
check("C still 404 after A→B share", r.status === 404, r);

// update toggles
r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, {
  userId: b.userId,
  showStreak: true,
  showHistory: true,
});
check("update toggles → 200", r.status === 200, r);
r = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
check("B sees toggles on", r.data.share?.showStreak === true && r.data.share?.showHistory === true, r.data);

// B cannot list shares (owner only)
r = await api(b.cookie, "GET", `/api/v1/habits/${hid}/share`);
check("B list shares → 404", r.status === 404, r);

// B cannot share further
r = await api(b.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: c.userId });
check("B share as non-owner → 404", r.status === 404, r);

// explicit revoke
r = await api(a.cookie, "DELETE", `/api/v1/habits/${hid}/share/${b.userId}`);
check("revoke → 200", r.status === 200, r);
r = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
check("B after revoke → 404", r.status === 404, r);
r = await api(b.cookie, "GET", "/api/v1/habits/shared");
check("B shared list empty after revoke", r.status === 200 && !r.data.items?.some((i) => i.habit.id === hid), r);

// re-share then unfriend cascade
r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId, showStreak: true });
check("re-share → 200", r.status === 200, r);
const friends = await api(a.cookie, "GET", "/api/v1/friends");
const fid = (friends.data.friends ?? []).find((f) => f.status === "accepted" && f.peer?.id === b.userId)?.id;
assert.ok(fid, "friendship id");
r = await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
check("unfriend → 200", r.status === 200, r);
r = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
check("B after unfriend → 404 cascade", r.status === 404, r);
r = await api(a.cookie, "GET", `/api/v1/habits/${hid}`);
check("A still owner after unfriend", r.status === 200 && r.data.access === "owner", r);

// unauth
r = await api("", "GET", `/api/v1/habits/${hid}`);
check("unauth GET habit → 401", r.status === 401, r);
r = await api("", "GET", "/api/v1/habits/shared");
check("unauth shared → 401", r.status === 401, r);
r = await api("", "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId });
check("unauth share → 401", r.status === 401, r);

// CSRF
{
  const res = await fetch(`${base}/api/v1/habits/${hid}/share`, {
    method: "POST",
    headers: { Cookie: a.cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ userId: b.userId }),
  });
  check("share no Origin → 403", res.status === 403, res.status);
}

// double revoke idempotent
await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId }); // may 400 non-friend
// re-friend
const inv2 = await api(a.cookie, "POST", "/api/v1/friends/invites", {});
await api(b.cookie, "POST", `/api/v1/friends/invites/${inv2.data.code}/accept`, {});
await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId });
const r1 = await api(a.cookie, "DELETE", `/api/v1/habits/${hid}/share/${b.userId}`);
const r2 = await api(a.cookie, "DELETE", `/api/v1/habits/${hid}/share/${b.userId}`);
check("revoke idempotent", r1.status === 200 && r2.status === 200 && r2.data.idempotent === true, { r1, r2 });

console.log(`\nHabit share: ${results.filter((x) => x.ok).length}/${results.length} passed\n`);
if (results.some((x) => !x.ok)) process.exit(1);
console.log("PASS habit share matrix\n");
