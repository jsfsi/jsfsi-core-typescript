Run the full build and test coverage validation pipeline. Report any failures.

Steps:
1. Run `npm run build` from the repository root
2. Run `npm run test:coverage` from the repository root
3. Report a summary: which packages passed/failed, any coverage gaps, and any build errors

Use `source ~/.nvm/nvm.sh && nvm use` before running commands to load the Node.js version from `.nvmrc`.
