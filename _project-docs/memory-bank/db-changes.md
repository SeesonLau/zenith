# DB Changes Log — Zenith

Log every database schema change, migration, or RLS policy change here.
Format: `[Date] [Type] Description`

---

## 2026-03-28 — Initial Supabase Tables (source unknown — likely manual)
- Tables created in Supabase: `habit_logs`, `finance_logs`, `diary_entries`, `diary_images`, `leisure_logs`, `user_preferences`
- RLS enabled on all 6 tables
- RLS policies: all set to `Allow all (public)` — qual: true, with_check: true — INSECURE, needs rewrite
- `sync_metadata` table NOT created in Supabase (exists only locally)

## Schema Drift Identified — 2026-03-28 (audit)
Supabase has columns not present in local WatermelonDB schema:
- All tables: `device_id` (text, nullable) — not in schema.ts
- `leisure_logs`: `linked_habit_id` (text, nullable) — not in schema.ts, references auto-created habit log
- `diary_images`: `uploaded_at` (timestamptz, nullable) — not in schema.ts

---

## Pending Actions
- [ ] Add `user_id` column to all tables (required for RLS)
- [ ] Rewrite all RLS policies to filter by `auth.uid() = user_id`
- [ ] Add `device_id` to WatermelonDB schema OR remove from Supabase
- [ ] Add `linked_habit_id` to LeisureLog model + schema OR remove from Supabase
- [ ] Add `uploaded_at` to DiaryImage model + schema OR remove from Supabase
- [ ] Create `sync_metadata` table in Supabase
- [ ] Generate migration file for any schema changes
