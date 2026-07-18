-- Legacy pilot file: full catalog v2 already sets video media via 0002_starter_catalog.sql.
-- Kept as no-op safety upsert for the three smoke-test exercises.
PRAGMA foreign_keys=ON;

UPDATE exercises SET
  media_object_key = 'catalog/exercises/mountain-pose.mp4',
  media_type = 'video',
  updated_at = '2026-07-19T00:00:00.000Z'
WHERE id = 'ex-mountain-pose';

UPDATE exercises SET
  media_object_key = 'catalog/exercises/cobra-pose.mp4',
  media_type = 'video',
  updated_at = '2026-07-19T00:00:00.000Z'
WHERE id = 'ex-cobra-pose';

UPDATE exercises SET
  media_object_key = 'catalog/exercises/tree-pose.mp4',
  media_type = 'video',
  updated_at = '2026-07-19T00:00:00.000Z'
WHERE id = 'ex-tree-pose';
