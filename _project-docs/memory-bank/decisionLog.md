# Decision Log — Zenith

## ADR-001: WatermelonDB for local storage
**Date**: 2026-03-28
**Decision**: Use WatermelonDB instead of SQLite directly or AsyncStorage
**Reason**: WatermelonDB provides a React-observable model layer, built-in sync protocol, and good performance for relational data. AsyncStorage is key-value only. Raw SQLite requires more boilerplate.
**Trade-off**: Requires native build (no Expo Go), needs patch-package for Expo 54 compatibility.

## ADR-002: Supabase for backend
**Date**: 2026-03-28
**Decision**: Use Supabase for auth + cloud sync backend
**Reason**: Provides auth, PostgreSQL, Edge Functions, and real-time in one platform. Pairs well with WatermelonDB sync protocol.
**Trade-off**: Vendor dependency. RLS policies must be set up correctly per table.

## ADR-003: NativeWind v4 + Tailwind CSS v3.4 for styling
**Date**: 2026-03-28
**Decision**: Use NativeWind v4 as the styling bridge for React Native
**Reason**: Consistent design tokens, faster iteration, dark theme trivial to implement with slate palette.
**Trade-off**: NativeWind is v4 but Tailwind CSS engine is **v3.4.x** (not v4 — `tailwindcss@^3.4.17`). Tailwind v3 uses `@tailwind base/components/utilities` directives in CSS, not `@import "tailwindcss"`. Do not upgrade Tailwind to v4 without verifying NativeWind compatibility first.

## ADR-004: Offline-first architecture
**Date**: 2026-03-28
**Decision**: All writes go to WatermelonDB first; Supabase sync happens in background
**Reason**: App must work without internet. Personal data should never be blocked by network.
**Trade-off**: Sync conflicts need to be handled. Currently deferred — last-write-wins via `updated_at` is the intended strategy but not yet implemented.

## ADR-005: Auth temporarily removed
**Date**: 2026-03-28
**Decision**: Supabase Auth disabled (`persistSession: false`, `autoRefreshToken: false`). No login/signup screens.
**Reason**: Auth was removed during rapid development of the four core domain screens. Decision was to get UI complete first, then add auth layer.
**Trade-off**: App is currently unauthenticated. RLS policies on Supabase cannot filter by user. App cannot be shipped without restoring auth. Planned for v0.3.0 (roadmap R-01, R-02).

## ADR-006: Inline style={{}} objects as the styling pattern
**Date**: 2026-03-28
**Decision**: Use inline `style={{}}` objects with `useThemeColors()` hook for all color tokens. Not NativeWind `className` strings on new screens.
**Reason**: The codebase evolved to inline styles during rapid development. All screens and components use this pattern. NativeWind className is only present on `DiaryCard.tsx` (legacy, to be fixed). Standardizing on className would require refactoring all existing screens.
**Trade-off**: Loses Tailwind's utility class system. Design token consistency maintained via `useThemeColors()` hook instead. Hardcoded hex values are banned — always go through the token hook.
