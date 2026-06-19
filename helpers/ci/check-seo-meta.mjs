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
 *   - blog post pages declare og:type=article + article:published_time
 *   - every page emits a WebSite JSON-LD node (site-wide search action)
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

/** Root @type(s) of a JSON-LD block, ignoring nodes nested inside it. */
function rootTypes(block) {
  try {
    const data = JSON.parse(block);
    const nodes = Array.isArray(data) ? data : [data];
    return nodes.flatMap(node => (node && node['@type'] ? [node['@type']] : []));
  } catch {
    return [];
  }
}

function checkPage(page, html) {
  // Redirect stubs have no real <head> chrome — skip them.
  if (/http-equiv="refresh"/i.test(html)) return null;

  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!title || !title[1].trim()) fail(`${page}: missing or empty <title>`);

  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
  if (!description || !description[1].trim()) fail(`${page}: missing or empty meta description`);

  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/);
  // Compare the parsed origin (not a substring) so a look-alike host such as
  // https://dawidrylko.com.evil.com/ cannot pass the check.
  const canonicalOrigin = canonical && URL.canParse(canonical[1]) ? new URL(canonical[1]).origin : null;
  if (canonicalOrigin !== ORIGIN) fail(`${page}: missing or non-canonical canonical link`);

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
  let pagesWithWebSite = 0;
  let indexablePages = 0;
  for (const page of pages) {
    const rel = relative(DIST_DIR, page);
    const html = await readFile(page, 'utf8');
    const checked = checkPage(rel, html);
    if (!checked) continue;

    indexablePages += 1;
    const types = ldJsonBlocks(checked).flatMap(rootTypes);
    if (types.includes('WebSite')) pagesWithWebSite += 1;

    // Only individual post pages have a root BlogPosting node; blog listing pages
    // nest BlogPosting items inside a Blog node and must not be treated as posts.
    if (types.includes('BlogPosting')) {
      postsWithBlogPosting += 1;
      // A post page must present itself as an article with a publish date, or
      // social/LLM crawlers lose the post's timeline.
      if (!/<meta[^>]*property="og:type"[^>]*content="article"/.test(checked)) {
        fail(`${rel}: BlogPosting page is missing og:type=article`);
      }
      if (!/<meta[^>]*property="article:published_time"[^>]*content="[^"]+"/.test(checked)) {
        fail(`${rel}: BlogPosting page is missing article:published_time`);
      }
    }
  }

  // The blog has published posts, so at least one BlogPosting node must ship.
  if (postsWithBlogPosting === 0) {
    fail('no page emits a BlogPosting JSON-LD node (blog structured data regressed)');
  }

  // The WebSite node (with its search action) is emitted by the shared layout,
  // so every indexable page must carry it.
  if (pagesWithWebSite !== indexablePages) {
    fail(`WebSite JSON-LD missing on ${indexablePages - pagesWithWebSite} of ${indexablePages} page(s)`);
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
