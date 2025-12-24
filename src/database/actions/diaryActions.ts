// src/database/actions/diaryActions.ts
import { database } from '../index';
import DiaryEntry from '../models/DiaryEntry';

export async function createDiaryEntry(data: {
  title?: string;
  content: string;
  mood?: string;
}) {
  const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');

  const newEntry = await diaryEntriesCollection.create((entry) => {
    entry.title = data.title;
    entry.content = data.content;
    entry.mood = data.mood;
    entry.entryDate = new Date();
    entry.isSynced = false;
  });

  return newEntry;
}
