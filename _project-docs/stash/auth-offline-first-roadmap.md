# Stash: Auth + Offline-First Roadmap
**Stashed:** 2026-03-30
**Status:** Deferred — revisit when ready to add sync/auth

---

## Context
Zenith is offline-first (WatermelonDB). Adding Supabase auth requires internet only once (first login). After that, session is persisted to AsyncStorage and the app works fully offline forever. Sync is the only feature that ever needs internet.

---

## Roadmap

### PHASE 1 — Supabase Setup (cloud side, no code changes yet)

1. Add `user_id` column to all 5 tables in Supabase
   (`habit_logs`, `finance_logs`, `diary_entries`, `diary_images`, `leisure_logs`)

2. Backfill existing rows with your new account's UUID
   ```sql
   UPDATE habit_logs    SET user_id = '<your-uuid>' WHERE user_id IS NULL;
   UPDATE finance_logs  SET user_id = '<your-uuid>' WHERE user_id IS NULL;
   UPDATE diary_entries SET user_id = '<your-uuid>' WHERE user_id IS NULL;
   UPDATE diary_images  SET user_id = '<your-uuid>' WHERE user_id IS NULL;
   UPDATE leisure_logs  SET user_id = '<your-uuid>' WHERE user_id IS NULL;
   ```

3. Write RLS policies on each table
   - "Users can only read/write their own rows"
   - `auth.uid() = user_id`

4. Create + deploy edge functions
   - `pull_changes` — filters rows by `auth.uid()`
   - `push_changes` — stamps `user_id` on incoming rows

### PHASE 2 — Local Schema (app side)

5. Add `user_id` column to WatermelonDB schema (schema v7)
   - Write migration v6 → v7

6. Update all action files to stamp `user_id` on every new record
   - Read from auth session in context

### PHASE 3 — Auth Screens (app side)

7. Re-enable Supabase session persistence
   - `persistSession: true` (was intentionally disabled)
   - `autoRefreshToken: true`

8. Create `AuthContext`
   - Reads stored session from AsyncStorage on mount
   - Exposes: `user`, `session`, `isLoading`, `signIn()`, `signOut()`
   - Session found in storage → go straight to app (no network needed)
   - No session → show login screen

9. Build login screen (`app/login.tsx`)
   - Email + password form
   - `supabase.auth.signInWithPassword()`
   - On success → session auto-saved to AsyncStorage
   - On failure → show error, stay on login

10. Protect routes in `_layout.tsx`
    - No session + not loading → redirect to `/login`
    - Session present → show tabs

### PHASE 4 — Wire Sync to Auth

11. `SyncManager` reads `user_id` from auth session before syncing
    - No session → skip sync, return early

12. Test full cycle:
    - local write → sync push → Supabase row has correct `user_id`
    - Supabase row → sync pull → appears in local DB

---

## App Open Flow (after implementation)

```
App opens
    │
    ▼
AuthContext reads AsyncStorage
    │
    ├─ Session found ──────────────────► Load tabs normally
    │   (no network needed)               All features work offline
    │                                     Sync runs in background
    │                                     if internet available
    │
    └─ No session ─────────────────────► Login screen
        (first launch ever,               Requires internet ONCE
         or 60-day token expiry)          After login → fully offline
```

## What Never Needs Internet
- Starting/stopping habit timers
- Logging finance transactions
- Writing diary entries
- Leisure tracking
- Viewing all history
- Theme switching, settings

## What Does Need Internet
- First-ever login (one time)
- Supabase sync (optional, silent, skipped if offline)
- Token refresh every 60 days (silent, background)

---

## Dependency Order
- Phase 1 and Phase 2 can be done in parallel
- Phase 3 can be started any time
- Phase 4 requires Phase 1 + 2 + 3 all done first
- **Do NOT enable RLS until the backfill is done** — existing data goes dark if rows have no `user_id` when policies activate
