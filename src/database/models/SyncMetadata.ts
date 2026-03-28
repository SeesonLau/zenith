// src/database/models/SyncMetadata.ts
import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

/**
 * SyncMetadata - LOCAL ONLY, NEVER SYNCED
 * 
 * This table stores device-specific sync timestamps.
 * Each device maintains its own sync state independently.
 * 
 * IMPORTANT: This table should NEVER be included in sync operations!
 */
export default class SyncMetadata extends Model {
  static table = 'sync_metadata';

  @field('table_name') tableName!: string;
  
  // Use numbers for sync timestamps (milliseconds since epoch)
  // This matches what WatermelonDB's sync expects
  @field('last_pulled_at') lastPulledAt!: number;
  @field('last_pushed_at') lastPushedAt!: number;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}