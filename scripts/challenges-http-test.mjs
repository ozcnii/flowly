#!/usr/bin/env node
/** Challenges + reactions HTTP matrix. FLOWLY_DEV_EMULATION=1 required. */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "");
const origin = base;
const pass = (l) => console.log(`  ✓ ${l}`);
const check = (l, c, d) => {
  if (!c) {
    console.error(`  ✗ ${l}`, d ?? "");
    throw new Error(l);
  }
  pass(l);
};
const rnd = () => 970000 + Math.floor(Math.random() * 8000);
const devUser = (id, firstName) =>
  encodeURIComponent(JSON.stringify({ id, first_name: firstName, username: `u${id}` }));

async function auth(telegramId, name) {
  const res = await fetch(`${base}/api/v1/auth/telegram`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", "x-flowly-dev-user": devUser(telegramId, name) },
    body: "{}",
  });
  const text = await res.text();
  assert.equal(res.status, 200, text);
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie =
    setCookie.map((c) => c.split(";")[0]).join("; ") || res.headers.get("set-cookie")?.split(";")[0];
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

console.log(`\nChallenges HTTP @ ${base}\n`);
const a = await auth(rnd(), "Alice");
const b = await auth(rnd(), "Bob");
const c = await auth(rnd(), "Cara");
pass("auth");

const inv = await api(a.cookie, "POST", "/api/v1/friends/invites", {});
await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.data.code}/accept`, {});
pass("A↔B friends");

const today = new Date();
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const startsOn = iso(today);
const ends = new Date(today);
ends.setDate(ends.getDate() + 7);
const endsOn = iso(ends);

// create without friend → ok
let r = await api(a.cookie, "POST", "/api/v1/challenges", {
  title: "Solo",
  goalType: "habit_count",
  goalValue: 5,
  startsOn,
  endsOn,
});
check("create solo 201", r.status === 201, r);
const soloId = r.data.id;

// create with non-friend C → 400
r = await api(a.cookie, "POST", "/api/v1/challenges", {
  title: "Bad",
  goalType: "habit_count",
  goalValue: 5,
  startsOn,
  endsOn,
  memberIds: [c.userId],
});
check("non-friend member → 400", r.status === 400, r);

// create with B
r = await api(a.cookie, "POST", "/api/v1/challenges", {
  title: "Together",
  description: "test",
  goalType: "habit_count",
  goalValue: 10,
  startsOn,
  endsOn,
  memberIds: [b.userId],
});
check("create with B 201", r.status === 201, r);
const id = r.data.id;

// list
r = await api(a.cookie, "GET", "/api/v1/challenges");
check("A list has challenges", r.status === 200 && r.data.items?.length >= 2, r);
r = await api(b.cookie, "GET", "/api/v1/challenges");
check("B sees invite", r.status === 200 && r.data.items?.some((i) => i.challenge.id === id && i.membership.status === "invited"), r);
r = await api(c.cookie, "GET", "/api/v1/challenges");
check("C empty of Together", r.status === 200 && !r.data.items?.some((i) => i.challenge.id === id), r);

// stranger GET detail
r = await api(c.cookie, "GET", `/api/v1/challenges/${id}`);
check("C detail 404", r.status === 404, r);

// B join
r = await api(b.cookie, "POST", `/api/v1/challenges/${id}/join`, {});
check("B join 200", r.status === 200, r);
r = await api(b.cookie, "POST", `/api/v1/challenges/${id}/join`, {});
check("B join idempotent", r.status === 200 && r.data.idempotent === true, r);

// detail progress
r = await api(a.cookie, "GET", `/api/v1/challenges/${id}`);
check("detail progress members", r.status === 200 && r.data.progress?.length >= 2, r);

// reaction
r = await api(a.cookie, "POST", `/api/v1/challenges/${id}/reactions`, { recipientId: b.userId, emoji: "🔥" });
check("react 200", r.status === 200 && r.data.action === "added", r);
r = await api(a.cookie, "POST", `/api/v1/challenges/${id}/reactions`, { recipientId: b.userId, emoji: "🔥" });
check("react toggle remove", r.status === 200 && r.data.action === "removed", r);
r = await api(a.cookie, "POST", `/api/v1/challenges/${id}/reactions`, { recipientId: a.userId, emoji: "🔥" });
check("self react 400", r.status === 400, r);
r = await api(c.cookie, "POST", `/api/v1/challenges/${id}/reactions`, { recipientId: b.userId, emoji: "🔥" });
check("stranger react 403/404", r.status === 403 || r.status === 404, r);

// leave
r = await api(b.cookie, "POST", `/api/v1/challenges/${id}/leave`, {});
check("B leave 200", r.status === 200, r);
r = await api(a.cookie, "POST", `/api/v1/challenges/${id}/leave`, {});
check("owner leave 400", r.status === 400, r);

// invalid goal
r = await api(a.cookie, "POST", "/api/v1/challenges", {
  title: "X",
  goalType: "habit_count",
  goalValue: 0,
  startsOn,
  endsOn,
});
check("goal 0 → 400", r.status === 400, r);

// unauth
r = await api("", "GET", "/api/v1/challenges");
check("unauth 401", r.status === 401, r);

console.log("\nPASS challenges HTTP matrix\n");
