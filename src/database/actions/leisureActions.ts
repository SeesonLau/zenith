// src/database/actions/leisureActions.ts
import { database } from '../index';
import LeisureLog from '../models/LeisureLog';

export async function startLeisureTimer(
  type: 'Manga' | 'Manhwah' | 'Manhuah' | 'Fanart' | 'Real' | 'AV',
  title?: string,
  notes?: string
) {
  const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');

  const newLog = await leisureLogsCollection.create((log) => {
    log.type = type;
    log.title = title;
    log.notes = notes;
    log.startedAt = new Date();
    log.isSynced = false;
  });

  return newLog;
}

export async function stopLeisureTimer(logId: string) {
  const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
  const log = await leisureLogsCollection.find(logId);
  await log.stopTimer();
  return log;
}