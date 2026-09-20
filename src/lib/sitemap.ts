import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { slugifyTag } from './slugify-tag';
import { isTagIndexable } from './tag-index';

// Derive the URL slug for a top-level post directory. Mirrors generateId in
// content.config.ts: strip the leading YYYY-MM-DD-- prefix.
export function postSlug(dirName: string): string {
  return dirName.replace(/.*--/, '');
}

// The sitemap lastmod for a post: updatedDate if present, otherwise date, as a
// yyyy-mm-dd string (the day is enough for crawlers). Null when neither is found.
export function lastmodFromFrontmatter(frontmatter: string): string | null {
  const date = frontmatter.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1];
  const updated = frontmatter.match(/^updatedDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1];
  return updated ?? date ?? null;
}

// The post body wrapper emitted by [...slug].astro. Scoping to it is what
// separates a post's own images (featured image + everything the Markdown
// renders) from site chrome that also carries an <img> — the Bio avatar sits
// outside this element.
//
// Exported because it is the single point of coupling between that template and
// this module: renaming the class there would empty the image sitemap one post
// at a time, silently, since a post with no images is also a legitimate result.
// sitemap.test.ts asserts the template still emits exactly this string.
export const POST_ARTICLE_TAG = '<article class="blog-post">';
const POST_ARTICLE = new RegExp(`${POST_ARTICLE_TAG}([\\s\\S]*?)</article>`);
const IMG_SRC = /<img\b[^>]*?\ssrc="([^"]+)"/g;

