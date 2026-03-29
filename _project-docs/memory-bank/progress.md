# Progress — Zenith

## Current Version: 0.2.1

## Version History
| Version | Date | Summary |
|---|---|---|
| 0.1.0 | 2026-03-28 | Initial scaffold — DB setup, auth wired, tabs scaffolded, habits screen functional |
| 0.2.0 | 2026-03-28 | All 4 tab screens + all sub-screens implemented, sync layer complete, theme system working |
| 0.2.1 | 2026-03-29 | QA pass 1 complete — 26 additional issues fixed (debug guards, calendar, leisure, analytics, a11y) |

## Done

### [0.1.0] Foundation
- Expo project initialized with Expo Router
- Tab layout: Dashboard, Habits, Finance, Diary, Leisure
- WatermelonDB schema v5 — 7 tables with sync fields and soft deletes
- All 4 domain models: HabitLog, FinanceLog, DiaryEntry, DiaryImage, LeisureLog
- All 4 domain action files: habitActions, financeActions, diaryActions, leisureActions
- imageActions.ts — upload, delete, retry failed uploads to Supabase Storage
- Database hooks: useRunningHabitTimers, useRunningLeisureTimers, useFinanceLogs, useDiaryEntries
- Additional hooks: useCompletedHabitLogs, useCompletedLeisureLogs, useDiaryImages, useAllDiaryEntries
- Supabase client (`src/lib/supabase.ts`) + getDeviceId()
- Supabase Storage (`src/lib/supabaseStorage.ts`) — upload/delete/download diary images
- NativeWind v4 + Tailwind v3.4 configured

### [0.2.0] Screens + Sync + Theme
- Schema v6 — added device_id (all tables), linked_habit_id (leisure_logs), uploaded_at (diary_images)
- Migrations file (`src/database/migrations.ts`) — covers v6 device_id addition
- **All 4 tab screens fully implemented:**
  - Habits — active timers with LIVE badge, formatDurationHMS, grouped session history
  - Finance — weekly calendar bar graph, balance card, income/expense stats, transaction list
  - Diary — month navigator, stats (entries/this week/total words/streak), entry list
  - Leisure — active sessions (LeisureTimerCard), today's stats, grouped session history
- **All sub-screens fully implemented:**
  - `habit/start.tsx` — category/activity picker, notes, start timer
  - `habit/[id].tsx` — detail view with stop/delete
  - `habit/history.tsx` — full history with date grouping
  - `finance/add.tsx` — full form with quick tags (item/location/cost), dual-column category/currency picker
  - `finance/[id].tsx` — transaction detail
  - `finance/analytics.tsx` — category breakdown + analytics
  - `diary/new.tsx` — rich text entry with mood picker + image attach
  - `diary/[id].tsx` — entry detail + edit
  - `diary/calendar.tsx` — calendar heatmap view
  - `leisure/complete.tsx` — session completion with LeisureTypePicker
  - `leisure/[id].tsx` — session detail
  - `settings/index.tsx` — theme switcher (slate/white), data panel, about
  - `settings/preferences.tsx` — user preferences
- **All common components implemented:**
  - Button (5 variants: primary/secondary/success/danger/ghost, 3 sizes, icon support, loading)
  - Card, Input, EmptyState, FloatingActionButton, Badge, ScreenWrapper
  - SyncStatus (manual sync, force full sync, debug tools — Test Pull, Check Local, Check Supabase)
  - NetworkStatus, DatePicker, Divider, LoadingSpinner, ScreenContext
- **All domain components implemented:**
  - Diary: DiaryCard, MoodPicker, ImageGallery, RichTextEditor
  - Finance: StatCard
  - Leisure: LeisureTimerCard (live timer with LIVE badge), CompletedLeisureCard, LeisureTypePicker (grouped by I/II/III with collapse)
- **ThemeContext fully implemented** — dark (slate) / light (white), persisted via AsyncStorage, triggers NativeWind setColorScheme
- **useThemeColors hook** — full token map (bgPrimary, bgSurface, bgSurfaceHover, textPrimary, textSecondary, textTertiary, borderSurface, module colors, status colors)
- **Sync layer fully implemented:**
  - `syncManager.ts` — performSync, forceFullSync, startAutoSync (5min interval), stopAutoSync, getSyncStatus, getPendingChangesCount, clearSyncMetadata
  - `supabaseSync.ts` — syncWithSupabase, filterSyncMetadata (prevents sync_metadata from being pushed)
  - `syncUtils.ts` — checkSyncMetadataDuplicates, cleanupDuplicateSyncMetadata, getSyncStatistics, verifySyncMetadataIntegrity, generateSyncDiagnosticReport, quickFixSyncIssues
- **useSync hook** — exposes sync(), isSyncing, lastSyncedAt, syncError
- **src/constants/categories.ts** — single source of truth for all categories + validation helpers
- **src/lib/constants.ts** — HABIT_CONFIG, FINANCE_CONFIG, LEISURE_CONFIG, DIARY_CONFIG + config getters
- **src/utils/formatters.ts** — formatCurrency, formatDurationHMS, formatDuration, formatTime, formatNumber
- **src/utils/dateHelpers.ts** — formatDate, getRelativeTime, getStartOf/EndOf (month/day/week), isSameDay, isToday, isYesterday, addDays, addMonths
- **src/utils/imageHelpers.ts** — image processing utilities
- **leisureActions.ts** — startLeisureTimer (creates linked HabitLog with category Enjoyment/activity Leisure), completeLeisureSession, stopLeisureTimer — both stop the linked habit log
- Auto-sync started in `app/_layout.tsx` useEffect via startAutoSync/stopAutoSync

## In Progress
- Nothing actively in progress

## Known Issues
Full issue list in `_project-docs/progress/qa-bugs.md` (81 issues, 36 open).

**Critical (blocking production):**
- [CRITICAL] Auth completely removed — no login/signup flow, supabase session disabled
- [CRITICAL] RLS policies allow all public access — no user_id column on Supabase tables
- [CRITICAL] QA-079: Supabase edge functions (pull_changes/push_changes) not deployed — sync broken

**High:**
- QA-028/041: Settings preferences saves nothing — resets on restart
- QA-054–058: No user_id on any record type — RLS cannot function
- QA-036: Home screen is a static splash with no domain data
- QA-080/081: `diary/[id].tsx` missing SafeAreaView and still uses NativeWind (legacy)
