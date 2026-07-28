#!/usr/bin/env node
/**
 * E8-D9-T02 — PRD §50.3 E2E HTTP flows (local next + FLOWLY_DEV_EMULATION).
 * Usage: node scripts/stage8-e2e-http-test.mjs [baseUrl]
 */
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "");
const origin = base;
const today = () => new Date().toISOString().slice(0, 10);
const ok = (l) => console.log(`  ✓ ${l}`);
const fail = (l, d) => {
  console.error(`  ✗ ${l}`, d ?? "");
  throw new Error(l);
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
  assert.ok(cookie, "session cookie");
  return { cookie, userId: JSON.parse(text).userId, name };
}

async function api(cookie, method, path, body) {
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
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json, text };
}

async function flowHabit(A) {
  console.log("\n§50.3 Habit");
  const create = await api(A.cookie, "POST", "/api/v1/habits", {
    title: "E2E water",
    icon: "glass-water",
    color: "sky",
    startLocalDate: today(),
    allowSkip: true,
    schedule: {
      ruleType: "exact_times",
      configuration: { times: ["08:00", "20:00"] },
      validFrom: today(),
    },
  });
  if (create.status !== 201) fail("create habit", create);
  const habitId = create.json.habit.id;
  ok(`create habit + 2 times ${habitId}`);

  const list = await api(A.cookie, "GET", "/api/v1/habits");
  assert.equal(list.status, 200);
  assert.ok(list.json.habits.some((h) => h.id === habitId));
  ok("habits list contains habit");

  await api(A.cookie, "GET", "/api/v1/habits"); // ensure today materialize
  let occs = await api(A.cookie, "GET", `/api/v1/occurrences?habitId=${habitId}&date=${today()}`);
  assert.equal(occs.status, 200, JSON.stringify(occs.json));
  assert.ok((occs.json.occurrences?.length ?? 0) >= 2, `expected 2 slots got ${occs.json.occurrences?.length}`);
  ok(`occurrences today: ${occs.json.occurrences.length}`);

  const occId = occs.json.occurrences[0].id;
  const done = await api(A.cookie, "POST", `/api/v1/occurrences/${occId}/complete`, {});
  if (done.status !== 200) fail("complete occurrence", done);
  ok(`complete ${occId} → ${done.status}`);

  const cal = await api(A.cookie, "GET", `/api/v1/calendar/day?date=${today()}`);
  assert.equal(cal.status, 200, JSON.stringify(cal.json));
  ok("calendar day 200");

  const report = await api(A.cookie, "GET", `/api/v1/reports/week?date=${today()}`);
  assert.equal(report.status, 200, JSON.stringify(report.json));
  ok("weekly report 200");

  // cleanup best-effort
  await api(A.cookie, "DELETE", `/api/v1/habits/${habitId}`);
  return { habitId };
}

