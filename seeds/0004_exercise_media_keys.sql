-- Point starter exercises at shipped public/media/catalog/exercises/*.webp stills.
PRAGMA foreign_keys=ON;

UPDATE exercises
SET
  media_object_key = 'catalog/exercises/' || id || '.webp',
  media_type = 'image',
  updated_at = '2026-07-18T22:00:00.000Z'
WHERE id LIKE 'ex-%';
