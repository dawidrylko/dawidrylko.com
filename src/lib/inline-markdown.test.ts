import { describe, it, expect } from 'vitest';
import { inlineMarkdown, stripInlineMarkdown } from './inline-markdown';

describe('inlineMarkdown', () => {
  it('renders bold', () => {
    expect(inlineMarkdown('a **bold** word')).toBe('a <strong>bold</strong> word');
  });

  it('renders italic with asterisks and underscores', () => {
    expect(inlineMarkdown('an *em* and _em_')).toBe('an <em>em</em> and <em>em</em>');
  });

  it('does not treat bold as italic', () => {
    expect(inlineMarkdown('**strong**')).toBe('<strong>strong</strong>');
  });

  it('renders code spans and does not reinterpret their contents', () => {
    expect(inlineMarkdown('run `npm **install**`')).toBe('run <code>npm **install**</code>');
  });

  it('renders links', () => {
    expect(inlineMarkdown('[label](https://example.com)')).toBe('<a href="https://example.com">label</a>');
  });

  it('escapes HTML in the input', () => {
    expect(inlineMarkdown('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  it('escapes HTML inside code spans', () => {
    expect(inlineMarkdown('`<div>`')).toBe('<code>&lt;div&gt;</code>');
  });
});

describe('stripInlineMarkdown', () => {
  it('keeps the text and drops the markers', () => {
    expect(stripInlineMarkdown('`a`, **b**, *c*, [d](https://example.com)')).toBe('a, b, c, d');
  });

  it('leaves underscores in identifiers alone', () => {
    expect(stripInlineMarkdown('`_.random` i snake_case')).toBe('_.random i snake_case');
  });
});
