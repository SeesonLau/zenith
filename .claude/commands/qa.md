Run a full QA audit on the Zenith codebase. Work through every area below, read the relevant files, and report all findings.

---

## Area 1 — Code Quality
Read every file in `app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/utils/`, `src/types/`, `src/contexts/`.

Check for:
- TypeScript errors or use of `any` — flag file + line
- Missing explicit types on state, props, or function returns
- Unused imports or variables declared but never read
- `console.log` / `console.warn` statements — flag all; mark Critical if they print tokens, auth data, or sync payloads (e.g. `JSON.stringify(changes)`)
- Hardcoded secrets or API keys not using `EXPO_PUBLIC_*` env vars
- Missing file path comment on line 1 (required by CLAUDE.md for every source file)
- Files that are empty or export only a placeholder component with no real content

---

## Area 2 — UI Completeness
Read every screen file in `app/`.

For each screen check:
- Is it a real screen or an empty/stub? (stub = renders just a `<Text>` or nothing meaningful)
- Does it show a loading indicator while async data loads?
- Does it show an error message if a DB or network call fails?
- Does it show an empty state if a list returns zero rows?
- Are there any `onPress` / `onSubmit` handlers that do nothing, only `console.log`, or navigate without saving data that should be saved?
- Are there hardcoded placeholder strings? (e.g. "Test User", fake amounts, fake dates, sample entries)

---

## Area 3 — Navigation & Flow Tracing
Read `app/` directory structure and all `router.push()` / `router.replace()` / `<Link>` calls across all screens.

Verify each route target exists as a real file:

**Habits flow:** `(tabs)/habits → habit/start → habit/[id] → habit/history`
**Finance flow:** `(tabs)/finance → finance/add → finance/[id] → finance/analytics`
**Diary flow:** `(tabs)/diary → diary/new → diary/[id] → diary/calendar`
**Leisure flow:** `(tabs)/leisure → leisure/start → leisure/[id]`
**Auth flow:** `app/auth.tsx → (tabs)` on success; `app/_layout.tsx` handles auth gate

Check:
- Every `router.push('/x')` target maps to a real file in `app/`
- Dynamic routes (e.g. `habit/[id]`) receive the `id` param at the call site
- No screen is a dead end — every screen either has a back button, tab navigation, or explicit exit
- Auth gate: is the user redirected to auth if not signed in? Is it in `_layout.tsx`?
- Is `app/auth.tsx` wired to `AuthContext` (signIn / signUp)?

---

## Area 4 — Data & Sync Layer
Read `src/database/schema.ts`, all files in `src/database/models/`, `src/database/actions/`, `src/database/hooks/`, `src/database/sync/`, and `src/contexts/SyncContext.tsx`, `src/hooks/useSync.ts`.

**WatermelonDB model ↔ schema match:**
- For each model class, verify every `@field`, `@date`, `@text`, `@readonly`, `@relation` decorator maps to a column defined in `schema.ts` with the correct type
- Flag any column in schema that has no corresponding field in the model
- Flag any field in the model that has no corresponding column in schema

**Actions correctness:**
- Every write operation (`create`, `update`, `delete`) wrapped in `database.write(async () => { ... })`?
- Soft-delete pattern used consistently? (set `deleted_at`, not hard delete)
- `total_cost` in `finance_logs` — is it auto-calculated from `quantity * cost` in the action, or expected from the UI?

**Sync layer:**
- Search `src/database/sync/supabaseSync.ts` for any `console.log` that prints `changes` or `JSON.stringify(changes)` — flag as Critical if found (sync payloads can be large and contain personal data)
- Does `SyncContext` / `useSync` actually call `syncWithSupabase()`?
- Check `supabase/functions/` — do both `pull_changes` AND `push_changes` Edge Functions exist? Flag as High if either is missing.
- Is `migrationsEnabledAtVersion: 1` correct for the current schema version?

**Supabase auth sync:**
- Does any action attach `user_id` to records before writing? (needed for RLS once Supabase tables exist)
- Are there any direct `supabase.from('table').insert()` calls outside of the sync layer? (violates offline-first architecture)

---

## Area 5 — Performance Anti-patterns
Read `app/` and `src/components/`.

Flag any of the following:
- `FlatList` or `SectionList` missing `keyExtractor`
- Inline arrow functions as `FlatList` `renderItem` prop (new function every render — extract to a `useCallback` or component)
- `useTimer` — does `setInterval` or `setTimeout` inside a `useEffect` have a cleanup `return () => clearInterval(...)`?
- Expensive computations (sorting, filtering large arrays) outside `useMemo`
- Observable subscriptions created outside WatermelonDB `withObservables` or `observe()` patterns
- `database.get('table').query()` called directly inside render (should be in a hook or observable)

