import { getBlogPosts } from './blog';

// A blog post entry, inferred from getBlogPosts so this stays in sync with the
// content collection type without importing astro:content directly (the unit
// tests alias that virtual module to a stub).
type Post = Awaited<ReturnType<typeof getBlogPosts>>[number];

export interface TagInfo {
  // The tag exactly as authored in frontmatter (display label).
  tag: string;
  // URL-safe slug used for /tags/<slug>/.
  slug: string;
  // Number of posts carrying the tag.
  count: number;
  // Posts carrying the tag, newest first (getBlogPosts order is preserved).
  posts: Post[];
}

// Build a URL-safe slug for a tag. Mirrors the blog search normaliser
// (lowercase, strip diacritics, ł→l — ł is not a decomposable combining mark)
// then collapses every run of non-alphanumeric characters to a single hyphen so
// "Node.js" → "node-js" and "frontend development" → "frontend-development".
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Aggregate every tag across the published posts. Returns one entry per distinct
// tag, sorted by frequency (desc) then alphabetically (pl locale). Throws if two
// different tags slugify to the same URL so a collision fails the build rather
// than silently merging two archives.
export async function getTags(): Promise<TagInfo[]> {
  const posts = await getBlogPosts();
  const byTag = new Map<string, TagInfo>();
  const slugOwner = new Map<string, string>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const existing = byTag.get(tag);
      if (existing) {
        existing.posts.push(post);
        existing.count += 1;
        continue;
      }

      const slug = slugifyTag(tag);
      const owner = slugOwner.get(slug);
      if (owner && owner !== tag) {
        throw new Error(`Tag slug collision: "${tag}" and "${owner}" both map to "/tags/${slug}/"`);
      }
      slugOwner.set(slug, tag);
      byTag.set(tag, { tag, slug, count: 1, posts: [post] });
    }
  }

  return [...byTag.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'pl'));
}
