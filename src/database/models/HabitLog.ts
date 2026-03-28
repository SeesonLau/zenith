// src/database/models/HabitLog.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';
import { formatDurationShort } from '@/src/utils/formatters';

export default class HabitLog extends Model {
  static table = 'habit_logs';

  @field('category') category!: string;
  @field('activity') activity!: string;
  @date('started_at') startedAt!: Date;
  @date('ended_at') endedAt?: Date;
  @field('duration') duration?: number;
  @field('notes') notes?: string;
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
