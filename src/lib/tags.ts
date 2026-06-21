import { getBlogPosts } from './blog';
import { slugifyTag } from './slugify-tag';
import { plPlural } from './pl-plural';

// Re-exported so existing server-side imports (`../lib/tags`) keep working; the
// implementation lives in a dependency-free module the client search can import.
export { slugifyTag };

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

// "<n> wpis/wpisy/wpisów" with the correct Polish plural form for the count.
export function postCountLabel(count: number): string {
  return `${count} ${plPlural(count, ['wpis', 'wpisy', 'wpisów'])}`;
}

// "<n> tag/tagi/tagów" with the correct Polish plural form for the count.
export function tagCountLabel(count: number): string {
  return `${count} ${plPlural(count, ['tag', 'tagi', 'tagów'])}`;
}

// Meta description for a tag archive page. Kept long enough to clear the
// "meta description too short" SEO audit while staying within the 160-character
// limit for every tag (longest current case ~146 chars).
export function describeTagPage(tag: TagInfo): string {
  return `Wpisy oznaczone tagiem „${tag.tag}” na blogu Dawida Ryłko — ${postCountLabel(
    tag.count,
  )}. Artykuły o programowaniu, technologiach i wytwarzaniu oprogramowania.`;
}
