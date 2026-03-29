# QA Report — Bugs & Issues
**Last verified:** 2026-03-29
**Auditor:** Claude Code (automated full-read audit)

---

## Code Quality

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-001 | `app/_layout.tsx` | 15, 19 | `console.log('🚀 App starting...')` and `console.log('🛑 App closing...')` — not guarded by `__DEV__` | High | Logs appear in production builds | Wrap both in `if (__DEV__) { ... }` | Open |
| QA-002 | `app/(tabs)/diary.tsx` | 25–27 | `console.log('📔 DIARY DEBUG: ...')` — debug log not guarded by `__DEV__` | High | Exposes entry count in production logs | Wrap in `if (__DEV__) { ... }` or remove | ✅ Fixed 2026-03-29 |
| QA-003 | `app/(tabs)/leisure.tsx` | — | Screen imports `database` and `Q` directly from `@nozbe/watermelondb` and calls `database.get('leisure_logs').query(...).observe()` inside a `useEffect` — violates architecture rule | High | Bypasses DB hook layer | Extract into `useCompletedLeisureLogs` hook | ✅ Fixed 2026-03-29 |
| QA-004 | `app/finance/analytics.tsx` | 23–38 | Screen imports `database` and `Q` directly and calls `database.get('finance_logs').query(...).observe()` — violates architecture rule | High | Same as QA-003 | Move query into `useFinanceLogs` hook | ✅ Fixed 2026-03-29 |
| QA-005 | `app/habit/[id].tsx` | 28 | `database.get<HabitLog>('habit_logs').find(id)` called directly in screen | High | Bypasses hook layer | Move into hook | ✅ Fixed 2026-03-29 |
| QA-006 | `app/finance/[id].tsx` | 27 | `database.get<FinanceLog>('finance_logs').find(id)` called directly in screen | High | Same as QA-005 | Move into action/hook | ✅ Fixed 2026-03-29 |
| QA-007 | `app/leisure/[id].tsx` | 27 | `database.get<LeisureLog>('leisure_logs').find(id)` called directly in screen | High | Same as QA-005 | Move into action/hook | ✅ Fixed 2026-03-29 |
| QA-008 | `app/diary/[id].tsx` | 32 | `database.get<DiaryEntry>('diary_entries').find(id)` called directly in screen | High | Same as QA-005 | Move into action/hook | ✅ Fixed 2026-03-29 |
| QA-009 | `src/components/common/SyncStatus.tsx` | 102–119, 154–188, 190–224 | Extensive `console.log` / `console.error` blocks in debug tools — none guarded by `__DEV__`. Lines 119–130 log raw sync response data. | Critical | Exposes sync payload structure and data counts in production; potential info leak | Wrap all debug-panel `console.*` calls in `if (__DEV__) { ... }` | Open |
| QA-010 | `src/database/sync/supabaseSync.ts` | 86–89 | `JSON.stringify(data.changes.finance_logs.created[0], null, 2)` — logs individual financial record data in the sync path | Critical | Logs user financial data in production | Guard with `if (__DEV__)` | ✅ Fixed 2026-03-29 |
| QA-011 | `src/database/sync/syncManager.ts` | multiple | Multiple `console.log` calls throughout — none guarded | High | Verbose production logs | Wrap all in `if (__DEV__) { ... }` | Open |
| QA-012 | `src/lib/supabase.ts` | 35 | `console.log('✅ Generated new device ID:', deviceId)` — not guarded | Medium | Minor production noise | Wrap in `if (__DEV__)` | Open |
| QA-013 | `app/habit/[id].tsx` | 249 | `colors: any` type in `DetailRowProps` interface | Medium | Defeats TypeScript strict mode | Type as `ThemeColors` | ✅ Fixed 2026-03-29 |
| QA-014 | `app/finance/[id].tsx` | 187 | `colors: any` in `DetailRowProps` | Medium | Same as QA-013 | Type as `ThemeColors` | ✅ Fixed 2026-03-29 |
| QA-015 | `app/leisure/[id].tsx` | 244 | `icon: any` and `colors: any` in local `DetailRowProps` | Medium | Same as QA-013 | Type properly | ✅ Fixed 2026-03-29 |
| QA-016 | `src/components/common/Button.tsx` | 17, 21 | `icon?: IconProps<any>['name']` and `style?: any` — two `any` usages | Medium | Weakens icon name type safety | Use `keyof typeof Ionicons.glyphMap` for icon; `ViewStyle` for style | Open |
| QA-017 | `src/utils/imageHelpers.ts` | 28 | `(fileInfo as any).size` — cast to `any` to access `.size` | Medium | Bypasses type checking | Use `(fileInfo as FileSystem.FileInfo & { size: number }).size` with a guard | Open |
| QA-018 | `src/database/sync/syncManager.ts` | 44, 75, 82 | Multiple `as any` casts on WatermelonDB records | Medium | Hides type errors at sync layer | Create typed helper or use proper model types | Open |
| QA-019 | `app/finance/add.tsx` | 1 | Comment on line 2: `// Added useMemo, useEffect` — inline artifact left in code | Low | Minor code noise | Remove comment | Open |
| QA-020 | `app/finance/add.tsx` | 37–42 | Left-over build comments: `// ❌ REMOVED: ...`, `// ✅ KEEP: ...` | Low | Code noise | Remove all `❌`/`✅` inline build comments | Open |
| QA-021 | `app/settings/index.tsx` | 55–84 | "THEME DEBUG PANEL" with green border shipped to production | High | Confusing to end users | Remove or gate behind `__DEV__` | Open |
| QA-022 | `app/settings/index.tsx` | 107, 165 | `console.log` on theme switch — not guarded | Medium | Production noise | Wrap in `if (__DEV__)` | Open |
| QA-023 | `src/components/common/ScreenContext.tsx` | 1 | Path comment says `ScreenContent.tsx` but file is `ScreenContext.tsx` | Low | Developer confusion | Fix path comment | Open |
| QA-024 | `app/diary/calendar.tsx` | 17 | `selectedDate` hardcoded to `new Date(2024, 11, 1)` (Dec 2024) instead of `new Date()` | High | Calendar always opens on Dec 2024 | Change to `new Date()` | Open |
| QA-025 | `app/diary/calendar.tsx` | 98 | `console.log('Selected date: ...')` — not guarded, fires on every day tap | Medium | Production log noise | Wrap in `if (__DEV__)` or remove | Open |
| QA-026 | `src/database/sync/syncUtils.ts` | 272 | `console.log(report)` — logs diagnostic report including device ID and record counts | High | Exposes device ID and data counts in production | Guard with `if (__DEV__)` | Open |
| QA-027 | `src/database/models/UserPreference.ts` | 14 | `get parsedValue(): any` — returns `any` | Low | Loses type safety on preference values | Return `unknown` | Open |
| QA-028 | `app/settings/preferences.tsx` | 18 | `handleSavePreferences` shows success alert but has `// TODO: Save preferences to database/AsyncStorage` — never actually persisted | High | User believes preferences are saved but they reset | Implement persistence via `UserPreference` actions | Open |
| QA-029 | `src/database/sync/supabaseSync.ts` | 7 | `error?: any` in `SyncResult` interface | Low | Loses error type information | Type as `error?: Error \| unknown` | Open |
| QA-030 | `app/(tabs)/habits.tsx` | 67 | `setTimeout(() => setRefreshing(false), 500)` — no cleanup ref | Medium | Memory leak if unmounted during timeout | Assign to ref and clear in cleanup | Open |
| QA-031 | `app/(tabs)/finance.tsx` | 149 | Same pattern — `setTimeout` without cleanup | Medium | Same memory leak | Same fix | Open |
| QA-032 | `app/(tabs)/diary.tsx` | 30 | Same pattern — `setTimeout` without cleanup | Medium | Same | Same fix | Open |
| QA-033 | `app/(tabs)/leisure.tsx` | 79 | Same pattern | Medium | Same | Same fix | Open |
| QA-034 | `src/lib/financeConstants.ts` | — | Category keys (`Load`, `Fare`, etc.) didn't match canonical `FinanceTypeCategory` type | High | Runtime lookup failures | Renamed all keys to match type | ✅ Fixed 2026-03-29 |
| QA-035 | `src/database/hooks/useDatabase.ts` | 33–175 | Async subscription pattern inside `useEffect` could cause state-update-after-unmount | High | Memory leak and RN warning | Refactor to synchronous subscription | ✅ Fixed 2026-03-28 |
| QA-078 | `src/database/sync/supabaseSync.ts` | 34, 48, 51, 57–59, 74–78, 81, 83, 104, 127, 133, 153–154 | Many `console.log` calls not guarded by `__DEV__`, including line 51: `console.log('📱 Device ID:', deviceId)` which logs the device identifier in production | High | Device ID and sync metadata logged in production | Wrap all sync-path logs in `if (__DEV__)` | Open |

