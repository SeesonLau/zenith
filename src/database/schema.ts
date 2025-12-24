// src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // ==========================================
    // HABIT TRACKER - Layered Time System
    // ==========================================
    tableSchema({
      name: 'habit_logs',
      columns: [
        { name: 'category', type: 'string' }, // Productivity, Self-Care, Logistics, Enjoyment, Nothing
        { name: 'activity', type: 'string' }, // Working, Studying, Sleeping, etc.
        { name: 'started_at', type: 'number' }, // Unix timestamp (milliseconds)
        { name: 'ended_at', type: 'number', isOptional: true }, // Unix timestamp (null if still running)
        { name: 'duration', type: 'number', isOptional: true }, // Calculated in seconds
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // Sync fields
        { name: 'is_synced', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true }, // Soft delete for sync
      ],
    }),

    // ==========================================
    // FINANCE TRACKER
    // ==========================================
    tableSchema({
      name: 'finance_logs',
      columns: [
        { name: 'transaction_type', type: 'string' }, // 'income' or 'expense'
        { name: 'location', type: 'string', isOptional: true },
        { name: 'item', type: 'string' },
        { name: 'quantity', type: 'number' }, // Default 1
        { name: 'cost', type: 'number' }, // Unit cost
        { name: 'total_cost', type: 'number' }, // Auto-calculated: quantity * cost
        { name: 'currency', type: 'string' }, // Default 'PHP'
        { name: 'type_category', type: 'string' }, // Load, Fare, School, Personal-Physical, etc.
        { name: 'transaction_date', type: 'number' }, // Unix timestamp (milliseconds)
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // Sync fields
        { name: 'is_synced', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // ==========================================
    // DIARY MODULE
    // ==========================================
    tableSchema({
      name: 'diary_entries',
      columns: [
        { name: 'title', type: 'string', isOptional: true },
        { name: 'content', type: 'string' }, // Rich text stored as plain text or markdown
        { name: 'entry_date', type: 'number' }, // Unix timestamp (milliseconds)
        { name: 'mood', type: 'string', isOptional: true }, // Optional: happy, sad, neutral, etc.
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // Sync fields
        { name: 'is_synced', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // Diary Images (One-to-Many relationship)
    tableSchema({
      name: 'diary_images',
      columns: [
        { name: 'diary_entry_id', type: 'string', isIndexed: true }, // Foreign key
        { name: 'local_uri', type: 'string' }, // Local file path
        { name: 'remote_url', type: 'string', isOptional: true }, // Supabase Storage URL
        { name: 'upload_status', type: 'string' }, // 'pending', 'uploaded', 'failed'
        { name: 'file_size', type: 'number', isOptional: true }, // In bytes
        { name: 'mime_type', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // Sync fields
        { name: 'is_synced', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // ==========================================
    // LEISURE TRACKER
    // ==========================================
    tableSchema({
      name: 'leisure_logs',
      columns: [
        { name: 'type', type: 'string' }, // Manga, Manhwah, Manhuah, Fanart, Real, AV
        { name: 'title', type: 'string', isOptional: true }, // Optional: name of content
        { name: 'started_at', type: 'number' }, // Unix timestamp (milliseconds)
        { name: 'ended_at', type: 'number', isOptional: true }, // null if still running
        { name: 'duration', type: 'number', isOptional: true }, // Calculated in seconds
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // Sync fields
        { name: 'is_synced', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // ==========================================
    // USER PREFERENCES (Optional - for app settings)
    // ==========================================
    tableSchema({
      name: 'user_preferences',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' }, // Store JSON stringified values
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ==========================================
    // SYNC METADATA (Track last sync times)
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