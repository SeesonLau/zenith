// supabase/migration.ts
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

const migrations = schemaMigrations({
  migrations: [
    // Migration version 1 is the initial schema
    // No changes needed for version 1
  ],
});

export default migrations;
