// src/database/hooks/useDatabase.ts
import { useEffect, useState } from 'react';
import { database } from '../index';
import { Q } from '@nozbe/watermelondb';
import type HabitLog from '../models/HabitLog';
import type FinanceLog from '../models/FinanceLog';
import type DiaryEntry from '../models/DiaryEntry';
import type LeisureLog from '../models/LeisureLog';
import type DiaryImage from '../models/DiaryImage';

export function useDiaryImages(entryId: string) {
  const [images, setImages] = useState<DiaryImage[]>([]);

  useEffect(() => {
    const subscription = database
      .get<DiaryImage>('diary_images')
      .query(Q.where('diary_entry_id', entryId))
      .observe()
      .subscribe(setImages);

    return () => subscription.unsubscribe();
  }, [entryId]);

  return images;
}

export function useCompletedHabitLogs() {
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    const subscription = database
      .get<HabitLog>('habit_logs')
      .query(
        Q.where('ended_at', Q.notEq(null)),
        Q.sortBy('started_at', Q.desc)
      )
      .observeWithColumns(['ended_at', 'duration', 'updated_at'])
      .subscribe(setLogs);

    return () => subscription.unsubscribe();
  }, []);

  return logs;
}

export function useRunningHabitTimers() {
  const [timers, setTimers] = useState<HabitLog[]>([]);

  useEffect(() => {
    const subscription = database
      .get<HabitLog>('habit_logs')
      .query(Q.where('ended_at', null))
      .observeWithColumns(['ended_at', 'started_at', 'updated_at'])
      .subscribe(setTimers);

    return () => subscription.unsubscribe();
  }, []);

  return timers;
}

export function useRunningLeisureTimers() {
  const [timers, setTimers] = useState<LeisureLog[]>([]);

  useEffect(() => {
    const subscription = database
      .get<LeisureLog>('leisure_logs')
      .query(Q.where('ended_at', null))
      .observeWithColumns(['ended_at', 'started_at', 'updated_at'])
      .subscribe(setTimers);

    return () => subscription.unsubscribe();
  }, []);

  return timers;
}

export function useFinanceLogs(startDate: Date, endDate: Date) {
  const [logs, setLogs] = useState<FinanceLog[]>([]);

  useEffect(() => {
    const subscription = database
      .get<FinanceLog>('finance_logs')
      .query(
        Q.where('transaction_date', Q.gte(startDate.getTime())),
        Q.where('transaction_date', Q.lte(endDate.getTime())),
        Q.sortBy('transaction_date', Q.desc)
      )
      .observe()
      .subscribe(setLogs);

    return () => subscription.unsubscribe();
  }, [startDate, endDate]);

  return logs;
}

export function useDiaryEntries(year: number, month: number) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const subscription = database
      .get<DiaryEntry>('diary_entries')
      .query(
        Q.where('entry_date', Q.gte(startDate.getTime())),
        Q.where('entry_date', Q.lte(endDate.getTime())),
        Q.sortBy('entry_date', Q.desc)
      )
      .observe()
      .subscribe(setEntries);

    return () => subscription.unsubscribe();
  }, [year, month]);

  return entries;
}

export function useCompletedLeisureLogs(limit: number = 20) {
  const [logs, setLogs] = useState<LeisureLog[]>([]);

  useEffect(() => {
    const subscription = database
      .get<LeisureLog>('leisure_logs')
      .query(
        Q.where('ended_at', Q.notEq(null)),
        Q.sortBy('started_at', Q.desc),
        Q.take(limit)
      )
      .observeWithColumns(['ended_at', 'duration', 'updated_at'])
      .subscribe(setLogs);

    return () => subscription.unsubscribe();
  }, [limit]);

  return logs;
}

export function useAllDiaryEntries() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const subscription = database
      .get<DiaryEntry>('diary_entries')
      .query(Q.sortBy('entry_date', Q.desc))
      .observe()
      .subscribe(setEntries);

    return () => subscription.unsubscribe();
  }, []);

  return entries;
}
