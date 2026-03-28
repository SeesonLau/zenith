// src/database/sync/syncUtils.ts
// Utility functions for managing multi-device sync

import { database } from '../index';
import { Q } from '@nozbe/watermelondb';
import { getDeviceId } from '@/src/lib/supabase';
import type SyncMetadata from '../models/SyncMetadata';

/**
 * Helper to safely access SyncMetadata properties
 */
interface SyncMetadataProps {
  id: string;
  tableName: string;
  lastPulledAt: number;
  lastPushedAt: number;
}

function toSyncMetadataProps(record: SyncMetadata): SyncMetadataProps {
  return {
    id: record.id,
    tableName: (record as any).tableName,
    lastPulledAt: (record as any).lastPulledAt,
    lastPushedAt: (record as any).lastPushedAt,
  };
}

/**
 * Check if sync_metadata has duplicate entries
 * (Diagnostic function)
 */
export async function checkSyncMetadataDuplicates(): Promise<{
  hasDuplicates: boolean;
  count: number;
  records: SyncMetadataProps[];
}> {
  try {
    const metadata = await database
      .get<SyncMetadata>('sync_metadata')
      .query(Q.where('table_name', 'last_sync'))
      .fetch();

    return {
      hasDuplicates: metadata.length > 1,
      count: metadata.length,
      records: metadata.map(toSyncMetadataProps),
    };
  } catch (error) {
    console.error('Failed to check sync metadata:', error);
    return {
      hasDuplicates: false,
      count: 0,
      records: [],
    };
  }
}

/**
 * Clean up duplicate sync_metadata records
 * Keeps only the most recent one
 */
export async function cleanupDuplicateSyncMetadata(): Promise<{
  success: boolean;
  removed: number;
}> {
  try {
    let removedCount = 0;
    
    await database.write(async () => {
      const metadata = await database
        .get<SyncMetadata>('sync_metadata')
        .query(Q.where('table_name', 'last_sync'))
        .fetch();

      if (metadata.length <= 1) {
        console.log('✅ No duplicates to clean up');
        return;
      }

      // Sort by lastPulledAt descending, keep the most recent
      const props = metadata.map(toSyncMetadataProps);
      const sorted = props.sort((a, b) => b.lastPulledAt - a.lastPulledAt);
      const keepId = sorted[0].id;
      const removeIds = sorted.slice(1).map(p => p.id);

      console.log(`🧹 Keeping most recent sync metadata (${new Date(sorted[0].lastPulledAt).toISOString()})`);
      console.log(`🗑️ Removing ${removeIds.length} duplicate(s)`);

      for (const id of removeIds) {
        const record = await database.get<SyncMetadata>('sync_metadata').find(id);
        await record.destroyPermanently();
      }

      removedCount = removeIds.length;
    });

    return { success: true, removed: removedCount };
  } catch (error) {
    console.error('Failed to cleanup duplicates:', error);
    return { success: false, removed: 0 };
  }
}

/**
 * Get sync statistics for debugging
 */
export async function getSyncStatistics(): Promise<{
  deviceId: string;
  lastSyncedAt: Date | null;
  unsyncedCounts: {
    habits: number;
    finance: number;
    diary: number;
    diaryImages: number;
    leisure: number;
  };
  totalUnsynced: number;
  syncMetadataCount: number;
}> {
  const deviceId = await getDeviceId();
  
  // Get sync metadata
  let lastSyncedAt: Date | null = null;
  let syncMetadataCount = 0;
  
  try {
    const metadata = await database
      .get<SyncMetadata>('sync_metadata')
      .query(Q.where('table_name', 'last_sync'))
      .fetch();
    
    syncMetadataCount = metadata.length;
    
    if (metadata.length > 0) {
      const props = toSyncMetadataProps(metadata[0]);
      lastSyncedAt = new Date(props.lastPulledAt);
    }
  } catch (error) {
    console.error('Failed to get sync metadata:', error);
  }

  // Count unsynced records
  const unsyncedCounts = {
    habits: 0,
    finance: 0,
    diary: 0,
    diaryImages: 0,
    leisure: 0,
  };

  try {
    const tables = [
      { name: 'habit_logs', key: 'habits' },
      { name: 'finance_logs', key: 'finance' },
      { name: 'diary_entries', key: 'diary' },
      { name: 'diary_images', key: 'diaryImages' },
      { name: 'leisure_logs', key: 'leisure' },
    ];

    for (const table of tables) {
      const records = await database
        .get(table.name)
        .query(Q.where('is_synced', false))
        .fetch();
      
      unsyncedCounts[table.key as keyof typeof unsyncedCounts] = records.length;
    }
  } catch (error) {
    console.error('Failed to count unsynced records:', error);
  }

  const totalUnsynced = Object.values(unsyncedCounts).reduce((sum, count) => sum + count, 0);

  return {
    deviceId,
    lastSyncedAt,
    unsyncedCounts,
    totalUnsynced,
    syncMetadataCount,
  };
}

