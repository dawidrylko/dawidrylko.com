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
