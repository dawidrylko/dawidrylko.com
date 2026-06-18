import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

// Posts keep their Gatsby on-disk layout: content/pl/YYYY-MM-DD--slug/index.{md,mdx}.
// A few directories also hold secondary pages (e.g. .../ng-help.md); Gatsby
// creates a page for every MDX node, so the glob matches all .md/.mdx files.
// The URL slug strips the extension, drops a trailing /index, and removes the
// date prefix — identical to Gatsby's `filePath.replace(/.*--/, '/')`, so URLs
// are preserved (including nested ones like .../ng-help/).
const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: 'content/pl',
    generateId: ({ entry }) =>
      entry
        .replace(/\.mdx?$/, '')
        .replace(/\/index$/, '')
        .replace(/.*--/, ''),
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
