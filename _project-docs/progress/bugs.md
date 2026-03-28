# Bug Tracker — Zenith
**Last updated:** 2026-03-28

---

## 🔴 Critical

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-001 | Security | Supabase DB | — | RLS policies are `Allow all (public)` — any request can read/write all rows. No user filtering. | Open |
| BUG-002 | Security | Supabase DB | — | No `user_id` column on any table — RLS cannot filter by owner even if policies are rewritten. | Open |
| BUG-004 | Sync | Supabase DB | — | `sync_metadata` table exists locally but not in Supabase — WatermelonDB sync tracking will fail. | Open |
| BUG-026 | Auth | Entire app | — | Auth completely removed. `supabase.auth` session disabled (`persistSession: false`). No login/signup flow. App runs unauthenticated. Cannot ship without re-enabling auth. | Open |

---

## 🟠 High

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-005 | Security | `src/database/sync/supabaseSync.ts` | ~35 | Logs full sync payload via `JSON.stringify(changes)` — exposes all personal data to console. Not in `__DEV__` guard. | Open |
| BUG-006 | Sync | Supabase server | — | `push_changes` and `pull_changes` Edge Functions deleted locally. Server deployment status unknown. Sync push/pull will fail if not deployed. | Open |

---

## 🟡 Medium

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-011 | Architecture | `src/types/database.types.ts` | ~360 | `RootStackParamList` defined here — should be in a navigation types file. Minor — navigation.types.ts was deleted. | Open |
| BUG-012 | Architecture | `app/(tabs)/habits.tsx` | ~26–37 | Timer `setInterval` / elapsed time logic is inline. `useTimer.ts` was deleted rather than implemented. Acceptable short-term but violates hooks separation. | Open |
| BUG-013 | Code Quality | `src/database/models/DiaryEntry.ts` | ~20 | Stale comment: "CHANGE THIS LINE: Remove Q." — misleading, should be removed. | Open |
| BUG-020 | Code Quality | `src/lib/financeConstants.ts` | — | Outdated category names (Load, Fare, Personal-Physical, etc.) that do not match `src/constants/categories.ts`. Also imported but never used in categories.ts. Creates false impression of a second category source. | Open |
| BUG-021 | UI | `src/components/leisure/LeisureTimerCard.tsx` | ~30–60 | Accepts `type`, `title`, `notes` props but ignores all three. Renders hardcoded "❓" icon and "Untitled Session" for every active session. | Open |
| BUG-022 | Code Quality | Multiple | — | Version mismatch: `app/(tabs)/index.tsx` says v1.1.0, `package.json` says 1.0.0, `CHANGELOG.md` says 0.1.0. Actual version is 0.2.0. | Fixed |

---

## 🟢 Low

| ID | Area | File | Line | Issue | Status |
|---|---|---|---|---|---|
| BUG-017 | Code Quality | `src/database/sync/supabaseSync.ts` | Multiple | ~20 `console.log` statements with emoji decorators. Not wrapped in `__DEV__` guards. | Open |
| BUG-023 | Code Quality | `src/components/diary/DiaryCard.tsx` | — | Uses NativeWind `className` strings ("card p-4 mb-3", "text-primary font-bold text-lg") while all other components use inline `style={{}}` objects. Inconsistent styling approach. | Open |
| BUG-024 | Code Quality | `app/settings/index.tsx` | ~10–30 | Manually derives colors via `theme === 'slate' ? '#...' : '#...'` instead of using `useThemeColors()` hook. Will drift from design tokens. | Open |
| BUG-025 | Code Quality | `src/database/sync/syncManager.ts` | Multiple | Multiple `console.log` calls not wrapped in `__DEV__` guards. | Open |

---

## Fixed

| ID | Area | What Was Fixed | Fixed In |
|---|---|---|---|
| BUG-003 | Sync | Schema drift partially resolved: `device_id` added to WatermelonDB schema v6 via migration. `linked_habit_id` and `uploaded_at` confirmed in local schema. | 0.2.0 |
| BUG-007 | Code | `pull_changes` Edge Function removed from codebase — was an empty stub. Server-side status tracked separately as BUG-006. | 0.2.0 |
| BUG-008 | Code Quality | `app/auth.tsx` deleted entirely — `error: any` issue no longer exists. | 0.2.0 |
| BUG-009 | Code Quality | `app/auth.tsx` missing file path comment no longer relevant (file deleted). | 0.2.0 |
| BUG-014 | Architecture | `SyncContext.tsx` deleted — replaced by `useSync` hook which exposes sync state directly. | 0.2.0 |
| BUG-015 | Architecture | `ThemeContext.tsx` fully implemented — dark/light toggle, AsyncStorage persistence, NativeWind integration. | 0.2.0 |
| BUG-016 | Architecture | `global.types.ts`, `navigation.types.ts`, `supabase.types.ts` deleted — types consolidated in `database.types.ts`. | 0.2.0 |
| BUG-018 | Architecture | `useTimer.ts` deleted — decision made not to extract timer hook; inline timer in habits.tsx is acceptable. | 0.2.0 |
| BUG-019 | Architecture | `syncManager.ts` fully implemented — performSync, forceFullSync, auto-sync, network reconnect listener. | 0.2.0 |
| BUG-010 | Code Quality | `_layout.tsx` rewritten — hardcoded hex colors replaced. | 0.2.0 |

---

## Tracking

| Severity | Total | Open | Fixed |
|---|---|---|---|
| Critical | 4 | 4 | 0 |
| High | 2 | 2 | 0 |
| Medium | 6 | 6 | 0 |
| Low | 4 | 4 | 0 |
| **Open Total** | **16** | **16** | — |
| **Fixed** | 10 | — | 10 |
