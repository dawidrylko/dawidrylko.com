import { plPlural } from './pl-plural';

// Average adult reading speed (words per minute). A round, widely-used estimate;
// the figure is approximate so a precise value would be false precision.
const WORDS_PER_MINUTE = 200;

// Count words in a Markdown body, stripping fenced code blocks first (code is
// scanned, not read linearly, so counting it inflates the estimate). Mirrors the
// approximation that used to live inline in the post page.
export function countWords(body?: string): number {
  if (!body) return 0;
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// Whole-minute reading estimate, floored at 1 so a short post never reads "0 min".
export function readingTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Non-breaking space between a number and its unit, so "1386 słów" never renders
// glued together (Astro's default compressHTML drops newline whitespace between
// adjacent template expressions) and never wraps with the number orphaned at a
// line end.
const NBSP = '\u00A0';

export function formatReadingTime(minutes: number): string {
  return `${minutes}${NBSP}min czytania`;
}

export function formatWordCount(words: number): string {
  return `${words}${NBSP}${plPlural(words, ['słowo', 'słowa', 'słów'])}`;
}
