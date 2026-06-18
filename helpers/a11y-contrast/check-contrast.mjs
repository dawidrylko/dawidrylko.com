#!/usr/bin/env node
/**
 * WCAG 2.1 contrast audit for the design tokens in src/styles/main.css.
 *
 * Parses the `--color-*` custom properties from :root and verifies that every
 * foreground/background pair actually used for text in the UI meets the
 * WCAG AA threshold of 4.5:1 for normal-size text.
 *
 * Runs with zero dependencies so it can act as a fast CI gate without a
 * browser or build step. Exits non-zero when any pair fails.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Defaults to the Gatsby stylesheet; an optional CLI arg points the audit at
// another copy (e.g. the Astro migration's verbatim `astro/src/styles/main.css`).
const CSS_PATH = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, '../../src/styles/main.css');

const AA_NORMAL = 4.5; // normal-size text

/** Parse `--color-*: #rrggbb;` declarations from the :root block. */
function parseColorTokens(css) {
  const rootMatch = css.match(/:root\s*\{([^}]*)\}/);
  if (!rootMatch) {
    throw new Error('Could not find :root block in main.css');
  }

  const tokens = {};
  const re = /--(color-[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(rootMatch[1])) !== null) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

const NAMED_COLORS = { white: '#ffffff', black: '#000000' };

function toRgb(value) {
  const color = NAMED_COLORS[value.toLowerCase()] ?? value;
  const hex = color.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map(c => c + c)
          .join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Unsupported color value: ${value}`);
  }
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
}

/** Relative luminance per WCAG 2.1. */
function luminance([r, g, b]) {
  const channel = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const la = luminance(toRgb(a));
  const lb = luminance(toRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

async function main() {
  const css = await readFile(CSS_PATH, 'utf8');
  const tokens = parseColorTokens(css);

  // Page background is the default white (body sets no background-color).
  const WHITE = '#ffffff';
  const t = name => {
    const value = tokens[name];
    if (!value) throw new Error(`Missing token --${name} in main.css`);
    return value;
  };

  // Foreground/background pairs as actually rendered in the UI.
  const pairs = [
    {
      label: 'body text on page',
      fg: t('color-text'),
      bg: WHITE,
      min: AA_NORMAL,
    },
    {
      label: 'muted text on page',
      fg: t('color-text-light'),
      bg: WHITE,
      min: AA_NORMAL,
    },
    {
      label: 'heading on page',
      fg: t('color-heading'),
      bg: WHITE,
      min: AA_NORMAL,
    },
    {
      label: 'h1 heading on page',
      fg: t('color-heading-black'),
      bg: WHITE,
      min: AA_NORMAL,
    },
    {
      label: 'link (primary) on page',
      fg: t('color-primary'),
      bg: WHITE,
      min: AA_NORMAL,
    },
    {
      label: 'table header text (white on primary)',
      fg: WHITE,
      bg: t('color-primary'),
      min: AA_NORMAL,
    },
    {
      label: 'text on accent row/active crumb',
      fg: t('color-text'),
      bg: t('color-accent'),
      min: AA_NORMAL,
    },
    {
      label: 'link on accent (crumb hover)',
      fg: t('color-primary'),
      bg: t('color-accent'),
      min: AA_NORMAL,
    },
    {
      label: 'muted text on accent',
      fg: t('color-text-light'),
      bg: t('color-accent'),
      min: AA_NORMAL,
    },
  ];

  // --color-accent is intentionally excluded as a text foreground: it is used
  // for decorative dividers (hr, table row separators, even-row shading),
  // exempt from WCAG 1.4.11, and for the deliberately low-contrast "Metadata"
  // easter-egg link in the footer.

  let failed = 0;
  console.log(`WCAG AA contrast audit (${process.argv[2] ?? 'src/styles/main.css'})\n`);
  for (const { label, fg, bg, min } of pairs) {
    const ratio = contrastRatio(fg, bg);
    const pass = ratio >= min;
    if (!pass) failed += 1;
    const mark = pass ? '✓' : '✗';
    console.log(
      `  ${mark} ${label}: ${ratio.toFixed(2)}:1 ` +
        `(${fg} on ${bg}, needs ${min.toFixed(1)}:1)`,
    );
  }

  console.log('');
  if (failed > 0) {
    console.error(`Contrast audit failed: ${failed} pair(s) below WCAG AA.`);
    process.exit(1);
  }
  console.log('All token pairs pass WCAG AA.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
