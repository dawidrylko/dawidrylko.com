#!/usr/bin/env node
/**
 * Regression contract for the Astro build (astro/dist).
 *
 * Locks in the rendering fixes verified during the live migration QA so they
 * cannot silently regress. Zero-dependency smoke test that runs in CI against
 * the built output — it does NOT rebuild. Each check maps to a concrete fix:
 *
 *   - code blocks ship Shiki's dark palette and it is activated in dark mode
 *   - the /setup/ Mermaid diagram hydrates (client:load island)
 *   - the memoization post's interactive demo hydrates (client:visible island)
 *   - blog-list thumbnails render at the small (150px) size, not full-res
 *   - post-body list markers stay outside (not dropped onto their own line)
 *   - breadcrumbs truncate on one line (no horizontal-scroll fallback)
 *
 * Exits non-zero listing every contract that fails.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../astro/dist');

const problems = [];
const fail = msg => problems.push(msg);

async function exists(relPath) {
  try {
    await access(join(DIST_DIR, relPath));
    return true;
  } catch {
    return false;
  }
}

async function read(relPath) {
  return readFile(join(DIST_DIR, relPath), 'utf8');
}

/** Concatenate every emitted stylesheet so we can assert on the bundled CSS. */
async function readAllCss() {
  const assetsDir = join(DIST_DIR, '_astro');
  let files;
  try {
    files = await readdir(assetsDir);
  } catch {
    return '';
  }
  const css = await Promise.all(
    files.filter(f => f.endsWith('.css')).map(f => readFile(join(assetsDir, f), 'utf8')),
  );
  return css.join('\n');
}

/** Resolve a post directory by slug prefix (slugs are stable, not hashed). */
async function findPost(prefix) {
  const entries = await readdir(DIST_DIR, { withFileTypes: true });
  const dir = entries.find(e => e.isDirectory() && e.name.startsWith(prefix));
  return dir ? join(dir.name, 'index.html') : null;
}

async function checkCodeDarkTheme(css) {
  // The dual-theme code blocks expose --shiki-dark-bg; our dark-mode rule must
  // consume it so code does not stay light on a dark page.
  if (!css.includes('--shiki-dark-bg')) {
    fail('dark-mode code styling missing: no --shiki-dark-bg rule in bundled CSS');
  }
  // And the build must actually emit dual-theme code blocks.
  const bing = await findPost('przesylanie-adresow-do-bing');
  if (bing && (await exists(bing))) {
    const html = await read(bing);
    if (!/class="astro-code[^"]*"/.test(html) || !html.includes('--shiki-dark')) {
      fail('code blocks are not dual-theme (missing astro-code / --shiki-dark in output)');
    }
  }
}

async function checkListMarkers(css) {
  if (!/\.blog-post section ul[^{]*\{[^}]*list-style-position:\s*outside/.test(css)) {
    fail('post-body lists missing list-style-position: outside (markers regressed inside)');
  }
}

async function checkBreadcrumbs(css) {
  const m = css.match(/\.breadcrumbs ol\{([^}]*)\}/);
  if (!m) {
    fail('breadcrumbs ol rule not found in bundled CSS');
    return;
  }
  if (!/flex-wrap:\s*nowrap/.test(m[1])) {
    fail('breadcrumbs no longer nowrap (wrapping regressed)');
  }
  if (/overflow-x/.test(m[1])) {
    fail('breadcrumbs reintroduced horizontal scroll (should be ellipsis only)');
  }
}

async function checkSetupMermaid() {
  if (!(await exists('setup/index.html'))) {
    fail('cannot check Mermaid: setup/index.html missing');
    return;
  }
  const html = await read('setup/index.html');
  if (!/client="load"/.test(html) || !/component-url="[^"]*Mermaid[^"]*"/.test(html)) {
    fail('/setup/ Mermaid diagram is not a client:load island (would not hydrate)');
  }
}

async function checkDemoHydration() {
  const post = await findPost('memoizacja');
  if (!post || !(await exists(post))) {
    fail('cannot check demo: memoization post missing');
    return;
  }
  const html = await read(post);
  if (!/client="visible"/.test(html) || !/component-url="[^"]*memoization-demo[^"]*"/.test(html)) {
    fail('memoization demo is not a hydrated island (Pensieve would be static)');
  }
}

async function checkBlogThumbnail() {
  if (!(await exists('blog/index.html'))) {
    fail('cannot check blog thumbnails: blog/index.html missing');
    return;
  }
  const html = await read('blog/index.html');
  if (!/<img[^>]*width="150"/.test(html) || !/srcset="[^"]*150w/.test(html)) {
    fail('blog-list thumbnail not rendered at 150px (full-res image regressed)');
  }
}

async function main() {
  if (!(await exists('.'))) {
    console.error(`Build output not found at ${DIST_DIR}. Run "pnpm build" first.`);
    process.exit(1);
  }

  const css = await readAllCss();
  await checkCodeDarkTheme(css);
  await checkListMarkers(css);
  await checkBreadcrumbs(css);
  await checkSetupMermaid();
  await checkDemoHydration();
  await checkBlogThumbnail();

  console.log('Astro build-output regression contract (astro/dist)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nRegression contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log('  ✓ code dark theme, Mermaid + demo hydration, thumbnails, list markers, breadcrumbs.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
