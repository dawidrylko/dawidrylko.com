import { describe, it, expect } from 'vitest';
import { createPageSchema } from './page-metadata';

describe('createPageSchema', () => {
  it('builds a WebPage envelope by default', () => {
    const schema = createPageSchema({ title: 'Home', description: 'desc' });
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebPage');
    expect(schema.name).toBe('Home');
    expect(schema.description).toBe('desc');
  });

  it('defaults the headline to the title and allows an override', () => {
    expect(createPageSchema({ title: 'Home', description: 'd' }).headline).toBe('Home');
    expect(createPageSchema({ title: 'Home', description: 'd', headline: 'Custom' }).headline).toBe('Custom');
  });

  it('joins keywords into a comma-separated string and omits them when absent', () => {
    expect(createPageSchema({ title: 'T', description: 'd', keywords: ['a', 'b'] }).keywords).toBe('a, b');
    expect('keywords' in createPageSchema({ title: 'T', description: 'd' })).toBe(false);
  });

  it('attaches the author Person by default and can opt out', () => {
    const withAuthor = createPageSchema({ title: 'T', description: 'd' }) as Record<string, unknown>;
    expect((withAuthor.author as { '@type': string })['@type']).toBe('Person');
    expect('author' in createPageSchema({ title: 'T', description: 'd', withAuthor: false })).toBe(false);
  });

  it('supports the ProfilePage type', () => {
    const schema = createPageSchema({ type: 'ProfilePage', title: 'About', description: 'd' });
    expect(schema['@type']).toBe('ProfilePage');
  });

  it('supports the CollectionPage type and merges extra fields', () => {
    const schema = createPageSchema({
      type: 'CollectionPage',
      title: 'Files',
      description: 'd',
      extra: { mainEntity: { '@type': 'ItemList', numberOfItems: 3 } },
    }) as Record<string, unknown>;
    expect(schema['@type']).toBe('CollectionPage');
    expect((schema.mainEntity as { numberOfItems: number }).numberOfItems).toBe(3);
  });
});
