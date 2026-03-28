// src/database/actions/diaryActions.ts (COMPLETE FIX)
import { database } from '../index';
import DiaryEntry from '../models/DiaryEntry';
import { getDeviceId } from '@/src/lib/supabase';
import { addImageToDiaryEntry, uploadPendingImagesForEntry } from './imageActions';
import type { ImageInfo } from '@/src/utils/imageHelpers';

export async function createDiaryEntry(
  data: {
    title?: string;
    content: string;
    mood?: string;
  },
  images?: ImageInfo[]
) {
  const deviceId = await getDeviceId();
  
  return await database.write(async () => {
    const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');

    const newEntry = await diaryEntriesCollection.create((entry) => {
      entry.title = data.title;
      entry.content = data.content;
      entry.mood = data.mood;
      entry.entryDate = new Date();
      entry.isSynced = false;
      entry.deviceId = deviceId;
    });

    // Add images if provided
    if (images && images.length > 0) {
      for (const imageInfo of images) {
        await addImageToDiaryEntry(
          newEntry.id,
          imageInfo.uri,
          imageInfo.fileSize,
          'image/jpeg'
        );
      }

      // Upload images in the background
      uploadPendingImagesForEntry(newEntry.id).catch((error) => {
        console.error('Failed to upload images:', error);
      });
    }

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

    // Get and delete all associated images
    const images = await entry.images.fetch();
    const { deleteDiaryImage } = await import('./imageActions');
    
    for (const image of images) {
      await deleteDiaryImage(image.id);
    }

    await entry.markAsDeleted();
  });
}