/**
 * Verify sync metadata integrity
 * Returns issues found
 */
export async function verifySyncMetadataIntegrity(): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    const metadata = await database
      .get<SyncMetadata>('sync_metadata')
      .query(Q.where('table_name', 'last_sync'))
      .fetch();

    if (metadata.length === 0) {
      issues.push('No sync metadata found (will be created on first sync)');
    } else if (metadata.length > 1) {
      issues.push(`Found ${metadata.length} sync_metadata records (should only have 1)`);
    }

    // Check for invalid timestamps
    for (const record of metadata) {
      const props = toSyncMetadataProps(record);
      if (props.lastPulledAt != null && props.lastPulledAt < 0) {
        issues.push('Invalid lastPulledAt timestamp (negative value)');
      }
      if (props.lastPushedAt != null && props.lastPushedAt < 0) {
        issues.push('Invalid lastPushedAt timestamp (negative value)');
      }
    }
  } catch (error) {
    issues.push(`Failed to verify sync metadata: ${error}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Complete diagnostic report
 */
export async function generateSyncDiagnosticReport(): Promise<string> {
  const stats = await getSyncStatistics();
  const integrity = await verifySyncMetadataIntegrity();
  const duplicates = await checkSyncMetadataDuplicates();

  const report = `
╔══════════════════════════════════════════════════════════╗
║           SYNC DIAGNOSTIC REPORT                         ║
╚══════════════════════════════════════════════════════════╝

📱 Device Information
   Device ID: ${stats.deviceId}
   Last Synced: ${stats.lastSyncedAt ? stats.lastSyncedAt.toISOString() : 'Never'}

📊 Unsynced Records
   Habits: ${stats.unsyncedCounts.habits}
   Finance: ${stats.unsyncedCounts.finance}
   Diary: ${stats.unsyncedCounts.diary}
   Diary Images: ${stats.unsyncedCounts.diaryImages}
   Leisure: ${stats.unsyncedCounts.leisure}
   ─────────────────────
   Total: ${stats.totalUnsynced}

🔍 Sync Metadata Status
   Count: ${stats.syncMetadataCount} ${stats.syncMetadataCount > 1 ? '⚠️ (SHOULD BE 1!)' : '✅'}
   Has Duplicates: ${duplicates.hasDuplicates ? '❌ YES' : '✅ NO'}

✅ Integrity Check
   Valid: ${integrity.isValid ? '✅ YES' : '❌ NO'}
   ${integrity.issues.length > 0 ? 'Issues:\n   - ' + integrity.issues.join('\n   - ') : 'No issues found'}

${duplicates.hasDuplicates ? `
⚠️  WARNING: Multiple sync_metadata records detected!
   This can cause "duplicate key" errors during sync.
   Run cleanupDuplicateSyncMetadata() to fix.
` : ''}

${stats.totalUnsynced > 0 ? `
📤 Action Needed
   You have ${stats.totalUnsynced} unsynced records.
   Run performSync() to push changes to server.
` : ''}
`;

  console.log(report);
  return report;
}

/**
 * Quick fix for common sync issues
 */
export async function quickFixSyncIssues(): Promise<{
  success: boolean;
  actions: string[];
  errors: string[];
}> {
  const actions: string[] = [];
  const errors: string[] = [];

  try {
    // Fix 1: Clean up duplicate sync_metadata
    const duplicateCheck = await checkSyncMetadataDuplicates();
    if (duplicateCheck.hasDuplicates) {
      actions.push('Cleaning up duplicate sync_metadata records...');
      const cleanup = await cleanupDuplicateSyncMetadata();
      if (cleanup.success) {
        actions.push(`✅ Removed ${cleanup.removed} duplicate(s)`);
      } else {
        errors.push('Failed to cleanup duplicates');
      }
    } else {
      actions.push('✅ No duplicate sync_metadata found');
    }

    // Fix 2: Verify integrity
    const integrity = await verifySyncMetadataIntegrity();
    if (!integrity.isValid) {
      actions.push('⚠️ Integrity issues found:');
      integrity.issues.forEach(issue => actions.push(`  - ${issue}`));
    } else {
      actions.push('✅ Sync metadata integrity verified');
    }

    return {
      success: errors.length === 0,
      actions,
      errors,
    };
  } catch (error) {
    errors.push(`Unexpected error: ${error}`);
    return {
      success: false,
      actions,
      errors,
    };
  }
}