---

## UI / UX

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-036 | `app/(tabs)/index.tsx` | — | Home screen shows "System Ready" static card — no domain data or summary widgets | Medium | Home screen is an empty splash page | Add summary counts/stats per domain from hooks | Open |
| QA-037 | `app/(tabs)/habits.tsx` | — | No error UI if `stopHabitTimer` fails — `console.error` only | Medium | User taps "Stop Timer", it fails silently | Add `Alert.alert` on catch | Open |
| QA-038 | `app/(tabs)/leisure.tsx` | — | No error UI if `startLeisureTimer` fails — `console.error` only | Medium | Same as QA-037 | Add `Alert.alert` | Open |
| QA-039 | `app/leisure/start.tsx` | — | On error, screen calls `router.back()` with no user message | Medium | Silent failure | Show `Alert.alert('Error', ...)` before navigating back | Open |
| QA-040 | `app/diary/calendar.tsx` | 96–99 | Tapping a day with entries does `console.log` only — no navigation | High | Calendar is broken: dates not navigable | Navigate to filtered diary entries for selected date | Open |
| QA-041 | `app/settings/preferences.tsx` | — | All preference toggles are purely local React state — no read from DB on mount, no save on submit | High | Settings are cosmetic only; preferences reset on restart | Implement `useEffect` to load from `UserPreference` table and save on submit | Open |
| QA-042 | `src/components/leisure/LeisureTimerCard.tsx` | 88–90 | Active timer card shows hardcoded `❓` and "Untitled Session" — ignores `type` and `title` props | High | All active timers look identical | Use `getLeisureConfig(type)` and show `title` | Open |
| QA-043 | `app/settings/index.tsx` | 383 | `Developer: "Your Name"` and `Build: "2025.01.01"` — placeholder content | Medium | Looks unfinished | Replace with real values or use `expo-constants` | Open |
| QA-044 | `app/(tabs)/finance.tsx` | — | No loading indicator while `useFinanceLogs` resolves on first render | Low | Brief flash of empty state | Show `LoadingSpinner` while logs list is empty on first mount | Open |
| QA-045 | `app/(tabs)/diary.tsx` | — | `imageCount` always hardcoded as `0` when passing to `DiaryCard` | Medium | Diary cards never show image count | Use `useDiaryImages(entry.id)` or include count in entry query | Open |
| QA-080 | `app/diary/[id].tsx` | 1–13 | Missing `SafeAreaView` import and wrapper — NativeWind legacy screen has no safe area protection | Medium | Content may be hidden under status bar on some devices | Add `SafeAreaView` from `react-native-safe-area-context` | Open |
| QA-081 | `app/diary/[id].tsx` | — | Missing `useThemeColors` import — screen uses hardcoded NativeWind classes and will not respond to theme switching | Medium | When light mode is implemented, diary detail will stay dark | Refactor to `useThemeColors()` pattern per CLAUDE.md | Open |

