// src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 6, // INCREMENTED VERSION
  tables: [
    // ==========================================
    // HABIT TRACKER - Layered Time System
    // ==========================================
    tableSchema({
      name: 'habit_logs',
      columns: [
        { name: 'category', type: 'string' },
        { name: 'activity', type: 'string' },
        { name: 'started_at', type: 'number' },
        { name: 'ended_at', type: 'number', isOptional: true },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ==========================================
    // FINANCE TRACKER
    // ==========================================
    tableSchema({
      name: 'finance_logs',
      columns: [
        { name: 'transaction_type', type: 'string' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'item', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'cost', type: 'number' },
        { name: 'total_cost', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'type_category', type: 'string' },
        { name: 'transaction_date', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ==========================================
    // DIARY MODULE
    // ==========================================
    tableSchema({
      name: 'diary_entries',
      columns: [
        { name: 'title', type: 'string', isOptional: true },
        { name: 'content', type: 'string' },
        { name: 'entry_date', type: 'number' },
        { name: 'mood', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Diary Images (One-to-Many relationship)
    tableSchema({
      name: 'diary_images',
      columns: [
        { name: 'diary_entry_id', type: 'string', isIndexed: true },
        { name: 'local_uri', type: 'string' },
        { name: 'remote_url', type: 'string', isOptional: true },
        { name: 'upload_status', type: 'string' },
        { name: 'file_size', type: 'number', isOptional: true },
        { name: 'mime_type', type: 'string', isOptional: true },
        { name: 'uploaded_at', type: 'number', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ==========================================
    // LEISURE TRACKER
    // ==========================================
    tableSchema({
      name: 'leisure_logs',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string', isOptional: true },
        { name: 'started_at', type: 'number' },
        { name: 'ended_at', type: 'number', isOptional: true },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'linked_habit_id', type: 'string', isOptional: true }, // NEW FIELD
        { name: 'is_synced', type: 'boolean' },
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ==========================================
    // USER PREFERENCES
    // ==========================================
    tableSchema({
      name: 'user_preferences',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ==========================================
    // SYNC METADATA
    // ==========================================
    tableSchema({
      name: 'sync_metadata',
      columns: [
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'last_pulled_at', type: 'number', isOptional: true },
        { name: 'last_pushed_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

export default schema;