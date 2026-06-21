#!/usr/bin/env node
/**
 * JS bundle budget for the Astro build (dist/).
 *
 * Guards the JavaScript a visitor downloads up front on any single page. For
 * each rendered page it sums the unique /_astro/*.js modules the HTML references
 * (module scripts + modulepreload links) and fails if the heaviest page exceeds
 * the budget.
 *
 * Only statically-referenced modules count: Mermaid's per-diagram chunks are
 * imported at runtime by the hydrated island, not preloaded in the HTML, so they
 * are correctly excluded. Today the heaviest page is /setup/ (the Mermaid
 * client:load island) at ~187 KB; the budget leaves headroom while still
 * catching a heavy dependency that starts shipping site-wide.
 *
 * Zero dependencies; runs against the built output, it does NOT rebuild.
 */

import { readFile, readdir, access, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../dist');

const MAX_PAGE_JS_BYTES = 240 * 1024;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Recursively collect every .html file under dir. */
async function collectHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return collectHtml(full);
      return entry.name.endsWith('.html') ? [full] : [];
    }),
  );
  return files.flat();
}

/** Sum the unique /_astro/*.js modules a page references, in bytes. */
async function pageJsBytes(html, sizeCache) {
  const refs = new Set(html.match(/\/_astro\/[A-Za-z0-9._-]+\.js/g) ?? []);
  let total = 0;
  for (const ref of refs) {
    if (!sizeCache.has(ref)) {
      try {
        sizeCache.set(ref, (await stat(join(DIST_DIR, ref))).size);
      } catch {
        sizeCache.set(ref, 0);
      }
    }
    total += sizeCache.get(ref);
  }
  return total;
}

async function main() {
  if (!(await exists(DIST_DIR))) {
    console.error(`Build output not found at ${DIST_DIR}. Run "pnpm build" first.`);
    process.exit(1);
  }

  const pages = await collectHtml(DIST_DIR);
  const sizeCache = new Map();
  const weights = [];
  for (const page of pages) {
    const bytes = await pageJsBytes(await readFile(page, 'utf8'), sizeCache);
    weights.push({ page: relative(DIST_DIR, page), bytes });
  }
  weights.sort((a, b) => b.bytes - a.bytes);

  const kb = bytes => `${(bytes / 1024).toFixed(0)} KB`;
  const over = weights.filter(w => w.bytes > MAX_PAGE_JS_BYTES);

  console.log(`JS bundle budget (dist/) — max ${kb(MAX_PAGE_JS_BYTES)} per page\n`);
  if (over.length > 0) {
    for (const w of over) console.error(`  ✗ ${w.page}: ${kb(w.bytes)} of initial JS (over budget)`);
    console.error(`\nBundle budget failed: ${over.length} page(s) over ${kb(MAX_PAGE_JS_BYTES)}.`);
    process.exit(1);
  }
  const heaviest = weights[0];
  console.log(`  ✓ ${pages.length} page(s) within budget (heaviest: ${heaviest.page} at ${kb(heaviest.bytes)}).`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
