// src/database/actions/diaryActions.ts
import { database } from '../index';
import DiaryEntry from '../models/DiaryEntry';
import DiaryImage from '../models/DiaryImage';
import { getDeviceId } from '@/src/lib/supabase';
import { uploadPendingImagesForEntry } from './imageActions';
import { deleteImageFromSupabase } from '@/src/lib/supabaseStorage';
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

  // All DB creates in a single write — no nested writes
  const newEntry = await database.write(async () => {
    const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');
    const imageCollection = database.get<DiaryImage>('diary_images');

    const entry = await diaryEntriesCollection.create((e) => {
      e.title = data.title;
      e.content = data.content;
      e.mood = data.mood;
      e.entryDate = new Date();
      e.isSynced = false;
      e.deviceId = deviceId;
    });

    if (images && images.length > 0) {
      for (const imageInfo of images) {
        await imageCollection.create((img) => {
          img.diaryEntryId = entry.id;
          img.localUri = imageInfo.uri;
          img.uploadStatus = 'pending';
          img.fileSize = imageInfo.fileSize;
          img.mimeType = 'image/jpeg';
          img.isSynced = false;
        });
      }
    }

    return entry;
  });

  // Upload runs after the write completes — fire and forget
  if (images && images.length > 0) {
    uploadPendingImagesForEntry(newEntry.id).catch((error) => {
      if (__DEV__) console.error('Failed to upload images:', error);
    });
  }

  return newEntry;
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
  const diaryEntriesCollection = database.get<DiaryEntry>('diary_entries');
  const entry = await diaryEntriesCollection.find(entryId);
  const images = await entry.images.fetch();

  // Delete remote files first — outside the write context
  for (const image of images) {
    if (image.remoteUrl) {
      await deleteImageFromSupabase(image.remoteUrl);
    }
  }

  // All local deletions in a single write — no nested writes
  return await database.write(async () => {
    for (const image of images) {
      await image.markAsDeleted();
    }
    await entry.markAsDeleted();
  });
}
