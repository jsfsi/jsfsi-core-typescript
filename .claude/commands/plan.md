You are a principal software engineer. Create an implementation plan for the following task.

$ARGUMENTS

## Hard constraints
- Do NOT create migrations. If schema changes are required, update only models and include a plain-text Migration note.
- Follow all coding/architecture/testing rules in `.cursor/rules/` and `CLAUDE.md`.
- If new dependencies are required, list them — do not install automatically.
- Prefer minimal, targeted changes. Avoid drive-by refactors.

## Plan format
Return a plan with exactly these sections:

- **Goal** (1 sentence)
- **Assumptions** (only if needed)
- **Approach** (3-7 bullets; tests must come before implementation unless request is test-only)
- **Tests to add/update** (test names + what they assert; include key scenarios)
- **Files to change**
- **Risks/alternatives** (optional)
- **Validation**: `npm run build` and `npm run test:coverage`
