// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeWrapTables from './src/lib/rehype-wrap-tables.ts';
import webmanifest from './src/integrations/webmanifest';
import { buildPostLastmodMap } from './src/lib/sitemap.ts';

// Post lastmod dates (updatedDate ?? date), read from frontmatter so the sitemap
// can advertise per-post freshness. Built once at config load.
const postLastmod = await buildPostLastmodMap();

// Content pipeline (migrated from Gatsby):
//   - MDX with remark-math + rehype-katex (KaTeX, build-time SSR)
//   - Shiki syntax highlighting with light/dark themes (replaces Prism)
//   - React islands for interactive components (Mermaid, embedded demos)
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://dawidrylko.com',
  // Trailing-slash URLs preserved from the Gatsby site so links/redirects match.
  trailingSlash: 'always',
  // Static assets (resume PDFs, /files, robots.txt, CNAME) served from static/.
  publicDir: 'static',
  // Ported from Gatsby's createRedirect (/resume → /bio/). In the static
  // output Astro emits a meta-refresh redirect page.
  redirects: {
    '/resume': '/bio/',
  },
  build: {
    // Inline all CSS into <style> tags instead of emitting a render-blocking
    // <link rel="stylesheet">. The shared chrome stylesheet (~24 KB) otherwise
    // sits on the critical path of every page, gating FCP/LCP behind an extra
    // round-trip on Lighthouse's throttled mobile profile — the documented
    // performance ceiling for these text-led pages. Inlining ships the critical
    // CSS in the initial HTML response, removing that round-trip. The trade-off
    // (CSS is no longer cached across navigations) is acceptable for a static
    // site whose visits are predominantly single-page entries from search.
    inlineStylesheets: 'always',
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      // Enrich each entry: per-post lastmod from frontmatter, plus a priority
      // hint by route type (homepage > blog listings > posts > tags).
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const slug = pathname.replace(/^\/|\/$/g, '');
        const lastmod = postLastmod.get(slug);

        if (lastmod) item.lastmod = new Date(lastmod).toISOString();

        if (pathname === '/') {
          item.priority = 1.0;
        } else if (pathname === '/blog/' || /^\/blog\/\d+\/$/.test(pathname)) {
          item.priority = 0.8;
        } else if (lastmod) {
          item.priority = 0.7;
        } else if (pathname.startsWith('/tags/')) {
          item.priority = 0.4;
        } else {
          item.priority = 0.6;
        }

        return item;
      },
    }),
    webmanifest(),
  ],
  // Responsive images (stable in Astro 6): every <Image>/<Picture> and Markdown
  // image gets a srcset + sizes + responsive styles automatically. Replaces
  // Gatsby's gatsbyImageData FULL_WIDTH responsive output.
  image: {
    layout: 'constrained',
  },
  markdown: {
    // rehype-slug adds id="" to every heading (Astro does not by default), so
    // the in-post table of contents and shared deep links resolve. autolink then
    // appends a hover "#" anchor; it is aria-hidden + tabindex -1 so it neither
    // duplicates the heading in the a11y tree nor becomes a focus trap.
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      // Wrap content tables in <div class="table-scroll"> so short tables stretch
      // to full column width (and wide ones scroll) — see rehype-wrap-tables.ts.
      rehypeWrapTables,
      rehypeKatex,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
