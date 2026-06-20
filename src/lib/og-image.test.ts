import { describe, it, expect } from 'vitest';
import { wrapText, buildOgSvg } from './og-image';

describe('wrapText', () => {
  it('keeps short text on a single line', () => {
    expect(wrapText('Hello world', 24, 4)).toEqual(['Hello world']);
  });

  it('wraps on spaces when a line would overflow', () => {
    expect(wrapText('one two three four five', 9, 4)).toEqual(['one two', 'three', 'four five']);
  });

  it('keeps an over-long single word whole', () => {
    expect(wrapText('superlongunbreakableword tail', 10, 4)).toEqual(['superlongunbreakableword', 'tail']);
  });

  it('ellipsises when the text exceeds the line budget', () => {
    const lines = wrapText('a b c d e f g h i j', 1, 3);
    expect(lines).toHaveLength(3);
    expect(lines[2].endsWith('…')).toBe(true);
  });
});

describe('buildOgSvg', () => {
  it('produces a 1200x630 SVG containing the (escaped) title', () => {
    const svg = buildOgSvg('Tags & <Astro>');
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    expect(svg).toContain('Tags &amp; &lt;Astro&gt;');
    expect(svg).not.toContain('<Astro>');
  });
});
