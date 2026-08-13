import type { AstroIntegration } from 'astro';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE_METADATA } from '../data/site-metadata';
import { buildImageSitemap, extractPostImageUrls } from '../lib/sitemap';

// Google image sitemap. @astrojs/sitemap emits page URLs only, so the 100+
// diagrams and screenshots co-located with the posts are invisible to Google
// Images: they ship as content-hashed /_astro/ assets that nothing but a
// srcset-parsing crawl would ever find.
//
// It runs on astro:build:done, over the emitted HTML, rather than as a route:
// a route would have to re-derive each URL through getImage(), which produces a
// *valid but different* variant of every image — a second copy of the whole
// responsive set (measured: +262 files, +69 MB on a 195 MB dist) that appears on
// no page. Reading the built markup instead costs nothing and is correct by
// construction: what is listed is literally what the page displays.
const SITEMAP_FILE = 'sitemap-images.xml';

async function collectHtml(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectHtml(full);
      return entry.name.endsWith('.html') ? [full] : [];
    }),
  );
  return files.flat();
}

export default function sitemapImages(): AstroIntegration {
  let origin = SITE_METADATA.url;

  return {
    name: 'sitemap-images',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (config.site) origin = new URL(config.site).origin;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const entries = [];

        for (const file of await collectHtml(outDir)) {
          const images = extractPostImageUrls(await readFile(file, 'utf8'));
          if (images.length === 0) continue;

          // dist/a/b/index.html -> /a/b/ , matching trailingSlash: 'always'.
          const relative = path.relative(outDir, path.dirname(file)).split(path.sep).join('/');
          entries.push({ pathname: `/${relative}/`, images });
        }

        // Sorted so the output is byte-stable across builds.
        entries.sort((a, b) => a.pathname.localeCompare(b.pathname));
        await writeFile(path.join(outDir, SITEMAP_FILE), buildImageSitemap(entries, origin), 'utf8');

        const total = entries.reduce((sum, entry) => sum + entry.images.length, 0);
        logger.info(
          `\`${SITEMAP_FILE}\` created at \`${path.basename(outDir)}\` — ${total} image(s), ${entries.length} page(s)`,
        );
      },
    },
  };
}
