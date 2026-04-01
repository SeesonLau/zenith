# Active Context — Zenith

## Current Version
0.2.2

## Current State
- ✅ All 4 tab screens fully implemented (Habits, Finance, Diary, Leisure)
- ✅ WatermelonDB schema v6 — 7 tables, device_id + linked_habit_id + uploaded_at
- ✅ SyncManager fully implemented — auto-sync, performSync, forceFullSync
- ✅ ThemeContext working — dark/light toggle, persisted via AsyncStorage
- ✅ Leisure Analytics — 3 tabs (Monthly/Overall/Intervals), expandable By Type with title drill-down and session details, GitHub-style heatmap (scroll + Day/Night divider)
- ✅ Leisure session edit/delete — detail screen follows Finance pattern (view → edit mode, DateTimePicker for date/time, duration editor)
- ✅ Leisure content type picker — all groups collapsed by default, no preselection on Add or Edit
- ✅ Infinite scroll on Leisure tab, Finance tab, and Habit History — 15 groups initial, auto-loads on scroll
- ✅ updateLeisureLog action added to leisureActions.ts
- ❌ Auth removed — no login flow, supabase session disabled (CRITICAL)
- ❌ RLS policies open (allow all public) — no user_id on any table (CRITICAL)
- ❌ Edge functions (pull_changes/push_changes) not deployed — sync always fails (CRITICAL)

## Critical Bugs (blocking production)
- QA-054–058: No `user_id` on any record — RLS cannot function
- QA-079: Supabase edge functions not deployed — sync broken end-to-end
- QA-028/041: Settings preferences UI saves nothing — resets on every restart

## Open High-Priority Issues
- QA-036: Home screen is a static splash — no domain data
- QA-037/038: Silent failure on habit/leisure timer errors
- QA-045: Diary cards always show 0 images
- QA-080/081: `diary/[id].tsx` missing SafeAreaView + still using NativeWind (legacy)

## Next Steps (Priority Order)
1. Restore auth (R-01) — login/signup screens wired to Supabase
2. Fix RLS (R-02) — add user_id to schema + rewrite policies
3. Deploy edge functions (R-03) — pull_changes + push_changes
4. Add user_id to WatermelonDB schema + migrations (R-10)
5. Fix settings preferences persistence (QA-028/041)
6. See `_project-docs/progress/qa-bugs.md` for all open issues
