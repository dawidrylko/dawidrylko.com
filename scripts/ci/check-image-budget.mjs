#!/usr/bin/env node
/**
 * Image weight budget for the Astro build (dist/).
 *
 * Oversized images are the heaviest Core Web Vitals / SEO regression a content
 * site ships (Ahrefs "image file size too big"). This walks every emitted image
 * and fails when one exceeds the per-file budget.
 *
 * Existing oversized images are author content (post illustrations, processed
 * by astro:assets) and cannot be re-encoded from here, so they are grandfathered
 * via image-budget-baseline.json — a list of file-name stems (the part before
 * the first dot, stable across content-hash changes). A NEW image over budget
 * whose stem is not baselined fails the build, which is the regression guard:
 * future images must be optimised before they are added.
 *
 * Regenerate the baseline after intentionally optimising images:
 *   node scripts/ci/check-image-budget.mjs --update-baseline
 *
 * Zero dependencies; runs against the built output, it does NOT rebuild.
 */

import { readFile, writeFile, readdir, stat, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter(a => a !== '--update-baseline');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const DIST_DIR = args[0] ? resolve(process.cwd(), args[0]) : resolve(__dirname, '../../dist');
const BASELINE_FILE = resolve(__dirname, 'image-budget-baseline.json');

// 1 MB. Optimised web images (AVIF/WebP, sensibly sized JPEG) land well under
// this; anything larger is an unoptimised original.
const MAX_BYTES = 1024 * 1024;
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// astro:assets emits `<source-name>.<8-char-hash>[_<variant>].<ext>`; the hash
// changes with content but the source name does not. Source names can contain
// dots (e.g. "2.Raspberry-Pi-3"), so strip the trailing hash+variant+ext rather
// than splitting on the first dot.
const HASH_SUFFIX = /\.[A-Za-z0-9_-]{8}(?:_[A-Za-z0-9]+)?\.[a-z0-9]+$/;

/** The stable source stem of an emitted asset (hash and extension removed). */
function stemOf(file) {
  const name = basename(file);
  const match = name.match(HASH_SUFFIX);
  if (match) return name.slice(0, match.index);
  // No Astro hash (e.g. a verbatim static/ asset): drop just the extension.
  const dot = name.lastIndexOf('.');
  return dot === -1 ? name : name.slice(0, dot);
}

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return collectImages(full);
      const dot = entry.name.lastIndexOf('.');
      const ext = dot === -1 ? '' : entry.name.slice(dot).toLowerCase();
      return IMAGE_EXT.has(ext) ? [full] : [];
    }),
  );
  return files.flat();
}

async function loadBaseline() {
  if (!(await exists(BASELINE_FILE))) return new Set();
  return new Set(JSON.parse(await readFile(BASELINE_FILE, 'utf8')));
}

async function main() {
  if (!(await exists(DIST_DIR))) {
    console.error(`Build output not found at ${DIST_DIR}. Run "pnpm build" first.`);
    process.exit(1);
  }

  const images = await collectImages(DIST_DIR);
  const oversized = [];
  for (const image of images) {
    const { size } = await stat(image);
    if (size > MAX_BYTES) oversized.push({ rel: relative(DIST_DIR, image), stem: stemOf(image), size });
  }

  if (UPDATE_BASELINE) {
    const stems = [...new Set(oversized.map(o => o.stem))].sort();
    await writeFile(BASELINE_FILE, `${JSON.stringify(stems, null, 2)}\n`);
    console.log(`Wrote ${stems.length} grandfathered stem(s) to ${relative(process.cwd(), BASELINE_FILE)}.`);
    return;
  }

  const baseline = await loadBaseline();
  const mb = bytes => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  const offenders = oversized.filter(o => !baseline.has(o.stem));
  const grandfathered = oversized.filter(o => baseline.has(o.stem));

  console.log(`Image weight budget (dist/): ${mb(MAX_BYTES)} per file\n`);
  for (const g of grandfathered.sort((a, b) => b.size - a.size)) {
    console.warn(`  ⚠ grandfathered: ${g.rel} (${mb(g.size)})`);
  }

  if (offenders.length > 0) {
    for (const o of offenders.sort((a, b) => b.size - a.size)) {
      console.error(`  ✗ ${o.rel} is ${mb(o.size)} (max ${mb(MAX_BYTES)})`);
    }
    console.error(
      `\nImage budget failed: ${offenders.length} new oversized image(s). ` +
        `Optimise/resize the source, or run with --update-baseline if this is intentional.`,
    );
    process.exit(1);
  }
  console.log(
    `  ✓ ${images.length} image(s) within budget` +
      (grandfathered.length ? ` (${grandfathered.length} grandfathered above).` : '.'),
  );
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
