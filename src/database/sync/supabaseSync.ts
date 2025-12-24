// src/database/sync/supabaseSync.ts
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../index';
import { supabase, getDeviceId } from '../../lib/supabase';

export async function syncWithSupabase() {
  try {
    console.log('🔄 Starting sync...');
    
    const deviceId = await getDeviceId();
    console.log('📱 Device ID:', deviceId);

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        console.log('⬇️ Pulling changes from server...');
        console.log('Last pulled at:', lastPulledAt);

        const { data, error } = await supabase.rpc('pull_changes', {
          last_pulled_at: lastPulledAt,
          schema_version: schemaVersion,
          migration: migration,
          device_id_param: deviceId,
        });

        if (error) {
          console.error('❌ Pull error:', error);
          throw error;
        }

        console.log('✅ Pull successful');

        return {
          changes: data.changes,
          timestamp: data.timestamp,
        };
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        console.log('⬆️ Pushing changes to server...');

        const { error } = await supabase.rpc('push_changes', {
          changes: changes,
          last_pulled_at: lastPulledAt,
          device_id_param: deviceId,
        });

        if (error) {
          console.error('❌ Push error:', error);
          throw error;
        }

        console.log('✅ Push successful');
      },
      migrationsEnabledAtVersion: 1,
    });

    console.log('✅ Sync completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return { success: false, error };
  }
}