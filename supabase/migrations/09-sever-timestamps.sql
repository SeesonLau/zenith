DROP FUNCTION IF EXISTS push_changes(JSONB, BIGINT, TEXT);

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
  server_timestamp BIGINT;
BEGIN
  -- Use SERVER timestamp for all updates (prevents clock skew)
  server_timestamp := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  
  FOR table_name, table_changes IN SELECT * FROM jsonb_each(changes)
  LOOP
    IF table_name = 'sync_metadata' THEN
      RAISE NOTICE 'Skipping sync_metadata (local-only table)';
      CONTINUE;
    END IF;

    IF table_changes ? 'created' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'created')
      LOOP
        CASE table_name
          WHEN 'habit_logs' THEN
            INSERT INTO habit_logs (
              id, category, activity, started_at, ended_at, duration, 
              notes, is_synced, device_id, created_at, updated_at
            ) VALUES (
              record->>'id',
              record->>'category',
              record->>'activity',
              (record->>'started_at')::BIGINT,
              CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN (record->>'ended_at')::BIGINT
                ELSE NULL END,
              (record->>'duration')::BIGINT,
              record->>'notes',
              true,
              device_id_param,
              (record->>'created_at')::BIGINT,
              server_timestamp  -- ← Use server time
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
              updated_at = server_timestamp;  -- ← Use server time

          WHEN 'finance_logs' THEN
            INSERT INTO finance_logs (
              id, transaction_type, location, item, quantity, cost, 
              total_cost, currency, type_category, transaction_date, 
              notes, is_synced, device_id, created_at, updated_at
            ) VALUES (
              record->>'id',
              record->>'transaction_type',
              record->>'location',
              record->>'item',
              (record->>'quantity')::NUMERIC,
              (record->>'cost')::NUMERIC,
              (record->>'total_cost')::NUMERIC,
              record->>'currency',
              record->>'type_category',
              (record->>'transaction_date')::BIGINT,
              record->>'notes',
              true,
              device_id_param,
              (record->>'created_at')::BIGINT,
              server_timestamp
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
              updated_at = server_timestamp;

          WHEN 'diary_entries' THEN
            INSERT INTO diary_entries (
              id, title, content, entry_date, mood, 
              is_synced, device_id, created_at, updated_at
            ) VALUES (
              record->>'id',
              record->>'title',
              record->>'content',
              (record->>'entry_date')::BIGINT,
              record->>'mood',
              true,
              device_id_param,
              (record->>'created_at')::BIGINT,
              server_timestamp
            )
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              entry_date = EXCLUDED.entry_date,
              mood = EXCLUDED.mood,
              is_synced = true,
              device_id = EXCLUDED.device_id,
              updated_at = server_timestamp;

          WHEN 'diary_images' THEN
            INSERT INTO diary_images (
              id, diary_entry_id, local_uri, remote_url, upload_status,
              file_size, mime_type, is_synced, created_at, updated_at
            ) VALUES (
              record->>'id',
              record->>'diary_entry_id',
              record->>'local_uri',
              record->>'remote_url',
              record->>'upload_status',
              (record->>'file_size')::BIGINT,
              record->>'mime_type',
              true,
              (record->>'created_at')::BIGINT,
              server_timestamp
            )
            ON CONFLICT (id) DO UPDATE SET
              diary_entry_id = EXCLUDED.diary_entry_id,
              local_uri = EXCLUDED.local_uri,
              remote_url = EXCLUDED.remote_url,
              upload_status = EXCLUDED.upload_status,
              file_size = EXCLUDED.file_size,
              mime_type = EXCLUDED.mime_type,
              is_synced = true,
              updated_at = server_timestamp;

          WHEN 'leisure_logs' THEN
            INSERT INTO leisure_logs (
              id, type, title, started_at, ended_at, duration,
              notes, is_synced, device_id, created_at, updated_at
            ) VALUES (
              record->>'id',
              record->>'type',
              record->>'title',
              (record->>'started_at')::BIGINT,
              CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN (record->>'ended_at')::BIGINT
                ELSE NULL END,
              (record->>'duration')::BIGINT,
              record->>'notes',
              true,
              device_id_param,
              (record->>'created_at')::BIGINT,
              server_timestamp
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
              updated_at = server_timestamp;
        END CASE;
      END LOOP;
    END IF;

    IF table_changes ? 'updated' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'updated')
      LOOP
        CASE table_name
          WHEN 'habit_logs' THEN
            UPDATE habit_logs SET
              category = record->>'category',
              activity = record->>'activity',
              started_at = (record->>'started_at')::BIGINT,
              ended_at = CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN (record->>'ended_at')::BIGINT
                ELSE NULL END,
              duration = (record->>'duration')::BIGINT,
              notes = record->>'notes',
              is_synced = true,
              device_id = device_id_param,
              updated_at = server_timestamp  -- ← Use server time
            WHERE id = record->>'id';

          WHEN 'finance_logs' THEN
            UPDATE finance_logs SET
              transaction_type = record->>'transaction_type',
              location = record->>'location',
              item = record->>'item',
              quantity = (record->>'quantity')::NUMERIC,
              cost = (record->>'cost')::NUMERIC,
              total_cost = (record->>'total_cost')::NUMERIC,
              currency = record->>'currency',
              type_category = record->>'type_category',
              transaction_date = (record->>'transaction_date')::BIGINT,
              notes = record->>'notes',
              is_synced = true,
              device_id = device_id_param,
              updated_at = server_timestamp
            WHERE id = record->>'id';

          WHEN 'diary_entries' THEN
            UPDATE diary_entries SET
              title = record->>'title',
              content = record->>'content',
              entry_date = (record->>'entry_date')::BIGINT,
              mood = record->>'mood',
              is_synced = true,
              device_id = device_id_param,
              updated_at = server_timestamp
            WHERE id = record->>'id';

          WHEN 'diary_images' THEN
            UPDATE diary_images SET
              diary_entry_id = record->>'diary_entry_id',
              local_uri = record->>'local_uri',
              remote_url = record->>'remote_url',
              upload_status = record->>'upload_status',
              file_size = (record->>'file_size')::BIGINT,
              mime_type = record->>'mime_type',
              is_synced = true,
              updated_at = server_timestamp
            WHERE id = record->>'id';

          WHEN 'leisure_logs' THEN
            UPDATE leisure_logs SET
              type = record->>'type',
              title = record->>'title',
              started_at = (record->>'started_at')::BIGINT,
              ended_at = CASE WHEN record->>'ended_at' IS NOT NULL 
                THEN (record->>'ended_at')::BIGINT
                ELSE NULL END,
              duration = (record->>'duration')::BIGINT,
              notes = record->>'notes',
              is_synced = true,
              device_id = device_id_param,
              updated_at = server_timestamp
            WHERE id = record->>'id';
        END CASE;
      END LOOP;
    END IF;

    IF table_changes ? 'deleted' THEN
      FOR record IN SELECT * FROM jsonb_array_elements(table_changes->'deleted')
      LOOP
        CASE table_name
          WHEN 'habit_logs' THEN DELETE FROM habit_logs WHERE id = record::TEXT;
          WHEN 'finance_logs' THEN DELETE FROM finance_logs WHERE id = record::TEXT;
          WHEN 'diary_entries' THEN DELETE FROM diary_entries WHERE id = record::TEXT;
          WHEN 'diary_images' THEN DELETE FROM diary_images WHERE id = record::TEXT;
          WHEN 'leisure_logs' THEN DELETE FROM leisure_logs WHERE id = record::TEXT;
        END CASE;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION push_changes TO authenticated, anon;