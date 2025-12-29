-- supabase/migrations/05-fix-pull-changes.sql
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
  current_timestamp BIGINT;
  last_pulled BIGINT;
BEGIN
  current_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
  last_pulled := COALESCE(last_pulled_at, 0);
  
  -- Log for debugging
  RAISE NOTICE 'Pulling changes - Last pulled: %, Current: %', last_pulled, current_timestamp;
  
  -- Build changes object for each table
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
                'is_synced', h.is_synced,
                'device_id', h.device_id,
                'deleted_at', h.deleted_at,
                'created_at', h.created_at,
                'updated_at', h.updated_at
              )
            ) FROM habit_logs h 
            WHERE h.created_at > last_pulled 
            AND (h.deleted_at IS NULL OR h.deleted_at = 0)
            AND (h.device_id != device_id_param OR h.device_id IS NULL)
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
                'is_synced', h.is_synced,
                'device_id', h.device_id,
                'deleted_at', h.deleted_at,
                'created_at', h.created_at,
                'updated_at', h.updated_at
              )
            ) FROM habit_logs h 
            WHERE h.updated_at > last_pulled 
            AND h.created_at <= last_pulled 
            AND (h.deleted_at IS NULL OR h.deleted_at = 0)
            AND (h.device_id != device_id_param OR h.device_id IS NULL)
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
                'is_synced', f.is_synced,
                'device_id', f.device_id,
                'deleted_at', f.deleted_at,
                'created_at', f.created_at,
                'updated_at', f.updated_at
              )
            ) FROM finance_logs f 
            WHERE f.created_at > last_pulled 
            AND (f.deleted_at IS NULL OR f.deleted_at = 0)
            AND (f.device_id != device_id_param OR f.device_id IS NULL)
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
                'is_synced', f.is_synced,
                'device_id', f.device_id,
                'deleted_at', f.deleted_at,
                'created_at', f.created_at,
                'updated_at', f.updated_at
              )
            ) FROM finance_logs f 
            WHERE f.updated_at > last_pulled 
            AND f.created_at <= last_pulled 
            AND (f.deleted_at IS NULL OR f.deleted_at = 0)
            AND (f.device_id != device_id_param OR f.device_id IS NULL)
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
                'is_synced', d.is_synced,
                'device_id', d.device_id,
                'deleted_at', d.deleted_at,
                'created_at', d.created_at,
                'updated_at', d.updated_at
              )
            ) FROM diary_entries d 
            WHERE d.created_at > last_pulled 
            AND (d.deleted_at IS NULL OR d.deleted_at = 0)
            AND (d.device_id != device_id_param OR d.device_id IS NULL)
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
                'is_synced', d.is_synced,
                'device_id', d.device_id,
                'deleted_at', d.deleted_at,
                'created_at', d.created_at,
                'updated_at', d.updated_at
              )
            ) FROM diary_entries d 
            WHERE d.updated_at > last_pulled 
            AND d.created_at <= last_pulled 
            AND (d.deleted_at IS NULL OR d.deleted_at = 0)
            AND (d.device_id != device_id_param OR d.device_id IS NULL)
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
          'created', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', di.id,
                'diary_entry_id', di.diary_entry_id,
                'local_uri', di.local_uri,
                'remote_url', di.remote_url,
                'upload_status', di.upload_status,
                'file_size', di.file_size,
                'mime_type', di.mime_type,
                'is_synced', di.is_synced,
                'device_id', di.device_id,
                'deleted_at', di.deleted_at,
                'created_at', di.created_at,
                'updated_at', di.updated_at
              )
            ) FROM diary_images di 
            WHERE di.created_at > last_pulled 
            AND (di.deleted_at IS NULL OR di.deleted_at = 0)
            AND (di.device_id != device_id_param OR di.device_id IS NULL)
            ), '[]'::jsonb
          ),
          'updated', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', di.id,
                'diary_entry_id', di.diary_entry_id,
                'local_uri', di.local_uri,
                'remote_url', di.remote_url,
                'upload_status', di.upload_status,
                'file_size', di.file_size,
                'mime_type', di.mime_type,
                'is_synced', di.is_synced,
                'device_id', di.device_id,
                'deleted_at', di.deleted_at,
                'created_at', di.created_at,
                'updated_at', di.updated_at
              )
            ) FROM diary_images di 
            WHERE di.updated_at > last_pulled 
            AND di.created_at <= last_pulled 
            AND (di.deleted_at IS NULL OR di.deleted_at = 0)
            AND (di.device_id != device_id_param OR di.device_id IS NULL)
            ), '[]'::jsonb
          ),
          'deleted', COALESCE(
            (SELECT jsonb_agg(di.id) FROM diary_images di 
            WHERE di.deleted_at > last_pulled 
            AND di.deleted_at IS NOT NULL
            ), '[]'::jsonb
          )
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
                'is_synced', l.is_synced,
                'device_id', l.device_id,
                'deleted_at', l.deleted_at,
                'created_at', l.created_at,
                'updated_at', l.updated_at
              )
            ) FROM leisure_logs l 
            WHERE l.created_at > last_pulled 
            AND (l.deleted_at IS NULL OR l.deleted_at = 0)
            AND (l.device_id != device_id_param OR l.device_id IS NULL)
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
                'is_synced', l.is_synced,
                'device_id', l.device_id,
                'deleted_at', l.deleted_at,
                'created_at', l.created_at,
                'updated_at', l.updated_at
              )
            ) FROM leisure_logs l 
            WHERE l.updated_at > last_pulled 
            AND l.created_at <= last_pulled 
            AND (l.deleted_at IS NULL OR l.deleted_at = 0)
            AND (l.device_id != device_id_param OR l.device_id IS NULL)
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
    'timestamp', current_timestamp
  );
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION pull_changes TO authenticated, anon;