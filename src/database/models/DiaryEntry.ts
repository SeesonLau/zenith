// src/database/models/DiaryEntry.ts
import { Model, Query } from '@nozbe/watermelondb'; 
import { field, date, readonly, children, writer } from '@nozbe/watermelondb/decorators';
import DiaryImage from './DiaryImage';

export default class DiaryEntry extends Model {
  static table = 'diary_entries';
  static associations = {
    diary_images: { type: 'has_many', foreignKey: 'diary_entry_id' },
  } as const;

  @field('title') title?: string;
  @field('content') content!: string;
  @date('entry_date') entryDate!: Date;
  @field('mood') mood?: string;
  @field('is_synced') isSynced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // CHANGE THIS LINE: Remove "Q."
  @children('diary_images') images!: Query<DiaryImage>; 

  // Get word count
  get wordCount(): number {
    return this.content.trim().split(/\s+/).length;
  }

  // Get excerpt (first 100 characters)
  get excerpt(): string {
    return this.content.length > 100 
      ? `${this.content.substring(0, 100)}...` 
      : this.content;
  }

  @writer async addImage(localUri: string, mimeType: string, fileSize: number) {
    const imageCollection = this.collections.get<DiaryImage>('diary_images');
    await imageCollection.create((image) => {
      image.diaryEntry.set(this);
      image.localUri = localUri;
      image.uploadStatus = 'pending';
      image.mimeType = mimeType;
      image.fileSize = fileSize;
      image.isSynced = false;
    });
    
    await this.update((entry) => {
      entry.isSynced = false;
    });
  }
}