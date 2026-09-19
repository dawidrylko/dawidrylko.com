import { describe, expect, it } from 'vitest';
import { findBlockedPaths, parsePaths } from './check-autofix-paths.mjs';

describe('findBlockedPaths', () => {
  it('allows source, style and script files', () => {
    const paths = ['src/pages/index.astro', 'src/styles/main.css', 'scripts/ci/check-seo-meta.mjs', 'README.md'];
    expect(findBlockedPaths(paths)).toEqual([]);
  });

  it('refuses anything under content/, the hand-edited posts', () => {
    const paths = ['content/pl/2025-12-26--od-tablicy-do-mapy/index.mdx', 'content/pl/2021-01-01--x/ng-help.md'];
    expect(findBlockedPaths(paths)).toEqual(paths);
  });

  it('refuses workflows, hooks and the dependency manifests', () => {
    const paths = [
      '.github/workflows/ci.yml',
      '.github/dependabot.yml',
      '.husky/pre-commit',
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      '.npmrc',
      '.nvmrc',
    ];
    expect(findBlockedPaths(paths)).toEqual(paths);
  });

  it('matches only from the repository root', () => {
    expect(findBlockedPaths(['src/content/notes.ts', 'test/package.json', 'src/.github/notes.md'])).toEqual([]);
  });
});

describe('parsePaths', () => {
  it('reads the path column of git apply --numstat', () => {
    const text = '3\t1\tsrc/pages/index.astro\n-\t-\tstatic/logo.png\n0\t2\tcontent/pl/x/index.mdx\n';
    expect(parsePaths(text)).toEqual(['src/pages/index.astro', 'static/logo.png', 'content/pl/x/index.mdx']);
  });

  it('accepts bare paths and ignores blank lines', () => {
    expect(parsePaths('src/a.ts\n\nsrc/b.ts')).toEqual(['src/a.ts', 'src/b.ts']);
  });
});
