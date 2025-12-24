// src/database/actions/habitActions.ts
import { database } from '../index';
import HabitLog from '../models/HabitLog';

export async function startHabitTimer(
  category: string,
  activity: string,
  notes?: string
) {
  const habitLogsCollection = database.get<HabitLog>('habit_logs');

  const newLog = await habitLogsCollection.create((log) => {
    log.category = category;
    log.activity = activity;
    log.startedAt = new Date();
    log.notes = notes;
    log.isSynced = false;
  });

  return newLog;
}

export async function stopHabitTimer(logId: string) {
  const habitLogsCollection = database.get<HabitLog>('habit_logs');
  const log = await habitLogsCollection.find(logId);
  await log.stopTimer();
  return log;
}