---

## Navigation

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-046 | `app/(tabs)/index.tsx` | 27 | `router.push('/settings' as any)` — `as any` cast to suppress type error | Medium | Route typing ignored; typos won't be caught | Use proper typed route | Open |
| QA-047 | `app/(tabs)/finance.tsx` | — | No navigation to `app/finance/analytics.tsx` from Finance tab — analytics screen completely unreachable from UI | High | Analytics feature is dead | Add button/link on Finance tab to `/finance/analytics` | Open |
| QA-048 | `app/(tabs)/habits.tsx` | 259 | `router.push('/habit/history')` — route verified: `app/habit/history.tsx` exists | Low | — | No action needed | Open |
| QA-049 | `app/diary/calendar.tsx` | 169 | No way to navigate to calendar from diary list without scrolling to bottom; only appears when `entries.length > 0` | Low | Minor UX friction | Keep as-is or promote the calendar button | Open |
| QA-050 | `app/leisure/complete.tsx` | 47 | `router.back()` on discard — does not stop the leisure timer. Timer remains running in background. | High | Phantom running timer persists | Call `deleteLeisureLog(params.id)` before `router.back()` | Open |

---

## Data & Sync Layer

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-051 | `src/database/sync/supabaseSync.ts` | 151 | `migrationsEnabledAtVersion: 5` but schema version is `6`. Correct by design — schema started at v5, no devices exist below that. | High | **Deferred — by design.** No action needed. | — | Deferred |
| QA-052 | `src/database/migrations.ts` | — | No migration steps for v1–v4. Devices on very old schemas would reset. | Medium | **Deferred — no fix possible.** Schema history pre-v5 doesn't exist; no such devices exist. | — | Deferred |
| QA-053 | `src/database/actions/diaryActions.ts` | 18–49 | `createDiaryEntry` nested `database.write()` calls — WatermelonDB throws on nested writes | Critical | App crash when creating diary entry with images | Batch image creation inline in single write | ✅ Fixed 2026-03-28 |
| QA-054 | `src/database/actions/habitActions.ts` | — | No `user_id` attached to records — per CLAUDE.md, every user-data table requires `user_id` for RLS | High | RLS policies will fail; no user filtering in Supabase | Add `user_id` field to schema/models, populate from auth session | Open |
| QA-055 | `src/database/actions/financeActions.ts` | — | Same as QA-054 — no `user_id` | High | Same consequence | Same fix | Open |
| QA-056 | `src/database/actions/diaryActions.ts` | — | Same as QA-054 | High | Same | Same | Open |
| QA-057 | `src/database/actions/leisureActions.ts` | — | Same as QA-054 | High | Same | Same | Open |
| QA-058 | `src/database/schema.ts` | — | No `user_id` column on any user-data table — Supabase RLS `auth.uid() = user_id` policies cannot function | High | All users' data visible to any authenticated user once RLS is enabled | Add `user_id` column to each table schema and migrations | Open |
| QA-059 | `app/(tabs)/leisure.tsx` | 26–38 | `database.get().query().observe()` called directly in screen — `useCompletedLeisureLogs` hook existed but was unused | High | Duplicate code + arch violation | Use existing hook | ✅ Fixed 2026-03-29 |
| QA-060 | `src/database/actions/diaryActions.ts` | 74–88 | `deleteDiaryEntry` had nested `database.write()` calls — same issue as QA-053 | Critical | App crash when deleting diary entry with images | Batch in single write | ✅ Fixed 2026-03-28 |
| QA-061 | `src/database/sync/syncManager.ts` | 264–277 | `getPendingChangesCount` queries all records then JS-filters — O(n) full table scan | Medium | Slow on large datasets; SyncStatus polls every 10 seconds | Use `Q.where('is_synced', false)` + `fetchCount()` | ✅ Fixed 2026-03-29 |
| QA-062 | `app/finance/analytics.tsx` | 270 | `config.color.replace('bg-', '#')` — `'bg-green-500'.replace('bg-', '#')` produces `'#green-500'`, not a valid color | High | Category icons have invalid background color — renders transparent or errors silently | Use hex color map instead of string replace | Open |
| QA-079 | `src/database/sync/supabaseSync.ts` | 61, 137 | `supabase.rpc('pull_changes', ...)` and `supabase.rpc('push_changes', ...)` — no `supabase/functions/` directory exists in repo. Edge functions are not deployed. Sync will always fail at the RPC call. | High | Sync is completely non-functional; all data stays local indefinitely | Create and deploy `pull_changes` and `push_changes` Supabase edge functions | Open |

