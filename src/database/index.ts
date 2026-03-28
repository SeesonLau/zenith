// src/database/index.ts (COMPLETE VERSION WITH MIGRATIONS)
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';
import { schema } from './schema';
import migrations from './migrations';  

// Import all models
import HabitLog from './models/HabitLog';
import FinanceLog from './models/FinanceLog';
import DiaryEntry from './models/DiaryEntry';
import DiaryImage from './models/DiaryImage';
import LeisureLog from './models/LeisureLog';
import UserPreference from './models/UserPreference';
import SyncMetadata from './models/SyncMetadata';

const adapter = new SQLiteAdapter({
  schema,
  migrations,  // ADDED: Enable migrations
  dbName: 'zenith',
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

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

export * from './models';
export * from './actions/habitActions';
export * from './actions/financeActions';
export * from './actions/diaryActions';
export * from './actions/leisureActions';
export * from './actions/imageActions';