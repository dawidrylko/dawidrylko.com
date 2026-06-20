// Minimal shape needed to rank posts by relatedness; satisfied by a content
// collection entry, so the helper stays pure and unit-testable without pulling
// in astro:content.
interface RankablePost {
  id: string;
  data: { date: Date; tags: string[] };
}

// Posts most related to `current`, ranked by number of shared tags (desc) and,
// on a tie, by date (newest first). The current post is excluded and only posts
// sharing at least one tag qualify. Returns at most `limit` entries.
export function relatedPosts<T extends RankablePost>(current: T, candidates: T[], limit = 3): T[] {
  const currentTags = new Set(current.data.tags);

  return candidates
    .filter(post => post.id !== current.id)
    .map(post => ({ post, shared: post.data.tags.filter(tag => currentTags.has(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || b.post.data.date.getTime() - a.post.data.date.getTime())
    .slice(0, limit)
    .map(({ post }) => post);
}
