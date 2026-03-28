# Active Context — Zenith

## Current Version
0.2.0

## Current State
- ✅ All 4 tab screens fully implemented (Habits, Finance, Diary, Leisure)
- ✅ All sub-screens implemented: habit/start, habit/[id], habit/history, finance/add, finance/[id], finance/analytics, diary/new, diary/[id], diary/calendar, leisure/complete, leisure/[id], settings/index, settings/preferences
- ✅ All common components: Button, Card, Input, EmptyState, FAB, Badge, ScreenWrapper, SyncStatus, NetworkStatus, DatePicker, Divider, LoadingSpinner, ScreenContext
- ✅ All domain components: DiaryCard, MoodPicker, ImageGallery, RichTextEditor, StatCard, LeisureTimerCard, CompletedLeisureCard, LeisureTypePicker
- ✅ WatermelonDB schema v6 — 7 tables, device_id + linked_habit_id + uploaded_at added
- ✅ SyncManager fully implemented — auto-sync every 5 min, performSync, forceFullSync, syncUtils diagnostics
- ✅ ThemeContext working — dark (slate) / light (white) toggle, persisted via AsyncStorage
- ✅ useThemeColors hook — full token map used across all screens
- ❌ Auth removed — no login flow, supabase session disabled, app runs without authentication
- ❌ RLS policies still open (allow all public) — CRITICAL security issue
- ❌ No user_id column on any Supabase table
- ❌ push_changes / pull_changes Edge Functions status unknown (called via RPC but may be empty)

## Open Issues
- [CRITICAL] RLS allows all public access — user_id missing, no ownership filtering
- [HIGH] Auth completely removed — app has no user authentication
- [HIGH] Edge Functions (push/pull) likely broken — sync is wired but server-side unverified
- [MED] financeConstants.ts has different category names than categories.ts — redundant file
- [MED] LeisureTimerCard ignores type/title props — renders "❓ Untitled Session" for all
- [MED] Version mismatch — index.tsx says v1.1.0, package.json says 1.0.0, CHANGELOG says 0.1.0
- [LOW] DiaryCard uses className; other screens use inline styles — mixed approach
- See `_project-docs/progress/bugs.md` for full list

## Next Steps (Priority Order)
1. Restore auth — implement login/signup flow (Supabase auth re-enable)
2. Fix RLS: add user_id to all Supabase tables + rewrite policies
3. Verify Edge Functions (push/pull) are deployed and working end-to-end
4. Fix LeisureTimerCard to use type/title props
5. Resolve financeConstants.ts vs categories.ts conflict
6. Standardize styling: choose inline styles or className across all screens
