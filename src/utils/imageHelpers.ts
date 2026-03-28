// src/utils/imageHelpers.ts 
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

/**
 * Compress and resize image for optimal storage
 * Target: Square 800x800, JPEG 0.7 quality
 */
export async function compressImage(uri: string): Promise<ImageInfo> {
  try {
    // Resize and compress
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800, height: 800 } }], // Square crop
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Get file size
    const fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
    const fileSize = fileInfo.exists ? (fileInfo as any).size : 0;

    return {
      uri: manipulatedImage.uri,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      fileSize,
    };
  } catch (error) {
    console.error('Failed to compress image:', error);
    throw error;
  }
}

/**
 * Calculate total size of multiple images
 */
export function calculateTotalSize(images: ImageInfo[]): number {
  return images.reduce((total, img) => total + img.fileSize, 0);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if adding image would exceed limit
 */
export function canAddImage(
  currentImages: ImageInfo[],
  newImageSize: number,
  maxImages: number = 6,
  maxTotalSize: number = 5 * 1024 * 1024 // 5MB
): { canAdd: boolean; reason?: string } {
  if (currentImages.length >= maxImages) {
    return { canAdd: false, reason: `Maximum ${maxImages} images allowed` };
  }

  const totalSize = calculateTotalSize(currentImages) + newImageSize;
  if (totalSize > maxTotalSize) {
    return {
      canAdd: false,
      reason: `Total size would exceed 5MB (current: ${formatFileSize(totalSize)})`,
    };
  }

  return { canAdd: true };
}