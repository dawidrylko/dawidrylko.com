#!/usr/bin/env node
/**
 * Regression contract for the Astro build (dist/).
 *
 * Locks in the rendering fixes verified during the live migration QA so they
 * cannot silently regress. Zero-dependency smoke test that runs in CI against
 * the built output — it does NOT rebuild. Each check maps to a concrete fix:
 *
 *   - code blocks ship Shiki's dark palette and it is activated in dark mode
 *   - the /setup/ Mermaid diagram hydrates (client:load island)
 *   - the memoization post's interactive demo hydrates (client:visible island)
 *   - blog-list thumbnails render at a bounded (600px) size, not full-res
 *   - content list markers stay outside (not dropped onto their own line / clipped)
 *   - breadcrumbs stay on one line and scroll horizontally on mobile (no wrap)
 *   - the /files/ page lists presentations (static/files is read from disk)
 *   - the /files/ cmd/ctrl+shift+. hidden-variant toggle ships and is wired up
 *   - the /setup/ Mermaid diagram cannot push page-level horizontal scroll
 *
 * Exits non-zero listing every contract that fails.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../dist');

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
  const css = await Promise.all(files.filter(f => f.endsWith('.css')).map(f => readFile(join(assetsDir, f), 'utf8')));
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
  // Content lists (blog post bodies plus the bio/contact sections) re-add the
  // gutter the global ul/ol reset strips and keep markers outside, so the
  // wrapper's overflow-x: hidden does not clip them onto their own line / off
  // the left edge.
  if (!/main section ul[^{]*\{[^}]*list-style-position:\s*outside/.test(css)) {
    fail('content lists missing list-style-position: outside (markers regressed inside)');
  }
  if (!/main section ul[^{]*\{[^}]*padding-left/.test(css)) {
    fail('content lists missing padding-left gutter (outside markers would be clipped)');
  }
}

async function checkBreadcrumbs(css) {
  const m = css.match(/\.breadcrumbs ol\{([^}]*)\}/);
  if (!m) {
    fail('breadcrumbs ol rule not found in bundled CSS');
    return;
  }
  // Contract: the trail stays on a single line and scrolls horizontally on
  // narrow screens rather than wrapping onto multiple rows.
  if (!/flex-wrap:\s*nowrap/.test(m[1])) {
    fail('breadcrumbs should not wrap (expected flex-wrap: nowrap so they scroll)');
  }
  if (!/overflow-x:\s*auto/.test(m[1])) {
    fail('breadcrumbs missing horizontal scroll (expected overflow-x: auto)');
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

async function checkFilesPage() {
  if (!(await exists('files/index.html'))) {
    fail('cannot check files page: files/index.html missing');
    return;
  }
  const html = await read('files/index.html');
  // The page reads static/files from disk at build time. A wrong base path
  // (the old Gatsby '../static/files') resolves outside the repo and renders an
  // empty table — assert at least one real download link made it into the page.
  if (!/href="\/files\/[^"]+"/.test(html)) {
    fail('files page lists no downloadable files (static/files not read — check the base path)');
  }
  if (!/download="/.test(html)) {
    fail('files page has no download links (presentation rows did not render)');
  }
}

async function checkFilesHiddenToggle() {
  if (!(await exists('files/index.html'))) {
    fail('cannot check files toggle: files/index.html missing');
    return;
  }
  const html = await read('files/index.html');
  // Hidden Keynote/PowerPoint variants must be in the DOM (CSS-hidden), and the
  // cmd/ctrl+shift+. keyboard handler must ship inline to reveal them.
  if (!/is-hidden-variant/.test(html)) {
    fail('files page is missing hidden Keynote/PowerPoint variants (cmd+shift+. has nothing to reveal)');
  }
  if (!/show-hidden-variants/.test(html) || !/shiftKey/.test(html) || !/metaKey/.test(html)) {
    fail('files page cmd/ctrl+shift+. toggle script did not ship inline');
  }
}

async function checkMermaidOverflow(css) {
  // The Mermaid SVG is a flex child; without min-width: 0 (and an overflow
  // guard on the container) a wide diagram overruns max-width: 100% and pushes
  // page-level horizontal scroll on phones (the /setup/ regression).
  const container = css.match(/\.mermaid-diagram\{([^}]*)\}/);
  const svg = css.match(/\.mermaid-diagram svg\{([^}]*)\}/);
  if (!container || !/overflow-x:\s*auto/.test(container[1])) {
    fail('.mermaid-diagram is missing overflow-x: auto (diagram can push page horizontal scroll)');
  }
  if (!svg || !/min-width:\s*0/.test(svg[1])) {
    fail('.mermaid-diagram svg is missing min-width: 0 (flex child can overrun max-width on mobile)');
  }
}

async function checkTagArchives() {
  // The tag index must exist and link out to at least one tag archive, and each
  // archive must list posts via the shared .post-list-item card. Tag chips on
  // post pages point at /tags/<slug>/, so a broken archive would 404 internally.
  if (!(await exists('tags/index.html'))) {
    fail('cannot check tags: tags/index.html missing (tag archive pages did not build)');
    return;
  }
  const indexHtml = await read('tags/index.html');
  const firstTag = indexHtml.match(/href="\/tags\/([^"/]+)\/"/);
  if (!firstTag) {
    fail('tags index lists no tag archives (/tags/<slug>/ links missing)');
    return;
  }
  const archive = `tags/${firstTag[1]}/index.html`;
  if (!(await exists(archive))) {
    fail(`tag archive ${archive} missing (a /tags/ link points at a page that did not build)`);
    return;
  }
  const archiveHtml = await read(archive);
  if (!/class="post-list-item"/.test(archiveHtml)) {
    fail('tag archive lists no posts (.post-list-item missing — shared card regressed)');
  }
}

async function checkBlogThumbnail() {
  if (!(await exists('blog/index.html'))) {
    fail('cannot check blog thumbnails: blog/index.html missing');
    return;
  }
  const html = await read('blog/index.html');
  // Mobile-first thumbnails: rendered inside a .post-thumb link, sourced at a
  // bounded 600px width (responsive srcset) rather than the full-res original.
  if (!/class="post-thumb"/.test(html)) {
    fail('blog-list thumbnail wrapper (.post-thumb) missing');
  }
  if (!/<img[^>]*width="600"/.test(html) || !/srcset="[^"]*600w/.test(html)) {
    fail('blog-list thumbnail not rendered at the bounded 600px size (full-res image regressed)');
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
  await checkMermaidOverflow(css);
  await checkDemoHydration();
  await checkBlogThumbnail();
  await checkTagArchives();
  await checkFilesPage();
  await checkFilesHiddenToggle();

  console.log('Astro build-output regression contract (dist/)\n');
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nRegression contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log(
    '  ✓ code dark theme, Mermaid hydration + overflow, demo hydration, thumbnails, tag archives, list markers, breadcrumbs, files listing + toggle.',
  );
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
