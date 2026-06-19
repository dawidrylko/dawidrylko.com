import { getImage } from 'astro:assets';
import { getBlogPosts } from '../../lib/blog';
import { excerpt } from '../../lib/excerpt';
import { inlineMarkdown } from '../../lib/inline-markdown';

// Static search index consumed by the client-side blog search. Covers every
// listed post so search spans the whole archive, not just the current page.
export async function GET() {
  const posts = await getBlogPosts();

  const items = await Promise.all(
    posts.map(async post => {
      const { title, description, tags, date, featuredImg, featuredImgAlt } = post.data;

      let img;
      if (featuredImg) {
        const generated = await getImage({ src: featuredImg, width: 600, format: 'webp' });
        img = { src: generated.src, alt: featuredImgAlt || '' };
      }

      // `description` stays plain text for matching; `descriptionHtml` carries the
      // rendered inline Markdown for display.
      const plainDescription = description || excerpt(post.body ?? '');

      return {
        title,
        description: plainDescription,
        descriptionHtml: inlineMarkdown(plainDescription),
        tags,
        dateFormatted: date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: '2-digit' }),
        url: `/${post.id}/`,
        ...(img ? { img } : {}),
      };
    }),
  );

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
}
