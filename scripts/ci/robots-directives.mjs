// Shared by the SEO contract (check-seo-meta.mjs) and the language contract
// (check-lang-attributes.mjs). Both need the same distinction, and getting it
// wrong in only one of them would let a page advertise itself inconsistently.

// A dead end is a page whose URL is not a real destination: the 404, emitted as
// "noindex, nofollow". It must advertise neither a canonical nor hreflang
// alternates, because both would point at a non-200 URL, which SEO audits flag.
//
// "noindex, follow" is deliberately NOT a dead end. A thin tag archive is an
// ordinary 200 page kept out of the index while still passing internal links to
// the posts it lists, so it self-references exactly like an indexable page.
// Collapsing these two cases back into a bare /noindex/ test is the regression
// this predicate exists to prevent.
export function isDeadEndPage(html) {
  return /<meta[^>]*name="robots"[^>]*content="[^"]*noindex[^"]*nofollow/i.test(html);
}

// Kept in sync with TAG_INDEX_MIN_POSTS in src/lib/tags.ts. This gate has zero
// dependencies and cannot import the TypeScript source, so the threshold is
// duplicated, the same way check-lang-attributes.mjs duplicates OG_LOCALES.
export const TAG_INDEX_MIN_POSTS = 5;

// The wrapper PostListItem.astro emits for one entry. This is the single point
// of coupling between that template and the archive contract below, which is why
// it is exported: robots-directives.test.mjs asserts the template still emits
// exactly this string, so renaming the class fails with a message that names the
// real cause instead of reporting every archive as empty.
export const POST_LIST_ITEM_TAG = '<article class="post-list-item">';

// How many posts a rendered tag archive lists.
export function countArchivePosts(html) {
  return (html.match(/class="post-list-item"/g) ?? []).length;
}

// The tag hub lists every archive and is the only indexed parent of the ones
// that stay in the index. It also falls inside the /tags/** reviewed suppression
// in search-quality.config.ts, which silences that tool's noindex error for the
// whole subtree, so this is the only gate left that can catch a noindex landing
// on the hub (by copy-paste from the archive template, most plausibly). Returns
// null when the page is fine.
export function tagHubViolation(html) {
  const noindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  return noindex ? 'the tag hub is the entry point to every archive and must stay indexable' : null;
}

// The tag archive contract, asserted against emitted HTML: an archive advertises
// the directive its size earns. The unit tests around isTagIndexable cover the
// threshold arithmetic; only this covers the wiring, which is the part that can
// vanish silently. Drop `noIndexFollow` anywhere on its way from the tag page
// through PageLayout to Seo and every thin archive returns to the index with
// nothing else going red. Returns null when the page is fine.
export function tagArchiveViolation(html) {
  const posts = countArchivePosts(html);
  const noindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  const shouldIndex = posts >= TAG_INDEX_MIN_POSTS;

  if (shouldIndex) return noindex ? `archive lists ${posts} post(s) and must stay indexable` : null;
  if (!noindex) return `archive lists ${posts} post(s) and must be noindex`;
  // Both exclusions are one word apart at the call site (`noIndex` instead of
  // `noIndexFollow` in tags/[slug].astro), and picking the wrong one strips the
  // self-canonical and hreflang from 200 pages while nothing else goes red. A
  // thin archive is excluded from the index, never marked a dead end.
  if (isDeadEndPage(html)) return `archive lists ${posts} post(s) and must be "noindex, follow", not a dead end`;
  return null;
}
