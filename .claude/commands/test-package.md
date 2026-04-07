Run tests with coverage for a specific package and report results.

Package: $ARGUMENTS

Steps:
1. Use `source ~/.nvm/nvm.sh && nvm use` to load the Node.js version from `.nvmrc`
2. Run `npm run test:coverage --workspace=@jsfsi-core/$ARGUMENTS`
3. Report: pass/fail count, coverage percentages, any uncovered lines

If no package is specified, list the available packages: `ts-crossplatform`, `ts-nodejs`, `ts-nestjs`, `template-rest-api`, `template-authenticated-dashboard`.
