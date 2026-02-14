# Instructions on how to prompt AI

## A new task

Use plan with the following prompt:

```txt
You are a principal software engineer.

<Feature>

## Hard constraints
- Do NOT create migrations. If schema changes are required, update only models and include a plain-text Migration note.
- Follow all coding/architecture/testing rules in .cursor/rules.
- If dependencies are required, list them; I will install manually.
- Prefer minimal, targeted changes. Avoid drive-by refactors.

## Plan mode requirements
Return a plan with exactly these sections:

- Goal (1 sentence)
- Assumptions (only if needed)
- Approach (3–7 bullets; if feature is <= 1 sentence, keep total plan <= 8 bullets)
   - Tests must come before implementation unless request is test-only
- Tests to add/update (test names + what they assert; include key scenarios)
- Files to change
- Risks/alternatives (optional)
- Validation
   - npm run build
   - npm run test
```

## When moving from plan to implementation (agent)

```txt
Build the plan with the following rules:
- Before continuing to the next todo always wait for me to write the "next step" here, i want to validate each step that you will be doing, its easier then validating everything at the end
- Each todo task should be run in its own sub agent to reduce the context required to perform the task.
- .cursor/rules must be always in context when performing any task
```

## Pre commit validation

```txt
Please review the code changes analyse it and propose any changes you think relevant, focus on:
- Code simplicity
- Bugs
- Naming
- Inconsistent implementation according to .cursor/rules
- Improvements
- Risks
- Ambiguity
- Code extensibility
- Security vulnerabilities (OWASP top 10 is a must)
- Performance
```
