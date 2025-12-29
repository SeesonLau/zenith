// src/database/actions/habitActions.ts (COMPLETE FIX)
import { database } from '../index';
import HabitLog from '../models/HabitLog';
import { getDeviceId } from '@/src/lib/supabase';

export async function startHabitTimer(
  category: string,
  activity: string,
  notes?: string
) {
  const deviceId = await getDeviceId();
  
  return await database.write(async () => {
    const habitLogsCollection = database.get<HabitLog>('habit_logs');

    return await habitLogsCollection.create((log) => {
      log.category = category;
      log.activity = activity;
      log.notes = notes;
      log.startedAt = new Date();
      log.isSynced = false;
      log.deviceId = deviceId;
    });
  });
}

export async function stopHabitTimer(logId: string) {
  return await database.write(async () => {
    const habitLogsCollection = database.get<HabitLog>('habit_logs');
    const log = await habitLogsCollection.find(logId);
    await log.stopTimer();
    return log;
  });
}