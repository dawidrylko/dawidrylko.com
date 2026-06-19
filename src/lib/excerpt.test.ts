import { describe, it, expect } from 'vitest';
import { excerpt } from './excerpt';

describe('excerpt', () => {
  it('returns short plain text unchanged', () => {
    expect(excerpt('A short sentence.')).toBe('A short sentence.');
  });

  it('strips fenced code blocks', () => {
    expect(excerpt('Before\n```js\nconst x = 1;\n```\nAfter')).toBe('Before After');
  });

  it('strips inline code', () => {
    expect(excerpt('Use `npm install` to begin.')).toBe('Use to begin.');
  });

  it('drops images but keeps link text', () => {
    expect(excerpt('See ![alt](img.png) and [the docs](https://example.com).')).toBe('See and the docs.');
  });

  it('removes markdown punctuation', () => {
    expect(excerpt('## Heading **bold** _em_')).toBe('Heading bold em');
  });

  it('truncates to the requested length on a word boundary and adds an ellipsis', () => {
    const result = excerpt('one two three four five', 12);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(13);
    expect(result).not.toContain('  ');
  });

  it('does not truncate text exactly at the limit', () => {
    expect(excerpt('eleven chars', 12)).toBe('eleven chars');
  });
});
