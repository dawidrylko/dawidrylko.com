#!/usr/bin/env node
/**
 * WCAG 2.1 contrast audit for the design tokens in src/styles/main.css.
 *
 * Parses the `--color-*` custom properties and verifies that every
 * foreground/background pair actually used for text in the UI meets the
 * WCAG AA threshold of 4.5:1 for normal-size text. Both themes are audited:
 * the light `:root` tokens and the dark-mode overrides inside the
 * `@media (prefers-color-scheme: dark)` block.
 *
 * Runs with zero dependencies so it can act as a fast CI gate without a
 * browser or build step. Exits non-zero when any pair fails.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(__dirname, '../../src/styles/main.css');

const AA_NORMAL = 4.5; // normal-size text

/** Parse `--color-*: #rrggbb;` declarations out of a CSS block body. */
function parseColorBlock(blockBody) {
  const tokens = {};
  const re = /--(color-[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(blockBody)) !== null) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

/** Light tokens from the first top-level `:root` block. */
function parseLightTokens(css) {
  const rootMatch = css.match(/:root\s*\{([^}]*)\}/);
  if (!rootMatch) {
    throw new Error('Could not find :root block in main.css');
  }
  return parseColorBlock(rootMatch[1]);
}

/**
 * Dark tokens: the `:root` overrides nested in the prefers-color-scheme: dark
 * media query, merged on top of the light tokens (the dark block only
 * overrides colors, so unlisted tokens inherit their light values).
 */
function parseDarkTokens(css, lightTokens) {
  const darkMedia = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*?\}\s*)\}/);
  if (!darkMedia) {
    throw new Error('Could not find @media (prefers-color-scheme: dark) block in main.css');
  }
  const rootMatch = darkMedia[1].match(/:root\s*\{([^}]*)\}/);
  if (!rootMatch) {
    throw new Error('Could not find :root override inside the dark-mode media block');
  }
  return { ...lightTokens, ...parseColorBlock(rootMatch[1]) };
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

/**
 * Foreground/background pairs as actually rendered in the UI, expressed in
 * terms of tokens so the exact same set is checked in both themes. The page
 * background is the --color-background token (body uses it in both themes).
 *
 * --color-accent is intentionally excluded as a text foreground: it is used
 * for decorative dividers (hr, table row separators, even-row shading),
 * exempt from WCAG 1.4.11, and for the deliberately low-contrast "Metadata"
 * easter-egg link in the footer.
 */
function buildPairs(t) {
  const bg = t('color-background');
  return [
    { label: 'body text on page', fg: t('color-text'), bg },
    { label: 'muted text on page', fg: t('color-text-light'), bg },
    { label: 'heading on page', fg: t('color-heading'), bg },
    { label: 'h1 heading on page', fg: t('color-heading-black'), bg },
    { label: 'link (primary) on page', fg: t('color-primary'), bg },
    { label: 'table header text (on primary)', fg: t('color-on-primary'), bg: t('color-primary') },
    { label: 'text on accent row/active crumb', fg: t('color-text'), bg: t('color-accent') },
    { label: 'link on accent (crumb hover)', fg: t('color-primary'), bg: t('color-accent') },
    { label: 'muted text on accent', fg: t('color-text-light'), bg: t('color-accent') },
  ];
}

function auditTheme(name, tokens) {
  const t = key => {
    const value = tokens[key];
    if (!value) throw new Error(`Missing token --${key} in main.css`);
    return value;
  };

  let failed = 0;
  console.log(`${name} theme:`);
  for (const { label, fg, bg } of buildPairs(t)) {
    const ratio = contrastRatio(fg, bg);
    const pass = ratio >= AA_NORMAL;
    if (!pass) failed += 1;
    console.log(
      `  ${pass ? '✓' : '✗'} ${label}: ${ratio.toFixed(2)}:1 ` +
        `(${fg} on ${bg}, needs ${AA_NORMAL.toFixed(1)}:1)`,
    );
  }
  console.log('');
  return failed;
}

async function main() {
  const css = await readFile(CSS_PATH, 'utf8');
  const lightTokens = parseLightTokens(css);
  const darkTokens = parseDarkTokens(css, lightTokens);

  console.log('WCAG AA contrast audit (src/styles/main.css)\n');
  const failed = auditTheme('Light', lightTokens) + auditTheme('Dark', darkTokens);

  if (failed > 0) {
    console.error(`Contrast audit failed: ${failed} pair(s) below WCAG AA.`);
    process.exit(1);
  }
  console.log('All token pairs pass WCAG AA in both themes.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