async function flowVideo(A) {
  console.log("\n§50.3 Video workout");
  const catalog = await api(A.cookie, "GET", "/api/v1/workouts?source=youtube&limit=5");
  assert.equal(catalog.status, 200);
  const items = catalog.json.items ?? catalog.json.workouts ?? [];
  // public catalog shape: total + items? check
  const workouts = catalog.json.workouts ?? catalog.json.items ?? [];
  // From earlier prod: filters/total - list may be under different key
  let videoId =
    (workouts.find?.((w) => w.format === "video" || w.youtubeVideoId) ?? null)?.id ??
    catalog.json?.workouts?.find?.((w) => w.youtubeVideoId)?.id;

  if (!videoId) {
    // raw list without filter
    const all = await api(A.cookie, "GET", "/api/v1/workouts");
    assert.equal(all.status, 200);
    const list = all.json.workouts ?? all.json.items ?? [];
    // response may only have total - need to inspect
    if (Array.isArray(list) && list.length) {
      videoId = list.find((w) => w.format === "video" || w.youtubeVideoId)?.id ?? list.find((w) => String(w.id).startsWith("wo-yt-"))?.id;
    }
    // fallback known seed id
    if (!videoId && (all.json.total ?? 0) > 0) videoId = "wo-yt-malova-morning-10";
  }
  assert.ok(videoId, "need youtube video workout in catalog");
  ok(`catalog video ${videoId}`);

  // close any active
  const active0 = await api(A.cookie, "GET", "/api/v1/workout-sessions/active");
  if (active0.status === 200 && active0.json.session?.id) {
    const s = active0.json.session;
    await api(A.cookie, "POST", `/api/v1/workout-sessions/${s.id}/finish`, {
      accumulatedSeconds: s.accumulatedSeconds ?? 0,
      finalStatus: "completed",
      baseUpdatedAt: s.updatedAt,
    });
  }

  const start = await api(A.cookie, "POST", "/api/v1/workout-sessions", { workoutId: videoId, mode: "video" });
  if (start.status !== 201) fail("start video session", start);
  let session = start.json.session;
  ok(`start session ${session.id} mode=${session.mode}`);

  // pause checkpoint
  let cp = await api(A.cookie, "PATCH", `/api/v1/workout-sessions/${session.id}/checkpoint`, {
    accumulatedSeconds: 5,
    playbackPositionSeconds: 5,
    paused: true,
    baseUpdatedAt: session.updatedAt,
  });
  if (cp.status !== 200) fail("pause checkpoint", cp);
  session = cp.json.session;
  ok(`pause accumulated=${session.accumulatedSeconds}`);

  // resume
  cp = await api(A.cookie, "PATCH", `/api/v1/workout-sessions/${session.id}/checkpoint`, {
    accumulatedSeconds: 12,
    playbackPositionSeconds: 12,
    paused: false,
    baseUpdatedAt: session.updatedAt,
  });
  if (cp.status !== 200) fail("resume checkpoint", cp);
  session = cp.json.session;
  ok(`resume accumulated=${session.accumulatedSeconds}`);

  const fin = await api(A.cookie, "POST", `/api/v1/workout-sessions/${session.id}/finish`, {
    accumulatedSeconds: session.accumulatedSeconds,
    playbackPositionSeconds: session.playbackPositionSeconds ?? 12,
    finalStatus: "completed",
    baseUpdatedAt: session.updatedAt,
  });
  if (fin.status !== 200) fail("finish video", fin);
  assert.equal(fin.json.session.state, "closed");
  assert.equal(fin.json.session.finalStatus, "completed");
  ok("finish completed");

  const day = await api(A.cookie, "GET", `/api/v1/calendar/day?date=${today()}`);
  assert.equal(day.status, 200);
  ok("calendar after video");
  return { sessionId: session.id, videoId };
}

async function flowStep(A) {
  console.log("\n§50.3 Step-by-step workout");
  const stepId = "wo-morning-10"; // seeded step_by_step
  const active0 = await api(A.cookie, "GET", "/api/v1/workout-sessions/active");
  if (active0.status === 200 && active0.json.session?.id) {
    const s = active0.json.session;
    await api(A.cookie, "POST", `/api/v1/workout-sessions/${s.id}/finish`, {
      accumulatedSeconds: s.accumulatedSeconds ?? 0,
      finalStatus: "partial",
      baseUpdatedAt: s.updatedAt,
    });
  }

  const start = await api(A.cookie, "POST", "/api/v1/workout-sessions", { workoutId: stepId, mode: "step" });
  if (start.status !== 201) fail("start step session", start);
  let session = start.json.session;
  ok(`start step ${session.id} exercises=${session.workout?.exercises?.length ?? "?"}`);

  // next exercise via checkpoint currentExercisePosition
  const n = session.workout?.exercises?.length ?? 1;
  cp: for (const pos of [0, 1, Math.min(2, n - 1)]) {
    const body = {
      accumulatedSeconds: 30 + pos * 30,
      currentExercisePosition: pos,
      paused: false,
      baseUpdatedAt: session.updatedAt,
    };
    const cp = await api(A.cookie, "PATCH", `/api/v1/workout-sessions/${session.id}/checkpoint`, body);
    if (cp.status !== 200) fail(`step checkpoint pos=${pos}`, cp);
    session = cp.json.session;
    ok(`exercise pos=${session.currentExercisePosition} acc=${session.accumulatedSeconds}`);
  }

  // skip ahead (+30 conceptually via seconds)
  const skip = await api(A.cookie, "PATCH", `/api/v1/workout-sessions/${session.id}/checkpoint`, {
    accumulatedSeconds: session.accumulatedSeconds + 30,
    currentExercisePosition: Math.min((session.currentExercisePosition ?? 0) + 1, Math.max(n - 1, 0)),
    paused: false,
    baseUpdatedAt: session.updatedAt,
  });
  if (skip.status !== 200) fail("skip/add 30s", skip);
  session = skip.json.session;
  ok(`+30s / next → acc=${session.accumulatedSeconds}`);

  const fin = await api(A.cookie, "POST", `/api/v1/workout-sessions/${session.id}/finish`, {
    accumulatedSeconds: session.accumulatedSeconds,
    finalStatus: "partial",
    baseUpdatedAt: session.updatedAt,
  });
  if (fin.status !== 200) fail("finish partial", fin);
  assert.equal(fin.json.session.finalStatus, "partial");
  ok("finish partial");

  const day = await api(A.cookie, "GET", `/api/v1/calendar/day?date=${today()}`);
  assert.equal(day.status, 200);
  ok("calendar after step");
  return { sessionId: session.id };
}

