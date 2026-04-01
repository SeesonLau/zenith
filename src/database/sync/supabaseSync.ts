// src/database/sync/supabaseSync.ts (FIXED - FILTERS OUT SYNC_METADATA)
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../index';
import { supabase, getDeviceId } from '../../lib/supabase';

interface SyncResult {
  success: boolean;
  error?: any;
  changes?: {
    pulled: {
      created: number;
      updated: number;
      deleted: number;
    };
    pushed: {
      created: number;
      updated: number;
      deleted: number;
    };
  };
}

/**
 * Filter out sync_metadata from changes before pushing
 * sync_metadata is device-local only and should NEVER be synced
 */
function filterSyncMetadata(changes: any): any {
  if (!changes) return changes;

  const filtered = { ...changes };

  if (filtered.sync_metadata) {
    if (__DEV__) console.log('🚫 Filtering out sync_metadata from push (local-only table)');
    delete filtered.sync_metadata;
  }
  
  return filtered;
}

export async function syncWithSupabase(): Promise<SyncResult> {
  const changes = {
    pulled: { created: 0, updated: 0, deleted: 0 },
    pushed: { created: 0, updated: 0, deleted: 0 },
  };

  try {
    if (__DEV__) console.log('🔄 Starting sync...');

    const deviceId = await getDeviceId();
    if (__DEV__) console.log('📱 Device ID:', deviceId);

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        if (__DEV__) {
          console.log('⬇️ Pulling changes from server...');
          console.log('📅 Last pulled at:', lastPulledAt ? new Date(lastPulledAt).toISOString() : 'Never');
          console.log('🔢 Last pulled at (raw):', lastPulledAt);
          console.log('📋 Schema version:', schemaVersion);
        }

        const { data, error } = await supabase.rpc('pull_changes', {
          last_pulled_at: lastPulledAt || 0,
          schema_version: schemaVersion,
          migration: migration || null,
          device_id_param: deviceId,
        });

        if (error) {
          if (__DEV__) console.error('❌ Pull error:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint);
          throw new Error(`Pull failed: ${error.message ?? JSON.stringify(error)}`);
        }

        if (__DEV__) {
          console.log('🔍 Pull received:');
          console.log('  💰 Finance:', data?.changes?.finance_logs?.created?.length || 0);
          console.log('  ⏱️  Habits:', data?.changes?.habit_logs?.created?.length || 0);
          console.log('  📔 Diary:', data?.changes?.diary_entries?.created?.length || 0);
          console.log('  🎮 Leisure:', data?.changes?.leisure_logs?.created?.length || 0);
          if (data?.changes?.sync_metadata) {
            console.warn('⚠️ sync_metadata found in pull response');
          }
        }
        
        // Log first finance record to verify structure (dev only — contains personal data)
        if (__DEV__ && data?.changes?.finance_logs?.created?.length > 0) {
          console.log('📦 First finance record structure:');
          console.log(JSON.stringify(data.changes.finance_logs.created[0], null, 2));
        }

        // Count changes (excluding sync_metadata)
        if (data && data.changes) {
          Object.entries(data.changes).forEach(([tableName, tableChanges]: [string, any]) => {
            if (tableName === 'sync_metadata') {
              console.warn('⚠️ Skipping sync_metadata in pull count');
              return;
            }
            changes.pulled.created += tableChanges.created?.length || 0;
            changes.pulled.updated += tableChanges.updated?.length || 0;
            changes.pulled.deleted += tableChanges.deleted?.length || 0;
          });
        }

        if (__DEV__) console.log('✅ Pull successful — pulled:', changes.pulled);

        // Normalize pull response: move all `created` records into `updated`.
        // sendCreatedAsUpdated: true handles `updated` records that don't exist locally
        // by creating them — so this is safe. Without this, WatermelonDB logs a
        // diagnostic warning because it expects only `updated` when that flag is set.
        const rawChanges = data.changes as Record<string, { created: any[]; updated: any[]; deleted: string[] }>;
        for (const tableChanges of Object.values(rawChanges ?? {})) {
          if (tableChanges.created?.length) {
            tableChanges.updated = [...(tableChanges.updated ?? []), ...tableChanges.created];
            tableChanges.created = [];
          }
        }

        return {
          changes: data.changes,
          timestamp: data.timestamp,
        };
      },
      pushChanges: async ({ changes: localChanges, lastPulledAt }) => {
        if (__DEV__) console.log('⬆️ Pushing changes to server...');

        // CRITICAL: Filter out sync_metadata before pushing
        const filteredChanges = filterSyncMetadata(localChanges);

        // Count local changes (after filtering)
        if (filteredChanges) {
          Object.entries(filteredChanges).forEach(([_tableName, tableChanges]: [string, any]) => {
            changes.pushed.created += tableChanges.created?.length || 0;
            changes.pushed.updated += tableChanges.updated?.length || 0;
            changes.pushed.deleted += tableChanges.deleted?.length || 0;
          });
        }

        if (__DEV__) console.log('📤 Pushing:', changes.pushed);

        if (changes.pushed.created === 0 &&
            changes.pushed.updated === 0 &&
            changes.pushed.deleted === 0) {
          if (__DEV__) console.log('✅ No changes to push');
          return;
        }

        const { error } = await supabase.rpc('push_changes', {
          changes: filteredChanges,
          last_pulled_at: lastPulledAt || 0,
          device_id_param: deviceId,
        });

        if (error) {
          if (__DEV__) console.error('❌ Push error:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint);
          throw new Error(`Push failed: ${error.message ?? JSON.stringify(error)}`);
        }

        if (__DEV__) console.log('✅ Push successful');
      },
      migrationsEnabledAtVersion: 5,
      sendCreatedAsUpdated: true,
    });

    if (__DEV__) console.log('✅ Sync completed — pulled:', changes.pulled, 'pushed:', changes.pushed);

    return {
      success: true,
      changes,
    };
  } catch (error: any) {
    if (__DEV__) console.error('❌ Sync failed:', error?.message ?? error);
    return {
      success: false,
      error,
      changes,
    };
  }
}