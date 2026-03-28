-- supabase/migrations/08-fix-sync-metadata.sql
-- Fix sync_metadata to be device-local only (never synced)

-- Step 1: Drop sync_metadata from server (it should only exist locally)
DROP TABLE IF EXISTS sync_metadata CASCADE;

-- Step 2: Remove sync_metadata from push_changes function
CREATE OR REPLACE FUNCTION push_changes(
  changes JSONB,
  last_pulled_at BIGINT,
  device_id_param TEXT
) RETURNS VOID AS $$
DECLARE
  table_name TEXT;
  table_changes JSONB;
  record JSONB;
BEGIN
  -- Iterate through each table in changes
  FOR table_name, table_changes IN SELECT * FROM jsonb_each(changes)
  LOOP
    -- SKIP sync_metadata - it should never be synced!
    IF table_name = 'sync_metadata' THEN
      RAISE NOTICE 'Skipping sync_metadata (local-only table)';
      CONTINUE;
    END IF;

    -- Process created records
    IF table_changes ? 'created' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'created')
      LOOP
        -- Insert based on table
        CASE table_name
          WHEN 'habit_logs' THEN
            INSERT INTO habit_logs (
              id, category, activity, started_at, ended_at, duration, 
              notes, is_synced, device_id, created_at, updated_at
            ) VALUES (
              (record->>'id')::UUID,
              record->>'category',
              record->>'activity',
              to_timestamp((record->>'started_at')::BIGINT / 1000),
              CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN to_timestamp((record->>'ended_at')::BIGINT / 1000) 
                ELSE NULL END,
              (record->>'duration')::INTEGER,
              record->>'notes',
              true,
              device_id_param,
              to_timestamp((record->>'created_at')::BIGINT / 1000),
              to_timestamp((record->>'updated_at')::BIGINT / 1000)
            )
            ON CONFLICT (id) DO UPDATE SET
              category = EXCLUDED.category,
              activity = EXCLUDED.activity,
              started_at = EXCLUDED.started_at,
              ended_at = EXCLUDED.ended_at,
              duration = EXCLUDED.duration,
              notes = EXCLUDED.notes,
              is_synced = true,
              device_id = EXCLUDED.device_id,
              updated_at = EXCLUDED.updated_at;

          WHEN 'finance_logs' THEN
            INSERT INTO finance_logs (
              id, transaction_type, location, item, quantity, cost, 
              total_cost, currency, type_category, transaction_date, 
              notes, is_synced, device_id, created_at, updated_at
            ) VALUES (
              (record->>'id')::UUID,
              record->>'transaction_type',
              record->>'location',
              record->>'item',
              (record->>'quantity')::INTEGER,
              (record->>'cost')::NUMERIC,
              (record->>'total_cost')::NUMERIC,
              record->>'currency',
              record->>'type_category',
              to_timestamp((record->>'transaction_date')::BIGINT / 1000),
              record->>'notes',
              true,
              device_id_param,
              to_timestamp((record->>'created_at')::BIGINT / 1000),
              to_timestamp((record->>'updated_at')::BIGINT / 1000)
            )
            ON CONFLICT (id) DO UPDATE SET
              transaction_type = EXCLUDED.transaction_type,
              location = EXCLUDED.location,
              item = EXCLUDED.item,
              quantity = EXCLUDED.quantity,
              cost = EXCLUDED.cost,
              total_cost = EXCLUDED.total_cost,
              currency = EXCLUDED.currency,
              type_category = EXCLUDED.type_category,
              transaction_date = EXCLUDED.transaction_date,
              notes = EXCLUDED.notes,
              is_synced = true,
              device_id = EXCLUDED.device_id,
              updated_at = EXCLUDED.updated_at;

          WHEN 'diary_entries' THEN
            INSERT INTO diary_entries (
              id, title, content, entry_date, mood, 
              is_synced, device_id, created_at, updated_at
            ) VALUES (
              (record->>'id')::UUID,
              record->>'title',
              record->>'content',
              to_timestamp((record->>'entry_date')::BIGINT / 1000),
              record->>'mood',
              true,
              device_id_param,
              to_timestamp((record->>'created_at')::BIGINT / 1000),
              to_timestamp((record->>'updated_at')::BIGINT / 1000)
            )
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              entry_date = EXCLUDED.entry_date,
              mood = EXCLUDED.mood,
              is_synced = true,
              device_id = EXCLUDED.device_id,
              updated_at = EXCLUDED.updated_at;

          WHEN 'diary_images' THEN
            INSERT INTO diary_images (
              id, diary_entry_id, local_uri, remote_url, upload_status,
              file_size, mime_type, is_synced, created_at, updated_at
            ) VALUES (
              (record->>'id')::UUID,
              (record->>'diary_entry_id')::UUID,
              record->>'local_uri',
              record->>'remote_url',
              record->>'upload_status',
              (record->>'file_size')::INTEGER,
              record->>'mime_type',
              true,
              to_timestamp((record->>'created_at')::BIGINT / 1000),
              to_timestamp((record->>'updated_at')::BIGINT / 1000)
            )
            ON CONFLICT (id) DO UPDATE SET
              diary_entry_id = EXCLUDED.diary_entry_id,
              local_uri = EXCLUDED.local_uri,
              remote_url = EXCLUDED.remote_url,
              upload_status = EXCLUDED.upload_status,
              file_size = EXCLUDED.file_size,
              mime_type = EXCLUDED.mime_type,
              is_synced = true,
              updated_at = EXCLUDED.updated_at;

          WHEN 'leisure_logs' THEN
            INSERT INTO leisure_logs (
              id, type, title, started_at, ended_at, duration,
              notes, is_synced, device_id, created_at, updated_at
            ) VALUES (
              (record->>'id')::UUID,
              record->>'type',
              record->>'title',
              to_timestamp((record->>'started_at')::BIGINT / 1000),
              CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN to_timestamp((record->>'ended_at')::BIGINT / 1000) 
                ELSE NULL END,
              (record->>'duration')::INTEGER,
              record->>'notes',
              true,
              device_id_param,
              to_timestamp((record->>'created_at')::BIGINT / 1000),
              to_timestamp((record->>'updated_at')::BIGINT / 1000)
            )
            ON CONFLICT (id) DO UPDATE SET
              type = EXCLUDED.type,
              title = EXCLUDED.title,
              started_at = EXCLUDED.started_at,
              ended_at = EXCLUDED.ended_at,
              duration = EXCLUDED.duration,
              notes = EXCLUDED.notes,
              is_synced = true,
              device_id = EXCLUDED.device_id,
              updated_at = EXCLUDED.updated_at;

        END CASE;
      END LOOP;
    END IF;

    -- Process updated records (similar to created, but records already exist)
    IF table_changes ? 'updated' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'updated')
      LOOP
        -- Similar INSERT ... ON CONFLICT DO UPDATE for each table
        -- (Same as above, marking as synced)
        CASE table_name
          WHEN 'habit_logs' THEN
            UPDATE habit_logs SET
              category = record->>'category',
              activity = record->>'activity',
              started_at = to_timestamp((record->>'started_at')::BIGINT / 1000),
              ended_at = CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN to_timestamp((record->>'ended_at')::BIGINT / 1000) 
                ELSE NULL END,
              duration = (record->>'duration')::INTEGER,
              notes = record->>'notes',
              is_synced = true,
              device_id = device_id_param,
              updated_at = to_timestamp((record->>'updated_at')::BIGINT / 1000)
            WHERE id = (record->>'id')::UUID;

          WHEN 'finance_logs' THEN
            UPDATE finance_logs SET
              transaction_type = record->>'transaction_type',
              location = record->>'location',
              item = record->>'item',
              quantity = (record->>'quantity')::INTEGER,
              cost = (record->>'cost')::NUMERIC,
              total_cost = (record->>'total_cost')::NUMERIC,
              currency = record->>'currency',
              type_category = record->>'type_category',
              transaction_date = to_timestamp((record->>'transaction_date')::BIGINT / 1000),
              notes = record->>'notes',
              is_synced = true,
              device_id = device_id_param,
              updated_at = to_timestamp((record->>'updated_at')::BIGINT / 1000)
            WHERE id = (record->>'id')::UUID;

          WHEN 'diary_entries' THEN
            UPDATE diary_entries SET
              title = record->>'title',
              content = record->>'content',
              entry_date = to_timestamp((record->>'entry_date')::BIGINT / 1000),
              mood = record->>'mood',
              is_synced = true,
              device_id = device_id_param,
              updated_at = to_timestamp((record->>'updated_at')::BIGINT / 1000)
            WHERE id = (record->>'id')::UUID;

          WHEN 'diary_images' THEN
            UPDATE diary_images SET
              diary_entry_id = (record->>'diary_entry_id')::UUID,
              local_uri = record->>'local_uri',
              remote_url = record->>'remote_url',
              upload_status = record->>'upload_status',
              file_size = (record->>'file_size')::INTEGER,
              mime_type = record->>'mime_type',
              is_synced = true,
              updated_at = to_timestamp((record->>'updated_at')::BIGINT / 1000)
            WHERE id = (record->>'id')::UUID;

          WHEN 'leisure_logs' THEN
            UPDATE leisure_logs SET
              type = record->>'type',
              title = record->>'title',
              started_at = to_timestamp((record->>'started_at')::BIGINT / 1000),
              ended_at = CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN to_timestamp((record->>'ended_at')::BIGINT / 1000) 
                ELSE NULL END,
              duration = (record->>'duration')::INTEGER,
              notes = record->>'notes',
              is_synced = true,
              device_id = device_id_param,
              updated_at = to_timestamp((record->>'updated_at')::BIGINT / 1000)
            WHERE id = (record->>'id')::UUID;

        END CASE;
      END LOOP;
    END IF;

    -- Process deleted records
    IF table_changes ? 'deleted' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'deleted')
      LOOP
        CASE table_name
          WHEN 'habit_logs' THEN
            DELETE FROM habit_logs WHERE id = record::TEXT::UUID;
          WHEN 'finance_logs' THEN
            DELETE FROM finance_logs WHERE id = record::TEXT::UUID;
          WHEN 'diary_entries' THEN
            DELETE FROM diary_entries WHERE id = record::TEXT::UUID;
          WHEN 'diary_images' THEN
            DELETE FROM diary_images WHERE id = record::TEXT::UUID;
          WHEN 'leisure_logs' THEN
            DELETE FROM leisure_logs WHERE id = record::TEXT::UUID;
        END CASE;
      END LOOP;
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Update pull_changes to exclude sync_metadata
CREATE OR REPLACE FUNCTION pull_changes(
  last_pulled_at BIGINT,
  schema_version INTEGER,
  migration JSONB,
  device_id_param TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  current_timestamp BIGINT;
BEGIN
  current_timestamp := extract(epoch from now()) * 1000;

  -- Build the response - EXCLUDING sync_metadata
  result := jsonb_build_object(
    'changes', jsonb_build_object(
      'habit_logs', jsonb_build_object(
        'created', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'category', category,
              'activity', activity,
              'started_at', extract(epoch from started_at) * 1000,
              'ended_at', CASE WHEN ended_at IS NOT NULL 
                THEN extract(epoch from ended_at) * 1000 
                ELSE NULL END,
              'duration', duration,
              'notes', notes,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM habit_logs 
          WHERE extract(epoch from created_at) * 1000 > last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'updated', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'category', category,
              'activity', activity,
              'started_at', extract(epoch from started_at) * 1000,
              'ended_at', CASE WHEN ended_at IS NOT NULL 
                THEN extract(epoch from ended_at) * 1000 
                ELSE NULL END,
              'duration', duration,
              'notes', notes,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM habit_logs 
          WHERE extract(epoch from updated_at) * 1000 > last_pulled_at
            AND extract(epoch from created_at) * 1000 <= last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'deleted', '[]'::jsonb
      ),
      'finance_logs', jsonb_build_object(
        'created', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'transaction_type', transaction_type,
              'location', location,
              'item', item,
              'quantity', quantity,
              'cost', cost,
              'total_cost', total_cost,
              'currency', currency,
              'type_category', type_category,
              'transaction_date', extract(epoch from transaction_date) * 1000,
              'notes', notes,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM finance_logs 
          WHERE extract(epoch from created_at) * 1000 > last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'updated', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'transaction_type', transaction_type,
              'location', location,
              'item', item,
              'quantity', quantity,
              'cost', cost,
              'total_cost', total_cost,
              'currency', currency,
              'type_category', type_category,
              'transaction_date', extract(epoch from transaction_date) * 1000,
              'notes', notes,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM finance_logs 
          WHERE extract(epoch from updated_at) * 1000 > last_pulled_at
            AND extract(epoch from created_at) * 1000 <= last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'deleted', '[]'::jsonb
      ),
      'diary_entries', jsonb_build_object(
        'created', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'title', title,
              'content', content,
              'entry_date', extract(epoch from entry_date) * 1000,
              'mood', mood,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM diary_entries 
          WHERE extract(epoch from created_at) * 1000 > last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'updated', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'title', title,
              'content', content,
              'entry_date', extract(epoch from entry_date) * 1000,
              'mood', mood,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM diary_entries 
          WHERE extract(epoch from updated_at) * 1000 > last_pulled_at
            AND extract(epoch from created_at) * 1000 <= last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'deleted', '[]'::jsonb
      ),
      'diary_images', jsonb_build_object(
        'created', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'diary_entry_id', diary_entry_id::TEXT,
              'local_uri', local_uri,
              'remote_url', remote_url,
              'upload_status', upload_status,
              'file_size', file_size,
              'mime_type', mime_type,
              'is_synced', true,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM diary_images 
          WHERE extract(epoch from created_at) * 1000 > last_pulled_at
        ),
        'updated', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'diary_entry_id', diary_entry_id::TEXT,
              'local_uri', local_uri,
              'remote_url', remote_url,
              'upload_status', upload_status,
              'file_size', file_size,
              'mime_type', mime_type,
              'is_synced', true,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM diary_images 
          WHERE extract(epoch from updated_at) * 1000 > last_pulled_at
            AND extract(epoch from created_at) * 1000 <= last_pulled_at
        ),
        'deleted', '[]'::jsonb
      ),
      'leisure_logs', jsonb_build_object(
        'created', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'type', type,
              'title', title,
              'started_at', extract(epoch from started_at) * 1000,
              'ended_at', CASE WHEN ended_at IS NOT NULL 
                THEN extract(epoch from ended_at) * 1000 
                ELSE NULL END,
              'duration', duration,
              'notes', notes,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM leisure_logs 
          WHERE extract(epoch from created_at) * 1000 > last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'updated', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id::TEXT,
              'type', type,
              'title', title,
              'started_at', extract(epoch from started_at) * 1000,
              'ended_at', CASE WHEN ended_at IS NOT NULL 
                THEN extract(epoch from ended_at) * 1000 
                ELSE NULL END,
              'duration', duration,
              'notes', notes,
              'is_synced', true,
              'device_id', device_id,
              'created_at', extract(epoch from created_at) * 1000,
              'updated_at', extract(epoch from updated_at) * 1000
            )
          ), '[]'::jsonb)
          FROM leisure_logs 
          WHERE extract(epoch from updated_at) * 1000 > last_pulled_at
            AND extract(epoch from created_at) * 1000 <= last_pulled_at
            AND (device_id IS NULL OR device_id != device_id_param)
        ),
        'deleted', '[]'::jsonb
      )
      -- NOTE: sync_metadata is NOT included here - it's local-only!
    ),
    'timestamp', current_timestamp
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION pull_changes TO authenticated;
GRANT EXECUTE ON FUNCTION push_changes TO authenticated;