// Fails the build when the library bundle renamed its classes or functions (e.g. minification).
// Consumers log `Failure.name` and `Logger` contexts built from `Class.name`, so a renamed
// `NetworkFailure` would show up in production logs as a one-letter identifier.
//
// Usage (from a package directory): node ../../scripts/check-dist-names.mjs [InternalClassName...]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const distDirectory = path.resolve(process.cwd(), 'dist');
const bundles = {
  cjs: path.join(distDirectory, 'index.cjs'),
  mjs: path.join(distDirectory, 'index.mjs'),
};
const internalClassNames = process.argv.slice(2);

const loadExports = async (format, file) =>
  format === 'cjs' ? createRequire(import.meta.url)(file) : import(pathToFileURL(file).href);

const findRenamedExports = (moduleExports) =>
  Object.entries(moduleExports)
    .filter(([, value]) => typeof value === 'function')
    .filter(([exportName, value]) => value.name !== exportName)
    .map(([exportName, value]) => `${exportName} (runtime name "${value.name}")`);

const findMissingInternalClasses = (source) =>
  internalClassNames.filter(
    (className) => !new RegExp(`\\bclass ${className}\\b|\\b${className} = class\\b`).test(source),
  );

const problems = [];

for (const [format, file] of Object.entries(bundles)) {
  const moduleExports = await loadExports(format, file);
  const renamedExports = findRenamedExports(moduleExports);
  const missingInternalClasses = findMissingInternalClasses(readFileSync(file, 'utf8'));
  const exportedFunctions = Object.values(moduleExports).filter((value) => typeof value === 'function');

  if (exportedFunctions.length === 0) {
    problems.push(`${format}: no exported classes or functions found`);
  }
  if (renamedExports.length > 0) {
    problems.push(`${format}: exports renamed in bundle: ${renamedExports.join(', ')}`);
  }
  if (missingInternalClasses.length > 0) {
    problems.push(`${format}: internal classes renamed in bundle: ${missingInternalClasses.join(', ')}`);
  }
}

if (problems.length > 0) {
  process.stderr.write(
    [
      `Bundle in ${distDirectory} does not keep class and function names:`,
      ...problems.map((problem) => `  - ${problem}`),
      'Library builds must not minify identifiers (vite.config.ts: build.minify = false).',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

process.stdout.write(`Bundle names check passed for ${distDirectory}\n`);
