// src/database/models/LeisureLog.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, writer } from '@nozbe/watermelondb/decorators';

export default class LeisureLog extends Model {
  static table = 'leisure_logs';

  @field('type') type!: 'Manga' | 'Manhwah' | 'Manhuah' | 'Fanart' | 'Real' | 'AV';
  @field('title') title?: string;
  @date('started_at') startedAt!: Date;
  @date('ended_at') endedAt?: Date;
  @field('duration') duration?: number; // in seconds
  @field('notes') notes?: string;
  @field('is_synced') isSynced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @writer async stopTimer() {
    if (this.endedAt) {
      throw new Error('Timer already stopped');
    }
    const now = new Date();
    const durationInSeconds = Math.floor((now.getTime() - this.startedAt.getTime()) / 1000);
    
    await this.update((log) => {
      log.endedAt = now;
      log.duration = durationInSeconds;
      log.isSynced = false;
    });
  }

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