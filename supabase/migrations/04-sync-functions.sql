-- supabase/migrations/04-sync-functions.sql
-- WatermelonDB Sync Functions for Supabase

-- ==========================================
-- PULL CHANGES FUNCTION
-- ==========================================
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
BEGIN
  current_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
  
  -- Build changes object for each table
  result := jsonb_build_object(
    'changes', jsonb_build_object(
      'habit_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(jsonb_agg(to_jsonb(h.*)) FILTER (WHERE h.created_at > last_pulled_at AND h.deleted_at IS NULL), '[]'::jsonb),
          'updated', COALESCE(jsonb_agg(to_jsonb(h.*)) FILTER (WHERE h.updated_at > last_pulled_at AND h.created_at <= last_pulled_at AND h.deleted_at IS NULL), '[]'::jsonb),
          'deleted', COALESCE(jsonb_agg(h.id) FILTER (WHERE h.deleted_at > last_pulled_at), '[]'::jsonb)
        )
        FROM habit_logs h
        WHERE h.device_id != device_id_param OR h.device_id IS NULL
      ),
      'finance_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(jsonb_agg(to_jsonb(f.*)) FILTER (WHERE f.created_at > last_pulled_at AND f.deleted_at IS NULL), '[]'::jsonb),
          'updated', COALESCE(jsonb_agg(to_jsonb(f.*)) FILTER (WHERE f.updated_at > last_pulled_at AND f.created_at <= last_pulled_at AND f.deleted_at IS NULL), '[]'::jsonb),
          'deleted', COALESCE(jsonb_agg(f.id) FILTER (WHERE f.deleted_at > last_pulled_at), '[]'::jsonb)
        )
        FROM finance_logs f
        WHERE f.device_id != device_id_param OR f.device_id IS NULL
      ),
      'diary_entries', (
        SELECT jsonb_build_object(
          'created', COALESCE(jsonb_agg(to_jsonb(d.*)) FILTER (WHERE d.created_at > last_pulled_at AND d.deleted_at IS NULL), '[]'::jsonb),
          'updated', COALESCE(jsonb_agg(to_jsonb(d.*)) FILTER (WHERE d.updated_at > last_pulled_at AND d.created_at <= last_pulled_at AND d.deleted_at IS NULL), '[]'::jsonb),
          'deleted', COALESCE(jsonb_agg(d.id) FILTER (WHERE d.deleted_at > last_pulled_at), '[]'::jsonb)
        )
        FROM diary_entries d
        WHERE d.device_id != device_id_param OR d.device_id IS NULL
      ),
      'leisure_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(jsonb_agg(to_jsonb(l.*)) FILTER (WHERE l.created_at > last_pulled_at AND l.deleted_at IS NULL), '[]'::jsonb),
          'updated', COALESCE(jsonb_agg(to_jsonb(l.*)) FILTER (WHERE l.updated_at > last_pulled_at AND l.created_at <= last_pulled_at AND l.deleted_at IS NULL), '[]'::jsonb),
          'deleted', COALESCE(jsonb_agg(l.id) FILTER (WHERE l.deleted_at > last_pulled_at), '[]'::jsonb)
        )
        FROM leisure_logs l
        WHERE l.device_id != device_id_param OR l.device_id IS NULL
      )
    ),
    'timestamp', current_timestamp
  );
  
  RETURN result;
END;
$$;

-- ==========================================
-- PUSH CHANGES FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION push_changes(
  changes JSONB,
  last_pulled_at BIGINT,
  device_id_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_name TEXT;
  table_changes JSONB;
  record JSONB;
  record_id TEXT;
BEGIN
  -- Loop through each table in changes
  FOR table_name, table_changes IN SELECT * FROM jsonb_each(changes)
  LOOP
    -- Process created records
    IF table_changes ? 'created' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'created')
      LOOP
        EXECUTE format(
          'INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, $1) ON CONFLICT (id) DO NOTHING',
          table_name, table_name
        ) USING record || jsonb_build_object('device_id', device_id_param);
      END LOOP;
    END IF;
    
    -- Process updated records
    IF table_changes ? 'updated' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'updated')
      LOOP
        EXECUTE format(
          'UPDATE %I SET %s WHERE id = $1',
          table_name,
          (
            SELECT string_agg(format('%I = $2->>%L', key, key), ', ')
            FROM jsonb_object_keys(record) key
            WHERE key != 'id'
          )
        ) USING record->>'id', record;
      END LOOP;
    END IF;
    
    -- Process deleted records
    IF table_changes ? 'deleted' THEN
      FOR record_id IN SELECT * FROM jsonb_array_elements_text(table_changes->'deleted')
      LOOP
        EXECUTE format(
          'UPDATE %I SET deleted_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE id = $1',
          table_name
        ) USING record_id;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION pull_changes TO authenticated, anon;
GRANT EXECUTE ON FUNCTION push_changes TO authenticated, anon;