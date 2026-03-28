// src/database/models/DiaryEntry.ts
import { Model, Query } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
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
  @field('device_id') deviceId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('diary_images') images!: Query<DiaryImage>;

  get wordCount(): number {
    return this.content.trim().split(/\s+/).length;
  }

  get excerpt(): string {
    return this.content.length > 100
      ? `${this.content.substring(0, 100)}...`
      : this.content;
  }
}
