// Path guard for the Dependabot autofix patch. The patch is produced by the
// freshly updated formatters and linters, so it is untrusted: it must not reach
// authored content (content/ is edited by hand only, see CLAUDE.md), workflows,
// or the dependency manifests. The push job runs this from the pull request head
// BEFORE applying the patch, so the patch cannot rewrite its own guard. Paths
// come one per line on stdin (the output of `git apply --numstat`). Zero deps;
// `findBlockedPaths` is pure and unit-tested.
import { readFileSync } from 'node:fs';

const BLOCKED = [
  /^content\//,
  /^\.github\//,
  /^\.husky\//,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^\.npmrc$/,
  /^\.nvmrc$/,
];

// Pure: given repo-relative paths, return the ones the autofix must not touch.
export function findBlockedPaths(paths) {
  return paths.filter(path => BLOCKED.some(pattern => pattern.test(path)));
}

// `git apply --numstat` prints "<added>\t<deleted>\t<path>"; a bare path per
// line is accepted as well.
export function parsePaths(text) {
  return text
    .split('\n')
    .map(line => line.split('\t').at(-1).trim())
    .filter(Boolean);
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  const paths = parsePaths(readFileSync(0, 'utf8'));
  const blocked = findBlockedPaths(paths);

  if (blocked.length) {
    console.error('✗ The autofix patch touches protected paths:');
    for (const path of blocked) {
      console.error(`  - ${path}`);
    }
    console.error('\nThe patch is not pushed. The pull request stays for a human.');
    process.exit(1);
  }

  console.log(`✓ The autofix patch touches ${paths.length} file(s), none of them protected.`);
}
