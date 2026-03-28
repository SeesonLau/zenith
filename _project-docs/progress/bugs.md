# Bug Tracker — Zenith
**Last updated:** 2026-03-28

---

## 🔴 Critical

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-001 | Security | Supabase DB | — | RLS policies are `Allow all (public)` with `qual: true` — any request can read/write all rows. No user filtering. | Open |
| BUG-002 | Security | Supabase DB | — | No `user_id` column on any table — RLS policies cannot filter by owner even if rewritten. | Open |
| BUG-003 | Sync | Schema | — | Schema drift: Supabase has `device_id` on all tables, `linked_habit_id` on `leisure_logs`, `uploaded_at` on `diary_images` — none of these exist in local WatermelonDB schema. Sync will silently drop these columns. | Open |
| BUG-004 | Sync | Supabase DB | — | `sync_metadata` table exists locally but not in Supabase — sync tracking will fail. | Open |

---

## 🟠 High

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-005 | Security | `src/database/sync/supabaseSync.ts` | 36 | Logs full sync payload via `JSON.stringify(changes)` — exposes all personal data to console/logs. | Open |
| BUG-006 | Sync | `supabase/functions/` | — | `push_changes` Edge Function does not exist — every sync push will fail with RPC error. | Open |
| BUG-007 | Sync | `supabase/functions/pull_changes/index.ts` | — | `pull_changes` Edge Function is empty — sync pull returns no data. | Open |
| BUG-008 | Code Quality | `app/auth.tsx` | 41, 52 | `error: any` used twice — should be typed as `AuthError` from `@supabase/supabase-js`. | Open |
| BUG-009 | Code Quality | Multiple | 1 | Missing file path comment on line 1 in: `app/auth.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/habits.tsx`. | Open |
| BUG-010 | Code Quality | `app/(tabs)/_layout.tsx` | 12–14 | Hardcoded hex colors `#0f172a`, `#1e293b`, `#38bdf8`, `#64748b` instead of theme tokens or constants. | Open |

---

## 🟡 Medium

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-011 | Architecture | `src/types/database.types.ts` | ~360 | `RootStackParamList` defined in wrong file — belongs in `src/types/navigation.types.ts`. | Open |
| BUG-012 | Architecture | `app/(tabs)/habits.tsx` | ~30–60 | Timer interval logic (`setInterval` / elapsed time) is inline — `src/hooks/useTimer.ts` exists but is empty. Violates separation of concerns. | Open |
| BUG-013 | Code Quality | `src/database/models/DiaryEntry.ts` | 20 | Stale comment "CHANGE THIS LINE: Remove Q." — misleading, should be removed. | Open |
| BUG-014 | Architecture | `src/contexts/SyncContext.tsx` | — | Empty stub — sync state (isSyncing, lastSyncedAt, error) not available app-wide. Any screen that needs sync status has no source of truth. | Open |
| BUG-015 | Architecture | `src/contexts/ThemeContext.tsx` | — | Empty stub — no theme switching capability. | Open |
| BUG-016 | Architecture | `src/types/` | — | `global.types.ts`, `navigation.types.ts`, `supabase.types.ts` are all empty stubs. Types they should contain are scattered or missing entirely. | Open |

---

## 🟢 Low

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-017 | Code Quality | `src/database/sync/supabaseSync.ts` | Multiple | 12 `console.log` statements with emoji decorations — must be removed or wrapped in `__DEV__` before production. | Open |
| BUG-018 | Architecture | `src/hooks/useTimer.ts` | — | Empty stub while timer logic is duplicated inline in `habits.tsx`. Will need to be extracted before Leisure timer screen is built. | Open |
| BUG-019 | Architecture | `src/database/sync/syncManager.ts` | — | Empty stub — `supabaseSync.ts` exists but `syncManager.ts` (the intended wrapper) is never used. Two sync files with unclear responsibility split. | Open |

---

## Tracking

| Severity | Total | Open | Fixed |
|---|---|---|---|
| Critical | 4 | 4 | 0 |
| High | 6 | 6 | 0 |
| Medium | 6 | 6 | 0 |
| Low | 3 | 3 | 0 |
| **Total** | **19** | **19** | **0** |
