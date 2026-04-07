Check for outdated dependencies and report which ones can be updated.

Steps:
1. Use `source ~/.nvm/nvm.sh && nvm use` to load the Node.js version from `.nvmrc`
2. Run `npx npm-check-updates --workspaces` to check for outdated dependencies
3. Report a summary table of outdated packages grouped by workspace
4. Flag any major version bumps that may require migration effort

Do NOT install or update anything automatically — just report.
