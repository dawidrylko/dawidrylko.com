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
 *   - every image advertised in the image sitemap was actually emitted, so the
 *     sitemap can never promise Google an asset the build did not produce
 *   - the canonical sitemap index reaches every sitemap we publish, so no
 *     sitemap depends on robots.txt alone to be discovered
 *
 * The pure helpers (`findArtifactViolations`, `findGluedRobotsDirectives`,
 * `extractImageLocs`, `extractSitemapIndexLocs`, `distPathForLoc`) are
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

// Pure: return every <image:loc> URL declared in an image sitemap, in order.
// `&amp;` is undone LAST: unescaping the meta-character first would re-expose an
// ampersand that the following passes then consume a second time, so an escaped
// literal "&lt;" (written "&amp;lt;") would decode to "<" instead of "&lt;".
export function extractImageLocs(xml) {
  return [...xml.matchAll(/<image:loc>\s*([^<]+?)\s*<\/image:loc>/g)].map(([, loc]) =>
    loc
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&'),
  );
}

// Pure: return every <loc> a sitemap index points at, in order.
export function extractSitemapIndexLocs(xml) {
  return [...xml.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<]+?)\s*<\/loc>/g)].map(([, loc]) => loc.replace(/&amp;/g, '&'));
}

// Pure: the sitemap URLs a robots.txt advertises via `Sitemap:` directives.
export function extractRobotsSitemaps(robotsTxt) {
  return robotsTxt
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#'))
    .flatMap(line => line.match(/^\s*Sitemap\s*:\s*(\S+)/i)?.[1] ?? []);
}

// Pure: the dist-relative path a sitemap image URL should resolve to. Sitemap
// URLs are percent-encoded per RFC 3986, but several post images carry Polish
// diacritics and en-dashes in their filename and land on disk as raw UTF-8 —
// so the encoding has to be undone before touching the filesystem.
export function distPathForLoc(loc) {
  return decodeURIComponent(new URL(loc, 'https://dawidrylko.com').pathname);
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
const REQUIRED_ASSETS = [
  'robots.txt',
  'rss.xml',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'sitemap.xml',
  'sitemap-images.xml',
  'llms.txt',
];

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
  const robotsTxtBody = (await exists(robotsPath)) ? await readFile(robotsPath, 'utf8') : '';
  if (robotsTxtBody) {
    for (const line of findGluedRobotsDirectives(robotsTxtBody)) {
      fail(`robots.txt has glued directives on one line: "${line}"`);
    }
    if (!/^\s*Sitemap\s*:/im.test(robotsTxtBody)) fail('robots.txt does not declare a Sitemap');
  }

  // Discovery graph. Three places enumerate our sitemaps and drift apart
  // independently: robots.txt, the canonical sitemap-index.xml, and the
  // conventional /sitemap.xml. Asserting one of them is what let the image
  // sitemap ship reachable only via robots.txt, so assert the whole graph —
  // every url set we publish must be reachable from robots.txt, and no two
  // indexes may disagree about what exists.
  const toName = loc => distPathForLoc(loc).replace(/^\//, '');
  const sitemapFiles = (await readdir(distDir)).filter(name => /^sitemap.*\.xml$/.test(name));
  const indexes = new Map();
  const urlSets = [];

  for (const name of sitemapFiles) {
    const xml = await readFile(join(distDir, name), 'utf8');
    if (xml.includes('<sitemapindex')) indexes.set(name, extractSitemapIndexLocs(xml).map(toName));
    else urlSets.push(name);
  }

  // Nothing may point at a sitemap the build did not emit.
  for (const [name, refs] of indexes) {
    for (const ref of refs) {
      if (!sitemapFiles.includes(ref)) fail(`${name} points at a missing sitemap: ${ref}`);
    }
  }

  // Walk robots.txt one level down through any index it names.
  const reachable = new Set();
  for (const url of extractRobotsSitemaps(robotsTxtBody)) {
    const name = toName(url);
    if (indexes.has(name)) for (const ref of indexes.get(name)) reachable.add(ref);
    else reachable.add(name);
  }
  for (const name of urlSets) {
    if (!reachable.has(name)) fail(`${name} is unreachable from robots.txt (not advertised, and in no index it names)`);
  }

  // Two indexes listing different sets means one of them is stale.
  const [first, ...rest] = [...indexes];
  for (const [name, refs] of rest) {
    const expected = [...first[1]].sort().join(', ');
    const actual = [...refs].sort().join(', ');
    if (expected !== actual) fail(`${name} lists [${actual}] but ${first[0]} lists [${expected}]`);
  }

  // The image sitemap must only advertise images the build actually emitted;
  // a 404 in an image sitemap is a hard error for Google Images.
  const imageSitemapPath = join(distDir, 'sitemap-images.xml');
  let imageLocs = [];
  if (await exists(imageSitemapPath)) {
    imageLocs = extractImageLocs(await readFile(imageSitemapPath, 'utf8'));
    if (imageLocs.length === 0) fail('sitemap-images.xml advertises no images');
    for (const loc of imageLocs) {
      if (!(await exists(join(distDir, distPathForLoc(loc))))) {
        fail(`image sitemap points at a file missing from the build: ${loc}`);
      }
    }
  }

  console.log('Crawl-hygiene contract (dist/)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nCrawl-hygiene contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log(
    `  ✓ ${REQUIRED_HTML.length + REQUIRED_ASSETS.length} required URL(s) present; ` +
      `${pages.length} page(s) free of the ASCII artifact; robots.txt directives well-formed; ` +
      `${imageLocs.length} image sitemap entr(ies) resolve to emitted files.`,
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
