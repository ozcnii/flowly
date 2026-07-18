-- Short step smoke workout: 3 exercises 10s / 15s / 5s + rest 5s between (not after last).
-- Idempotent. Keep on local + prod for TMA audio/rest verification — do not delete.
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
  'Короткая тренировка для проверки step-runtime: 10/15/5 сек и отдых 5 сек между упражнениями. Не удалять.',
  'catalog/covers/wo-morning-10.webp',
  NULL,
  40,
  'beginner',
  '[]',
  '[]',
  'step_by_step',
  'published',
  '2026-07-18T00:00:00.000Z',
  '2026-07-18T22:45:00.000Z',
  '2026-07-18T00:00:00.000Z'
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  description=excluded.description,
  duration_seconds=excluded.duration_seconds,
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
