import { describe, it, expect } from 'vitest';
import { countWords, formatReadingTime, formatWordCount, readingTimeMinutes } from './reading-time';

describe('countWords', () => {
  it('returns 0 for empty or missing input', () => {
    expect(countWords()).toBe(0);
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('counts whitespace-separated words', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('  spaced   out \n words ')).toBe(3);
  });

  it('ignores fenced code blocks', () => {
    const body = 'intro words here\n```js\nconst a = 1;\nconst b = 2;\n```\noutro words';
    expect(countWords(body)).toBe(5);
  });
});

describe('readingTimeMinutes', () => {
  it('rounds to whole minutes', () => {
    expect(readingTimeMinutes(200)).toBe(1);
    expect(readingTimeMinutes(500)).toBe(3);
  });

  it('never returns less than 1 minute', () => {
    expect(readingTimeMinutes(0)).toBe(1);
    expect(readingTimeMinutes(10)).toBe(1);
  });
});

describe('formatWordCount', () => {
  it('joins the count and the Polish plural with a non-breaking space', () => {
    expect(formatWordCount(1386)).toBe('1386\u00A0słów');
    expect(formatWordCount(1572)).toBe('1572\u00A0słowa');
    expect(formatWordCount(1)).toBe('1\u00A0słowo');
  });
});

describe('formatReadingTime', () => {
  it('joins the minutes and the unit with a non-breaking space', () => {
    expect(formatReadingTime(7)).toBe('7\u00A0min czytania');
  });
});
