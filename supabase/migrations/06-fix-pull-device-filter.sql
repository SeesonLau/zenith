-- supabase/migrations/06-fix-pull-device-filter.sql
DROP FUNCTION IF EXISTS pull_changes;

CREATE OR REPLACE FUNCTION pull_changes(
  last_pulled_at BIGINT,
  schema_version INT,
  migration JSONB,
  device_id_param TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  current_ts BIGINT;
  last_pulled BIGINT;
BEGIN
  current_ts := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
  last_pulled := COALESCE(last_pulled_at, 0);
  
  RAISE NOTICE 'Pulling changes - Last pulled: %, Current: %, Device: %', last_pulled, current_ts, device_id_param;
  
  result := jsonb_build_object(
    'changes', jsonb_build_object(
      'habit_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', h.id,
                'category', h.category,
                'activity', h.activity,
                'started_at', h.started_at,
                'ended_at', h.ended_at,
                'duration', h.duration,
                'notes', h.notes,
                'is_synced', true,
                'created_at', h.created_at,
                'updated_at', h.updated_at
              )
            ) FROM habit_logs h 
            WHERE h.created_at > last_pulled 
            AND (h.deleted_at IS NULL OR h.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'updated', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', h.id,
                'category', h.category,
                'activity', h.activity,
                'started_at', h.started_at,
                'ended_at', h.ended_at,
                'duration', h.duration,
                'notes', h.notes,
                'is_synced', true,
                'created_at', h.created_at,
                'updated_at', h.updated_at
              )
            ) FROM habit_logs h 
            WHERE h.updated_at > last_pulled 
            AND h.created_at <= last_pulled 
            AND (h.deleted_at IS NULL OR h.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'deleted', COALESCE(
            (SELECT jsonb_agg(h.id) FROM habit_logs h 
            WHERE h.deleted_at > last_pulled 
            AND h.deleted_at IS NOT NULL
            ), '[]'::jsonb
          )
        )
      ),
      'finance_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', f.id,
                'transaction_type', f.transaction_type,
                'location', f.location,
                'item', f.item,
                'quantity', f.quantity,
                'cost', f.cost,
                'total_cost', f.total_cost,
                'currency', f.currency,
                'type_category', f.type_category,
                'transaction_date', f.transaction_date,
                'notes', f.notes,
                'is_synced', true,
                'created_at', f.created_at,
                'updated_at', f.updated_at
              )
            ) FROM finance_logs f 
            WHERE f.created_at > last_pulled 
            AND (f.deleted_at IS NULL OR f.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'updated', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', f.id,
                'transaction_type', f.transaction_type,
                'location', f.location,
                'item', f.item,
                'quantity', f.quantity,
                'cost', f.cost,
                'total_cost', f.total_cost,
                'currency', f.currency,
                'type_category', f.type_category,
                'transaction_date', f.transaction_date,
                'notes', f.notes,
                'is_synced', true,
                'created_at', f.created_at,
                'updated_at', f.updated_at
              )
            ) FROM finance_logs f 
            WHERE f.updated_at > last_pulled 
            AND f.created_at <= last_pulled 
            AND (f.deleted_at IS NULL OR f.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'deleted', COALESCE(
            (SELECT jsonb_agg(f.id) FROM finance_logs f 
            WHERE f.deleted_at > last_pulled 
            AND f.deleted_at IS NOT NULL
            ), '[]'::jsonb
          )
        )
      ),
      'diary_entries', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', d.id,
                'title', d.title,
                'content', d.content,
                'entry_date', d.entry_date,
                'mood', d.mood,
                'is_synced', true,
                'created_at', d.created_at,
                'updated_at', d.updated_at
              )
            ) FROM diary_entries d 
            WHERE d.created_at > last_pulled 
            AND (d.deleted_at IS NULL OR d.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'updated', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', d.id,
                'title', d.title,
                'content', d.content,
                'entry_date', d.entry_date,
                'mood', d.mood,
                'is_synced', true,
                'created_at', d.created_at,
                'updated_at', d.updated_at
              )
            ) FROM diary_entries d 
            WHERE d.updated_at > last_pulled 
            AND d.created_at <= last_pulled 
            AND (d.deleted_at IS NULL OR d.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'deleted', COALESCE(
            (SELECT jsonb_agg(d.id) FROM diary_entries d 
            WHERE d.deleted_at > last_pulled 
            AND d.deleted_at IS NOT NULL
            ), '[]'::jsonb
          )
        )
      ),
      'diary_images', (
        SELECT jsonb_build_object(
          'created', COALESCE('[]'::jsonb, '[]'::jsonb),
          'updated', COALESCE('[]'::jsonb, '[]'::jsonb),
          'deleted', COALESCE('[]'::jsonb, '[]'::jsonb)
        )
      ),
      'leisure_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', l.id,
                'type', l.type,
                'title', l.title,
                'started_at', l.started_at,
                'ended_at', l.ended_at,
                'duration', l.duration,
                'notes', l.notes,
                'is_synced', true,
                'created_at', l.created_at,
                'updated_at', l.updated_at
              )
            ) FROM leisure_logs l 
            WHERE l.created_at > last_pulled 
            AND (l.deleted_at IS NULL OR l.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'updated', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', l.id,
                'type', l.type,
                'title', l.title,
                'started_at', l.started_at,
                'ended_at', l.ended_at,
                'duration', l.duration,
                'notes', l.notes,
                'is_synced', true,
                'created_at', l.created_at,
                'updated_at', l.updated_at
              )
            ) FROM leisure_logs l 
            WHERE l.updated_at > last_pulled 
            AND l.created_at <= last_pulled 
            AND (l.deleted_at IS NULL OR l.deleted_at = 0)
            ), '[]'::jsonb
          ),
          'deleted', COALESCE(
            (SELECT jsonb_agg(l.id) FROM leisure_logs l 
            WHERE l.deleted_at > last_pulled 
            AND l.deleted_at IS NOT NULL
            ), '[]'::jsonb
          )
        )
      )
    ),
    'timestamp', current_ts
  );
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION pull_changes TO authenticated, anon;