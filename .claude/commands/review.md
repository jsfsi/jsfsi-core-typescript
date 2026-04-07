Review the current uncommitted code changes and propose improvements. Run `git diff` to see what changed.

Focus on:
- Code simplicity
- Bugs
- Naming consistency
- Inconsistencies with the project patterns described in `.cursor/rules/` and `CLAUDE.md`
- Security vulnerabilities (OWASP top 10)
- Performance
- Missing or incomplete test coverage
- Incorrect Result type usage (should use Ok/Fail, isFailure — never instanceof or try-catch in domain)
- Any `any` types, double casts, or hardcoded strings in React components

Be concise — list issues as bullet points with file:line references. Only flag real problems, not style preferences.
