-- supabase/migrations/05-timestamp-based-sync.sql
-- CORRECT: Use updated_at to determine which version wins

DROP FUNCTION IF EXISTS pull_changes CASCADE;
DROP FUNCTION IF EXISTS push_changes CASCADE;

-- ==========================================
-- PUSH: Always send local changes to Supabase
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
  existing_updated_at BIGINT;
  new_updated_at BIGINT;
BEGIN
  FOR table_name, table_changes IN SELECT * FROM jsonb_each(changes)
  LOOP
    
    -- CREATED records
    IF table_changes ? 'created' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'created')
      LOOP
        record := jsonb_set(record, '{device_id}', to_jsonb(device_id_param));
        
        -- Check if record already exists in Supabase
        EXECUTE format('SELECT updated_at FROM %I WHERE id = $1', table_name) 
          INTO existing_updated_at
          USING record->>'id';
        
        IF existing_updated_at IS NULL THEN
          -- Record doesn't exist, insert it
          EXECUTE format(
            'INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, $1)',
            table_name, table_name
          ) USING record;
          
          RAISE NOTICE 'Created % in %', record->>'id', table_name;
        ELSE
          -- Record exists, use updated_at to decide
          new_updated_at := (record->>'updated_at')::BIGINT;
          
          IF new_updated_at >= existing_updated_at THEN
            -- Local is newer, update Supabase
            EXECUTE format('DELETE FROM %I WHERE id = $1', table_name) 
              USING record->>'id';
            
            EXECUTE format(
              'INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, $1)',
              table_name, table_name
            ) USING record;
            
            RAISE NOTICE 'Overwrote % in % (local newer: % >= %)', 
              record->>'id', table_name, new_updated_at, existing_updated_at;
          ELSE
            RAISE NOTICE 'Skipped % in % (Supabase newer)', record->>'id', table_name;
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    -- UPDATED records (same logic as created)
    IF table_changes ? 'updated' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'updated')
      LOOP
        record := jsonb_set(record, '{device_id}', to_jsonb(device_id_param));
        new_updated_at := (record->>'updated_at')::BIGINT;
        
        -- Check existing timestamp
        EXECUTE format('SELECT updated_at FROM %I WHERE id = $1', table_name) 
          INTO existing_updated_at
          USING record->>'id';
        
        IF existing_updated_at IS NULL OR new_updated_at >= existing_updated_at THEN
          -- Local is newer or record doesn't exist, update Supabase
          EXECUTE format('DELETE FROM %I WHERE id = $1', table_name) 
            USING record->>'id';
          
          EXECUTE format(
            'INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, $1)',
            table_name, table_name
          ) USING record;
          
          RAISE NOTICE 'Updated % in % → duration: %, ended_at: %', 
            record->>'id', table_name, record->>'duration', record->>'ended_at';
        ELSE
          RAISE NOTICE 'Skipped update for % in % (Supabase newer)', 
            record->>'id', table_name;
        END IF;
      END LOOP;
    END IF;
    
    -- DELETED records
    IF table_changes ? 'deleted' THEN
      FOR record_id IN SELECT * FROM jsonb_array_elements_text(table_changes->'deleted')
      LOOP
        EXECUTE format(
          'UPDATE %I SET 
             deleted_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
             updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
           WHERE id = $1',
          table_name
        ) USING record_id;
        
        RAISE NOTICE 'Deleted % in %', record_id, table_name;
      END LOOP;
    END IF;
    
  END LOOP;
  
  RAISE NOTICE '✅ Push completed for device %', device_id_param;
END;
$$;

-- ==========================================
-- PULL: Get ALL records updated since last pull
-- (Including your own device's records)
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
  current_ts BIGINT;
  last_pull BIGINT;
BEGIN
  current_ts := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
  last_pull := COALESCE(last_pulled_at, 0);
  
  RAISE NOTICE 'Pulling changes since % (including own device)', 
    to_timestamp(last_pull / 1000);
  
  -- Pull ALL records updated since last_pulled_at
  -- WatermelonDB will handle conflicts using updated_at timestamps
  result := jsonb_build_object(
    'changes', jsonb_build_object(
      'habit_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            jsonb_agg(to_jsonb(h.*)) FILTER (
              WHERE h.updated_at > last_pull
                AND (h.deleted_at IS NULL OR h.deleted_at = 0)
            ), '[]'::jsonb),
          'updated', '[]'::jsonb,  -- WatermelonDB treats new records as creates
          'deleted', COALESCE(
            jsonb_agg(h.id) FILTER (
              WHERE h.deleted_at > last_pull 
                AND h.deleted_at IS NOT NULL
            ), '[]'::jsonb)
        )
        FROM habit_logs h
      ),
      'finance_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            jsonb_agg(to_jsonb(f.*)) FILTER (
              WHERE f.updated_at > last_pull
                AND (f.deleted_at IS NULL OR f.deleted_at = 0)
            ), '[]'::jsonb),
          'updated', '[]'::jsonb,
          'deleted', COALESCE(
            jsonb_agg(f.id) FILTER (
              WHERE f.deleted_at > last_pull 
                AND f.deleted_at IS NOT NULL
            ), '[]'::jsonb)
        )
        FROM finance_logs f
      ),
      'diary_entries', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            jsonb_agg(to_jsonb(d.*)) FILTER (
              WHERE d.updated_at > last_pull
                AND (d.deleted_at IS NULL OR d.deleted_at = 0)
            ), '[]'::jsonb),
          'updated', '[]'::jsonb,
          'deleted', COALESCE(
            jsonb_agg(d.id) FILTER (
              WHERE d.deleted_at > last_pull 
                AND d.deleted_at IS NOT NULL
            ), '[]'::jsonb)
        )
        FROM diary_entries d
      ),
      'diary_images', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            jsonb_agg(to_jsonb(di.*)) FILTER (
              WHERE di.updated_at > last_pull
                AND (di.deleted_at IS NULL OR di.deleted_at = 0)
            ), '[]'::jsonb),
          'updated', '[]'::jsonb,
          'deleted', COALESCE(
            jsonb_agg(di.id) FILTER (
              WHERE di.deleted_at > last_pull 
                AND di.deleted_at IS NOT NULL
            ), '[]'::jsonb)
        )
        FROM diary_images di
      ),
      'leisure_logs', (
        SELECT jsonb_build_object(
          'created', COALESCE(
            jsonb_agg(to_jsonb(l.*)) FILTER (
              WHERE l.updated_at > last_pull
                AND (l.deleted_at IS NULL OR l.deleted_at = 0)
            ), '[]'::jsonb),
          'updated', '[]'::jsonb,
          'deleted', COALESCE(
            jsonb_agg(l.id) FILTER (
              WHERE l.deleted_at > last_pull 
                AND l.deleted_at IS NOT NULL
            ), '[]'::jsonb)
        )
        FROM leisure_logs l
      )
    ),
    'timestamp', current_ts
  );
  
  RAISE NOTICE '✅ Pull completed';
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION pull_changes TO authenticated, anon;
GRANT EXECUTE ON FUNCTION push_changes TO authenticated, anon;

COMMENT ON FUNCTION push_changes IS 
'Pushes local changes. Uses updated_at timestamp to resolve conflicts - newer version wins.';

COMMENT ON FUNCTION pull_changes IS 
'Pulls ALL records (including own device). WatermelonDB sync handles conflicts using updated_at timestamps.';