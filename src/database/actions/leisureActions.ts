// src/database/actions/leisureActions.ts
import { database } from '../index';
import LeisureLog from '../models/LeisureLog';
import HabitLog from '../models/HabitLog';
import { getDeviceId } from '@/src/lib/supabase';
import type { LeisureType } from '@/src/constants/categories';
import { LEISURE_TYPES } from '@/src/constants/categories';

const DEFAULT_LEISURE_TYPE: LeisureType = LEISURE_TYPES[0];

export async function startLeisureTimer() {
  const deviceId = await getDeviceId();

  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const habitLogsCollection = database.get<HabitLog>('habit_logs');

    const habitLog = await habitLogsCollection.create((log) => {
      log.category = 'Enjoyment';
      log.activity = 'Leisure';
      log.startedAt = new Date();
      log.isSynced = false;
      log.deviceId = deviceId;
    });

    const leisureLog = await leisureLogsCollection.create((log) => {
      log.type = DEFAULT_LEISURE_TYPE;
      log.startedAt = new Date();
      log.linkedHabitId = habitLog.id;
      log.isSynced = false;
      log.deviceId = deviceId;
    });

    return leisureLog;
  });
}

export async function completeLeisureSession(
  logId: string,
  type: LeisureType,
  title?: string,
  notes?: string
) {
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const habitLogsCollection = database.get<HabitLog>('habit_logs');

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

    if (log.linkedHabitId) {
      const habitLog = await habitLogsCollection.find(log.linkedHabitId);
      if (!habitLog.endedAt) {
        await habitLog.update((record) => {
          record.endedAt = endTime;
          record.duration = durationInSeconds;
          record.isSynced = false;
        });
      }
    }

    return log;
  });
}

export async function updateLeisureLog(
  logId: string,
  updates: {
    type: LeisureType;
    title?: string;
    notes?: string;
    startedAt: Date;
    duration: number;
  }
) {
  return await database.write(async () => {
    const log = await database.get<LeisureLog>('leisure_logs').find(logId);
    await log.update(record => {
      record.type = updates.type;
      record.title = updates.title;
      record.notes = updates.notes;
      record.startedAt = updates.startedAt;
      record.duration = updates.duration;
      record.endedAt = new Date(updates.startedAt.getTime() + updates.duration * 1000);
      record.isSynced = false;
    });
    return log;
  });
}

export async function deleteLeisureLog(logId: string) {
  return await database.write(async () => {
    const log = await database.get<LeisureLog>('leisure_logs').find(logId);
    await log.markAsDeleted();
  });
}

export async function stopLeisureTimer(logId: string) {
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const habitLogsCollection = database.get<HabitLog>('habit_logs');

    const log = await leisureLogsCollection.find(logId);
    const endTime = new Date();
    const durationInSeconds = Math.floor(
      (endTime.getTime() - log.startedAt.getTime()) / 1000
    );

    await log.update((record) => {
      record.endedAt = endTime;
      record.duration = durationInSeconds;
      record.isSynced = false;
    });

    if (log.linkedHabitId) {
      const habitLog = await habitLogsCollection.find(log.linkedHabitId);
      if (!habitLog.endedAt) {
        await habitLog.update((record) => {
          record.endedAt = endTime;
          record.duration = durationInSeconds;
          record.isSynced = false;
        });
      }
    }

    return log;
  });
}
