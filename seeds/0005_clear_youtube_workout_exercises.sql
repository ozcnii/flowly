-- YouTube/video workouts must not ship step exercise lists (DEC-062 video runtime).
DELETE FROM workout_exercises WHERE workout_id IN (
  SELECT id FROM workouts WHERE format = 'video' OR source_type = 'youtube'
);
