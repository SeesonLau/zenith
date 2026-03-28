// src/database/models/HabitLog.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

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
    if (!this.duration) return '0s';
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
}
