// src/database/models/LeisureLog.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';
import type { LeisureType } from '@/src/constants/categories';
import { formatDurationShort } from '@/src/utils/formatters';

export default class LeisureLog extends Model {
  static table = 'leisure_logs';

  @field('type') type!: LeisureType;
  @field('title') title?: string;
  @date('started_at') startedAt!: Date;
  @date('ended_at') endedAt?: Date;
  @field('duration') duration?: number;
  @field('notes') notes?: string;
  @field('linked_habit_id') linkedHabitId?: string;
  @field('is_synced') isSynced!: boolean;
  @field('device_id') deviceId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  get isRunning(): boolean {
    return !this.endedAt;
  }

  get formattedDuration(): string {
    return formatDurationShort(this.duration || 0);
  }
}
