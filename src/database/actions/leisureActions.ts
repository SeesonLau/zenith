// src/database/actions/leisureActions.ts
import { database } from '../index';
import LeisureLog from '../models/LeisureLog';
import HabitLog from '../models/HabitLog';
import { getDeviceId } from '@/src/lib/supabase';
import type { LeisureType } from '@/src/constants/categories';

// Start timer with minimal data AND automatically create linked habit
export async function startLeisureTimer() {
  const deviceId = await getDeviceId();
  
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const habitLogsCollection = database.get<HabitLog>('habit_logs');

    // First, create the habit log with Category "Enjoyment" and Activity "Leisure"
    const habitLog = await habitLogsCollection.create((log) => {
      log.category = 'Enjoyment';
      log.activity = 'Leisure';
      log.startedAt = new Date();
      log.isSynced = false;
      log.deviceId = deviceId;
    });

    // Then create the leisure log linked to the habit
    const leisureLog = await leisureLogsCollection.create((log) => {
      log.type = 'Manga'; // Default type, will be updated on completion
      log.startedAt = new Date();
      log.linkedHabitId = habitLog.id; // Link to the habit log
      log.isSynced = false;
      log.deviceId = deviceId;
    });

    return leisureLog;
  });
}

// Complete session with all details AND stop linked habit
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
    
    // Update the leisure log
    await log.update((record) => {
      record.type = type;
      record.title = title;
      record.notes = notes;
      record.endedAt = endTime;
      record.duration = durationInSeconds;
      record.isSynced = false;
    });

    // Stop the linked habit timer if it exists
    if (log.linkedHabitId) {
      try {
        const habitLog = await habitLogsCollection.find(log.linkedHabitId);
        
        // Only stop if it's still running
        if (!habitLog.endedAt) {
          await habitLog.update((record) => {
            record.endedAt = endTime;
            record.duration = durationInSeconds;
            record.isSynced = false;
          });
        }
      } catch (error) {
        console.error('Failed to stop linked habit timer:', error);
        // Continue even if habit update fails
      }
    }

    return log;
  });
}

// Stop timer directly (for detail view) AND stop linked habit
export async function stopLeisureTimer(logId: string) {
  return await database.write(async () => {
    const leisureLogsCollection = database.get<LeisureLog>('leisure_logs');
    const habitLogsCollection = database.get<HabitLog>('habit_logs');
    
    const log = await leisureLogsCollection.find(logId);
    const endTime = new Date();
    const durationInSeconds = Math.floor(
      (endTime.getTime() - log.startedAt.getTime()) / 1000
    );
    
    // Update the leisure log
    await log.update((record) => {
      record.endedAt = endTime;
      record.duration = durationInSeconds;
      record.isSynced = false;
    });

    // Stop the linked habit timer if it exists
    if (log.linkedHabitId) {
      try {
        const habitLog = await habitLogsCollection.find(log.linkedHabitId);
        
        // Only stop if it's still running
        if (!habitLog.endedAt) {
          await habitLog.update((record) => {
            record.endedAt = endTime;
            record.duration = durationInSeconds;
            record.isSynced = false;
          });
        }
      } catch (error) {
        console.error('Failed to stop linked habit timer:', error);
        // Continue even if habit update fails
      }
    }

    return log;
  });
}