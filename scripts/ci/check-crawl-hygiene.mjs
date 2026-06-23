#!/usr/bin/env node
/**
 * Crawl-hygiene contract for the Astro production build (dist/).
 *
 * A fast, zero-dependency smoke test run in CI against the uploaded build
 * artifact (it does NOT rebuild). It locks the "public output is clean and
 * reachable" guarantees that an SEO/AI crawl depends on:
 *
 *   - the most important URLs are actually emitted (a 200 in a static build is
 *     simply "the file exists")
 *   - no rendered HTML leaks the decimal-ASCII signature easter egg (it must
 *     stay client-side only, out of crawler/Ahrefs text extraction)
 *   - robots.txt directives each sit on their own line (none glued together,
 *     which would make a directive unparseable) and a Sitemap is declared
 *
 * The pure helpers (`findArtifactViolations`, `findGluedRobotsDirectives`) are
 * unit-tested in check-crawl-hygiene.test.mjs. Exits non-zero listing every
 * problem found.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

// The signature easter egg decodes "Dawid Rylko" from decimal char codes; it
// must only ever be injected client-side, so its leading bytes (D a w = 68 97
// 119) must never appear in the static HTML a crawler downloads.
export const SIGNATURE_ARTIFACT = /\b68 97 119\b/;

// robots.txt grammar: one directive per line. These are the keywords we expect;
// finding two on a single line means they were glued together (unparseable).
const ROBOTS_DIRECTIVE = /(User-agent|Allow|Disallow|Sitemap|Crawl-delay|Host)\s*:/gi;

// Pure: given [{ path, html }], return the paths whose HTML leaks the artifact.
export function findArtifactViolations(pages) {
  return pages.filter(({ html }) => SIGNATURE_ARTIFACT.test(html)).map(({ path }) => path);
}

// Pure: return the robots.txt lines that carry more than one directive (glued).
export function findGluedRobotsDirectives(robotsTxt) {
  const offending = [];
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const matches = line.match(ROBOTS_DIRECTIVE);
    if (matches && matches.length > 1) offending.push(line);
  }
  return offending;
}

// The URLs an SEO/AI crawl must always find. HTML pages plus the machine
// artifacts that anchor discovery (robots, feeds, sitemaps, llms.txt).
const REQUIRED_HTML = [
  'index.html',
  'blog/index.html',
  'bio/index.html',
  'contact/index.html',
  'setup/index.html',
  'files/index.html',
  'metadata/index.html',
  'tags/index.html',
  '404.html',
];
const REQUIRED_ASSETS = ['robots.txt', 'rss.xml', 'sitemap-index.xml', 'sitemap-0.xml', 'sitemap.xml', 'llms.txt'];

const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function main() {
  const distDir = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../dist');
  const problems = [];
  const fail = msg => problems.push(msg);

  if (!(await exists(distDir))) {
    console.error(`Build output not found at ${distDir}. Run "pnpm build" first.`);
    process.exit(1);
  }

  // Every important URL must resolve (200 == file present in a static build).
  for (const rel of [...REQUIRED_HTML, ...REQUIRED_ASSETS]) {
    if (!(await exists(join(distDir, rel)))) fail(`missing required URL: /${rel}`);
  }

  // No rendered page may leak the decimal-ASCII signature artifact.
  const htmlFiles = await collectHtml(distDir);
  const pages = await Promise.all(
    htmlFiles.map(async file => ({ path: relative(distDir, file), html: await readFile(file, 'utf8') })),
  );
  for (const path of findArtifactViolations(pages)) {
    fail(`ASCII signature artifact leaked into crawlable HTML: ${path}`);
  }

  // robots.txt: one directive per line, and a Sitemap must be advertised.
  const robotsPath = join(distDir, 'robots.txt');
  if (await exists(robotsPath)) {
    const robots = await readFile(robotsPath, 'utf8');
    for (const line of findGluedRobotsDirectives(robots)) {
      fail(`robots.txt has glued directives on one line: "${line}"`);
    }
    if (!/^\s*Sitemap\s*:/im.test(robots)) fail('robots.txt does not declare a Sitemap');
  }

  console.log('Crawl-hygiene contract (dist/)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nCrawl-hygiene contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log(
    `  ✓ ${REQUIRED_HTML.length + REQUIRED_ASSETS.length} required URL(s) present; ` +
      `${pages.length} page(s) free of the ASCII artifact; robots.txt directives well-formed.`,
  );
}

// Only run the dist walk when invoked directly; importing for tests is side-effect free.
const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
