-- Deduplicate before unique index (keep newest terminal-preferring row per key).
DELETE FROM status_history WHERE occurrence_id IN (
  SELECT o.id FROM activity_occurrences o
  WHERE EXISTS (
    SELECT 1 FROM activity_occurrences k
    WHERE k.user_id = o.user_id AND k.entity_type = o.entity_type AND k.entity_id = o.entity_id AND k.scheduled_local_date = o.scheduled_local_date
      AND (
        CASE k.status
          WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
        END > CASE o.status
          WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
        END
        OR (
          CASE k.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END = CASE o.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END
          AND k.updated_at > o.updated_at
        )
        OR (
          CASE k.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END = CASE o.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END
          AND k.updated_at = o.updated_at AND k.id > o.id
        )
      )
  )
);
--> statement-breakpoint
DELETE FROM activity_occurrences WHERE id IN (
  SELECT o.id FROM activity_occurrences o
  WHERE EXISTS (
    SELECT 1 FROM activity_occurrences k
    WHERE k.user_id = o.user_id AND k.entity_type = o.entity_type AND k.entity_id = o.entity_id AND k.scheduled_local_date = o.scheduled_local_date
      AND (
        CASE k.status
          WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
        END > CASE o.status
          WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
        END
        OR (
          CASE k.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END = CASE o.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END
          AND k.updated_at > o.updated_at
        )
        OR (
          CASE k.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END = CASE o.status
            WHEN 'completed' THEN 5 WHEN 'partial' THEN 4 WHEN 'rest' THEN 3 WHEN 'skipped' THEN 3 WHEN 'not_completed' THEN 2 WHEN 'no_response' THEN 2 ELSE 1
          END
          AND k.updated_at = o.updated_at AND k.id > o.id
        )
      )
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_occurrences_user_entity_date_unique` ON `activity_occurrences` (`user_id`,`entity_type`,`entity_id`,`scheduled_local_date`);
