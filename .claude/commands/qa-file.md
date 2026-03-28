The argument(s) passed to this command are the file path(s) to audit. If no argument is provided, check the IDE context for a currently open file and audit that instead. If neither is available, audit `app/(tabs)/index.tsx` as a default starting point.

Read each target file. Then read any files they import from `src/` to understand context.

For each file check:
- TypeScript errors or use of `any` — flag with line number
- Missing explicit types on state, props, or function returns
- Unused imports
- `console.log` statements — Critical if printing auth data, tokens, or sync payloads
- Missing file path comment on line 1
- Every `onPress` / `onSubmit` handler — does it actually do what it says, or is it a no-op / stub?
- Every async call: is `error` destructured and handled? Is loading state reset in a `finally` block?
- WatermelonDB writes: are they inside `database.write(async () => { ... })`?
- FlatList: has `keyExtractor`? `renderItem` not an inline arrow?
- `setInterval` / `setTimeout` in `useEffect`: has cleanup return?
- Every `router.push()` target — does the route file actually exist?

Output a single table:

| ID | File | Line | Issue | Severity |
|---|---|---|---|---|

Severity: `Critical` | `High` | `Medium` | `Low`

Then write findings to `_project-docs/progress/qa-bugs.md`:
- If the file exists, append new rows under the matching section; do not duplicate existing IDs
- If the file does not exist, create it with the standard sections from the full `/qa` command
- Assign IDs continuing from the highest existing `QA-xxx` number, or starting at `QA-001`
- Also update the `ui-checklist.md` row(s) for any screen file(s) audited if `_project-docs/progress/ui-checklist.md` exists
