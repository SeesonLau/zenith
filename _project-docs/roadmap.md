# Roadmap — Zenith

## Planned
| ID | Description | Est | Notes |
|---|---|---|---|
| P-01 | Define WatermelonDB schema (all 4 domains) | S | Habits, Finance, Diary, Leisure tables + migrations |
| P-02 | Auth screens — Login + Signup UI | S | Wire to existing AuthContext |
| P-03 | Habits screen — timer list + start/stop | M | Use HabitTimerCard, useTimer hook |
| P-04 | Finance screen — transaction list + add form | M | TransactionCard, TransactionForm, FinanceSummary |
| P-05 | Diary screen — entry list + new entry | M | DiaryCard, RichTextEditor, MoodPicker |
| P-06 | Leisure screen — activity list + log session | M | LeisureTimerCard, TypePicker |
| P-07 | Dashboard screen — summary of all 4 domains | M | Depends on P-03 through P-06 |
| P-08 | Sync implementation — WatermelonDB ↔ Supabase | L | SyncManager, pull_changes Edge Function |
| P-09 | Settings screens — preferences + sync status | S | Theme toggle, sync info |
| P-10 | Finance analytics screen | M | Charts, category breakdown |

Est: S = small (< 1 session), M = medium (1-2 sessions), L = large (3+ sessions)

## Suggestions
- Calendar heatmap for habit streaks
- Export data as CSV
- Widget support (if Expo supports it)
- Biometric auth lock

## Deferred
| Item | Reason | Resume When |
|---|---|---|
| Conflict resolution for sync | No schema yet, premature | After P-08 is working |
| Social login (Google/Apple) | Complexity vs value for personal app | If app becomes multi-user |

## Completed
| ID | Description | Version | Date |
|---|---|---|---|
| — | Initial scaffold + DB setup | 0.1.0 | 2026-03-28 |
