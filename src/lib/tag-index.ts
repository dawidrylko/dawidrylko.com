// A tag archive is a listing page: its only content is a title and the posts it
// links to, all of which live on their own indexed pages. Below this threshold
// the archive is a near-duplicate of a handful of post entries, which is the
// case search engines routinely drop from the index anyway. Thin archives are
// therefore excluded deliberately (noindex) but stay crawlable (follow), so they
// keep passing internal links to the posts they list.
export const TAG_INDEX_MIN_POSTS = 5;

// Whether a tag archive of this size belongs in the search index.
export function isTagIndexable(count: number): boolean {
  return count >= TAG_INDEX_MIN_POSTS;
}
