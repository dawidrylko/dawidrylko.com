import type { AstroIntegration } from 'astro';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { SITE_METADATA } from '../data/site-metadata';

// Replaces gatsby-plugin-manifest: on build, generate the PWA manifest and the
// icon set from src/assets/logo.png straight into the build output (dist/),
// keeping them out of the shared ../static tree used by the Gatsby site.
const ICON_SIZES = [48, 72, 96, 144, 192, 256, 384, 512];

export default function webmanifest(): AstroIntegration {
  return {
    name: 'webmanifest',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const logo = path.resolve('src/assets/logo.png');
        const iconsDir = path.join(outDir, 'icons');
        await mkdir(iconsDir, { recursive: true });

        const icons = [];
        for (const size of ICON_SIZES) {
          const file = `icon-${size}x${size}.png`;
          await sharp(logo).resize(size, size, { fit: 'cover' }).png().toFile(path.join(iconsDir, file));
          icons.push({ src: `/icons/${file}`, sizes: `${size}x${size}`, type: 'image/png' });
        }

        const manifest = {
          name: `${SITE_METADATA.title} - dawidrylko.com`,
          short_name: SITE_METADATA.title,
          start_url: '/',
          background_color: '#ffffff',
          theme_color: '#005b99',
          display: 'minimal-ui',
          icons,
        };
        await writeFile(path.join(outDir, 'manifest.webmanifest'), JSON.stringify(manifest), 'utf8');

        // Favicon + apple-touch-icon referenced from the document head.
        await sharp(logo).resize(32, 32, { fit: 'cover' }).png().toFile(path.join(outDir, 'favicon-32x32.png'));
        await sharp(logo).resize(180, 180, { fit: 'cover' }).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
      },
    },
  };
}
