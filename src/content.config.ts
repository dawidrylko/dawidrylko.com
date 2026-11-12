import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { file, glob } from 'astro/loaders';
import { oeisEntrySchema } from './lib/oeis';
import { publicationSchema } from './lib/publications';

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
        // Optional last-modified date; surfaces as dateModified / article:modified_time.
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).min(1),
        // Opt-in exclusion from the search index for a page that is part of the
        // corpus but is not a search landing page. Renders as "noindex, follow"
        // and drops out of the sitemap, so both signals agree by construction.
        noIndex: z.boolean().optional(),
        featuredImg: image().optional(),
        featuredImgAlt: z.string().optional(),
      })
      .refine(data => !data.featuredImg || Boolean(data.featuredImgAlt), {
        message: 'featuredImgAlt is required when featuredImg is set',
        path: ['featuredImgAlt'],
      }),
});

// Bibliographic records, validated at build time. Adding a work means adding an
// entry to the JSON file; no component changes.
const publications = defineCollection({
  loader: file('src/data/publications.json'),
  schema: publicationSchema,
});

// OEIS sequences authored or extended, listed in their own section of /publications/.
const oeis = defineCollection({
  loader: file('src/data/oeis.json'),
  schema: oeisEntrySchema,
});

export const collections = { posts, publications, oeis };
