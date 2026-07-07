#!/usr/bin/env node
/**
 * SEO / structured-data contract for the Astro build (dist/).
 *
 * Walks every rendered HTML page and asserts the baseline discoverability
 * chrome that must never silently regress:
 *
 *   - a non-empty <title>
 *   - a non-empty <meta name="description">
 *   - exactly one <h1> (SEO audits flag pages with zero or multiple H1s)
 *   - a <link rel="canonical"> pointing at the production origin
 *   - every <script type="application/ld+json"> block is valid JSON
 *
 * Plus site-wide structured-data guarantees:
 *
 *   - blog post pages carry a BlogPosting JSON-LD node
 *   - blog post pages declare og:type=article + article:published_time
 *   - every page emits a WebSite JSON-LD node (site-wide search action)
 *   - every inline Person node (the canonical #person) carries a non-empty
 *     sameAs (the social profiles that anchor the author's identity)
 *   - the /bio/ profile page is typed ProfilePage with a Person mainEntity
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

/** Root nodes of a JSON-LD block, including nodes in a top-level @graph. */
function rootNodes(block) {
  try {
    const data = JSON.parse(block);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.['@graph'])) return data['@graph'];
    return [data];
  } catch {
    return [];
  }
}

function nodeTypes(node) {
  if (!node?.['@type']) return [];
  return Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
}

function rootTypes(block) {
  return rootNodes(block).flatMap(nodeTypes);
}

/** Every object node anywhere in a parsed JSON-LD block (depth-first). */
function allNodes(value, acc = []) {
  if (Array.isArray(value)) {
    for (const item of value) allNodes(item, acc);
  } else if (value && typeof value === 'object') {
    acc.push(value);
    for (const key of Object.keys(value)) allNodes(value[key], acc);
  }
  return acc;
}

/** Parsed object nodes of every JSON-LD block on a page (nested included). */
function allJsonLdNodes(html) {
  return ldJsonBlocks(html).flatMap(block => {
    try {
      return allNodes(JSON.parse(block));
    } catch {
      return [];
    }
  });
}

