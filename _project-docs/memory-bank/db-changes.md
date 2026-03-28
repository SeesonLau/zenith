# DB Changes Log — Zenith

Log every database schema change, migration, or RLS policy change here.
Format: `[Date] [Type] Description`

---

## 2026-03-28 — Initial Supabase Tables (source: supabase/migrations/ SQL files)
- Tables created in Supabase: `habit_logs`, `finance_logs`, `diary_entries`, `diary_images`, `leisure_logs`, `user_preferences`
- SQL migrations 01 through 10 exist in `supabase/migrations/`
- `sync_metadata` table: **NOT in Supabase** (exists only in local WatermelonDB)
- RLS enabled on all tables (migrations 02–08)
- RLS policies: all set to `Allow all (public)` — qual: true, with_check: true — **INSECURE**
- Migration 10 added `linked_habit_id` column to `leisure_logs` (Supabase side)

## 2026-03-28 — WatermelonDB Schema v5 → v6
- **Local migration** `src/database/migrations.ts` (toVersion: 6):
  - Added `device_id` (string, optional) to: habit_logs, finance_logs, diary_entries, diary_images, leisure_logs
- **Schema v6** (`src/database/schema.ts`) also includes (were already in v5 or added directly):
  - `linked_habit_id` (string, optional) on `leisure_logs`
  - `uploaded_at` (number, optional) on `diary_images`

## Current State — WatermelonDB vs Supabase Alignment

| Column | WatermelonDB v6 | Supabase | Status |
|---|---|---|---|
| `device_id` (all tables) | ✅ In schema + migration | ✅ Added via migration 03 | **Aligned** |
| `linked_habit_id` (leisure_logs) | ✅ In schema + model | ✅ Added via migration 10 | **Aligned** |
| `uploaded_at` (diary_images) | ✅ In schema + model | ✅ In initial create | **Aligned** |
| `user_id` (all tables) | ❌ Missing | ❌ Missing | **Missing — blocks RLS** |
| `sync_metadata` table | ✅ Exists locally | ❌ Not in Supabase | **Gap — sync tracking broken** |

---

## Pending Actions
- [ ] Add `user_id` column to all tables (required for RLS to function)
- [ ] Rewrite all RLS policies from `Allow all (public)` to `auth.uid() = user_id`
- [ ] Create `sync_metadata` table in Supabase (for WatermelonDB sync protocol)
- [ ] Generate SQL migration for user_id addition
- [ ] Re-enable Supabase auth (app currently runs without authentication)
