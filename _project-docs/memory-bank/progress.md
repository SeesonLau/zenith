# Progress — Zenith

## Current Version: 0.1.0

## Version History
| Version | Date | Summary |
|---|---|---|
| 0.1.0 | 2026-03-28 | Initial scaffold — DB setup, auth wired, tabs scaffolded, habits screen functional |

## Done
- [0.1.0] Expo project initialized with Expo Router
- [0.1.0] Tab layout: Dashboard, Habits, Finance, Diary, Leisure
- [0.1.0] WatermelonDB schema defined — 7 tables with sync fields and soft deletes
- [0.1.0] All 4 domain models: HabitLog, FinanceLog, DiaryEntry, DiaryImage, LeisureLog
- [0.1.0] All 4 domain actions: habit, finance, diary, leisure
- [0.1.0] Database hooks: useRunningHabitTimers, useRunningLeisureTimers, useFinanceLogs, useDiaryEntries
- [0.1.0] Supabase client set up (`src/lib/supabase.ts`)
- [0.1.0] AuthContext with sign in, sign up, sign out
- [0.1.0] auth.tsx screen (email/password login + signup)
- [0.1.0] Habits tab screen — full timer UI functional
- [0.1.0] NativeWind v4 + Tailwind v4 configured
- [0.1.0] Supabase MCP connected

## In Progress
- Nothing actively in progress

## Known Issues (see `_project-docs/progress/bugs.md` for full detail)
- [CRITICAL] RLS policies allow all public access — no user_id column on tables
- [CRITICAL] Schema drift between local WatermelonDB and Supabase (device_id, linked_habit_id, uploaded_at)
- [HIGH] push_changes and pull_changes Edge Functions are empty stubs
- [HIGH] Sync payload logged to console
- [MED] SyncContext, ThemeContext, useTimer, useSync all empty stubs
- [MED] All 24 components are empty stubs
- [MED] All 15 sub-screens are empty stubs
