// src/database/sync/supabaseSync.ts
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../index';
import { supabase } from '../../lib/supabase';

export async function syncWithSupabase() {
  try {
    console.log('🔄 Starting sync...');

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        console.log('⬇️ Pulling changes from server...');
        console.log('Last pulled at:', lastPulledAt);

        const { data, error } = await supabase.rpc('pull_changes', {
          last_pulled_at: lastPulledAt,
          schema_version: schemaVersion,
          migration: migration,
        });

        if (error) {
          console.error('❌ Pull error:', error);
          throw error;
        }

        console.log('✅ Pull successful:', data.changes);

        return {
          changes: data.changes,
          timestamp: data.timestamp,
        };
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        console.log('⬆️ Pushing changes to server...');
        console.log('Changes:', JSON.stringify(changes, null, 2));

        const { error } = await supabase.rpc('push_changes', {
          changes: changes,
          last_pulled_at: lastPulledAt,
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