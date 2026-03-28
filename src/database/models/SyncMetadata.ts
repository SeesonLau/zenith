// src/database/models/SyncMetadata.ts
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

/**
 * SyncMetadata - LOCAL ONLY, NEVER SYNCED
 *
 * Stores device-specific sync timestamps per table.
 * IMPORTANT: This table must NEVER be included in sync operations.
 */
export default class SyncMetadata extends Model {
  static table = 'sync_metadata';

  @field('table_name') tableName!: string;

  // Optional — null until first sync runs
  @field('last_pulled_at') lastPulledAt?: number;
  @field('last_pushed_at') lastPushedAt?: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
