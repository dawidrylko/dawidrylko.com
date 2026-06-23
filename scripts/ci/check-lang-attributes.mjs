#!/usr/bin/env node
/**
 * Language-strategy contract for the Astro build (dist/).
 *
 * The site is bilingual at the site level, monolingual per URL: an English
 * "shell" (home, /bio/, /contact/, /setup/, /metadata/, /files/) wraps a Polish
 * content zone (/blog/, individual posts, /tags/). This check locks that split
 * so the language signals can never silently drift apart:
 *
 *   - every indexable page declares a <html lang> that is one of the supported
 *     languages (en, pl)
 *   - <meta property="og:locale"> agrees with that lang (en→en_US, pl→pl_PL)
 *   - the known English shell routes stay lang=en; the blog, post and tag routes
 *     stay lang=pl (post pages are detected by og:type=article)
 *   - indexable pages self-reference their language via hreflang and an
 *     x-default, both pointing at the page's own canonical URL
 *   - noindex pages (e.g. 404) emit no hreflang at all, mirroring the canonical
 *     rule (an alternate would point at a non-200 URL, which SEO audits flag)
 *
 * Redirect stubs (meta-refresh pages such as /resume/) are skipped. Zero
 * dependencies; runs against the built output, it does NOT rebuild. Exits
 * non-zero listing every page that fails.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../dist');

// Kept in sync with src/lib/i18n.ts (this gate has zero deps, so the mapping is
// duplicated rather than imported from the TypeScript source).
const OG_LOCALES = { en: 'en_US', pl: 'pl_PL' };
const SUPPORTED_LANGS = Object.keys(OG_LOCALES);

// Routes that make up the English shell. Everything else that is indexable is
// the Polish content zone (blog listings, posts, tag archive).
const ENGLISH_ROUTES = new Set(['/', '/bio/', '/contact/', '/setup/', '/metadata/', '/files/']);

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

/** dist-relative file path → site pathname (e.g. blog/2/index.html → /blog/2/). */
function toPathname(rel) {
  const url = rel
    .split(sep)
    .join('/')
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '');
  return `/${url}`.replace(/\/{2,}/g, '/');
}

/** Expected language for a route, or null when the route is not classified. */
function expectedLang(pathname, isArticle) {
  if (ENGLISH_ROUTES.has(pathname)) return 'en';
  if (pathname === '/blog/' || /^\/blog\/\d+\/$/.test(pathname)) return 'pl';
  if (pathname.startsWith('/tags/')) return 'pl';
  if (isArticle) return 'pl';
  return null;
}

function checkPage(rel, html) {
  // Redirect stubs have no real <head> chrome — skip them.
  if (/http-equiv="refresh"/i.test(html)) return;

  const pathname = toPathname(rel);
  const isNoindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  const isArticle = /<meta[^>]*property="og:type"[^>]*content="article"/.test(html);

  const langMatch = html.match(/<html[^>]*\blang="([^"]*)"/i);
  const lang = langMatch?.[1]?.trim();
  if (!lang) {
    fail(`${rel}: missing <html lang> attribute`);
    return;
  }
  if (!SUPPORTED_LANGS.includes(lang)) {
    fail(`${rel}: <html lang="${lang}"> is not a supported language (${SUPPORTED_LANGS.join(', ')})`);
    return;
  }

  // og:locale must agree with the document language.
  const ogLocale = html.match(/<meta[^>]*property="og:locale"[^>]*content="([^"]*)"/)?.[1];
  if (ogLocale !== OG_LOCALES[lang]) {
    fail(`${rel}: og:locale "${ogLocale ?? ''}" does not match lang "${lang}" (expected ${OG_LOCALES[lang]})`);
  }

  // The English shell and the Polish content zone must not swap languages.
  const wanted = expectedLang(pathname, isArticle);
  if (wanted && wanted !== lang) {
    fail(`${rel}: expected lang="${wanted}" for this route, found "${lang}"`);
  }

  // hreflang: indexable pages self-reference their language + x-default; noindex
  // pages must carry none (an alternate would advertise a non-200 URL).
  const alternates = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"/g)].map(
    m => ({ hreflang: m[1], href: m[2] }),
  );
  if (isNoindex) {
    if (alternates.length > 0) fail(`${rel}: noindex page must not emit hreflang alternates`);
    return;
  }

  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
  const self = alternates.find(a => a.hreflang === lang);
  const xDefault = alternates.find(a => a.hreflang === 'x-default');
  if (!self) fail(`${rel}: missing self-referencing hreflang="${lang}"`);
  else if (canonical && self.href !== canonical) {
    fail(`${rel}: hreflang="${lang}" href "${self.href}" does not match canonical "${canonical}"`);
  }
  if (!xDefault) fail(`${rel}: missing hreflang="x-default"`);
  else if (canonical && xDefault.href !== canonical) {
    fail(`${rel}: hreflang="x-default" href "${xDefault.href}" does not match canonical "${canonical}"`);
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

  console.log('Language-strategy contract (dist/)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nLanguage contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log(`  ✓ ${pages.length} page(s): lang + og:locale consistent; hreflang self/x-default present.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
