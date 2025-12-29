// src/database/actions/leisureActions.ts (COMPLETE FIX)
import { database } from '../index';
import LeisureLog from '../models/LeisureLog';
import { getDeviceId } from '@/src/lib/supabase';

export async function startLeisureTimer(
  type: 'Manga' | 'Mangah' | 'Manhwah' | 'Manhuah' | 'Fanart' | 'Real' | 'AV',
  title?: string,
  notes?: string
) {
  const deviceId = await getDeviceId();
  
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');

    return await leisureLogsCollection.create((log) => {
      log.type = type;
      log.title = title;
      log.notes = notes;
      log.startedAt = new Date();
      log.isSynced = false;
      log.deviceId = deviceId;
    });
  });
}

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