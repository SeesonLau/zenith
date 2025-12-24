// src/database/models/SyncMetadata.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class SyncMetadata extends Model {
  static table = 'sync_metadata';

  @field('table_name') tableName!: string;
  @date('last_pulled_at') lastPulledAt?: Date;
  @date('last_pushed_at') lastPushedAt?: Date;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}