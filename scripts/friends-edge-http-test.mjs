#!/usr/bin/env node
/**
 * Edge-case HTTP matrix for friends/invites/shares (local, FLOWLY_DEV_EMULATION=1).
 * Usage: node scripts/friends-edge-http-test.mjs [baseUrl]
 */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "");
const origin = base;
const results = [];
const pass = (label) => {
  results.push({ label, ok: true });
  console.log(`  ✓ ${label}`);
};
const check = (label, cond, detail) => {
  if (!cond) {
    results.push({ label, ok: false, detail });
    console.error(`  ✗ ${label}`, detail ?? "");
    throw new Error(label);
  }
  pass(label);
};

const rnd = () => 940000 + Math.floor(Math.random() * 50000);
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
  return { cookie, userId: JSON.parse(text).userId, name, telegramId };
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

const accepted = (d) => (d?.friends ?? []).filter((f) => f.status === "accepted");
const pending = (d) => (d?.friends ?? []).filter((f) => f.status === "pending");

async function createInvite(cookie) {
  const r = await api(cookie, "POST", "/api/v1/friends/invites", {});
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.data;
}

async function createHabit(cookie) {
  const r = await api(cookie, "POST", "/api/v1/habits", {
    title: "Edge habit",
    icon: "leaf",
    color: "sage",
    startLocalDate: "2026-07-27",
    schedule: { ruleType: "exact_times", validFrom: "2026-07-27", configuration: { times: ["09:00"] } },
  });
  assert.ok(r.status === 200 || r.status === 201, JSON.stringify(r.data));
  return r.data.habit.id;
}

console.log(`\nFriends EDGE matrix @ ${base}\n`);

const a = await auth(rnd(), "Alice");
const b = await auth(rnd(), "Bob");
const c = await auth(rnd(), "Cara");
const d = await auth(rnd(), "Dan");
pass(`users A/B/C/D`);

// --- case fold
{
  const inv = await createInvite(a.cookie);
  const low = await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.code.toLowerCase()}/accept`, {});
  check("accept lowercase code", low.status === 200 && low.data.ok, low);
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  check("casefold → mutual friend", accepted(list.data).some((f) => f.peer?.id === b.userId));
  // cleanup remove
  const fid = accepted(list.data).find((f) => f.peer?.id === b.userId).id;
  await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
}

// --- expired invite
{
  const inv = await createInvite(a.cookie);
  // force expire via D1 if wrangler available — skip if not; use direct SQL through next? can't.
  // Mark expired with wrangler local:
  const { execSync } = await import("node:child_process");
  try {
    execSync(
      `npx wrangler d1 execute flowly-db --local --command "UPDATE invite_links SET expires_at='2020-01-01T00:00:00.000Z' WHERE code='${inv.code}';"`,
      { cwd: new URL("../apps/web", import.meta.url).pathname, stdio: "pipe" },
    );
    const r = await api(c.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {});
    check("expired invite → 400", r.status === 400 && /истек/i.test(r.data?.message ?? ""), r);
  } catch (e) {
    check("expired invite (wrangler local)", false, String(e).slice(0, 200));
  }
}

// --- cancel open link (remove pending), then accept should still work via new friendship row
{
  const inv = await createInvite(a.cookie);
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  const open = pending(list.data).find((f) => f.inviteCode === inv.code);
  check("open pending exists", Boolean(open), list.data);
  const rem = await api(a.cookie, "DELETE", `/api/v1/friends/${open.id}`);
  check("cancel open link DELETE 200", rem.status === 200, rem);
  // invite link still use_count 0 — accept should create friendship without pending row
  const acc = await api(c.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {});
  check("accept after cancel pending still works", acc.status === 200 && acc.data.ok, acc);
  const listA = await api(a.cookie, "GET", "/api/v1/friends");
  check("A friends with C after cancel+accept", accepted(listA.data).some((f) => f.peer?.id === c.userId), listA.data);
  const fid = accepted(listA.data).find((f) => f.peer?.id === c.userId).id;
  await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
}

// --- reject then accept by another (reject does not consume use_count)
{
  const inv = await createInvite(a.cookie);
  const rej = await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.code}/reject`, {});
  check("B reject 200", rej.status === 200, rej);
  // pending row rejected — C accept may need new insert path
  const acc = await api(c.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {});
  // after reject, pending is rejected not pending; use_count still 0 → claim + insert new accepted
  check("C accept after B reject", acc.status === 200 && acc.data.ok, acc);
  const listA = await api(a.cookie, "GET", "/api/v1/friends");
  check("A friends with C not B after reject/accept", accepted(listA.data).some((f) => f.peer?.id === c.userId) && !accepted(listA.data).some((f) => f.peer?.id === b.userId), listA.data);
  const fid = accepted(listA.data).find((f) => f.peer?.id === c.userId).id;
  await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
}

// --- re-friend after remove (new invite)
{
  const inv = await createInvite(a.cookie);
  await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {});
  let list = await api(a.cookie, "GET", "/api/v1/friends");
  const fid = accepted(list.data).find((f) => f.peer?.id === b.userId).id;
  await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
  const inv2 = await createInvite(a.cookie);
  const acc2 = await api(b.cookie, "POST", `/api/v1/friends/invites/${inv2.code}/accept`, {});
  check("re-friend after remove", acc2.status === 200 && acc2.data.ok, acc2);
  list = await api(a.cookie, "GET", "/api/v1/friends");
  check("A↔B friends again", accepted(list.data).some((f) => f.peer?.id === b.userId));
}

