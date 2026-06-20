// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import webmanifest from './src/integrations/webmanifest';

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
  integrations: [mdx(), react(), sitemap(), webmanifest()],
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
