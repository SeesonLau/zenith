// src/database/sync/syncManager.ts (COMPLETE FIXED VERSION)
import { syncWithSupabase } from './supabaseSync';
import { database } from '../index';
import NetInfo from '@react-native-community/netinfo';

let syncInterval: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;
let lastSyncTimestamp: number | null = null;
let isAutoSyncStarted = false;
let isForcingFullSync = false;  // ADDED: Flag for force sync

interface SyncResult {
  success: boolean;
  message?: string;
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
 * Get last sync timestamp from local storage
 */
async function getLastSyncTimestamp(): Promise<number | null> {
  try {
    const metadata = await database
      .get('sync_metadata')
      .query()
      .fetch();

    if (metadata.length > 0) {
      const lastSync = metadata.find((m: any) => m.tableName === 'last_sync');
      return lastSync ? (lastSync as any).lastPulledAt : null;
    }
    return null;
  } catch (error) {
    console.error('Failed to get last sync timestamp:', error);
    return null;
  }
}

/**
 * Save last sync timestamp
 */
async function saveLastSyncTimestamp(timestamp: number): Promise<void> {
  // ADDED: Don't save timestamp during force sync
  if (isForcingFullSync) {
    console.log('⏭️ Skipping timestamp save during force sync');
    return;
  }

  try {
    await database.write(async () => {
      const metadataCollection = database.get('sync_metadata');
      const existing = await metadataCollection
        .query()
        .fetch();

      const lastSyncRecord = existing.find((m: any) => m.tableName === 'last_sync');

      if (lastSyncRecord) {
        await lastSyncRecord.update((record: any) => {
          record.lastPulledAt = timestamp;
          record.lastPushedAt = timestamp;
        });
      } else {
        await metadataCollection.create((record: any) => {
          record.tableName = 'last_sync';
          record.lastPulledAt = timestamp;
          record.lastPushedAt = timestamp;
        });
      }
    });
    console.log('💾 Saved sync timestamp:', new Date(timestamp).toISOString());
  } catch (error) {
    console.error('Failed to save sync timestamp:', error);
  }
}

/**
 * Perform a manual sync with detailed logging
 */
export async function performSync(): Promise<SyncResult> {
  if (isSyncing) {
    console.log('⏭️ Sync already in progress, skipping...');
    return { success: false, message: 'Sync already in progress' };
  }

  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.log('📵 No internet connection, skipping sync');
    return { success: false, message: 'No internet connection' };
  }

  isSyncing = true;

  try {
    console.log('🔄 Starting sync...');
    console.log('📊 Last sync:', lastSyncTimestamp ? new Date(lastSyncTimestamp).toISOString() : 'Never');

    // Perform sync using supabaseSync
    const result = await syncWithSupabase();

    if (result.success) {
      // Update last sync timestamp (will be skipped if forcing)
      lastSyncTimestamp = Date.now();
      await saveLastSyncTimestamp(lastSyncTimestamp);

      console.log('✅ Sync completed successfully');
      console.log('📈 Changes:', result.changes);

      return {
        success: true,
        message: 'Sync completed',
        changes: result.changes,
      };
    } else {
      throw result.error;
    }
  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return {
      success: false,
      message: error.message || 'Sync failed',
      error,
    };
  } finally {
    isSyncing = false;
  }
}

/**
 * Force a full sync (ignores last sync timestamp and pulls ALL data)
 */
export async function forceFullSync(): Promise<SyncResult> {
  console.log('🔄 Forcing full sync (pulling all data)...');

  // Set flag to prevent saving timestamp during this sync
  isForcingFullSync = true;

  // Reset last sync timestamp to 0 to pull ALL data
  try {
    await database.write(async () => {
      const metadataCollection = database.get('sync_metadata');
      const existing = await metadataCollection.query().fetch();

      // Update to timestamp 0 instead of deleting
      if (existing.length > 0) {
        for (const record of existing) {
          await record.update((r: any) => {
            r.lastPulledAt = 0;
            r.lastPushedAt = 0;
          });
        }
        console.log('✅ Reset existing sync metadata to 0');
      } else {
        // Create new metadata with 0 timestamp
        await metadataCollection.create((record: any) => {
          record.tableName = 'last_sync';
          record.lastPulledAt = 0;
          record.lastPushedAt = 0;
        });
        console.log('✅ Created new sync metadata with 0 timestamp');
      }
    });

    lastSyncTimestamp = 0;
    console.log('✅ Reset sync metadata to 0 - will pull ALL data from server');
  } catch (error) {
    console.error('Failed to reset sync metadata:', error);
  }

  const result = await performSync();
  
  // Reset flag after sync completes
  isForcingFullSync = false;
  
  return result;
}

/**
 * Start automatic sync every 5 minutes when online
 */
export function startAutoSync() {
  if (isAutoSyncStarted) {
    console.log('⚠️ Auto-sync already started, skipping...');
    return;
  }

  console.log('🔄 Starting auto-sync...');
  isAutoSyncStarted = true;

  // Sync immediately (with delay to avoid concurrent calls)
  setTimeout(() => {
    performSync();
  }, 1000);

  // Then sync every 5 minutes
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  syncInterval = setInterval(() => {
    performSync();
  }, 5 * 60 * 1000); // 5 minutes

  // Also sync when app comes online (with debounce)
  let networkSyncTimeout: ReturnType<typeof setTimeout> | null = null;
  NetInfo.addEventListener((state) => {
    if (state.isConnected && !isSyncing) {
      // Clear any pending network sync
      if (networkSyncTimeout) {
        clearTimeout(networkSyncTimeout);
      }
      
      // Wait 2 seconds before syncing to avoid rapid network changes
      networkSyncTimeout = setTimeout(() => {
        console.log('📡 Network connected, syncing...');
        performSync();
      }, 2000);
    }
  });
}

/**
 * Stop automatic sync
 */
export function stopAutoSync() {
  console.log('⏸️ Stopping auto-sync...');
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  isAutoSyncStarted = false;
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  return {
    isSyncing,
    lastSyncedAt: lastSyncTimestamp ? new Date(lastSyncTimestamp) : null,
    autoSyncEnabled: syncInterval !== null,
  };
}

/**
 * Get pending changes count
 */
export async function getPendingChangesCount(): Promise<number> {
  try {
    const tables = ['habit_logs', 'finance_logs', 'diary_entries', 'diary_images', 'leisure_logs'];
    let count = 0;

    for (const tableName of tables) {
      const records = await database
        .get(tableName)
        .query()
        .fetch();

      const unsynced = records.filter((r: any) => !r.isSynced || r.isSynced === false);
      count += unsynced.length;
    }

    return count;
  } catch (error) {
    console.error('Failed to get pending changes:', error);
    return 0;
  }
}