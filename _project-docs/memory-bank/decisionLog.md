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

## ADR-003: NativeWind v4 for styling
**Date**: 2026-03-28
**Decision**: Use NativeWind v4 (Tailwind CSS for React Native) instead of StyleSheet
**Reason**: Consistent design tokens, faster iteration, dark theme trivial to implement with slate palette.
**Trade-off**: Requires `react-native-css-interop` bridge, adds build complexity. Tailwind v4 syntax differs from v3 (uses `@import "tailwindcss"` not `@tailwind base`).

## ADR-004: Offline-first architecture
**Date**: 2026-03-28
**Decision**: All writes go to WatermelonDB first; Supabase sync happens in background
**Reason**: App must work without internet. Personal data should never be blocked by network.
**Trade-off**: Sync conflicts need to be handled. Currently deferred — no conflict resolution strategy defined yet.
