// src/database/sync/syncManager.ts
import { syncWithSupabase } from './supabaseSync';
import NetInfo from '@react-native-community/netinfo';

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

/**
 * Start automatic sync every 5 minutes when online
 */
export function startAutoSync() {
  console.log('🔄 Starting auto-sync...');
  
  // Sync immediately
  performSync();
  
  // Then sync every 5 minutes
  syncInterval = setInterval(() => {
    performSync();
  }, 5 * 60 * 1000); // 5 minutes
  
  // Also sync when app comes online
  NetInfo.addEventListener(state => {
    if (state.isConnected && !isSyncing) {
      console.log('📡 Network connected, syncing...');
      performSync();
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
}

/**
 * Perform a manual sync
 */
export async function performSync() {
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
    const result = await syncWithSupabase();
    return result;
  } catch (error) {
    console.error('❌ Sync error:', error);
    return { success: false, error };
  } finally {
    isSyncing = false;
  }
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  return {
    isSyncing,
    autoSyncEnabled: syncInterval !== null,
  };
}