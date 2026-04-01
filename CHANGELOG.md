# Changelog

## [0.2.2] — 2026-04-01
### Added
- Leisure Analytics — expandable By Type rows in Monthly and Overall tabs: tap type → see titles ranked by frequency, tap title → see all sessions with date/time/duration/notes
- Leisure session edit mode on `leisure/[id].tsx` — follows Finance pattern: view mode with Edit button in header toggles full edit mode on same screen
- Edit fields: Content Type, Title, Notes, Date (native date picker), Time (native time picker), Duration (hours + minutes inputs)
- `updateLeisureLog` action in `leisureActions.ts` — patches type/title/notes/startedAt/duration/endedAt, marks isSynced=false
- Infinite scroll / lazy loading on Leisure tab, Finance tab, and Habit History — 15 date-groups rendered initially, auto-loads 15 more when scroll approaches bottom (400px threshold)

### Fixed
- Leisure Analytics heatmap — wrapped in horizontal `ScrollView` so all 24 hour columns are reachable
- Leisure Analytics heatmap Day/Night divider — dark teal (`#0f766e`) vertical line in all cell rows
- `LeisureTypePicker` — all groups collapsed by default; no type preselected on Add or Edit
- `complete.tsx` — Content Type now starts as `null`; Save blocked with alert if no type selected
- Edit session form — Date & Time moved to very top of form (above Content Type)
- Leisure tab — removed hardcoded 20-session cap; now uses `useAllLeisureLogs()` filtered to completed sessions

---

## [0.2.1] — 2026-03-29
### Fixed
- All production `console.log`/`console.error` calls in sync layer, settings, layout, and calendar now guarded with `if (__DEV__)`
- `SyncStatus.tsx` debug tools panel gated behind `{__DEV__ && ...}` — not rendered in production builds
- Settings "Theme System Active" debug panel removed
- `Button.tsx` — replaced `any` types with `React.ComponentProps<typeof Ionicons>['name']` for icon and `ViewStyle` for style
- `LeisureTimerCard` — now uses `type` and `title` props (was showing hardcoded `❓` / "Untitled Session" for all timers)
- Finance analytics category colors — added `hex` field to `FINANCE_CONFIG.categories` so `backgroundColor` is valid (was `#green-500`)
- Finance analytics — reachable from Finance tab via new "Analytics" button in header
- Diary calendar — now defaults to current month (was hardcoded to December 2024)
- Diary calendar day tap — navigates to diary entry (single) or diary tab (multiple entries)
- Leisure complete discard — now calls `deleteLeisureLog` before `router.back()` (was leaving orphaned running timer)
- `FloatingActionButton` — added `accessibilityLabel` and `accessibilityRole="button"` props
- Tab bar inactive tint colors corrected for WCAG AA contrast on both dark (`#94a3b8`) and light (`#64748b`) themes
- `onRefresh` timeout in all four tab screens now stored in `useRef` and cleaned up on unmount
- Leftover build comments (`// ✅ KEEP`, `// ❌ REMOVED`, `// Added useMemo`) removed from `finance/add.tsx`
- `ScreenContext.tsx` path comment corrected (was `ScreenContent.tsx themed`)
- Settings About section placeholder values replaced (`"Your Name"` → `"PotatoIV"`, `"2025.01.01"` → `"2026.03.29"`)
- `console.error` in `finance/add.tsx` and `leisure/complete.tsx` now guarded with `__DEV__`

---

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
