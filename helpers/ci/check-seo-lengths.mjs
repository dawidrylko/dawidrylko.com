#!/usr/bin/env node
/**
 * SEO length contract for the Astro build (dist/).
 *
 * Search engines truncate the <title> and <meta name="description"> in results,
 * and SEO audits (Ahrefs "title too long" / "meta description too long") flag
 * anything longer. This walks every rendered page and enforces the limits on
 * the routes the app owns (the static pages, whose copy lives in this repo):
 *
 *   - <title>            ≤ 60 chars
 *   - <meta description> ≤ 160 chars
 *
 * Blog post pages are author content (their title/description come from MDX
 * frontmatter); they are reported as warnings but never fail the build, so the
 * gate stays green while still surfacing posts worth tightening.
 *
 * Limits mirror TITLE_MAX_LENGTH / DESCRIPTION_MAX_LENGTH in src/lib/seo.ts.
 * Redirect stubs (meta-refresh pages) are skipped. Zero dependencies; runs
 * against the built output, it does NOT rebuild.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../dist');

const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 160;

// First path segment of every app-owned route. The homepage is '' (index.html);
// blog covers the listing and its pagination (blog/, blog/2/, …). Everything
// else (top-level post slugs, 404) is author content and only warned about.
const OWNED_SEGMENTS = new Set(['', 'bio', 'contact', 'setup', 'metadata', 'files', 'blog']);

const problems = [];
const warnings = [];
const fail = msg => problems.push(msg);
const warn = msg => warnings.push(msg);

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

/** The handful of HTML entities that appear in titles/descriptions. */
const HTML_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

/** Decode those entities in a single pass so "&amp;lt;" is not double-unescaped. */
function decodeEntities(text) {
  return text.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => HTML_ENTITIES[entity]);
}

function isOwnedRoute(rel) {
  return OWNED_SEGMENTS.has(
    rel
      .split(sep)[0]
      .replace(/\.html$/, '')
      .replace(/index$/, ''),
  );
}

function checkPage(rel, html) {
  // Redirect stubs have no real <head> chrome — skip them.
  if (/http-equiv="refresh"/i.test(html)) return;

  const owned = isOwnedRoute(rel);
  const report = owned ? fail : warn;

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  if (titleMatch) {
    const title = decodeEntities(titleMatch[1].trim());
    if (title.length > TITLE_MAX_LENGTH) {
      report(`${rel}: <title> is ${title.length} chars (max ${TITLE_MAX_LENGTH}) — "${title}"`);
    }
  }

  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
  if (descMatch) {
    const description = decodeEntities(descMatch[1].trim());
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      report(`${rel}: meta description is ${description.length} chars (max ${DESCRIPTION_MAX_LENGTH})`);
    }
  }
}

async function main() {
  if (!(await exists(DIST_DIR))) {
    console.error(`Build output not found at ${DIST_DIR}. Run "pnpm build" first.`);
    process.exit(1);
  }

  const pages = await collectHtml(DIST_DIR);
  if (pages.length === 0) fail('no HTML pages found in dist');

  for (const page of pages) {
    const rel = relative(DIST_DIR, page);
    checkPage(rel, await readFile(page, 'utf8'));
  }

  console.log('SEO length contract (dist/)\n');
  for (const warning of warnings) console.warn(`  ⚠ ${warning}`);

  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nSEO length contract failed: ${problems.length} problem(s) on app-owned pages.`);
    process.exit(1);
  }
  console.log(
    `  ✓ ${pages.length} page(s): app-owned titles ≤ ${TITLE_MAX_LENGTH} and descriptions ≤ ${DESCRIPTION_MAX_LENGTH} chars` +
      (warnings.length ? ` (${warnings.length} author-content warning(s) above).` : '.'),
  );
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
