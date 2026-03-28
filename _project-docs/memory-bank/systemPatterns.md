# System Patterns — Zenith

## Folder Structure
```
app/                    # Expo Router screens
  (tabs)/               # Tab screens (index, habits, finance, diary, leisure)
  habit/                # Habit sub-screens [id], start, history
  diary/                # Diary sub-screens [id], new, calendar
  finance/              # Finance sub-screens [id], add, analytics
  leisure/              # Leisure sub-screens [id], start
  settings/             # Settings sub-screens
src/
  components/           # Reusable UI components, grouped by domain
    common/             # Shared: Button, Card, Input, DatePicker, etc.
    habit/              # Habit-specific components
    finance/            # Finance-specific components
    diary/              # Diary-specific components
    leisure/            # Leisure-specific components
    layout/             # Header, TabBar, Container
  contexts/             # React context providers (Auth, Sync, Theme)
  hooks/                # Custom hooks (useSync, useNetworkStatus, useTimer, etc.)
  lib/                  # Singletons: supabase client, storage, constants
  utils/                # Pure functions: dateHelpers, formatters, validators, calculations
  types/                # TypeScript type definitions
  database/
    migrations/         # WatermelonDB schema migrations
    sync/               # SyncManager for Supabase sync
supabase/
  functions/            # Edge Functions (pull_changes, etc.)
```

## Architecture Patterns
- **Offline-first**: WatermelonDB stores all data locally. Supabase is sync-only.
- **Provider pattern**: Auth, Sync, Theme wrapped at root layout.
- **Tab routing**: Expo Router file-based routing. Each tab is a file in `app/(tabs)/`.
- **Domain components**: Components live with their domain (`src/components/habit/`, etc.)
- **No Redux**: Local state + React Context only. WatermelonDB observables for DB-driven UI.

## Styling Pattern
- NativeWind v4 className strings on all components
- No `StyleSheet.create`, no inline `style={{}}` objects
- Theme: `bg-slate-950` body, `bg-slate-900`/`bg-slate-800` surfaces, `text-sky-400` accent

## Data Flow
```
User Action → Component → WatermelonDB (local write)
                                ↓
                         SyncManager (on network)
                                ↓
                         Supabase (cloud backup)
```
