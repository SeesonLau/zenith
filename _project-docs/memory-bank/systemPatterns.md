# System Patterns — Zenith

## Folder Structure
```
app/                    # Expo Router screens
  (tabs)/               # Tab screens (index, habits, finance, diary, leisure)
  habit/                # Habit sub-screens: [id], start, history
  diary/                # Diary sub-screens: [id], new, calendar
  finance/              # Finance sub-screens: [id], add, analytics
  leisure/              # Leisure sub-screens: [id], complete
  settings/             # Settings sub-screens: index, preferences
src/
  components/           # UI only. No DB imports.
    common/             # Button, Card, Input, DatePicker, EmptyState, FAB, Badge,
                        # ScreenWrapper, SyncStatus, NetworkStatus, Divider,
                        # LoadingSpinner, ScreenContext
    habit/              # (no components — inline in habits.tsx)
    finance/            # StatCard
    diary/              # DiaryCard, MoodPicker, ImageGallery, RichTextEditor
    leisure/            # LeisureTimerCard, CompletedLeisureCard, LeisureTypePicker
  contexts/             # ThemeContext only (Auth + Sync removed)
  hooks/                # useThemeColors, useSync (UI-only hooks)
  lib/                  # supabase.ts, supabaseStorage.ts, constants.ts,
                        # financeConstants.ts (outdated — see bugs.md)
  utils/                # Pure functions: dateHelpers, formatters, imageHelpers
  types/                # database.types.ts (all types consolidated here)
  constants/            # categories.ts — single source of truth for all enum values
  database/
    models/             # WatermelonDB models (7 total)
    actions/            # All DB writes: habitActions, financeActions,
                        # diaryActions, leisureActions, imageActions
    hooks/              # useDatabase.ts — all 8 reactive DB hooks
    sync/               # syncManager.ts, supabaseSync.ts, syncUtils.ts
    migrations.ts       # WatermelonDB migrations (single file, v6 current)
    schema.ts           # WatermelonDB schema definition
    index.ts            # Database instance + exports
supabase/
  migrations/           # SQL migration files (01 through 10)
  migration.ts          # Migration runner script
```

**Deleted (not in codebase):**
- `src/contexts/AuthContext.tsx` — auth removed
- `src/contexts/SyncContext.tsx` — replaced by useSync hook
- `src/hooks/useTimer.ts` — deleted; timer logic stays inline in habits.tsx
- `src/hooks/useNetworkStatus.ts` — deleted
- `src/hooks/useImagePicker.ts` — deleted
- `src/components/layout/` — Container, Header, TabBar all deleted
- `supabase/functions/` — Edge Functions deleted locally (server status unknown)

## Architecture Patterns
- **Offline-first**: WatermelonDB stores all data locally. Supabase is sync-only, not source of truth.
- **No auth**: Auth removed. App runs without authentication. Supabase session disabled.
- **Theme provider only**: Only ThemeContext in provider stack — no AuthProvider, no SyncProvider.
- **Tab routing**: Expo Router file-based routing. Each tab is a file in `app/(tabs)/`.
- **Domain components**: Components live with their domain (`src/components/diary/`, etc.)
- **No Redux**: Local state + React Context. WatermelonDB observables drive reactive UI.
- **Layer boundary**: `components/` and `hooks/` never import from `src/database/`. Screens call actions and hooks, never import models directly.

## Styling Pattern
- **Actual pattern**: Inline `style={{}}` objects everywhere — all screens, all components.
- **Exception**: `src/components/diary/DiaryCard.tsx` uses NativeWind `className` strings (BUG-023).
- **No** `StyleSheet.create`, **no** NativeWind `className` in new code (pending decision on direction).
- **Theme tokens via hook**: All color values come from `useThemeColors()` — never hardcoded hex in production paths.
- **Module colors**: Habits=#9333ea (purple-600), Finance=#16a34a (green-600), Diary=#0284c7 (sky-600), Leisure=#db2777 (pink-600)

## Data Flow
```
User Action → Screen → Action file (src/database/actions/)
                              ↓
                       WatermelonDB (local write, is_synced: false)
                              ↓
                       SyncManager (auto every 5min, on reconnect)
                              ↓
                       supabaseSync.ts → supabase.rpc('push_changes')
                                       ← supabase.rpc('pull_changes')
                              ↓
                       Mark is_synced: true
```

## WatermelonDB Patterns
- All domain hooks use `observe()` not `fetch()` — ensures reactive UI updates.
- All writes use `database.write(() => batch([...]))` — never individual writes in loops.
- Schema v6 — 7 tables: habit_logs, finance_logs, diary_entries, diary_images, leisure_logs, user_preferences, sync_metadata.
- All domain tables have: `is_synced`, `device_id`, `deleted_at`, `created_at`, `updated_at`.
- Migrations in single file `src/database/migrations.ts` with `migrationsEnabledAtVersion: 5`.

## Leisure-Habit Link Pattern
`startLeisureTimer()` atomically creates two records:
1. A `HabitLog` (category: 'Enjoyment', activity: 'Leisure') — tracks time in the habits domain
2. A `LeisureLog` with `linkedHabitId` pointing to the HabitLog

`completeLeisureSession()` and `stopLeisureTimer()` both stop the linked HabitLog automatically.
This ensures leisure time appears in habit history under the Enjoyment category.

## Sync Architecture
- `syncManager.ts` — orchestrator: checks connectivity (NetInfo), calls supabaseSync, manages auto-sync interval, exposes `performSync` / `forceFullSync` / `startAutoSync` / `stopAutoSync`
- `supabaseSync.ts` — WatermelonDB synchronize() wrapper: `filterSyncMetadata()` prevents sync_metadata from being pushed to Supabase
- `syncUtils.ts` — diagnostics only: duplicate detection, statistics, integrity checks
- `useSync.ts` — UI hook: wraps performSync, exposes `sync()`, `isSyncing`, `lastSyncedAt`, `syncError`
- Auto-sync: 1s initial delay on app start, then 5min interval, plus network reconnect listener
