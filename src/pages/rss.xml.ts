import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { SITE_METADATA } from '../data/site-metadata';
import { excerpt } from '../lib/excerpt';

// Reproduces the Gatsby gatsby-plugin-feed output (/rss.xml) 1:1: content:encoded,
// featured-image enclosures, categories and the content/dc/atom namespaces.
const SITE_URL = SITE_METADATA.url;
const AUTHOR = `${SITE_METADATA.author.email} (${SITE_METADATA.author.name})`;

export async function GET() {
  // All posts, newest first — parity with Gatsby's allMdx feed query.
  const posts = (await getCollection('posts')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const items = await Promise.all(
    posts.map(async post => {
      const { title, date, tags, featuredImg } = post.data;
      const link = `${SITE_URL}/${post.id}/`;
      const description = post.data.description || excerpt(post.body ?? '');
      const content = `<p>${description}</p><div style='margin-top: 50px; font-style: italic;'><strong><a href='${link}'>Czytaj dalej</a>.</strong></div><br /> <br />`;

      let enclosure;
      if (featuredImg) {
        const img = await getImage({ src: featuredImg, width: 1200, height: 630, format: 'jpeg' });
        enclosure = { url: `${SITE_URL}${img.src}`, length: 0, type: 'image/jpeg' };
      }

      return {
        title,
        link: `/${post.id}/`,
        pubDate: date,
        description,
        content,
        categories: tags,
        author: AUTHOR,
        ...(enclosure ? { enclosure } : {}),
      };
    }),
  );

  const year = new Date().getFullYear();
  const customData = [
    `<language>pl</language>`,
    `<copyright>Copyright © ${year}, ${SITE_METADATA.author.name}</copyright>`,
    `<managingEditor>${AUTHOR}</managingEditor>`,
    `<webMaster>${AUTHOR}</webMaster>`,
    `<generator>${SITE_METADATA.title} RSS Feed</generator>`,
    `<docs>https://www.rssboard.org/rss-specification</docs>`,
    `<ttl>60</ttl>`,
    `<image><url>${SITE_URL}/icons/icon-144x144.png</url><title>${SITE_METADATA.title}</title><link>${SITE_URL}</link><description>Logo dla ${SITE_METADATA.title}</description></image>`,
    `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`,
  ].join('');

  return rss({
    title: SITE_METADATA.title,
    description: SITE_METADATA.description.pl,
    site: SITE_URL,
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
    },
    customData,
    items,
  });
}
