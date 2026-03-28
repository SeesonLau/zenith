# QA Report — Bugs & Issues
**Last verified:** 2026-03-28
**Auditor:** Claude Code (automated full-read audit)

---

## Code Quality

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-001 | `app/_layout.tsx` | 15, 19 | `console.log('🚀 App starting...')` and `console.log('🛑 App closing...')` — not guarded by `__DEV__` | High | Logs appear in production builds | Wrap both in `if (__DEV__) { ... }` | Open |
| QA-002 | `app/(tabs)/diary.tsx` | 25–27 | `console.log('📔 DIARY DEBUG: ...')` — debug log not guarded by `__DEV__` | High | Exposes entry count in production logs | Wrap in `if (__DEV__) { ... }` or remove | Open |
| QA-003 | `app/(tabs)/leisure.tsx` | — | Screen imports `database` and `Q` directly from `@nozbe/watermelondb` and calls `database.get('leisure_logs').query(...).observe()` inside a `useEffect` — violates the architecture rule that screens must not import from `src/database` | High | Bypasses DB hook layer; makes testing and refactoring harder | Extract into a `useCompletedLeisureLogs` hook in `useDatabase.ts` (hook already exists but is not used here) | Open |
| QA-004 | `app/finance/analytics.tsx` | 23–38 | Screen imports `database` and `Q` directly and calls `database.get('finance_logs').query(...).observe()` — violates architecture rule | High | Same as QA-003 | Move query into `useFinanceLogs` hook or a new dedicated hook | Open |
| QA-005 | `app/habit/[id].tsx` | 28 | `database.get<HabitLog>('habit_logs').find(id)` called directly in screen — violates architecture rule | High | Bypasses hook layer | Move lookup into an action or hook function | Open |
| QA-006 | `app/finance/[id].tsx` | 27 | `database.get<FinanceLog>('finance_logs').find(id)` called directly in screen | High | Same as QA-005 | Move into action/hook | Open |
| QA-007 | `app/leisure/[id].tsx` | 27 | `database.get<LeisureLog>('leisure_logs').find(id)` called directly in screen | High | Same as QA-005 | Move into action/hook | Open |
| QA-008 | `app/diary/[id].tsx` | 32 | `database.get<DiaryEntry>('diary_entries').find(id)` called directly in screen | High | Same as QA-005 | Move into action/hook | Open |
| QA-009 | `src/components/common/SyncStatus.tsx` | 102–119, 154–188, 190–224 | Extensive `console.log` / `console.error` blocks in debug tools — none guarded by `__DEV__`. Lines 119–130 log raw sync response data. | Critical | Exposes sync payload structure and data counts in production; potential info leak | Wrap all debug-panel `console.*` calls in `if (__DEV__) { ... }` | Open |
| QA-010 | `src/database/sync/supabaseSync.ts` | 49–90 | Numerous `console.log` calls including `JSON.stringify(data.changes.finance_logs.created[0], null, 2)` (line 88) — logs individual record data in the sync path | Critical | Logs user financial data in production. Violates security rule: "Never log sync payloads" | Guard all sync-path logs with `if (__DEV__)`, remove the record dump or limit to counts only | Open |
| QA-011 | `src/database/sync/syncManager.ts` | multiple | Multiple `console.log` calls throughout — none guarded | High | Verbose production logs | Wrap all in `if (__DEV__) { ... }` | Open |
| QA-012 | `src/lib/supabase.ts` | 35 | `console.log('✅ Generated new device ID:', deviceId)` — not guarded | Medium | Minor production noise | Wrap in `if (__DEV__)` | Open |
| QA-013 | `app/habit/[id].tsx` | 249 | `colors: any` type in `DetailRowProps` interface | Medium | Defeats TypeScript strict mode for the prop | Type as `ThemeColors` from `useThemeColors` | Open |
| QA-014 | `app/finance/[id].tsx` | 187 | `colors: any` in `DetailRowProps` | Medium | Same as QA-013 | Type as `ThemeColors` | Open |
| QA-015 | `app/leisure/[id].tsx` | 244 | `icon: any` and `colors: any` in local `DetailRowProps` | Medium | Same as QA-013 | Type properly | Open |
| QA-016 | `src/components/common/Button.tsx` | 17, 21 | `icon?: IconProps<any>['name']` and `style?: any` — two `any` usages | Medium | Weakens icon name type safety | Use `keyof typeof Ionicons.glyphMap` for icon; `ViewStyle` for style | Open |
| QA-017 | `src/utils/imageHelpers.ts` | 28 | `(fileInfo as any).size` — cast to `any` to access `.size` | Medium | Bypasses type checking for file size | Use `(fileInfo as FileSystem.FileInfo & { size: number }).size` with a guard | Open |
| QA-018 | `src/database/sync/syncManager.ts` | 44, 75, 82 | Multiple `as any` casts on WatermelonDB records (`record as any`) | Medium | Hides type errors at the sync layer | Create a typed helper or use proper WatermelonDB model types | Open |
| QA-019 | `app/finance/add.tsx` | 1 | Comment on line 2: `// Added useMemo, useEffect` — inline comment artifact left in code | Low | Minor code noise | Remove trailing comment | Open |
| QA-020 | `app/finance/add.tsx` | 37–42 | Left-over build comments: `// ❌ REMOVED: ...`, `// ✅ KEEP: ...` — code review comments not cleaned up | Low | Code noise | Remove all `❌`/`✅` inline build comments | Open |
| QA-021 | `app/settings/index.tsx` | 55–84 | "THEME DEBUG PANEL" with green border and debug text shipped to production — this is debug UI | High | Confusing to end users; not a production-ready screen | Remove the debug panel or gate it behind `__DEV__` | Open |
| QA-022 | `app/settings/index.tsx` | 107, 165 | `console.log('🌙 Switching to SLATE mode')` and `console.log('☀️ Switching to WHITE mode')` — not guarded | Medium | Production noise | Wrap in `if (__DEV__)` | Open |
| QA-023 | `src/components/common/ScreenContext.tsx` | 1 | File path comment says `// src/components/common/ScreenContent.tsx` but the file is `ScreenContext.tsx` — path comment mismatch | Low | Confusing for developers | Fix comment to `// src/components/common/ScreenContext.tsx` | Open |
| QA-024 | `app/diary/calendar.tsx` | 17 | Initial `selectedDate` hardcoded to `new Date(2024, 11, 1)` (December 2024) instead of `new Date()` | High | Calendar always opens on Dec 2024, not current month | Change to `new Date()` | Open |
| QA-025 | `app/diary/calendar.tsx` | 98 | `console.log('Selected date: ${dateKey}')` — not guarded, fires on every day tap with entries | Medium | Production log noise | Wrap in `if (__DEV__)` or remove | Open |
| QA-026 | `src/database/sync/syncUtils.ts` | 272 | `console.log(report)` — logs a full diagnostic report string including device ID and record counts | High | Exposes device ID and data counts in production | Guard with `if (__DEV__)` | Open |
| QA-027 | `src/database/models/UserPreference.ts` | 14 | `get parsedValue(): any` — returns `any` | Low | Loses type safety on preference values | Return `unknown` and let callers cast; or use a generic `get parsedValue<T>(): T` | Open |
| QA-028 | `app/settings/preferences.tsx` | 18 | `handleSavePreferences` shows `Alert.alert('Success', ...)` but has `// TODO: Save preferences to database/AsyncStorage` — preferences are never actually persisted | High | User believes preferences are saved but they reset on app restart | Implement persistence via `UserPreference` actions | Open |
| QA-029 | `src/database/sync/supabaseSync.ts` | 7 | `error?: any` in `SyncResult` interface | Low | Loses error type information | Type as `error?: Error | unknown` | Open |
| QA-030 | `app/(tabs)/habits.tsx` | 67 | `setTimeout(() => setRefreshing(false), 500)` in `onRefresh` — `setTimeout` without cleanup; never assigned to a ref | Medium | Memory leak if component unmounts during the timeout | Assign to a ref and clear in cleanup, or use async pattern | Open |
| QA-031 | `app/(tabs)/finance.tsx` | 149 | Same pattern — `setTimeout(() => setRefreshing(false), 500)` without cleanup | Medium | Same memory leak potential | Same fix as QA-030 | Open |
| QA-032 | `app/(tabs)/diary.tsx` | 30 | Same pattern — `setTimeout(() => setRefreshing(false), 500)` without cleanup | Medium | Same memory leak potential | Same fix as QA-030 | Open |
| QA-033 | `app/(tabs)/leisure.tsx` | 79 | Same pattern | Medium | Same | Same fix | Open |
| QA-034 | `src/lib/financeConstants.ts` | — | `FINANCE_CATEGORY_COLORS` and `FINANCE_CATEGORY_ICONS` reference old categories (`Load`, `Fare`, `Personal-Physical`, etc.) that no longer match `FinanceTypeCategory` in `categories.ts` (`Load/Data`, `Transport`, `Health`, `Digital`, `Social`, `Shopping`). The categories in `financeConstants.ts` are completely misaligned with the live category list. | High | Runtime errors if these constants are ever used via category lookup; `getFinanceCategoryConfig` in `analytics.tsx` uses `constants.ts` not `financeConstants.ts` but the mismatch is a maintenance hazard | Either delete `financeConstants.ts` (it's unused by active screens) or update it to match `categories.ts` | Open |
| QA-035 | `src/database/hooks/useDatabase.ts` | 33–52, 58–78, 83–103, 152–175 | Subscriptions use `fetchLogs/fetchTimers` as async functions returning a subscription inside `useEffect`, then the cleanup does `sub.then(s => s.unsubscribe())`. If the component unmounts before the promise resolves, the subscription is never cleaned up. | High | Potential memory leak and state-update-after-unmount warning | Refactor to synchronous subscription setup (non-async) or use a cancel flag | Open |

---

## UI / UX

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-036 | `app/(tabs)/index.tsx` | — | Home screen has no real data — shows "System Ready" static card and hardcoded "Zenith v0.2.0" text. No summary widgets from any domain. | Medium | Home screen is effectively an empty splash page | Add at least summary counts/stats per domain from hooks | Open |
| QA-037 | `app/(tabs)/habits.tsx` | — | No error UI if `stopHabitTimer` fails — `console.error` only, no user feedback beyond the thrown error | Medium | User taps "Stop Timer", it fails silently | Add an `Alert.alert` on catch (currently only logs) | Open |
| QA-038 | `app/(tabs)/leisure.tsx` | — | No error UI if `startLeisureTimer` fails — `console.error` only | Medium | Same as QA-037 | Add `Alert.alert` | Open |
| QA-039 | `app/leisure/start.tsx` | — | On error, screen just calls `router.back()` with no user message — user doesn't know why it went back | Medium | Silent failure; confusing UX | Show `Alert.alert('Error', ...)` before navigating back | Open |
| QA-040 | `app/diary/calendar.tsx` | 96–99 | Tapping a day with entries does `console.log` only — no navigation to entries for that day | High | Feature is broken: calendar dates are not navigable | Navigate to filtered diary entries for the selected date | Open |
| QA-041 | `app/settings/preferences.tsx` | — | All preference toggles (auto-sync, notifications, haptics, analytics) are purely local React state — no read from DB on mount, no save on submit (see QA-028) | High | Settings are cosmetic only; every app restart resets preferences to defaults | Implement `useEffect` to load from `UserPreference` table and save on submit | Open |
| QA-042 | `src/components/leisure/LeisureTimerCard.tsx` | 88–90 | Active timer card shows hardcoded `❓` emoji and "Untitled Session" — ignores `type` and `title` props that are passed in | High | All active timers look identical with no info about what's being tracked | Use `getLeisureConfig(type)` to show correct emoji/color; show `title` if provided | Open |
| QA-043 | `app/settings/index.tsx` | 383 | `Developer: "Your Name"` and `Build: "2025.01.01"` — placeholder content shipped | Medium | Looks unprofessional / unfinished | Replace with real values or use `expo-constants` for build info | Open |
| QA-044 | `app/(tabs)/finance.tsx` | — | No loading indicator while `useFinanceLogs` resolves on first render | Low | Brief flash of empty state or partial data | Show `LoadingSpinner` while logs list is empty on first mount | Open |
| QA-045 | `app/(tabs)/diary.tsx` | — | `imageCount` always hardcoded as `0` when passing to `DiaryCard` — real image count from DB is never loaded | Medium | Diary cards always show no images even if images exist | Use `useDiaryImages(entry.id)` or include count in the entry query | Open |

---

## Navigation

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-046 | `app/(tabs)/index.tsx` | 27 | `router.push('/settings' as any)` — uses `as any` cast to suppress type error for the route path | Medium | Route typing is ignored; typos in path won't be caught | Use proper typed route or confirm path is `/settings/index` | Open |
| QA-047 | `app/(tabs)/finance.tsx` | — | No navigation to `app/finance/analytics.tsx` from the Finance tab screen. The analytics screen exists but is completely unreachable from the UI. | High | Analytics feature is dead — no user can reach it | Add a button/link on the Finance tab to navigate to `/finance/analytics` | Open |
| QA-048 | `app/(tabs)/habits.tsx` | 259 | `router.push('/habit/history')` — no `as any`, but route should be verified. `app/habit/history.tsx` exists — OK. | Low | — | No action needed | Open |
| QA-049 | `app/diary/calendar.tsx` | 169 | From calendar screen, "Write New Entry" button navigates to `/diary/new` — OK. But there is no way to navigate back to calendar from diary list (only shows when `entries.length > 0`, and button is at bottom). | Low | Minor UX friction | Keep as-is or promote the calendar button higher | Open |
| QA-050 | `app/leisure/complete.tsx` | 47 | `router.back()` on discard — does not stop the leisure timer that was already started. Timer remains running in the background if the user discards. | High | Phantom running timer persists; app shows active session that can never be completed | Call `stopLeisureTimer(params.id)` or `deleteLeisureLog(params.id)` before `router.back()` | Open |

---

## Data & Sync Layer

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-051 | `src/database/sync/supabaseSync.ts` | 151 | `migrationsEnabledAtVersion: 5` but schema version is `6` (set in `schema.ts` line 5). Should be `6` or the value should match `schema.version`. | High | WatermelonDB may not apply migrations correctly when upgrading from version 5 to 6 — field additions in migration `toVersion: 6` may be skipped | Change to `migrationsEnabledAtVersion: 1` (first version that had migrations) or ensure it matches the oldest supported migration version | Open |
| QA-052 | `src/database/migrations.ts` | — | Only one migration defined (`toVersion: 6`), no prior migration steps exist. There is no `toVersion: 2`, `3`, `4`, or `5`. If a device has schema version 1 and upgrades, only the v6 migration runs — but there are no intermediate steps. If schema was `version: 5` before this migration, this is fine; but there's no migration to create initial tables — new installs start at schema version 6 via `createTable` implicitly. This gap could cause issues for users upgrading from older builds. | Medium | Users upgrading from a very old build may get database errors if intermediate schema versions existed | Document that v1–v5 were pre-migration (fresh-install only) builds, or add prior migration stubs | Open |
| QA-053 | `src/database/actions/diaryActions.ts` | 18–49 | `createDiaryEntry` calls `addImageToDiaryEntry` inside a `database.write(...)` block. `addImageToDiaryEntry` is itself an independent `database.write(...)` call — nested writes are not allowed in WatermelonDB and will throw. | Critical | App crashes when creating a diary entry with images | Move image creation logic inline inside the outer `database.write`, or batch using `database.batch()` | Open |
| QA-054 | `src/database/actions/habitActions.ts` | — | No `user_id` attached to records — per CLAUDE.md, every user-data table requires `user_id` for RLS. Records only get `device_id`. | High | RLS policies that use `auth.uid() = user_id` will fail when applied, and no user filtering will work in Supabase | Add `user_id` field to schema and models, and populate it from Supabase auth session (if auth is used) or confirm app is no-auth by design | Open |
| QA-055 | `src/database/actions/financeActions.ts` | — | Same as QA-054 — no `user_id` | High | Same consequence | Same fix | Open |
| QA-056 | `src/database/actions/diaryActions.ts` | — | Same as QA-054 | High | Same | Same | Open |
| QA-057 | `src/database/actions/leisureActions.ts` | — | Same as QA-054 | High | Same | Same | Open |
| QA-058 | `src/database/schema.ts` | — | No `user_id` column on any table (habit_logs, finance_logs, diary_entries, diary_images, leisure_logs). Without this column, Supabase RLS policies cannot filter by user. | High | All data from all users would be visible to any user once RLS is enabled properly | Add `user_id` column to each user-data table schema and migrations | Open |
| QA-059 | `app/(tabs)/leisure.tsx` | 26–38 | `database.get<LeisureLog>().query().observe()` called inside `useEffect` in a screen component — direct DB access in screen (see QA-003). Additionally `useCompletedLeisureLogs` hook already exists in `useDatabase.ts` but is unused here. | High | Duplicate code + arch violation | Use existing `useCompletedLeisureLogs` hook | Open |
| QA-060 | `src/database/actions/diaryActions.ts` | 74–88 | `deleteDiaryEntry` performs `deleteDiaryImage` calls inside an outer `database.write(...)` block — `deleteDiaryImage` itself calls `database.write(...)` — same nested write issue as QA-053 | Critical | App crash when deleting a diary entry that has images | Refactor to delete images in a `database.batch()` call within the single outer write | Open |
| QA-061 | `src/database/sync/syncManager.ts` | 264–277 | `getPendingChangesCount` queries every record in every table then JS-filters by `isSynced` — O(n) full table scan instead of a proper `Q.where('is_synced', false)` query | Medium | Slow on large datasets; SyncStatus component polls this every 10 seconds | Replace JS filter with `Q.where('is_synced', false)` query | Open |
| QA-062 | `app/finance/analytics.tsx` | 282 | `config.color.replace('bg-', '#')` — tries to convert a Tailwind class name like `bg-green-500` to a hex color by string replace. `'bg-green-500'.replace('bg-', '#')` produces `#green-500` which is not a valid CSS color. | High | Category icons in analytics have invalid background color — likely renders as transparent or errors silently | Use a real hex color map or access the raw hex from a separate constant | Open |

---

## Performance

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-063 | `app/(tabs)/habits.tsx` | 135 | `runningTimers.map(...)` renders timer cards as inline JSX in ScrollView — no `FlatList`/`keyExtractor`. For small lists this is OK, but the pattern is inconsistent. | Low | Minor render efficiency issue at scale | Acceptable for expected short list length | Open |
| QA-064 | `app/(tabs)/finance.tsx` | 24–34 | `getTodayWeekIndex` is defined as a regular function inside the component — recreated on every render. It also iterates all weeks on every render. | Low | Recreated on every render but cheap to compute | Move outside component or wrap in `useCallback` | Open |
| QA-065 | `src/components/common/SyncStatus.tsx` | 25–28 | `setInterval(updateStatus, 10000)` — `updateStatus` is async and calls `getPendingChangesCount` which does full table scans (QA-061). This runs every 10 seconds on the Home screen. | Medium | Repeated full table scans every 10s on main screen | Fix QA-061 first; then consider increasing interval or making count event-driven | Open |
| QA-066 | `app/(tabs)/finance.tsx` | 57–117 | `weeklyData` `useMemo` iterates all logs for each of 7 days per week — O(n*7) on every `logs` or `selectedMonth` change. For a typical month with 100 transactions, fine; but structure is O(n*days) | Low | Acceptable at current scale | No action needed for now | Open |

---

## Accessibility

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-067 | `src/components/common/FloatingActionButton.tsx` | 21–39 | `Pressable` with only an icon — no `accessibilityLabel` prop. All FABs across the app (Habits, Finance, Diary, Leisure) are inaccessible to screen readers. | High | Screen reader users cannot identify what the FAB does | Add `accessibilityLabel` prop to `FloatingActionButton` and pass a description from each screen | Open |
| QA-068 | `app/(tabs)/_layout.tsx` | 25–71 | Tab bar icon-only mode: each tab has a `title` so screen readers can read the tab label — OK. Tab bar background: dark mode `#0f172a`. Active tint: `#38bdf8` (sky-400). Contrast ratio #38bdf8 on #0f172a ≈ **8.5:1** — passes WCAG AA. Inactive tint: `#64748b` (slate-500). Contrast ratio #64748b on #0f172a ≈ **3.1:1** — **FAILS WCAG AA** (requires 3:1 minimum for UI components; borderline fail for normal text which requires 4.5:1). | Medium | Inactive tab labels/icons may be hard to read in dark mode for low-vision users | Increase inactive tint to `#94a3b8` (slate-400, ~4.7:1 contrast) | Open |
| QA-069 | `src/components/common/SyncStatus.tsx` | 302–313 | Icon-only `Pressable` for "Force Pull" button (cloud-download icon, no text visible) — no `accessibilityLabel` | Medium | Screen reader cannot identify this button | Add `accessibilityLabel="Force full sync"` | Open |
| QA-070 | `app/habit/[id].tsx` | 69–73 | Back button `Pressable` has only `<Ionicons name="close">` — no `accessibilityLabel` or `accessibilityRole` | Low | Screen reader reads icon name rather than action | Add `accessibilityLabel="Close"` and `accessibilityRole="button"` | Open |
| QA-071 | `app/diary/[id].tsx` | 104–108 | Edit button `Pressable` with only `<Ionicons name="create-outline">` — no `accessibilityLabel` | Low | Screen reader cannot identify edit action | Add `accessibilityLabel="Edit entry"` | Open |
| QA-072 | `app/(tabs)/_layout.tsx` | 25 | Light mode tab bar background: `#ffffff`. Active tint: `#0284c7` (sky-600). Contrast ≈ **5.9:1** — passes. Inactive tint: `#94a3b8` (slate-400). Contrast on white ≈ **2.4:1** — **FAILS WCAG AA** for both normal text and UI components. | High | Inactive light-mode tabs fail contrast check — likely invisible to low-vision users | Increase inactive light-mode tint to `#64748b` (slate-500, ~4.5:1) | Open |

---

## Architecture

| ID | File | Line | Issue | Severity | If Unaddressed | Fix Proposal | Status |
|---|---|---|---|---|---|---|---|
| QA-073 | `app/_layout.tsx` | — | `DatabaseProvider` is **not** wrapping the app. WatermelonDB's `DatabaseProvider` context is never set up. The `database` singleton in `src/database/index.ts` is imported directly instead. Hooks use the imported singleton not the context. This works but means no React context for database injection. | Medium | App functions but no context-based testing or database switching is possible | Either consistently use the singleton pattern (document it) or add `DatabaseProvider`. Currently mixed usage — hooks import singleton, screens import singleton. Consistent as-is but diverges from WatermelonDB docs. | Open |
| QA-074 | `app/_layout.tsx` | — | `ThemeProvider` wraps the app — OK. `SafeAreaProvider` wraps `ThemeProvider` — correct order. | Low | — | No action needed | Open |
| QA-075 | `src/lib/supabase.ts` | 6–7 | Supabase URL and key from `EXPO_PUBLIC_*` env vars — correct. `createClient` uses anon key only — no service role key client-side. | — | — | Compliant | Open |
| QA-076 | `src/database/index.ts` | 17–25 | Single `database` export — only one instance created. Correct. | — | — | Compliant | Open |
| QA-077 | `app/(tabs)/leisure.tsx`, `app/finance/analytics.tsx`, `app/habit/[id].tsx`, `app/finance/[id].tsx`, `app/leisure/[id].tsx`, `app/diary/[id].tsx` | — | Six screens directly import from `src/database` — violates CLAUDE.md architecture rule "Screens must call actions and use hooks — never import models directly" | High | Tight coupling between screen layer and DB layer; hard to test or mock | Refactor to use hooks/actions per the architecture rules | Open |

---

## Tracking

| Area | Total | Open | Fixed |
|---|---|---|---|
| Code Quality | 35 | 35 | 0 |
| UI / UX | 10 | 10 | 0 |
| Navigation | 5 | 5 | 0 |
| Data & Sync Layer | 12 | 12 | 0 |
| Performance | 4 | 4 | 0 |
| Accessibility | 6 | 6 | 0 |
| Architecture | 5 | 5 | 0 |
| **Total** | **77** | **77** | **0** |