// Extract the images a built post page actually displays, de-duplicated, in
// document order. Reading the emitted HTML — rather than re-deriving URLs from
// the Markdown source — is what makes the image sitemap agree with the page by
// construction: identical source files are content-deduplicated into a single
// /_astro/ asset by the build, and reproducing the exact transform hash from
// outside the render pipeline is not something getImage() can be asked for.
export function extractPostImageUrls(html: string): string[] {
  const article = html.match(POST_ARTICLE)?.[1];
  if (!article) return [];

  return [...new Set([...article.matchAll(IMG_SRC)].map(([, src]) => src))];
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Render the Google image sitemap extension. Deliberately image:loc only:
// image:caption, image:title, image:license and image:geo_location were
// deprecated by Google in 2022 and are ignored.
export function buildImageSitemap(entries: { pathname: string; images: string[] }[], origin: string): string {
  const urls = entries
    .filter(entry => entry.images.length > 0)
    .map(entry => {
      const images = entry.images
        .map(src => `    <image:image><image:loc>${escapeXml(origin + src)}</image:loc></image:image>`)
        .join('\n');
      return `  <url>\n    <loc>${escapeXml(origin + entry.pathname)}</loc>\n${images}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

// One post as the sitemap builders see it: its URL slug and its raw frontmatter
// block. Read straight from disk because astro.config.mjs runs before the Astro
// content pipeline exists and so cannot call getCollection().
interface PostFrontmatter {
  slug: string;
  frontmatter: string;
}

// Walk the top-level post directories once and return the frontmatter of each
// post's index.{mdx,md}. Scoped to top-level entries on purpose: that is the
// same set getBlogPosts() lists, so secondary pages (.../ng-help) neither carry
// a lastmod nor count towards a tag's size.
async function readPostFrontmatter(baseDir: string): Promise<PostFrontmatter[]> {
  const dirs = await readdir(baseDir, { withFileTypes: true });
  const posts: PostFrontmatter[] = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    for (const file of ['index.mdx', 'index.md']) {
      try {
        const raw = await readFile(join(baseDir, dir.name, file), 'utf8');
        posts.push({ slug: postSlug(dir.name), frontmatter: raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '' });
        break;
      } catch {
        // Try the other extension; a directory may hold index.md or index.mdx.
      }
    }
  }

  return posts;
}

// One item of a YAML sequence as a bare value: quotes are optional in this
// corpus, and a flow sequence may wrap across lines, where the newline stands
// for a single space.
const unquote = (value: string) =>
  value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();

// The tags a post declares, from either YAML shape the corpus uses: a flow
// sequence (`tags: ['css', 'javascript']`) or a block sequence of `- ` items.
// Comment lines inside a block are skipped rather than ending it, because a
// parser that stops early would silently undercount a tag — and an undercounted
// tag is how an archive drops out of the sitemap while still asking to be
// indexed, the exact contradiction this module exists to prevent.
export function tagsFromFrontmatter(frontmatter: string): string[] {
  const flow = frontmatter.match(/^tags:[ \t]*\[([^\]]*)\]/m);
  if (flow) return flow[1].split(',').map(unquote).filter(Boolean);

  const block = frontmatter.match(/^tags:[ \t]*\n((?:[ \t]*(?:-[ \t]*\S.*|#.*)?(?:\n|$))+)/m);
  if (!block) return [];
  return block[1]
    .split('\n')
    .filter(line => /^[ \t]*-/.test(line))
    .map(line => unquote(line.replace(/^[ \t]*-[ \t]*/, '')))
    .filter(Boolean);
}

// Map each top-level post slug to its lastmod by reading frontmatter directly
// from disk. Used by the sitemap serializer in astro.config.mjs.
export async function buildPostLastmodMap(baseDir = 'content/pl'): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const { slug, frontmatter } of await readPostFrontmatter(baseDir)) {
    const lastmod = lastmodFromFrontmatter(frontmatter);
    if (lastmod) map.set(slug, lastmod);
  }

  return map;
}

// How many posts carry each tag, keyed by the tag's URL slug. Mirrors getTags()
// over the same file set, one layer lower: frontmatter text instead of the
// parsed collection.
export async function buildTagCounts(baseDir = 'content/pl'): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  for (const { frontmatter } of await readPostFrontmatter(baseDir)) {
    for (const tag of tagsFromFrontmatter(frontmatter)) {
      const slug = slugifyTag(tag);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  return counts;
}

// The /tags/<slug>/ routes whose archive is too thin to be indexed. Those pages
// are still built and still linked from the /tags/ hub; keeping them out of the
// sitemap is what stops it advertising a URL that answers "noindex" — the two
// signals contradict each other, and an SEO audit reads both.
export async function buildThinTagRoutes(baseDir = 'content/pl'): Promise<Set<string>> {
  const counts = await buildTagCounts(baseDir);
  const thin = [...counts].filter(([, count]) => !isTagIndexable(count));

  return new Set(thin.map(([slug]) => `/tags/${slug}/`));
}

// The route a content file answers on, mirroring generateId in
// content.config.ts: drop the extension, drop a trailing /index, and strip
// everything up to the date prefix. Kept here rather than imported from the
// content config because astro.config.mjs runs before the content pipeline.
export function routeFromContentPath(relativePath: string): string {
  const id = relativePath
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '')
    .replace(/.*--/, '');

  return `/${id}/`;
}

// Whether a frontmatter block opts the page out of the search index.
export function isNoIndexFrontmatter(frontmatter: string): boolean {
  return /^noIndex:[ \t]*true[ \t]*$/m.test(frontmatter);
}

// The routes of content pages that declare `noIndex: true`. They stay built and
// stay linked from the post they belong to, but advertising them in the sitemap
// while they answer "noindex" would be the same contradiction thin tag archives
// avoid, and check-crawl-hygiene.mjs fails the build on it either way.
//
// Walks every .md/.mdx under the content root, not just each directory's
// index.*, because the pages this flag exists for are the secondary ones.
export async function buildNoIndexRoutes(baseDir = 'content/pl'): Promise<Set<string>> {
  const routes = new Set<string>();
  const dirs = await readdir(baseDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const files = await readdir(join(baseDir, dir.name), { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !/\.mdx?$/.test(file.name)) continue;
      const raw = await readFile(join(baseDir, dir.name, file.name), 'utf8');
      const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      if (isNoIndexFrontmatter(frontmatter)) routes.add(routeFromContentPath(`${dir.name}/${file.name}`));
    }
  }

  return routes;
}
