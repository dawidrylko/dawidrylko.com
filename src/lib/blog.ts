import { getCollection } from 'astro:content';

// Posts shown on the blog index: only top-level entries (index.{md,mdx}).
// Secondary pages such as .../ng-help are routed but never listed — matching
// the original Gatsby allMdx listing. Newest first.
export async function getBlogPosts() {
  return (await getCollection('posts'))
    .filter(post => !post.id.includes('/'))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// Pagination size for the blog index.
export const POSTS_PER_PAGE = 10;
