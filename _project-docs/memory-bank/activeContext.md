# Active Context — Zenith

## Current Version
0.1.0

## Current State
- ✅ Expo Router tab layout (5 tabs: Dashboard, Habits, Finance, Diary, Leisure)
- ✅ WatermelonDB schema defined (7 tables: habit_logs, finance_logs, diary_entries, diary_images, leisure_logs, user_preferences, sync_metadata)
- ✅ All 4 domain models implemented (HabitLog, FinanceLog, DiaryEntry/DiaryImage, LeisureLog)
- ✅ All 4 domain actions implemented (start/stop timers, create entries)
- ✅ Database hooks implemented (useRunningHabitTimers, useRunningLeisureTimers, useFinanceLogs, useDiaryEntries)
- ✅ AuthContext + auth.tsx screen (sign in / sign up)
- ✅ Supabase connected via MCP (6 tables live, 719 habit logs, 366 leisure logs)
- ✅ Habits tab fully functional (timer system working)
- ❌ Finance, Diary, Leisure, Dashboard tabs are stubs
- ❌ All 24 components are empty stubs
- ❌ All 15 sub-screens are empty stubs
- ❌ Sync Edge Functions empty — sync is broken end-to-end
- ❌ RLS policies are open (allow all public) — CRITICAL security issue

## Open Issues
- [CRITICAL] RLS allows all public access — no user_id on tables, no ownership filtering
- [CRITICAL] Schema drift — Supabase has device_id, linked_habit_id, uploaded_at not in local schema
- [HIGH] push_changes + pull_changes Edge Functions are empty
- [HIGH] sync payload logged to console (data leak)
- [MED] SyncContext, ThemeContext empty stubs
- See `_project-docs/progress/bugs.md` for full list (19 bugs)

## Next Steps (Priority Order)
1. Fix RLS: add user_id to all tables + rewrite policies
2. Fix schema drift: align local WatermelonDB schema with Supabase
3. Implement push_changes + pull_changes Edge Functions
4. Extract timer logic into useTimer hook
5. Build common components (Button, Card, Input, EmptyState, LoadingSpinner)
6. Build Finance screen (highest data volume — 167 logs already exist)

## Blockers
- Sync is non-functional until items 1–3 above are resolved
- No UI components exist — every screen build depends on common components first
