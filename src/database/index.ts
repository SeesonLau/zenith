// src/database/index.ts
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import migrations from '@/supabase/migration';
import {
  HabitLog,
  FinanceLog,
  DiaryEntry,
  DiaryImage,
  LeisureLog,
  UserPreference,
  SyncMetadata,
} from './models';

// Configure SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'zenith',
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Create and export database instance
export const database = new Database({
  adapter,
  modelClasses: [
    HabitLog,
    FinanceLog,
    DiaryEntry,
    DiaryImage,
    LeisureLog,
    UserPreference,
    SyncMetadata,
  ],
});

export default database;