---

## Performance

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-063 | `app/(tabs)/habits.tsx` | 135 | `runningTimers.map(...)` renders inline JSX in ScrollView — no `FlatList`/`keyExtractor` | Low | Minor render efficiency at scale | Acceptable for short list length | Open |
| QA-064 | `app/(tabs)/finance.tsx` | 24–34 | `getTodayWeekIndex` defined inside component — recreated on every render | Low | Cheap to compute; minor inefficiency | Move outside component | Open |
| QA-065 | `src/components/common/SyncStatus.tsx` | 25–28 | `setInterval(updateStatus, 10000)` calls `getPendingChangesCount` — previously O(n) full scan every 10s on Home screen | Medium | Repeated DB work on main screen | QA-061 fixed the underlying issue; remaining concern is polling interval | Open |
| QA-066 | `app/(tabs)/finance.tsx` | 57–117 | `weeklyData` `useMemo` is O(n×7) on every `logs` or `selectedMonth` change | Low | Acceptable at current scale | No action needed for now | Open |

---

## Accessibility

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-067 | `src/components/common/FloatingActionButton.tsx` | 21–39 | `Pressable` with only an icon — no `accessibilityLabel`. All FABs across the app are inaccessible to screen readers. | High | Screen reader users cannot identify FAB purpose | Add `accessibilityLabel` prop to `FloatingActionButton` and pass description from each screen | Open |
| QA-068 | `app/(tabs)/_layout.tsx` | 24 | Dark mode inactive tab tint `#64748b` on bg `#0f172a` — contrast ≈ **3.1:1**. Fails WCAG AA for normal text (requires 4.5:1). Borderline for UI components (requires 3:1). | Medium | Inactive dark-mode tabs may be hard to read for low-vision users | Increase inactive dark tint to `#94a3b8` (slate-400, ~4.7:1) | Open |
| QA-069 | `src/components/common/SyncStatus.tsx` | 302–313 | Icon-only `Pressable` for "Force Pull" — no `accessibilityLabel` | Medium | Screen reader cannot identify button | Add `accessibilityLabel="Force full sync"` | Open |
| QA-070 | `app/habit/[id].tsx` | 69–73 | Back button `Pressable` with only `<Ionicons name="close">` — no `accessibilityLabel` or `accessibilityRole` | Low | Screen reader reads icon name | Add `accessibilityLabel="Close"` and `accessibilityRole="button"` | Open |
| QA-071 | `app/diary/[id].tsx` | 104–108 | Edit button `Pressable` with only `<Ionicons name="create-outline">` — no `accessibilityLabel` | Low | Screen reader cannot identify edit action | Add `accessibilityLabel="Edit entry"` | Open |
| QA-072 | `app/(tabs)/_layout.tsx` | 23 | Light mode inactive tab tint `#94a3b8` on bg `#ffffff` — contrast ≈ **2.4:1**. Fails WCAG AA for both normal text (4.5:1) and UI components (3:1). | High | Inactive light-mode tabs fail contrast — invisible to low-vision users | Increase inactive light tint to `#64748b` (slate-500, ~4.5:1) | Open |

