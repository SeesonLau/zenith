# CLAUDE.md — Zenith Project Instructions

## Session Start Protocol
1. Read `_project-docs/memory-bank/activeContext.md` first.
2. Based on what is in it, pull only the additional files that are needed (e.g. roadmap.md if next steps reference it, progress.md if version context is needed).
3. Do NOT read all memory bank files — only pull what activeContext.md points to.
4. Use `/start-session` for normal sessions, `/start-session-full` only after a long break or before a major new feature area.

## Session End Protocol
1. Update `_project-docs/memory-bank/activeContext.md` with current state, open issues, and next steps.
2. Update `_project-docs/memory-bank/progress.md` and `CHANGELOG.md` if the version changed.
3. Update `_project-docs/roadmap.md` if any items were completed or added.
4. Write a session log in `_project-docs/sessions/` named `YYYY-MM-DD-vX.X.X.md`.
5. Tell the user which files were updated and what changed.

## Memory Bank
Located in `_project-docs/memory-bank/`. Files and their purpose:

| File | Purpose |
|---|---|
| `activeContext.md` | Current state, open issues, next steps — READ EVERY SESSION |
| `projectbrief.md` | What the project is and its goals |
| `productContext.md` | Why it exists, who uses it, problems it solves |
| `systemPatterns.md` | Architecture decisions, folder structure, patterns used |
| `techContext.md` | Tech stack, dependencies, setup steps |
| `progress.md` | Version history, done list, in-progress, known issues |
| `decisionLog.md` | Why key decisions were made (ADR format) |
| `db-changes.md` | Log of every database/schema/RLS change |

Keep `activeContext.md` under 50 lines. It is loaded every session — size directly affects token cost.

## Project Overview
Zenith is a personal life management mobile app built with React Native / Expo. It tracks four life domains: Habits (timer-based), Finance (transactions + analytics), Diary (rich text + mood + images), and Leisure (activity tracking). Data is stored locally with WatermelonDB and synced to Supabase for cloud backup.

## Coding Standards
- **File path comment**: Every new file must begin with a comment on line 1: `// path/to/file.tsx`
- **Naming**: Components PascalCase, hooks camelCase with `use` prefix, utils camelCase, types PascalCase with `.types.ts` suffix
- **Styling**: Inline `style={{}}` objects using `useThemeColors()` tokens — no `StyleSheet.create`, no hardcoded hex values. NativeWind `className` is NOT used on new code (DiaryCard is a legacy exception to fix, not a pattern to follow).
- **Theme**: Dark-first. Use `useThemeColors()` for all color values. Tokens: `bgPrimary`, `bgSurface`, `bgSurfaceHover`, `textPrimary`, `textSecondary`, `textTertiary`, `borderSurface`, `moduleHabits/Finance/Diary/Leisure`, `success/warning/danger/info`.
- **Security**: Never log auth tokens, user credentials, or Supabase keys. Never commit `.env` files.
- **Comments**: Only where logic is not self-evident. No JSDoc on obvious functions.
- **No premature abstraction**: Three similar lines is better than a premature helper. Build helpers only when used 3+ times.

## Git Rules
- **Never** add `Co-Authored-By` or any Claude attribution to commit messages
- Write commit messages in first person as if the developer wrote the code
- Commit format — capitalized keyword prefix, colon, short description:
  ```
  ADD: account activation screen
  UPDATE: auth error messages to be user-friendly
  FIX: login blocking valid passwords under 8 chars
  DELETE: empty stub files
  REFACTOR: consolidate thermal store into sessionStore
  DOCS: update memory bank and session logs
  ```
- Never force push to main
- Never commit `.env`, secrets, or generated files outside of what is already gitignored
- Never amend published commits

## Versioning
- **Patch** (0.0.x): Bug fixes, style tweaks, copy changes
- **Minor** (0.x.0): New screen, new feature, new DB table
- **Major** (x.0.0): Breaking architecture change, full redesign, new sync strategy

---

## Communication Style
- Terse. Output > explanation.
- No preamble. No affirmations ("Great!", "Certainly!").
- When uncertain, say so in one line, then proceed.
- Prefer action over clarification for unambiguous tasks.
- Ask only when ambiguity would cause irreversible mistakes.

## Code Style — General
- TypeScript strict mode always. No `any` unless explicitly justified with a comment.
- Prefer named exports over default exports.
- Use early returns to reduce nesting.
- No commented-out code in final output.
- No `console.log` in production paths — use `if (__DEV__)` guards.
- Errors must be handled explicitly — no silent catches.
- Prefer `const` over `let`. Never `var`.
- Functional components only. No class components.
- Comments format: `// Comment here` — no decorators, no dividers, no JSDoc on obvious functions.

## Code Style — Folder Structure
Maintain clear separation between data layer and UI layer:
```
src/
  components/     ← UI only. No DB imports.
  contexts/       ← React state providers
  hooks/          ← UI hooks only (useTimer, useNetworkStatus, etc.)
  lib/            ← External service clients (supabase.ts, storage.ts)
  utils/          ← Pure functions. No side effects. No DB imports.
  types/          ← Type definitions only. Grouped by domain.
  database/
    models/       ← WatermelonDB models
    actions/      ← All DB writes. The only layer that imports database.
    hooks/        ← DB-reactive hooks (useDatabase.ts)
    sync/         ← Sync logic only
    migrations.ts ← Single migrations file (not a folder)
```
- `components/` and `hooks/` must never import from `src/database/`
- Screens (`app/`) call actions and use hooks — never import models directly
- `utils/` must be pure — no DB, no Supabase, no React

## Code Style — Supabase / Database
- RLS is non-negotiable. Every table must have `auth.uid() = user_id` policies before production.
- Never expose service role key client-side.
- Prefer database functions/views over complex client-side joins.
- Always generate a migration file for schema changes. Never mutate schema directly in production.
- Name RLS policies descriptively: `"Users can read their own rows"`
- `user_id` column required on every user-data table for RLS to function.

## Security
- Never log auth tokens, sync payloads, or personal data — even in dev.
- Wrap all dev-only logs in `if (__DEV__)`.
- Never commit `.env` files, access tokens, or service role keys.
- Never run destructive SQL (`DROP`, `TRUNCATE`, `DELETE` without WHERE) without explicit user confirmation.
- Never expose Supabase service role key client-side under any circumstances.
- Bug tracker (`_project-docs/progress/qa-bugs.md`) must be updated whenever a security issue is found or fixed.

## What to Avoid
- Don't refactor working code unless explicitly asked.
- Don't add dependencies without asking if a lightweight alternative exists.
- Don't generate placeholder/Lorem Ipsum content unless explicitly asked.
- Don't over-engineer. YAGNI.
- Don't wrap every operation in try/catch just to suppress errors — handle them or let them propagate.
- Don't use `any` type to silence TypeScript — fix the type.

## Tool Use
- Read existing code before writing new code.
- Confirm before deleting files or making destructive changes.
- On Windows, wrap npx-based stdio servers with `cmd /c`.
- After editing a file, re-read it to verify the output is correct.
- If a task needs >3 tool calls, state the plan first.
- Update `_project-docs/progress/bugs.md` whenever bugs are found or fixed.
