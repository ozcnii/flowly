-- Short step-session smoke workout for prod/local verification (E2-D3-T02).
-- 3 exercises: 10s → 15s → 5s, rest 5s between (not after last).
-- Reuses existing catalog exercises + cover; idempotent UPSERT.
PRAGMA foreign_keys=ON;

INSERT INTO workouts (
  id, owner_id, source_type, visibility, title, description,
  cover_object_key, youtube_video_id, duration_seconds, difficulty,
  equipment, contraindications, format, status, created_at, updated_at, published_at
) VALUES (
  'wo-step-test-short',
  NULL,
  'flowly',
  'public',
  'Тест step 10+15+5',
  'Короткая тренировка для проверки step-runtime: 3 упражнения 10/15/5 сек и отдых 5 сек между ними.',
  'catalog/covers/wo-morning-10.webp',
  NULL,
  40,
  'beginner',
  '[]',
  '[]',
  'step_by_step',
  'published',
  '2026-07-18T00:00:00.000Z',
  '2026-07-18T00:00:00.000Z',
  '2026-07-18T00:00:00.000Z'
)
ON CONFLICT(id) DO UPDATE SET
  source_type=excluded.source_type,
  visibility=excluded.visibility,
  title=excluded.title,
  description=excluded.description,
  cover_object_key=excluded.cover_object_key,
  youtube_video_id=excluded.youtube_video_id,
  duration_seconds=excluded.duration_seconds,
  difficulty=excluded.difficulty,
  equipment=excluded.equipment,
  contraindications=excluded.contraindications,
  format=excluded.format,
  status=excluded.status,
  updated_at=excluded.updated_at,
  published_at=excluded.published_at;

DELETE FROM workout_category_links WHERE workout_id = 'wo-step-test-short';
INSERT INTO workout_category_links (workout_id, category_id) VALUES
('wo-step-test-short', 'cat-morning'),
('wo-step-test-short', 'cat-mobility');

DELETE FROM workout_exercises WHERE workout_id = 'wo-step-test-short';
INSERT INTO workout_exercises (
  workout_id, exercise_id, position, sets_count, repetitions,
  duration_seconds, rest_seconds, custom_instruction
) VALUES
('wo-step-test-short', 'ex-mountain', 1, NULL, NULL, 10, 5, NULL),
('wo-step-test-short', 'ex-cat-cow', 2, NULL, NULL, 15, 5, NULL),
('wo-step-test-short', 'ex-child', 3, NULL, NULL, 5, NULL, NULL);
