// src/database/actions/habitActions.ts
import { database } from '../index';
import HabitLog from '../models/HabitLog';

export async function startHabitTimer(
  category: string,
  activity: string,
  notes?: string
) {
  return await database.write(async () => {
    const habitLogsCollection = database.get<HabitLog>('habit_logs');

    const newLog = await habitLogsCollection.create((log) => {
      log.category = category;
      log.activity = activity;
      log.startedAt = new Date();
      log.notes = notes;
      log.isSynced = false;
    });

    return newLog;
  });
}

export async function stopHabitTimer(logId: string) {
  return await database.write(async () => {
    const habitLogsCollection = database.get<HabitLog>('habit_logs');
    const log = await habitLogsCollection.find(logId);
    
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