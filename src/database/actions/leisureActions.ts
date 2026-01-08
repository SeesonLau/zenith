// src/database/actions/leisureActions.ts
import { database } from '../index';
import LeisureLog from '../models/LeisureLog';
import { getDeviceId } from '@/src/lib/supabase';
import type { LeisureType } from '@/src/constants/categories';

// Start timer with minimal data
export async function startLeisureTimer() {
  const deviceId = await getDeviceId();
  
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');

    return await leisureLogsCollection.create((log) => {
      log.type = 'Manga'; // Default type, will be updated on completion
      log.startedAt = new Date();
      log.isSynced = false;
      log.deviceId = deviceId;
    });
  });
}

// Complete session with all details
export async function completeLeisureSession(
  logId: string,
  type: LeisureType,
  title?: string,
  notes?: string
) {
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const log = await leisureLogsCollection.find(logId);
    
    const endTime = new Date();
    const durationInSeconds = Math.floor(
      (endTime.getTime() - log.startedAt.getTime()) / 1000
    );
    
    await log.update((record) => {
      record.type = type;
      record.title = title;
      record.notes = notes;
      record.endedAt = endTime;
      record.duration = durationInSeconds;
      record.isSynced = false;
    });

    return log;
  });
}

// Stop timer directly (for detail view)
export async function stopLeisureTimer(logId: string) {
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const log = await leisureLogsCollection.find(logId);
    
    await log.update((record) => {
      record.endedAt = new Date();
      record.duration = Math.floor(
        (record.endedAt.getTime() - record.startedAt.getTime()) / 1000
      );
      record.isSynced = false;
    });

    return log;
  });
}