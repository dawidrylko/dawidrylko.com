import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage } from '../../lib/og-image';

// Generate a branded Open Graph card for every top-level post that has no
// featuredImg, so social/LLM previews show the title instead of the generic
// brand icon. Posts WITH a featuredImg use that image and are skipped here.
export const getStaticPaths = (async () => {
  const posts = await getCollection('posts');
  return posts
    .filter(post => !post.id.includes('/') && !post.data.featuredImg)
    .map(post => ({ params: { slug: post.id }, props: { title: post.data.title } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props.title as string);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
