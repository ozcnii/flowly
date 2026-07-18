#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const input = resolve(root, "seeds/catalog/starter-catalog.v1.json");
const output = resolve(root, "seeds/0002_starter_catalog.sql");
const ts = "2026-07-14T00:00:00.000Z";
const catalog = JSON.parse(readFileSync(input, "utf8"));

const fail = (msg) => { throw new Error(msg); };
const uniq = (items, key, label) => {
  const seen = new Set();
  for (const x of items) {
    const v = x[key];
    if (!v) fail(`${label}: missing ${key}`);
    if (seen.has(v)) fail(`${label}: duplicate ${key}=${v}`);
    seen.add(v);
  }
};
const sql = (v) => v == null ? "NULL" : `'${String(v).replaceAll("'", "''")}'`;
const json = (v) => sql(JSON.stringify(v ?? []));
const tuple = (xs) => `(${xs.join(", ")})`;

const categories = catalog.categories ?? [];
const exercises = catalog.exercises ?? [];
const workouts = catalog.workouts ?? [];
uniq(categories, "id", "categories"); uniq(categories, "slug", "categories"); uniq(exercises, "id", "exercises"); uniq(workouts, "id", "workouts");
if (categories.length < 10) fail(`expected >=10 categories, got ${categories.length}`);
if (workouts.length < 20) fail(`expected >=20 workouts, got ${workouts.length}`);
if (exercises.length < 60) fail(`expected >=60 exercises, got ${exercises.length}`);

const catBySlug = new Map(categories.map((c) => [c.slug, c]));
const exById = new Map(exercises.map((e) => [e.id, e]));
const workoutExerciseRows = [];
const workoutCategoryRows = [];
for (const w of workouts) {
  for (const k of ["title", "description", "duration", "difficulty", "format"]) if (!w[k]) fail(`workout ${w.id}: missing ${k}`);
  if (!Array.isArray(w.categories) || !w.categories.length) fail(`workout ${w.id}: missing categories`);
  if (!Array.isArray(w.exercises) || !w.exercises.length) fail(`workout ${w.id}: missing exercises`);
  for (const slug of w.categories) {
    const c = catBySlug.get(slug); if (!c) fail(`workout ${w.id}: unknown category ${slug}`);
    workoutCategoryRows.push([w.id, c.id]);
  }
  w.exercises.forEach((exId, i) => {
    const ex = exById.get(exId); if (!ex) fail(`workout ${w.id}: unknown exercise ${exId}`);
    workoutExerciseRows.push({ workoutId: w.id, exerciseId: exId, position: i + 1, duration: ex.duration ?? null });
  });
}

const out = [];
out.push("-- E2-D2-T01 starter catalog seed. Generated from seeds/catalog/starter-catalog.v1.json.");
out.push("-- LOCAL D1 ONLY. Do not edit by hand; run `npm run catalog:build-seed`.");
out.push("PRAGMA foreign_keys=ON;");
out.push("BEGIN TRANSACTION;\n");

out.push("INSERT INTO workout_categories (id, slug, name, icon, sort_order, is_active) VALUES");
out.push(categories.map((c) => tuple([sql(c.id), sql(c.slug), sql(c.name), sql(c.icon), c.sortOrder, 1])).join(",\n") + "\nON CONFLICT(id) DO UPDATE SET slug=excluded.slug, name=excluded.name, icon=excluded.icon, sort_order=excluded.sort_order, is_active=excluded.is_active;\n");

out.push("INSERT INTO exercises (id, owner_id, title, description, media_object_key, media_type, default_duration_seconds, default_repetitions, created_at, updated_at) VALUES");
// Starter art: webp stills by default; mediaType "gif" → catalog/exercises/{id}.gif when shipped.
out.push(exercises.map((e) => {
  const ext = e.mediaType === "gif" ? "gif" : "webp";
  return tuple([sql(e.id), "NULL", sql(e.title), sql(e.description), sql(`catalog/exercises/${e.id}.${ext}`), sql(e.mediaType), e.duration ?? "NULL", e.repetitions ?? "NULL", sql(ts), sql(ts)]);
}).join(",\n") + "\nON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, media_object_key=excluded.media_object_key, media_type=excluded.media_type, default_duration_seconds=excluded.default_duration_seconds, default_repetitions=excluded.default_repetitions, updated_at=excluded.updated_at;\n");

out.push("INSERT INTO workouts (id, owner_id, source_type, visibility, title, description, cover_object_key, youtube_video_id, duration_seconds, difficulty, equipment, contraindications, format, status, created_at, updated_at, published_at) VALUES");
out.push(workouts.map((w) => tuple([sql(w.id), "NULL", sql(w.sourceType ?? "flowly"), sql("public"), sql(w.title), sql(w.description), sql(w.coverObjectKey ?? (w.sourceType === "youtube" ? null : `catalog/covers/${w.id}.webp`)), sql(w.youtubeVideoId ?? null), w.duration, sql(w.difficulty), json(w.equipment), json(w.contraindications), sql(w.format), sql("published"), sql(ts), sql(ts), sql(ts)])).join(",\n") + "\nON CONFLICT(id) DO UPDATE SET source_type=excluded.source_type, visibility=excluded.visibility, title=excluded.title, description=excluded.description, cover_object_key=excluded.cover_object_key, youtube_video_id=excluded.youtube_video_id, duration_seconds=excluded.duration_seconds, difficulty=excluded.difficulty, equipment=excluded.equipment, contraindications=excluded.contraindications, format=excluded.format, status=excluded.status, updated_at=excluded.updated_at, published_at=excluded.published_at;\n");

out.push(`DELETE FROM workout_category_links WHERE workout_id IN (${workouts.map((w) => sql(w.id)).join(", ")});`);
out.push("INSERT INTO workout_category_links (workout_id, category_id) VALUES");
out.push(workoutCategoryRows.map((r) => tuple([sql(r[0]), sql(r[1])])).join(",\n") + ";\n");

out.push(`DELETE FROM workout_exercises WHERE workout_id IN (${workouts.map((w) => sql(w.id)).join(", ")});`);
out.push("INSERT INTO workout_exercises (workout_id, exercise_id, position, sets_count, repetitions, duration_seconds, rest_seconds, custom_instruction) VALUES");
out.push(workoutExerciseRows.map((r) => tuple([sql(r.workoutId), sql(r.exerciseId), r.position, "NULL", "NULL", r.duration ?? "NULL", "NULL", "NULL"])).join(",\n") + ";\n");

out.push("COMMIT;");
writeFileSync(output, out.join("\n"));
console.log(JSON.stringify({ output, categories: categories.length, workouts: workouts.length, exercises: exercises.length, workoutCategoryLinks: workoutCategoryRows.length, workoutExercises: workoutExerciseRows.length }, null, 2));
