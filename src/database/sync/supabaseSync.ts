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
  
  // Remove sync_metadata table from changes
  if (filtered.sync_metadata) {
    console.log('🚫 Filtering out sync_metadata from push (local-only table)');
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
    console.log('🔄 Starting sync...');

    const deviceId = await getDeviceId();
    console.log('📱 Device ID:', deviceId);

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        console.log('⬇️ Pulling changes from server...');
        console.log('📅 Last pulled at:', lastPulledAt ? new Date(lastPulledAt).toISOString() : 'Never');
        console.log('🔢 Last pulled at (raw):', lastPulledAt);
        console.log('📋 Schema version:', schemaVersion);

        const { data, error } = await supabase.rpc('pull_changes', {
          last_pulled_at: lastPulledAt || 0,
          schema_version: schemaVersion,
          migration: migration || null,
          device_id_param: deviceId,
        });

        if (error) {
          console.error('❌ Pull error:', error);
          throw error;
        }

        // DEBUG: Check what WatermelonDB will receive
        console.log('🔍 What WatermelonDB will receive:');
        console.log('  💰 Finance created:', data?.changes?.finance_logs?.created?.length || 0);
        console.log('  ⏱️  Habits created:', data?.changes?.habit_logs?.created?.length || 0);
        console.log('  📔 Diary created:', data?.changes?.diary_entries?.created?.length || 0);
        console.log('  🎮 Leisure created:', data?.changes?.leisure_logs?.created?.length || 0);
        
        // Verify sync_metadata is NOT in the response
        if (data?.changes?.sync_metadata) {
          console.warn('⚠️ WARNING: sync_metadata found in pull response (should not be there!)');
        }
        
        // Log first finance record to verify structure
        if (data?.changes?.finance_logs?.created?.length > 0) {
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

        console.log('✅ Pull successful');
        console.log('📥 Pulled:', changes.pulled);

        return {
          changes: data.changes,
          timestamp: data.timestamp,
        };
      },
      pushChanges: async ({ changes: localChanges, lastPulledAt }) => {
        console.log('⬆️ Pushing changes to server...');

        // CRITICAL: Filter out sync_metadata before pushing
        const filteredChanges = filterSyncMetadata(localChanges);

        // Count local changes (after filtering)
        if (filteredChanges) {
          Object.entries(filteredChanges).forEach(([tableName, tableChanges]: [string, any]) => {
            changes.pushed.created += tableChanges.created?.length || 0;
            changes.pushed.updated += tableChanges.updated?.length || 0;
            changes.pushed.deleted += tableChanges.deleted?.length || 0;
          });
        }

        console.log('📤 Pushing:', changes.pushed);

        // Only push if there are actual changes
        if (changes.pushed.created === 0 && 
            changes.pushed.updated === 0 && 
            changes.pushed.deleted === 0) {
          console.log('✅ No changes to push');
          return;
        }

        const { error } = await supabase.rpc('push_changes', {
          changes: filteredChanges,
          last_pulled_at: lastPulledAt || 0,
          device_id_param: deviceId,
        });

        if (error) {
          console.error('❌ Push error:', error);
          throw error;
        }

        console.log('✅ Push successful');
      },
      migrationsEnabledAtVersion: 5,
    });

    console.log('✅ Sync completed successfully');
    console.log('📊 Total changes - Pulled:', changes.pulled, 'Pushed:', changes.pushed);

    return {
      success: true,
      changes,
    };
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return {
      success: false,
      error,
      changes,
    };
  }
}