import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

// Posts keep their Gatsby on-disk layout: content/pl/YYYY-MM-DD--slug/index.{md,mdx}.
// The URL slug is the directory name with the date prefix stripped — identical
// to Gatsby's `filePath.replace(/.*--/, '/')`, so URLs are preserved.
const posts = defineCollection({
  loader: glob({
    pattern: '**/index.{md,mdx}',
    base: '../content/pl',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, '').replace(/.*--/, ''),
  }),
  // Frontmatter contract ported 1:1 from the Gatsby zod schema (roadmap #3),
  // including the rule that featuredImg requires featuredImgAlt.
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string().optional(),
        date: z.coerce.date(),
        tags: z.array(z.string()).min(1),
        featuredImg: image().optional(),
        featuredImgAlt: z.string().optional(),
      })
      .refine(data => !data.featuredImg || Boolean(data.featuredImgAlt), {
        message: 'featuredImgAlt is required when featuredImg is set',
        path: ['featuredImgAlt'],
      }),
});

export const collections = { posts };
