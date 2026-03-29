# Roadmap — Zenith

## Planned
| ID | Description | Priority | Notes |
|---|---|---|---|
| R-01 | Restore auth — login/signup screens wired to Supabase auth | CRITICAL | Re-enable persistSession, add login + signup UI |
| R-02 | Fix RLS: add user_id to all Supabase tables + rewrite policies | CRITICAL | Blocks any production use |
| R-03 | Verify + redeploy Edge Functions (push_changes, pull_changes) | HIGH | Sync broken without these |
| R-05 | Delete financeConstants.ts — consolidate into categories.ts | MED | BUG-020 |
| R-06 | Standardize styling — decide: inline style OR className, apply everywhere | MED | DiaryCard is the outlier |
| R-07 | Fix version mismatch — align package.json, index.tsx, CHANGELOG to 0.2.0 | LOW | BUG-022 |
| R-09 | Add sync_metadata table to Supabase | HIGH | Required for sync protocol |
| R-10 | Add user_id to WatermelonDB schema + migration (for local ownership tracking) | MED | Needed for multi-account support later |

## Suggestions (Post-Auth)
- Calendar heatmap for habit streaks
- Export data as CSV
- Widget support (if Expo supports it)
- Biometric auth lock
- Push notifications for habit reminders
- Finance budget goals / alerts

## Deferred
| Item | Reason | Resume When |
|---|---|---|
| Social login (Google/Apple) | Complexity vs value for personal app | If app becomes multi-user |
| Supabase type generation (`supabase gen types typescript`) | Requires auth + live DB connection | After R-01 + R-02 complete |

## Completed
| ID | Description | Version | Date |
|---|---|---|---|
| R-04 | Fix LeisureTimerCard — use type/title/notes props instead of hardcoded fallbacks | 0.2.1 | 2026-03-29 |
| R-08 | Wrap all console.log/error in `__DEV__` guards across sync, settings, screens | 0.2.1 | 2026-03-29 |
| P-01 | WatermelonDB schema v6 — 7 tables, all models, migrations | 0.1.0–0.2.0 | 2026-03-28 |
| P-03 | Habits screen — live timers, start/stop, history, sub-screens | 0.2.0 | 2026-03-28 |
| P-04 | Finance screen — transaction list, add form, analytics, sub-screens | 0.2.0 | 2026-03-28 |
| P-05 | Diary screen — entry list, new entry (rich text + mood + images), calendar, sub-screens | 0.2.0 | 2026-03-28 |
| P-06 | Leisure screen — activity list, complete session, timer cards, sub-screens | 0.2.0 | 2026-03-28 |
| P-07 | Dashboard screen — sync status, navigation to all domains | 0.2.0 | 2026-03-28 |
| P-08 | Sync layer — SyncManager, supabaseSync, syncUtils, useSync hook, auto-sync | 0.2.0 | 2026-03-28 |
| P-09 | Settings screens — theme toggle (dark/light), preferences | 0.2.0 | 2026-03-28 |
| P-10 | Finance analytics screen — category breakdown + charts | 0.2.0 | 2026-03-28 |
