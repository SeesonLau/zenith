// src/database/hooks/useSync.ts
import { useState, useEffect } from 'react';
import { performSync, getSyncStatus } from '@/src/database/sync/syncManager';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const sync = async () => {
    setIsSyncing(true);
    setSyncError(null);

    const result = await performSync();

    setIsSyncing(false);

    if (result.success) {
      setLastSyncedAt(new Date());
    } else {
      const errorMessage = 
        (result as any).message || 
        (result as any).error?.message || 
        'Sync failed';
      setSyncError(errorMessage);
    }

    return result;
  };

  useEffect(() => {
    const status = getSyncStatus();
    setIsSyncing(status.isSyncing);
  }, []);

  return {
    sync,
    isSyncing,
    lastSyncedAt,
    syncError,
  };
}