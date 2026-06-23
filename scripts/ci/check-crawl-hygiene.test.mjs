import { describe, expect, it } from 'vitest';
import { findArtifactViolations, findGluedRobotsDirectives, SIGNATURE_ARTIFACT } from './check-crawl-hygiene.mjs';

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
