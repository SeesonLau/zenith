// src/database/actions/habitActions.ts
import { database } from '../index';
import HabitLog from '../models/HabitLog';
import { getDeviceId } from '@/src/lib/supabase';
import type { HabitCategory } from '@/src/constants/categories';

export async function startHabitTimer(
  category: HabitCategory,
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
    
    // Calculate duration
    const now = new Date();
    const startTime = log.startedAt;
    const durationInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    // Update the log
    await log.update((record) => {
      record.endedAt = now;
      record.duration = durationInSeconds;
      record.isSynced = false;
    });
    
    return log;
  });
}

export async function deleteHabitLog(logId: string) {
  return await database.write(async () => {
    const habitLogsCollection = database.get<HabitLog>('habit_logs');
    const log = await habitLogsCollection.find(logId);
    await log.markAsDeleted();
  });
}