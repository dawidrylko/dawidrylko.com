import { describe, it, expect } from 'vitest';
import { stripInlineMarkdown, buildFaqJsonLd, buildHowToJsonLd } from './structured-content';

describe('stripInlineMarkdown', () => {
  it('strips bold, italic and code', () => {
    expect(stripInlineMarkdown('a **bold** and *em* and `code`')).toBe('a bold and em and code');
  });

  it('keeps link labels and drops the url', () => {
    expect(stripInlineMarkdown('see [the docs](https://example.com)')).toBe('see the docs');
  });

  it('drops images', () => {
    expect(stripInlineMarkdown('before ![alt](/img.png) after')).toBe('before after');
  });

  it('collapses whitespace and trims', () => {
    expect(stripInlineMarkdown('  spaced   out  ')).toBe('spaced out');
  });

  it('preserves Polish diacritics', () => {
    expect(stripInlineMarkdown('zażółć **gęślą** jaźń')).toBe('zażółć gęślą jaźń');
  });
});

describe('buildFaqJsonLd', () => {
  it('builds a FAQPage with one Question per item', () => {
    const data = buildFaqJsonLd([
      { question: 'What is it?', answer: 'A **thing**.' },
      { question: 'Why?', answer: 'Because.' },
    ]);
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
    });
    const { mainEntity } = data as { mainEntity: Array<Record<string, unknown>> };
    expect(mainEntity).toHaveLength(2);
    expect(mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'What is it?',
      acceptedAnswer: { '@type': 'Answer', text: 'A thing.' },
    });
  });

  it('handles an empty list', () => {
    expect(buildFaqJsonLd([])).toMatchObject({ '@type': 'FAQPage', mainEntity: [] });
  });
});

describe('buildHowToJsonLd', () => {
  it('builds a HowTo with 1-based ordered steps', () => {
    const data = buildHowToJsonLd({
      name: 'Make tea',
      steps: [{ text: 'Boil water.' }, { name: 'Steep', text: 'Add the *tea*.' }],
    });
    expect(data).toMatchObject({ '@context': 'https://schema.org', '@type': 'HowTo', name: 'Make tea' });
    const { step } = data as { step: Array<Record<string, unknown>> };
    expect(step[0]).toEqual({ '@type': 'HowToStep', position: 1, text: 'Boil water.' });
    expect(step[1]).toEqual({ '@type': 'HowToStep', position: 2, name: 'Steep', text: 'Add the tea.' });
  });

  it('includes totalTime only when provided', () => {
    expect(buildHowToJsonLd({ name: 'X', steps: [] })).not.toHaveProperty('totalTime');
    expect(buildHowToJsonLd({ name: 'X', totalTime: 'PT15M', steps: [] })).toMatchObject({ totalTime: 'PT15M' });
  });
});