---

## Area 6 — Accessibility
Read every screen in `app/` and every component in `src/components/`.

Check:
- Every `TouchableOpacity` / `Pressable` containing only an icon (no visible text label) must have `accessibilityLabel`
- Every icon-only button that performs a destructive action (delete, clear) must have `accessibilityRole="button"`

Read `src/lib/constants.ts` for any color tokens defined there. Read `app/(tabs)/_layout.tsx` and extract the actual current values for `backgroundColor`, `tabBarActiveTintColor`, and `tabBarInactiveTintColor`. Use those live values — do not assume them.

Calculate WCAG AA contrast for these pairs using the values you just read:
  - Active tab label color on tab bar background
  - Inactive tab label color on tab bar background
  - White (`#ffffff`) on tab bar background
  - White on the surface card color (slate-800 equivalent, check constants or `_layout.tsx`)
- Minimum: 4.5:1 for normal text, 3:1 for large text / UI components
- Formula: convert hex → linear RGB (if c/255 ≤ 0.03928: c/255/12.92, else ((c/255+0.055)/1.055)^2.4), then L = 0.2126R + 0.7152G + 0.0722B, contrast = (L_lighter+0.05)/(L_darker+0.05)

---

## Area 7 — Architecture Integrity
Read `app/_layout.tsx`, `src/contexts/`, `src/database/index.ts`, `src/lib/supabase.ts`.

Check:
- Is `DatabaseProvider` (WatermelonDB) wrapping the app in `_layout.tsx`? If not, `useDatabase` hook will crash
- Is the database singleton exported from `src/database/index.ts` used everywhere, or are multiple database instances being created?
- Does any screen or component import directly from `src/database/index.ts` and call `database.get(...)` instead of going through actions?
- `SyncContext` — is it provided at root level, or only in some subtrees?
- `ThemeContext` — does it exist and is it provided at root level?
- Check `src/lib/supabase.ts` — is the Supabase URL/key read from `EXPO_PUBLIC_*` env vars, or hardcoded?

---

## Output Format

### Inline Report (in chat)

One table per area:

| ID | File | Line | Issue | Severity | Impact |
|---|---|---|---|---|---|

Severity: `Critical` | `High` | `Medium` | `Low`

After all area tables:

**Flow Status Table**
| Flow | Status | Blocker |
|------|--------|---------|
| Habits (list → start → active → history) | ✅ Working / 🔄 Partial / ❌ Broken / ⬜ Stub | |
| Finance (list → add → detail → analytics) | | |
| Diary (list → new → detail → calendar) | | |
| Leisure (list → start → detail) | | |
| Auth (login → app → sign out) | | |
| Offline-first data writes | | |
| WatermelonDB ↔ Supabase sync | | |

**Summary Table**
| Area | Issues | Critical | High | Medium | Low |
|------|--------|----------|------|--------|-----|
| Code Quality | | | | | |
| UI Completeness | | | | | |
| Navigation & Flows | | | | | |
| Data & Sync Layer | | | | | |
| Performance | | | | | |
| Accessibility | | | | | |
| Architecture Integrity | | | | | |
| **Total** | | | | | |

---

### File Updates (write to disk after the inline report)

**1. Write `_project-docs/progress/qa-bugs.md`** (create if it doesn't exist, update if it does)

```
# QA Report — Bugs & Issues
**Last verified:** YYYY-MM-DD

## Code Quality
| ID | File | Line | Issue | Severity | Status |

## UI / UX
| ID | File | Line | Issue | Severity | Status |

## Data & Sync Layer
| ID | File | Line | Issue | Severity | Status |

## Performance
| ID | File | Line | Issue | Severity | Status |

## Accessibility
| ID | File | Line | Issue | Severity | Status |

## Architecture
| ID | File | Line | Issue | Severity | Status |

## Navigation
| ID | File | Line | Issue | Severity | Status |

## Tracking
| Area | Total | Open | Fixed |
```

- Assign IDs: `QA-001`, `QA-002`, etc. (continue from highest existing)
- Status: `Open` | `✅ Fixed YYYY-MM-DD` | `Deferred`
- Preserve existing IDs and fixed items on update

**2. Write `_project-docs/progress/ui-checklist.md`** (create if it doesn't exist, update if it does)

| ID | Screen | File | Built | Real Data | Loading | Error | Empty State | Notes |
|---|---|---|---|---|---|---|---|---|

- Built: ✅ complete | 🔄 partial | ❌ stub
- Real Data: ✅ WatermelonDB | 🔄 partial | ❌ none
- Loading / Error / Empty State: ✅ | ❌ | N/A

Include a Summary counts row at the bottom.