// --- remove idempotent
{
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  const fid = accepted(list.data).find((f) => f.peer?.id === b.userId)?.id;
  assert.ok(fid);
  const r1 = await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
  const r2 = await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
  check("remove idempotent", r1.status === 200 && r2.status === 200 && r2.data.idempotent === true, { r1, r2 });
}

// --- remove foreign friendship → 403/404
{
  const inv = await createInvite(a.cookie);
  await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {});
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  const fid = accepted(list.data).find((f) => f.peer?.id === b.userId).id;
  const r = await api(c.cookie, "DELETE", `/api/v1/friends/${fid}`);
  check("stranger cannot remove friendship", r.status === 403 || r.status === 404, r);
  await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
}

// --- share non-friend → 400
{
  const hid = await createHabit(a.cookie);
  const r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: d.userId });
  check("share with non-friend → 400", r.status === 400, r);
}

// --- share self → 400
{
  const hid = await createHabit(a.cookie);
  const r = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: a.userId });
  check("share with self → 400", r.status === 400, r);
}

// --- share stranger habit → 404
{
  const hid = await createHabit(a.cookie);
  const r = await api(b.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: a.userId });
  check("non-owner share → 404", r.status === 404, r);
}

// --- explicit revoke share without unfriend
{
  const inv = await createInvite(a.cookie);
  await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {});
  const hid = await createHabit(a.cookie);
  await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId });
  let v = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
  check("shared visible before revoke", v.status === 200 && v.data.access === "shared", v);
  const rev = await api(a.cookie, "DELETE", `/api/v1/habits/${hid}/share/${b.userId}`);
  check("explicit revoke 200", rev.status === 200, rev);
  v = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
  check("shared gone after revoke", v.status === 404, v);
  // still friends
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  check("still friends after share revoke", accepted(list.data).some((f) => f.peer?.id === b.userId), list.data);
  // re-share after revoke
  const again = await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId });
  check("re-share after revoke", again.status === 200, again);
  v = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
  check("visible after re-share", v.status === 200 && v.data.access === "shared", v);
  const fid = accepted(list.data).find((f) => f.peer?.id === b.userId).id;
  await api(a.cookie, "DELETE", `/api/v1/friends/${fid}`);
  v = await api(b.cookie, "GET", `/api/v1/habits/${hid}`);
  check("unfriend cascades share revoke", v.status === 404, v);
}

// --- concurrent double accept (race)
{
  const inv = await createInvite(a.cookie);
  const [r1, r2] = await Promise.all([
    api(b.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {}),
    api(c.cookie, "POST", `/api/v1/friends/invites/${inv.code}/accept`, {}),
  ]);
  const oks = [r1, r2].filter((r) => r.status === 200);
  const fails = [r1, r2].filter((r) => r.status !== 200);
  check("concurrent accept: exactly one winner", oks.length === 1 && fails.length === 1, { r1, r2 });
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  check("concurrent accept: A has one accepted", accepted(list.data).length === 1, list.data);
  if (accepted(list.data)[0]) await api(a.cookie, "DELETE", `/api/v1/friends/${accepted(list.data)[0].id}`);
}

// --- empty / bad code
{
  const r = await api(b.cookie, "POST", `/api/v1/friends/invites/%20/accept`, {});
  check("whitespace code not ok (400/404)", r.status === 400 || r.status === 404, r);
  const r2 = await api(b.cookie, "POST", `/api/v1/friends/invites/short/accept`, {});
  check("short unknown code → 404", r2.status === 404, r2);
}

// --- CSRF / no origin
{
  const inv = await createInvite(a.cookie);
  const res = await fetch(`${base}/api/v1/friends/invites/${inv.code}/accept`, {
    method: "POST",
    headers: { Cookie: b.cookie, "Content-Type": "application/json" },
    body: "{}",
  });
  check("accept without Origin → 403", res.status === 403, res.status);
}

// --- multiple friends
{
  const invB = await createInvite(a.cookie);
  const invC = await createInvite(a.cookie);
  await api(b.cookie, "POST", `/api/v1/friends/invites/${invB.code}/accept`, {});
  await api(c.cookie, "POST", `/api/v1/friends/invites/${invC.code}/accept`, {});
  const list = await api(a.cookie, "GET", "/api/v1/friends");
  check("multiple friends supported", accepted(list.data).length >= 2, list.data);
  for (const f of accepted(list.data)) await api(a.cookie, "DELETE", `/api/v1/friends/${f.id}`);
}

// --- self reject own invite
{
  const inv = await createInvite(a.cookie);
  const r = await api(a.cookie, "POST", `/api/v1/friends/invites/${inv.code}/reject`, {});
  check("self reject → 400", r.status === 400, r);
}

console.log(`\nEDGE: ${results.filter((r) => r.ok).length}/${results.length} passed\n`);
if (results.some((r) => !r.ok)) process.exit(1);
console.log("PASS all edge cases\n");
