import { describe, it, expect } from 'vitest';
import { buildCrumbs, breadcrumbListJsonLd } from './breadcrumbs';
import type { NavLink } from '../types';

const MENU: NavLink[] = [
  { name: 'Home', url: '/' },
  { name: 'About', url: '/bio/' },
  { name: 'Blog 🇵🇱', url: '/blog/' },
  { name: 'Contact', url: '/contact/' },
];

const names = (pathname: string, customTitle: string, parents?: NavLink[]) =>
  buildCrumbs({ pathname, customTitle, menu: MENU, parents }).map(c => c.name);

describe('buildCrumbs', () => {
  it('returns only the active Home crumb on the root path', () => {
    const crumbs = buildCrumbs({ pathname: '/', customTitle: 'Home', menu: MENU });
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0]).toMatchObject({ name: '🏠', url: '/', isActive: true });
  });

  it('labels a top-level page from the menu and marks it active', () => {
    const crumbs = buildCrumbs({ pathname: '/blog/', customTitle: 'Blog 🇵🇱', menu: MENU });
    expect(crumbs.map(c => c.name)).toEqual(['🏠', 'Blog 🇵🇱']);
    expect(crumbs.at(-1)).toMatchObject({ isActive: true, url: '/blog/' });
    expect(crumbs[0].isActive).toBe(false);
  });

  it('injects a parent that is not part of the path (post under Blog)', () => {
    expect(names('/od-tablicy-do-mapy/', 'Od tablicy do mapy', [{ name: 'Blog 🇵🇱', url: '/blog/' }])).toEqual([
      '🏠',
      'Blog 🇵🇱',
      'Od tablicy do mapy',
    ]);
  });

  it('does not duplicate a parent whose URL matches a path segment (tag detail)', () => {
    // Regression: /tags/devops/ used to render both the injected "Tagi" parent
    // and a path-derived "Tags" crumb. The parent must label the /tags/ segment
    // instead of being added twice.
    const crumbs = buildCrumbs({
      pathname: '/tags/devops/',
      customTitle: 'Tag: devops',
      menu: MENU,
      parents: [
        { name: 'Blog 🇵🇱', url: '/blog/' },
        { name: 'Tagi', url: '/tags/' },
      ],
    });
    expect(crumbs.map(c => c.name)).toEqual(['🏠', 'Blog 🇵🇱', 'Tagi', 'Tag: devops']);
    // The middle "Tagi" crumb keeps the canonical /tags/ href.
    expect(crumbs[2]).toMatchObject({ url: '/tags/', isActive: false });
    expect(crumbs.at(-1)).toMatchObject({ url: '/tags/devops/', isActive: true });
  });

  it('handles the tags index without duplicating the path segment', () => {
    expect(names('/tags/', 'Tagi', [{ name: 'Blog 🇵🇱', url: '/blog/' }])).toEqual(['🏠', 'Blog 🇵🇱', 'Tagi']);
  });

  it('title-cases an unknown intermediate segment with hyphens', () => {
    expect(names('/foo-bar/baz/', 'Baz')).toEqual(['🏠', 'Foo Bar', 'Baz']);
  });

  it('treats parent URLs with or without a trailing slash as equal', () => {
    expect(names('/tags/devops/', 'Tag: devops', [{ name: 'Tagi', url: '/tags' }])).toEqual([
      '🏠',
      'Tagi',
      'Tag: devops',
    ]);
  });
});

describe('breadcrumbListJsonLd', () => {
  const SITE = 'https://dawidrylko.com/';
  const CANONICAL = 'https://dawidrylko.com/tags/devops/';

  const build = () => {
    const crumbs = buildCrumbs({
      pathname: '/tags/devops/',
      customTitle: 'Tag: devops',
      menu: MENU,
      parents: [
        { name: 'Blog 🇵🇱', url: '/blog/' },
        { name: 'Tagi', url: '/tags/' },
      ],
    });
    return { crumbs, jsonLd: breadcrumbListJsonLd(crumbs, CANONICAL, SITE) };
  };

  it('emits a BreadcrumbList whose @id is the canonical + #breadcrumb fragment', () => {
    const { jsonLd } = build();
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd['@id']).toBe(`${CANONICAL}#breadcrumb`);
  });

  it('sets numberOfItems to the crumb count with 1-based sequential positions', () => {
    const { crumbs, jsonLd } = build();
    expect(jsonLd.numberOfItems).toBe(crumbs.length);
    expect(jsonLd.itemListElement.map(i => i.position)).toEqual([1, 2, 3, 4]);
  });

  it('emits every non-active item as an absolute URL string, never a typed node', () => {
    // Regression: ancestor crumbs used to be { '@type': 'WebPage', '@id' } nodes,
    // which SEO audits read as the current page advertising its parents' URLs as
    // its own identity. They must be plain URL strings.
    const { jsonLd } = build();
    const nonActive = jsonLd.itemListElement.slice(0, -1);
    expect(nonActive.map(i => i.item)).toEqual([
      'https://dawidrylko.com/',
      'https://dawidrylko.com/blog/',
      'https://dawidrylko.com/tags/',
    ]);
    for (const entry of nonActive) {
      expect(typeof entry.item).toBe('string');
    }
  });

  it('omits the item URL on the active (last) crumb — the current page itself', () => {
    const { jsonLd } = build();
    const last = jsonLd.itemListElement.at(-1)!;
    expect(last.name).toBe('Tag: devops');
    expect('item' in last).toBe(false);
  });
});
