// src/lib/supabaseStorage.ts (FIXED)
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

const BUCKET_NAME = 'diary-images';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToSupabase(
  diaryEntryId: string,
  imageUri: string,
  fileSize: number
): Promise<string | null> {
  try {
    // FIXED: Use correct enum
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',  // Use string literal instead of enum
    });

    // Generate unique filename
    const fileName = `${diaryEntryId}/${Date.now()}.jpg`;

    // Convert base64 to blob for upload
    const blob = base64ToBlob(base64, 'image/jpeg');

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload image:', error);
    return null;
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImageFromSupabase(remoteUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = remoteUrl.split(`/${BUCKET_NAME}/`);
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
}

/**
 * Download image from Supabase to local storage
 */
export async function downloadImageToLocal(
  remoteUrl: string,
  localPath: string
): Promise<boolean> {
  try {
    const downloadResult = await FileSystem.downloadAsync(remoteUrl, localPath);
    return downloadResult.status === 200;
  } catch (error) {
    console.error('Failed to download image:', error);
    return false;
  }
}

// Helper to convert base64 to Blob
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}