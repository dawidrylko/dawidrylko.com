#!/usr/bin/env node
/**
 * URL-parity gate for the Astro migration.
 *
 * SEO hard requirement: every blog post must keep its existing URL after the
 * Gatsby → Astro cutover. Gatsby derives the slug by stripping the date prefix
 * from the post directory (`filePath.replace(/.*--/, '/')`); Astro reproduces
 * the same slug from the directory name. This script computes the expected post
 * slugs from `content/pl` and asserts that the built Astro output contains a
 * page at each `dist/<slug>/index.html`.
 *
 * Zero dependencies so it runs as a fast CI gate. Exits non-zero on any
 * mismatch. Optional arg overrides the dist directory (default `astro/dist`).
 */

import { readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const CONTENT_DIR = resolve(REPO_ROOT, 'content/pl');
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(REPO_ROOT, 'dist');

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}--/;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const slugs = entries
    .filter(e => e.isDirectory() && DATE_PREFIX.test(e.name))
    .map(e => e.name.replace(DATE_PREFIX, ''))
    .sort();

  if (slugs.length === 0) {
    console.error(`No dated post directories found in ${CONTENT_DIR}`);
    process.exit(1);
  }

  const missing = [];
  for (const slug of slugs) {
    if (!(await exists(join(DIST_DIR, slug, 'index.html')))) {
      missing.push(slug);
    }
  }

  console.log(`URL parity: ${slugs.length} post(s) expected from content/pl\n`);
  if (missing.length > 0) {
    console.error(`Missing ${missing.length} post URL(s) in ${DIST_DIR}:`);
    for (const slug of missing) console.error(`  ✗ /${slug}/`);
    process.exit(1);
  }
  console.log(`All ${slugs.length} post URLs present in ${DIST_DIR}.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