function checkPage(page, html) {
  // Redirect stubs have no real <head> chrome — skip them.
  if (/http-equiv="refresh"/i.test(html)) return null;

  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!title || !title[1].trim()) fail(`${page}: missing or empty <title>`);

  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
  if (!description || !description[1].trim()) fail(`${page}: missing or empty meta description`);

  // Exactly one <h1> per page. Ahrefs flags both missing and multiple H1s; the
  // usual regression is a React island (e.g. a demo) rendering its own <h1>
  // inside an article that already has the post title as <h1>.
  const h1Count = (html.match(/<h1[\s/>]/g) || []).length;
  if (h1Count !== 1) fail(`${page}: expected exactly one <h1>, found ${h1Count}`);

  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/);
  // noindex pages (e.g. the 404) must not carry a canonical at all: a self
  // canonical would point at a non-200 URL, which SEO audits flag. Indexable
  // pages must carry one pointing at the production origin.
  const isNoindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  if (isNoindex) {
    if (canonical) fail(`${page}: noindex page must not emit a canonical link`);
  } else {
    // Compare the parsed origin (not a substring) so a look-alike host such as
    // https://dawidrylko.com.evil.com/ cannot pass the check.
    const canonicalOrigin = canonical && URL.canParse(canonical[1]) ? new URL(canonical[1]).origin : null;
    if (canonicalOrigin !== ORIGIN) fail(`${page}: missing or non-canonical canonical link`);
  }

  for (const [i, block] of ldJsonBlocks(html).entries()) {
    let data;
    try {
      data = JSON.parse(block);
    } catch (err) {
      fail(`${page}: invalid JSON-LD block #${i + 1} (${err.message})`);
      continue;
    }
    // Defensive rich-result validation: the opt-in Faq/HowTo MDX components are
    // author-driven, so we cannot require them — but where they appear they must
    // be well-formed, or the rich result is silently rejected by crawlers.
    for (const node of Array.isArray(data) ? data : [data]) {
      if (!node || typeof node !== 'object') continue;
      if (node['@type'] === 'FAQPage') {
        const entities = Array.isArray(node.mainEntity) ? node.mainEntity : [];
        if (entities.length === 0) fail(`${page}: FAQPage JSON-LD has no Question entries`);
        for (const q of entities) {
          if (q?.['@type'] !== 'Question' || !q?.name || !q?.acceptedAnswer?.text) {
            fail(`${page}: FAQPage Question is missing name or acceptedAnswer.text`);
          }
        }
      }
      if (node['@type'] === 'HowTo') {
        const steps = Array.isArray(node.step) ? node.step : [];
        if (steps.length === 0) fail(`${page}: HowTo JSON-LD has no steps`);
        for (const s of steps) {
          if (s?.['@type'] !== 'HowToStep' || !s?.text) {
            fail(`${page}: HowTo step is missing @type or text`);
          }
        }
      }
    }
  }

  // The canonical Person node (#person) anchors the author's identity; wherever
  // it is emitted as a full inline node (carrying a name, not just an {@id}
  // reference) it must list the social profiles via sameAs, or knowledge-graph
  // crawlers cannot reconcile the author across the web.
  for (const node of allJsonLdNodes(html)) {
    if (node['@type'] === 'Person' && node['@id'] === `${ORIGIN}/#person` && node.name) {
      if (!Array.isArray(node.sameAs) || node.sameAs.length === 0) {
        fail(`${page}: canonical Person node is missing a non-empty sameAs`);
      }
    }
  }

  // The /bio/ page is the author's profile: schema.org's ProfilePage with a
  // Person mainEntity is the pattern Google expects, so lock it against a
  // regression back to a bare WebPage.
  if (page === 'bio/index.html') {
    const profile = allJsonLdNodes(html).find(node => node['@type'] === 'ProfilePage');
    if (!profile) fail(`${page}: bio page must emit a ProfilePage JSON-LD node`);
    else if (profile.mainEntity?.['@id'] !== `${ORIGIN}/#person`) {
      fail(`${page}: ProfilePage mainEntity must reference the canonical Person`);
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
    const blocks = ldJsonBlocks(checked);
    const roots = blocks.flatMap(rootNodes);
    const types = blocks.flatMap(rootTypes);
    if (types.includes('WebSite')) pagesWithWebSite += 1;

    if (types.includes('SiteNavigationElement')) {
      fail(`${rel}: obsolete SiteNavigationElement JSON-LD must not be emitted`);
    }

    const fullPeople = roots.filter(
      node => node?.['@type'] === 'Person' && node?.['@id'] === `${ORIGIN}/#person` && node?.name,
    );
    if (fullPeople.length !== 1) {
      fail(`${rel}: expected one canonical full Person node, found ${fullPeople.length}`);
    } else {
      if (!fullPeople[0].image?.url) fail(`${rel}: canonical Person is missing an image`);
      if (!Array.isArray(fullPeople[0].worksFor) || fullPeople[0].worksFor.length === 0) {
        fail(`${rel}: canonical Person is missing current organizations`);
      }
    }

    const website = roots.find(node => node?.['@type'] === 'WebSite');
    if (website?.publisher?.['@id'] !== `${ORIGIN}/#person`) {
      fail(`${rel}: WebSite publisher must reference the canonical Person`);
    }

    for (const node of roots) {
      if (typeof node?.['@id'] === 'string' && node['@id'].startsWith(ORIGIN)) {
        if (new URL(node['@id']).pathname.includes('//')) fail(`${rel}: malformed @id ${node['@id']}`);
      }
    }

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

      const canonical = checked.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
      const post = roots.find(node => node?.['@type'] === 'BlogPosting');
      if (post?.author?.['@id'] !== `${ORIGIN}/#person`) fail(`${rel}: BlogPosting author is inconsistent`);
      if (post?.publisher?.['@id'] !== `${ORIGIN}/#person`) fail(`${rel}: BlogPosting publisher is inconsistent`);
      if (canonical && post?.url !== canonical) fail(`${rel}: BlogPosting URL differs from canonical URL`);
      if (post?.image?.url && !URL.canParse(post.image.url)) fail(`${rel}: BlogPosting image URL is not absolute`);
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
