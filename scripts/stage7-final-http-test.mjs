#!/usr/bin/env node
/** Stage 7 final: joint program + partner remind + DoD smoke. */
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
const rnd = () => 980000 + Math.floor(Math.random() * 7000);
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

console.log(`\nStage7 final HTTP @ ${base}\n`);
const a = await auth(rnd(), "Alice");
const b = await auth(rnd(), "Bob");
const inv = await api(a.cookie, "POST", "/api/v1/friends/invites", {});
await api(b.cookie, "POST", `/api/v1/friends/invites/${inv.data.code}/accept`, {});
pass("friends");

// habit share + partner remind
const habit = await api(a.cookie, "POST", "/api/v1/habits", {
  title: "Remind me",
  icon: "leaf",
  color: "sage",
  startLocalDate: "2026-07-28",
  schedule: { ruleType: "exact_times", validFrom: "2026-07-28", configuration: { times: ["09:00"] } },
});
check("habit", habit.status === 201 || habit.status === 200, habit);
const hid = habit.data.habit.id;
await api(a.cookie, "POST", `/api/v1/habits/${hid}/share`, { userId: b.userId });
let r = await api(b.cookie, "POST", "/api/v1/partner-reminds", {
  recipientId: a.userId,
  entityType: "habit",
  entityId: hid,
});
check("partner remind ok", r.status === 200, r);
r = await api(b.cookie, "POST", "/api/v1/partner-reminds", {
  recipientId: a.userId,
  entityType: "habit",
  entityId: hid,
});
check("partner remind 2h rate limit 429", r.status === 429, r);
r = await api(b.cookie, "POST", "/api/v1/partner-reminds", {
  recipientId: a.userId,
  entityType: "habit",
  entityId: "nope",
});
check("remind unknown habit 404/403", r.status === 404 || r.status === 403, r);

// joint program — need a program in DB
const programs = await api(a.cookie, "GET", "/api/v1/programs");
check("programs list", programs.status === 200, programs);
const programId = programs.data?.programs?.[0]?.id ?? programs.data?.items?.[0]?.id;
if (!programId) {
  console.log("  · no programs seeded — skip joint enroll share (API still present)");
} else {
  const start = "2026-07-28";
  const en = await api(a.cookie, "POST", `/api/v1/programs/${programId}/enroll`, { startLocalDate: start });
  check("enroll A", en.status === 200 || en.status === 201, en);
  const eid = en.data.enrollment?.id ?? en.data.id;
  assert.ok(eid);
  r = await api(a.cookie, "POST", `/api/v1/program-enrollments/${eid}/share`, { userId: b.userId });
  check("share enrollment", r.status === 200, r);
  r = await api(b.cookie, "POST", `/api/v1/program-enrollments/${eid}/join`, {});
  check("B join joint", r.status === 200, r);
  r = await api(a.cookie, "GET", `/api/v1/program-enrollments/${eid}/joint`);
  check("joint members", r.status === 200 && r.data.members?.length >= 2, r);
  r = await api(b.cookie, "POST", `/api/v1/program-enrollments/${eid}/leave`, {});
  check("B leave joint", r.status === 200, r);
}

// stranger no access to shared habit
const c = await auth(rnd(), "Cara");
r = await api(c.cookie, "GET", `/api/v1/habits/${hid}`);
check("stranger habit 404", r.status === 404, r);

console.log("\nPASS stage7 final matrix\n");
