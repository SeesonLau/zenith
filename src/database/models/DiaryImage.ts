// src/database/models/DiaryImage.ts
import { Model, Relation } from '@nozbe/watermelondb';
import { field, date, readonly, relation, writer } from '@nozbe/watermelondb/decorators';
import DiaryEntry from './DiaryEntry';

export default class DiaryImage extends Model {
  static table = 'diary_images';
  static associations = {
    diary_entries: { type: 'belongs_to', key: 'diary_entry_id' },
  } as const;

  @relation('diary_entries', 'diary_entry_id') diaryEntry!: Relation<DiaryEntry>;
  @field('local_uri') localUri!: string;
  @field('remote_url') remoteUrl?: string;
  @field('upload_status') uploadStatus!: 'pending' | 'uploaded' | 'failed';
  @field('file_size') fileSize?: number;
  @field('mime_type') mimeType?: string;
  @field('is_synced') isSynced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @writer async markAsUploaded(remoteUrl: string) {
    await this.update((image) => {
      image.remoteUrl = remoteUrl;
      image.uploadStatus = 'uploaded';
      image.isSynced = false;
    });
  }

  @writer async markAsFailed() {
    await this.update((image) => {
      image.uploadStatus = 'failed';
      image.isSynced = false;
    });
  }
}