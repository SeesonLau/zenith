// src/database/migrations.ts
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

// WatermelonDB requires a contiguous migration chain from v1 to the current schema version.
// If any version in the chain is missing, WatermelonDB resets (wipes) the local database.
// Versions 2–5 are empty placeholders to preserve the chain for devices at those versions.

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [],
    },
    {
      toVersion: 3,
      steps: [],
    },
    {
      toVersion: 4,
      steps: [],
    },
    {
      toVersion: 5,
      steps: [],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: 'habit_logs',
          columns: [
            { name: 'device_id', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'finance_logs',
          columns: [
            { name: 'device_id', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'diary_entries',
          columns: [
            { name: 'device_id', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'diary_images',
          columns: [
            { name: 'device_id', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'leisure_logs',
          columns: [
            { name: 'device_id', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
