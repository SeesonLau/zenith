# Active Context — Zenith

## Current Version
0.2.0

## Current State
- ✅ All 4 tab screens fully implemented (Habits, Finance, Diary, Leisure)
- ✅ All sub-screens implemented: habit/start, habit/[id], habit/history, finance/add, finance/[id], finance/analytics, diary/new, diary/[id], diary/calendar, leisure/complete, leisure/[id], settings/index, settings/preferences
- ✅ All common + domain components implemented
- ✅ WatermelonDB schema v6 — 7 tables, device_id + linked_habit_id + uploaded_at in schema
- ✅ SyncManager fully implemented — auto-sync every 5 min, performSync, forceFullSync
- ✅ ThemeContext working — dark (slate) / light (white) toggle, persisted via AsyncStorage
- ✅ Full QA audit complete (2026-03-28) — 77 issues logged in `_project-docs/progress/qa-bugs.md`
- ❌ Auth removed — no login flow, supabase session disabled (CRITICAL)
- ❌ RLS policies open (allow all public) — no user_id on any table (CRITICAL)
- ❌ 2 crash bugs: nested `database.write()` in diaryActions.ts (QA-053, QA-060)
- ❌ 2 data leak bugs: sync payload logged to console in production (QA-009, QA-010)

## Critical Bugs (crash / data leak / broken feature)
- QA-053: Nested `database.write()` in `createDiaryEntry` → crash when adding images
- QA-060: Nested `database.write()` in `deleteDiaryEntry` → crash when deleting entry with images
- QA-009: `SyncStatus.tsx` logs raw sync data in production (no `__DEV__` guard)
- QA-010: `supabaseSync.ts` logs individual finance records via `JSON.stringify`
- QA-050: Leisure discard → phantom running timer (never completable)
- QA-040: Diary calendar day tap → `console.log` only, no navigation
- QA-024: Diary calendar hardcoded to December 2024

## Next Steps (Priority Order)
1. Fix QA-053 + QA-060 — diary nested write crashes (blocking feature)
2. Fix QA-009 + QA-010 — production data leak via console
3. Fix QA-050 — phantom leisure timer on discard
4. Fix QA-024 + QA-040 — diary calendar broken
5. Restore auth (R-01) — login/signup with Supabase
6. Fix RLS (R-02) — add user_id + rewrite policies
7. See `_project-docs/progress/qa-bugs.md` for all 77 issues
