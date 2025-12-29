// src/database/migrations.ts (CORRECTED)
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // Migration from version 1 to 5
    // Only ADD device_id columns to existing tables
    {
      toVersion: 5,
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