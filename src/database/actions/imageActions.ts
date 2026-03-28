// src/database/actions/imageActions.ts (FIXED)
import { database } from '../index';
import { Q } from '@nozbe/watermelondb';  // ADDED: Import Q
import DiaryImage from '../models/DiaryImage';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/src/lib/supabaseStorage';

/**
 * Add image to diary entry (local only first)
 */
export async function addImageToDiaryEntry(
  diaryEntryId: string,
  localUri: string,
  fileSize: number,
  mimeType: string = 'image/jpeg'
) {
  return await database.write(async () => {
    const imageCollection = database.get<DiaryImage>('diary_images');

    return await imageCollection.create((image) => {
      image.diaryEntryId = diaryEntryId;
      image.localUri = localUri;
      image.uploadStatus = 'pending';
      image.fileSize = fileSize;
      image.mimeType = mimeType;
      image.isSynced = false;
    });
  });
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadDiaryImage(imageId: string): Promise<boolean> {
  try {
    const imageCollection = database.get<DiaryImage>('diary_images');
    const image = await imageCollection.find(imageId);

    // Mark as uploading
    await database.write(async () => {
      await image.update((img) => {
        img.uploadStatus = 'uploading';
      });
    });

    // Upload to Supabase
    const remoteUrl = await uploadImageToSupabase(
      image.diaryEntryId,
      image.localUri,
      image.fileSize
    );

    if (!remoteUrl) {
      // Mark as failed
      await image.markAsFailed();
      return false;
    }

    // Mark as uploaded
    await image.markAsUploaded(remoteUrl);
    return true;
  } catch (error) {
    console.error('Failed to upload diary image:', error);
    return false;
  }
}

/**
 * Upload all pending images for a diary entry
 */
export async function uploadPendingImagesForEntry(diaryEntryId: string): Promise<void> {
  const imageCollection = database.get<DiaryImage>('diary_images');
  
  // FIXED: Proper query syntax
  const images = await imageCollection
    .query(
      Q.where('diary_entry_id', diaryEntryId),
      Q.where('upload_status', 'pending')
    )
    .fetch();

  // FIXED: Add type annotation
  const uploadPromises = images.map((image: DiaryImage) => uploadDiaryImage(image.id));
  await Promise.allSettled(uploadPromises);
}

/**
 * Delete image (both local and remote)
 */
export async function deleteDiaryImage(imageId: string): Promise<boolean> {
  try {
    const imageCollection = database.get<DiaryImage>('diary_images');
    const image = await imageCollection.find(imageId);

    // Delete from Supabase if uploaded
    if (image.remoteUrl) {
      await deleteImageFromSupabase(image.remoteUrl);
    }

    // Delete from local database
    await database.write(async () => {
      await image.markAsDeleted();
    });

    return true;
  } catch (error) {
    console.error('Failed to delete diary image:', error);
    return false;
  }
}

/**
 * Retry failed uploads
 */
export async function retryFailedUploads(): Promise<number> {
  const imageCollection = database.get<DiaryImage>('diary_images');
  
  // FIXED: Proper query syntax
  const failedImages = await imageCollection
    .query(
      Q.where('upload_status', 'failed')
    )
    .fetch();

  let successCount = 0;

  for (const image of failedImages) {
    const success = await uploadDiaryImage(image.id);
    if (success) successCount++;
  }

  return successCount;
}