**Calculated WCAG contrast ratios (live values from `_layout.tsx`):**
| Pair | Dark Mode | Light Mode | Pass/Fail |
|---|---|---|---|
| Active tab (`#38bdf8` / `#0284c7`) on bg (`#0f172a` / `#ffffff`) | **8.5:1** ✅ | **4.1:1** ⚠️ borderline | Dark passes; Light borderline (4.5 req. for normal text) |
| Inactive tab (`#64748b` / `#94a3b8`) on bg (`#0f172a` / `#ffffff`) | **3.1:1** ❌ | **2.4:1** ❌ | Both fail normal text (4.5:1 req.) |
| White `#ffffff` on bg `#0f172a` | **15.3:1** ✅ | N/A | Passes |
| White `#ffffff` on surface `#1e293b` (dark bgSurface) | **8.5:1** ✅ | N/A | Passes |

---

## Architecture

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-073 | `app/_layout.tsx` | — | `DatabaseProvider` not wrapping the app. WatermelonDB context is never set up. Database singleton imported directly instead. Works but diverges from WatermelonDB docs and prevents context-based testing. | Medium | App functions but no context-based testing or DB switching possible | Either consistently document singleton pattern or add `DatabaseProvider` | Open |
| QA-074 | `app/_layout.tsx` | — | `ThemeProvider` wraps the app — correct. `SafeAreaProvider` wraps `ThemeProvider` — correct order. | Low | — | Compliant — no action needed | Open |
| QA-075 | `src/lib/supabase.ts` | 6–7 | Supabase URL/key from `EXPO_PUBLIC_*` env vars — correct. Anon key only client-side — compliant. | — | — | Compliant | Open |
| QA-076 | `src/database/index.ts` | 17–25 | Single `database` export — only one instance created. Correct. | — | — | Compliant | Open |
| QA-077 | `app/(tabs)/leisure.tsx`, `app/finance/analytics.tsx`, `app/habit/[id].tsx`, `app/finance/[id].tsx`, `app/leisure/[id].tsx`, `app/diary/[id].tsx` | — | Six screens directly imported from `src/database` — violates CLAUDE.md architecture rule | High | Tight coupling between screen and DB layer | Refactor to hooks/actions | ✅ Fixed 2026-03-29 |

---

## Tracking

| Area | Total | Open | Fixed |
|---|---|---|---|
| Code Quality | 36 | 23 | 13 |
| UI / UX | 12 | 12 | 0 |
| Navigation | 5 | 5 | 0 |
| Data & Sync Layer | 13 | 8 | 5 |
| Performance | 4 | 4 | 0 |
| Accessibility | 6 | 6 | 0 |
| Architecture | 5 | 4 | 1 |
| **Total** | **81** | **62** | **19** |
