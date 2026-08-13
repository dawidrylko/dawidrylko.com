import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

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

// Map each top-level post slug to its lastmod by reading frontmatter directly
// from disk. Used by the sitemap serializer in astro.config.mjs, which runs
// outside the Astro content pipeline and so cannot use getCollection().
export async function buildPostLastmodMap(baseDir = 'content/pl'): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const dirs = await readdir(baseDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    for (const file of ['index.mdx', 'index.md']) {
      try {
        const raw = await readFile(join(baseDir, dir.name, file), 'utf8');
        const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
        const lastmod = lastmodFromFrontmatter(frontmatter);
        if (lastmod) map.set(postSlug(dir.name), lastmod);
        break;
      } catch {
        // Try the other extension; a directory may hold index.md or index.mdx.
      }
    }
  }

  return map;
}
