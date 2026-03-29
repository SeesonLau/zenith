// src/constants/status.ts
// as const objects for every status/state string used in the app.
// Replaces raw string literals — rename here and TypeScript catches every callsite.

/** Image upload lifecycle */
export const UploadStatus = {
  Pending:   'pending',
  Uploading: 'uploading',
  Uploaded:  'uploaded',
  Failed:    'failed',
} as const;
export type UploadStatusValue = typeof UploadStatus[keyof typeof UploadStatus];

/** Local WatermelonDB sync metadata keys */
export const SyncKey = {
  LastSync: 'last_sync',
} as const;
export type SyncKeyValue = typeof SyncKey[keyof typeof SyncKey];

/** Supabase storage */
export const StorageBucket = {
  DiaryImages: 'diary-images',
} as const;
export type StorageBucketValue = typeof StorageBucket[keyof typeof StorageBucket];

/** Image encoding for Supabase upload */
export const ImageEncoding = {
  Base64: 'base64',
} as const;
export type ImageEncodingValue = typeof ImageEncoding[keyof typeof ImageEncoding];

/** AsyncStorage keys */
export const StorageKey = {
  DeviceId: '@zenith_device_id',
  Theme:    '@zenith_theme',
} as const;
export type StorageKeyValue = typeof StorageKey[keyof typeof StorageKey];
