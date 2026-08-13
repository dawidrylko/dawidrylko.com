import { describe, expect, it } from 'vitest';
import {
  distPathForLoc,
  extractImageLocs,
  findArtifactViolations,
  findGluedRobotsDirectives,
  SIGNATURE_ARTIFACT,
} from './check-crawl-hygiene.mjs';

describe('findArtifactViolations', () => {
  it('returns no violations when no page leaks the signature', () => {
    const pages = [
      { path: 'index.html', html: '<h1>Hi</h1>' },
      { path: 'metadata/index.html', html: '<table id="site-info-table"></table>' },
    ];
    expect(findArtifactViolations(pages)).toEqual([]);
  });

  it('flags a page that ships the decimal-ASCII signature', () => {
    const pages = [{ path: 'metadata/index.html', html: '<td>68 97 119 105 100 32 82 121 108 107 111</td>' }];
    expect(findArtifactViolations(pages)).toEqual(['metadata/index.html']);
  });

  it('does not match an unrelated number that merely contains 68/97/119 as substrings', () => {
    expect(SIGNATURE_ARTIFACT.test('price 168 974 1190')).toBe(false);
  });
});

describe('findGluedRobotsDirectives', () => {
  it('returns no offenders for a well-formed robots.txt', () => {
    const robots = [
      'User-agent: *',
      'Allow: /',
      '',
      '# comment',
      'Sitemap: https://example.com/sitemap-index.xml',
    ].join('\n');
    expect(findGluedRobotsDirectives(robots)).toEqual([]);
  });

  it('flags two directives glued onto one line', () => {
    const robots = 'User-agent: *Allow: /';
    expect(findGluedRobotsDirectives(robots)).toEqual(['User-agent: *Allow: /']);
  });

  it('ignores directive keywords appearing inside comments', () => {
    const robots = '# Sitemap: note and Allow: hint live in a comment\nUser-agent: *\nAllow: /';
    expect(findGluedRobotsDirectives(robots)).toEqual([]);
  });
});

describe('extractImageLocs', () => {
  it('returns every image loc, not the page loc', () => {
    const xml = [
      '<urlset>',
      '  <url>',
      '    <loc>https://dawidrylko.com/post/</loc>',
      '    <image:image><image:loc>https://dawidrylko.com/_astro/a.png</image:loc></image:image>',
      '    <image:image><image:loc>https://dawidrylko.com/_astro/b.jpg</image:loc></image:image>',
      '  </url>',
      '</urlset>',
    ].join('\n');
    expect(extractImageLocs(xml)).toEqual([
      'https://dawidrylko.com/_astro/a.png',
      'https://dawidrylko.com/_astro/b.jpg',
    ]);
  });

  it('decodes XML entities back into the real URL', () => {
    const xml = '<image:image><image:loc>https://dawidrylko.com/_astro/a.png?w=1&amp;h=2</image:loc></image:image>';
    expect(extractImageLocs(xml)).toEqual(['https://dawidrylko.com/_astro/a.png?w=1&h=2']);
  });

  it('does not double-unescape an escaped entity', () => {
    // "&amp;lt;" is the escaped form of the literal text "&lt;" — decoding it
    // must stop there and not go on to produce "<".
    const xml = '<image:loc>https://dawidrylko.com/_astro/a.png?q=&amp;lt;</image:loc>';
    expect(extractImageLocs(xml)).toEqual(['https://dawidrylko.com/_astro/a.png?q=&lt;']);
  });

  it('returns nothing for a sitemap without images', () => {
    expect(extractImageLocs('<urlset><url><loc>https://dawidrylko.com/</loc></url></urlset>')).toEqual([]);
  });
});

describe('distPathForLoc', () => {
  it('decodes percent-encoded filenames back to the raw UTF-8 name on disk', () => {
    expect(distPathForLoc('https://dawidrylko.com/_astro/2.Nowy_projekt%E2%80%93Google.CfOhSI-L_Zi8DzN.webp')).toBe(
      '/_astro/2.Nowy_projekt–Google.CfOhSI-L_Zi8DzN.webp',
    );
    expect(distPathForLoc('https://dawidrylko.com/_astro/1.Konta_us%C5%82ugi.Cj1y5E2U_2ayvHc.webp')).toBe(
      '/_astro/1.Konta_usługi.Cj1y5E2U_2ayvHc.webp',
    );
  });

  it('leaves a plain ASCII path untouched', () => {
    expect(distPathForLoc('https://dawidrylko.com/_astro/domino.BBW36BnX_Z2wNLpc.webp')).toBe(
      '/_astro/domino.BBW36BnX_Z2wNLpc.webp',
    );
  });
});
