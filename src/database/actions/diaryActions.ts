// src/database/actions/diaryActions.ts
import { database } from '../index';
import DiaryEntry from '../models/DiaryEntry';

export async function createDiaryEntry(data: {
  title?: string;
  content: string;
  mood?: string;
}) {
  return await database.write(async () => {
    const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');

    const newEntry = await diaryEntriesCollection.create((entry) => {
      entry.title = data.title;
      entry.content = data.content;
      entry.mood = data.mood;
      entry.entryDate = new Date();
      entry.isSynced = false;
    });

    return newEntry;
  });
}

export async function updateDiaryEntry(
  entryId: string,
  data: {
    title?: string;
    content?: string;
    mood?: string;
  }
) {
  return await database.write(async () => {
    const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');
    const entry = await diaryEntriesCollection.find(entryId);

    await entry.update((record) => {
      if (data.title !== undefined) record.title = data.title;
      if (data.content !== undefined) record.content = data.content;
      if (data.mood !== undefined) record.mood = data.mood;
      record.isSynced = false;
    });

    return entry;
  });
}

export async function deleteDiaryEntry(entryId: string) {
  return await database.write(async () => {
    const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');
    const entry = await diaryEntriesCollection.find(entryId);
    await entry.markAsDeleted();
  });
}