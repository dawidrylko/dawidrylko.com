import { describe, it, expect } from 'vitest';
import { createPageSchema } from './page-metadata';

describe('createPageSchema', () => {
  const pathname = '/test/';

  it('builds a WebPage envelope by default', () => {
    const schema = createPageSchema({ pathname, title: 'Home', description: 'desc' });
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebPage');
    expect(schema.name).toBe('Home');
    expect(schema.description).toBe('desc');
  });

  it('defaults the headline to the title and allows an override', () => {
    expect(createPageSchema({ pathname, title: 'Home', description: 'd' }).headline).toBe('Home');
    expect(createPageSchema({ pathname, title: 'Home', description: 'd', headline: 'Custom' }).headline).toBe('Custom');
  });

  it('joins keywords into a comma-separated string and omits them when absent', () => {
    expect(createPageSchema({ pathname, title: 'T', description: 'd', keywords: ['a', 'b'] }).keywords).toBe('a, b');
    expect('keywords' in createPageSchema({ pathname, title: 'T', description: 'd' })).toBe(false);
  });

  it('attaches the author Person by default and can opt out', () => {
    const withAuthor = createPageSchema({ pathname, title: 'T', description: 'd' }) as Record<string, unknown>;
    expect((withAuthor.author as { '@id': string })['@id']).toBe('https://dawidrylko.com/#person');
    expect('author' in createPageSchema({ pathname, title: 'T', description: 'd', withAuthor: false })).toBe(false);
  });

  it('supports the ProfilePage type', () => {
    const schema = createPageSchema({ pathname, type: 'ProfilePage', title: 'About', description: 'd' });
    expect(schema['@type']).toBe('ProfilePage');
  });

  it('supports the CollectionPage type and merges extra fields', () => {
    const schema = createPageSchema({
      type: 'CollectionPage',
      pathname,
      title: 'Files',
      description: 'd',
      extra: { mainEntity: { '@type': 'ItemList', numberOfItems: 3 } },
    }) as Record<string, unknown>;
    expect(schema['@type']).toBe('CollectionPage');
    expect((schema.mainEntity as { numberOfItems: number }).numberOfItems).toBe(3);
  });
});
