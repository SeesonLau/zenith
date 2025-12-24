// src/database/models/UserPreference.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class UserPreference extends Model {
  static table = 'user_preferences';

  @field('key') key!: string;
  @field('value') value!: string; // Store JSON stringified values
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Parse JSON value
  get parsedValue(): any {
    try {
      return JSON.parse(this.value);
    } catch {
      return this.value;
    }
  }
}