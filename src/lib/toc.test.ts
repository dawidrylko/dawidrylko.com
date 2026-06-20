import { describe, expect, it } from 'vitest';
import { buildTocTree, cleanHeadingText } from './toc';

describe('cleanHeadingText', () => {
  it('strips the autolink "#" anchor appended to headings', () => {
    expect(cleanHeadingText('Home Assistant#')).toBe('Home Assistant');
  });

  it('strips a "#" separated by whitespace', () => {
    expect(cleanHeadingText('Co dalej? #')).toBe('Co dalej?');
  });

  it('leaves a heading without a trailing anchor untouched', () => {
    expect(cleanHeadingText('Raspberry Pi 5')).toBe('Raspberry Pi 5');
  });

  it('keeps a "#" that is not at the end of the text', () => {
    expect(cleanHeadingText('C# w praktyce')).toBe('C# w praktyce');
  });

  it('only strips a single trailing "#"', () => {
    expect(cleanHeadingText('Tag ##')).toBe('Tag #');
  });
});

describe('buildTocTree', () => {
  it('keeps h2 headings at the top level', () => {
    const tree = buildTocTree([
      { depth: 2, slug: 'a', text: 'A' },
      { depth: 2, slug: 'b', text: 'B' },
    ]);

    expect(tree).toEqual([
      { slug: 'a', text: 'A', children: [] },
      { slug: 'b', text: 'B', children: [] },
    ]);
  });

  it('nests h3 headings under the preceding h2', () => {
    const tree = buildTocTree([
      { depth: 2, slug: 'summary', text: 'Podsumowanie#' },
      { depth: 3, slug: 'conclusions', text: 'Wnioski#' },
      { depth: 3, slug: 'next', text: 'Co dalej?#' },
    ]);

    expect(tree).toEqual([
      {
        slug: 'summary',
        text: 'Podsumowanie',
        children: [
          { slug: 'conclusions', text: 'Wnioski', children: [] },
          { slug: 'next', text: 'Co dalej?', children: [] },
        ],
      },
    ]);
  });

  it('starts a fresh child list for each new h2', () => {
    const tree = buildTocTree([
      { depth: 2, slug: 'one', text: 'One' },
      { depth: 3, slug: 'one-a', text: 'One A' },
      { depth: 2, slug: 'two', text: 'Two' },
      { depth: 3, slug: 'two-a', text: 'Two A' },
    ]);

    expect(tree.map(entry => entry.children.map(child => child.slug))).toEqual([['one-a'], ['two-a']]);
  });

  it('falls back to the top level for a leading h3 with no parent h2', () => {
    const tree = buildTocTree([{ depth: 3, slug: 'orphan', text: 'Orphan' }]);

    expect(tree).toEqual([{ slug: 'orphan', text: 'Orphan', children: [] }]);
  });
});
