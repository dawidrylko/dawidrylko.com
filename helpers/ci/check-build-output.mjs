#!/usr/bin/env node
/**
 * Build-output contract for the Gatsby production build (public/).
 *
 * Asserts that the artifacts the site depends on for SEO and distribution are
 * actually emitted and well-formed. This is a fast, zero-dependency smoke test
 * that runs in CI against the uploaded build artifact — it does NOT rebuild,
 * so it never duplicates the build job's responsibility. Its job is purely the
 * "what the build must contain" contract:
 *
 *   - core pages (index, 404)
 *   - RSS feed (with an <atom:link rel="self"> and at least one <item>)
 *   - sitemap (index + first shard)
 *   - PWA manifest (valid JSON with name, colors and at least one icon)
 *   - Open Graph / Twitter Card meta on rendered HTML
 *
 * Runtime page audits (Lighthouse) and link integrity (linkinator) live in
 * separate CI jobs; this file deliberately stays at the file-contract layer.
 *
 * Exits non-zero on the first contract that fails, listing every problem found.
 */

import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../../public');

const problems = [];
const fail = msg => problems.push(msg);

async function exists(relPath) {
  try {
    await access(join(PUBLIC_DIR, relPath));
    return true;
  } catch {
    return false;
  }
}

async function read(relPath) {
  return readFile(join(PUBLIC_DIR, relPath), 'utf8');
}

/** All these files must be present in the build output. */
async function checkRequiredFiles() {
  const required = [
    'index.html',
    '404.html',
    'rss.xml',
    'sitemap-index.xml',
    'sitemap-0.xml',
    'manifest.webmanifest',
  ];
  for (const file of required) {
    if (!(await exists(file))) {
      fail(`missing required artifact: public/${file}`);
    }
  }
}

async function checkRss() {
  if (!(await exists('rss.xml'))) return;
  const rss = await read('rss.xml');
  if (!/<item>/.test(rss)) {
    fail('rss.xml contains no <item> entries');
  }
  if (!/<atom:link[^>]*rel="self"/.test(rss)) {
    fail('rss.xml is missing its <atom:link rel="self"> element');
  }
  if (!/<enclosure\b/.test(rss)) {
    fail('rss.xml has no <enclosure> — featured-image enclosures regressed');
  }
}

async function checkManifest() {
  if (!(await exists('manifest.webmanifest'))) return;
  let manifest;
  try {
    manifest = JSON.parse(await read('manifest.webmanifest'));
  } catch (err) {
    fail(`manifest.webmanifest is not valid JSON: ${err.message}`);
    return;
  }
  if (!manifest.name) fail('manifest.webmanifest is missing "name"');
  if (!manifest.theme_color) fail('manifest.webmanifest is missing "theme_color"');
  if (!manifest.background_color) fail('manifest.webmanifest is missing "background_color"');
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    fail('manifest.webmanifest has no icons');
  }
}

/** Social-share meta must survive on rendered HTML (Open Graph + Twitter). */
async function checkSocialMeta() {
  const requiredOg = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
  const requiredTwitter = ['twitter:card', 'twitter:title', 'twitter:image'];
  const pages = ['index.html', join('blog', 'index.html')];

  for (const page of pages) {
    if (!(await exists(page))) {
      fail(`cannot check social meta: public/${page} is missing`);
      continue;
    }
    const html = await read(page);
    for (const prop of requiredOg) {
      if (!new RegExp(`property="${prop}"`).test(html)) {
        fail(`public/${page} is missing Open Graph meta "${prop}"`);
      }
    }
    for (const name of requiredTwitter) {
      if (!new RegExp(`name="${name}"`).test(html)) {
        fail(`public/${page} is missing Twitter Card meta "${name}"`);
      }
    }
  }
}

async function main() {
  if (!(await exists('.'))) {
    console.error(`Build output not found at ${PUBLIC_DIR}. Run "pnpm build" first.`);
    process.exit(1);
  }

  await checkRequiredFiles();
  await checkRss();
  await checkManifest();
  await checkSocialMeta();

  console.log('Build-output contract (public/)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nBuild-output contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log('  ✓ core pages, RSS, sitemap, manifest and social meta all present.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
