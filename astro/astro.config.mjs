// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Astro migration PoC. Mirrors the Gatsby site's content pipeline:
//   - MDX with remark-math + rehype-katex (KaTeX, build-time SSR)
//   - Shiki syntax highlighting with light/dark themes (replaces Prism)
//   - React islands for interactive components (Mermaid, embedded demos)
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://dawidrylko.com',
  // Match Gatsby's trailing-slash URLs so links/redirects stay identical.
  trailingSlash: 'always',
  // Ported from Gatsby's createRedirect (/resume → /bio/). In the static
  // output Astro emits a meta-refresh redirect page.
  redirects: {
    '/resume': '/bio/',
  },
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  vite: {
    // Posts live in ../content/pl and one post imports a demo from ../src/demo,
    // both outside the Astro project root — allow Vite to read the repo root.
    server: { fs: { allow: ['..'] } },
  },
});
