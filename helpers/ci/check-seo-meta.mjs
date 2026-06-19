#!/usr/bin/env node
/**
 * SEO / structured-data contract for the Astro build (dist/).
 *
 * Walks every rendered HTML page and asserts the baseline discoverability
 * chrome that must never silently regress:
 *
 *   - a non-empty <title>
 *   - a non-empty <meta name="description">
 *   - a <link rel="canonical"> pointing at the production origin
 *   - every <script type="application/ld+json"> block is valid JSON
 *
 * Plus site-wide structured-data guarantees:
 *
 *   - blog post pages carry a BlogPosting JSON-LD node
 *
 * Redirect stubs (meta-refresh pages such as /resume/) are skipped. Zero
 * dependencies; runs against the built output, it does NOT rebuild. Exits
 * non-zero listing every page that fails.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../dist');
const ORIGIN = 'https://dawidrylko.com';

const problems = [];
const fail = msg => problems.push(msg);

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

function ldJsonBlocks(html) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
}

function checkPage(page, html) {
  // Redirect stubs have no real <head> chrome — skip them.
  if (/http-equiv="refresh"/i.test(html)) return null;

  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!title || !title[1].trim()) fail(`${page}: missing or empty <title>`);

  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
  if (!description || !description[1].trim()) fail(`${page}: missing or empty meta description`);

  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/);
  if (!canonical || !canonical[1].startsWith(ORIGIN)) fail(`${page}: missing or non-canonical canonical link`);

  for (const [i, block] of ldJsonBlocks(html).entries()) {
    try {
      JSON.parse(block);
    } catch (err) {
      fail(`${page}: invalid JSON-LD block #${i + 1} (${err.message})`);
    }
  }

  return html;
}

async function main() {
  if (!(await exists(DIST_DIR))) {
    console.error(`Build output not found at ${DIST_DIR}. Run "pnpm build" first.`);
    process.exit(1);
  }

  const pages = await collectHtml(DIST_DIR);
  if (pages.length === 0) fail('no HTML pages found in dist');

  let postsWithBlogPosting = 0;
  for (const page of pages) {
    const rel = relative(DIST_DIR, page);
    const html = await readFile(page, 'utf8');
    const checked = checkPage(rel, html);
    if (checked && ldJsonBlocks(checked).some(b => b.includes('"BlogPosting"'))) {
      postsWithBlogPosting += 1;
    }
  }

  // The blog has published posts, so at least one BlogPosting node must ship.
  if (postsWithBlogPosting === 0) {
    fail('no page emits a BlogPosting JSON-LD node (blog structured data regressed)');
  }

  console.log('SEO / structured-data contract (dist/)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nSEO contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log(`  ✓ ${pages.length} page(s): title, description, canonical and valid JSON-LD; BlogPosting present.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
