# Changelog

## [0.2.0] — 2026-03-28
### Added
- All 4 tab screens fully implemented: Habits, Finance, Diary, Leisure
- All sub-screens implemented: habit/start, habit/[id], habit/history, finance/add, finance/[id], finance/analytics, diary/new, diary/[id], diary/calendar, leisure/complete, leisure/[id], settings/index, settings/preferences
- All common components: Button (5 variants), Card, Input, EmptyState, FloatingActionButton, Badge, ScreenWrapper, SyncStatus (with debug tools), NetworkStatus, DatePicker, Divider, LoadingSpinner, ScreenContext
- All domain components: DiaryCard, MoodPicker, ImageGallery, RichTextEditor, StatCard, LeisureTimerCard (live timer), CompletedLeisureCard, LeisureTypePicker (grouped by type I/II/III)
- ThemeContext — dark (slate) / light (white) toggle, persisted via AsyncStorage, triggers NativeWind color scheme
- useThemeColors hook — full design token map (bg, text, border, module colors, status colors)
- SyncManager — performSync, forceFullSync, startAutoSync (5min interval + reconnect), stopAutoSync
- supabaseSync.ts — WatermelonDB synchronize() wrapper with filterSyncMetadata (prevents sync_metadata push)
- syncUtils.ts — diagnostic utilities (duplicate detection, statistics, integrity check, quick fix)
- useSync hook — wraps performSync, exposes isSyncing, lastSyncedAt, syncError
- src/constants/categories.ts — single source of truth for all enum values (HabitCategory, FinanceTypeCategory, LeisureType, MoodType, CurrencyCode + validation helpers)
- src/database/migrations.ts — WatermelonDB migration v6 (adds device_id to all domain tables)
- imageActions.ts — upload, delete, retry failed uploads to Supabase Storage
- Leisure timer creates linked HabitLog (category: Enjoyment) for habit tracking integration
- Finance screen — weekly calendar bar graph (income up/expense down), balance card, dual navigation
- Diary screen — month navigator, stats (entries/streak/word count), entry list
- WatermelonDB schema v6: added device_id (all tables), linked_habit_id (leisure_logs), uploaded_at (diary_images)

### Removed
- AuthContext and auth screen — authentication removed entirely (CRITICAL gap, to be restored)
- SyncContext — replaced by useSync hook
- layout/ components (Container, Header, TabBar) — not needed with current design
- useTimer.ts, useNetworkStatus.ts, useImagePicker.ts stubs
- supabase/functions/ edge function files (server-side deployment status unknown)
- Redundant type stub files (global.types.ts, navigation.types.ts, supabase.types.ts)

### Changed
- Supabase client auth disabled: persistSession: false, autoRefreshToken: false
- Styling approach: inline style={{}} objects throughout (was intended to be NativeWind className)

---

## [0.1.0] — 2026-03-28
### Added
- Initial project scaffold with Expo Router tab layout
- Five tabs: Dashboard, Habits, Finance, Diary, Leisure
- WatermelonDB schema v5 — 7 tables with sync fields and soft deletes
- All 4 domain models: HabitLog, FinanceLog, DiaryEntry, DiaryImage, LeisureLog
- All 4 domain action files: habitActions, financeActions, diaryActions, leisureActions
- Database hooks: useRunningHabitTimers, useRunningLeisureTimers, useFinanceLogs, useDiaryEntries
- Supabase client + getDeviceId() utility
- NativeWind v4 + Tailwind CSS v3.4 configured
- Component scaffolds across all domains