async function flowFriends(A, B) {
  console.log("\n§50.3 Friends (core)");
  const inv = await api(A.cookie, "POST", "/api/v1/friends/invites", {});
  if (inv.status !== 201 && inv.status !== 200) fail("create invite", inv);
  const code = inv.json.invite?.code ?? inv.json.code ?? inv.json.inviteLink?.code;
  assert.ok(code, JSON.stringify(inv.json));
  ok(`invite ${code}`);

  const acc = await api(B.cookie, "POST", `/api/v1/friends/invites/${code}/accept`, {});
  if (![200, 201].includes(acc.status)) fail("accept invite", acc);
  ok("accept friendship");

  const habit = await api(A.cookie, "POST", "/api/v1/habits", {
    title: "E2E share only",
    icon: "heart",
    color: "rose",
    startLocalDate: today(),
  });
  assert.equal(habit.status, 201);
  const habitId = habit.json.habit.id;

  const share = await api(A.cookie, "POST", `/api/v1/habits/${habitId}/share`, { userId: B.userId });
  if (![200, 201].includes(share.status)) fail("share habit", share);
  ok("share habit with B");

  const shared = await api(B.cookie, "GET", "/api/v1/habits/shared");
  assert.equal(shared.status, 200);
  const items = shared.json.items ?? shared.json.habits ?? [];
  const seen = items.some((row) => (row.habit?.id ?? row.id ?? row.habitId) === habitId);
  assert.ok(seen, JSON.stringify(shared.json));
  ok("B sees shared habit");

  const bOwn = await api(B.cookie, "GET", "/api/v1/habits");
  assert.equal(bOwn.status, 200);
  assert.ok(!(bOwn.json.habits ?? []).some((h) => h.id === habitId));
  ok("B own list excludes A private habit");

  const remindBody = { recipientId: A.userId, entityType: "habit", entityId: habitId };
  const remind = await api(B.cookie, "POST", "/api/v1/partner-reminds", remindBody);
  if (![200, 201, 429].includes(remind.status)) fail("partner remind", remind);
  ok(`partner remind → ${remind.status}`);

  const remind2 = await api(B.cookie, "POST", "/api/v1/partner-reminds", remindBody);
  if (![200, 201, 429].includes(remind2.status)) fail("partner remind 2", remind2);
  ok(`partner remind 2 → ${remind2.status}${remind2.status === 429 ? " rate_limit" : ""}`);

  return { code, habitId };
}

console.log(`Stage8 E2E HTTP @ ${base}`);
const A = await auth(881001, "E2E-A");
const B = await auth(881002, "E2E-B");
ok(`auth A=${A.userId.slice(0, 8)}… B=${B.userId.slice(0, 8)}…`);

await flowHabit(A);
await flowVideo(A);
await flowStep(A);
await flowFriends(A, B);

console.log("\nPASS all §50.3 E2E HTTP flows");
