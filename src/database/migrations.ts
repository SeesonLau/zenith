// src/database/migrations.ts (CORRECTED)
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
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