import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { postSlug, lastmodFromFrontmatter, extractPostImageUrls, buildImageSitemap, POST_ARTICLE_TAG } from './sitemap';

describe('postSlug', () => {
  it('strips the YYYY-MM-DD-- date prefix', () => {
    expect(postSlug('2025-12-26--od-tablicy-do-mapy')).toBe('od-tablicy-do-mapy');
    expect(postSlug('2017-03-19--angular-2-angular-cli-pierwsze-kroki')).toBe('angular-2-angular-cli-pierwsze-kroki');
  });
});

describe('lastmodFromFrontmatter', () => {
  it('returns the date day from a full ISO timestamp', () => {
    expect(lastmodFromFrontmatter('date: 2016-04-16T13:31:30.000Z')).toBe('2016-04-16');
  });

  it('prefers updatedDate over date', () => {
    const fm = 'date: 2016-04-16T13:31:30.000Z\nupdatedDate: 2020-01-02T00:00:00.000Z';
    expect(lastmodFromFrontmatter(fm)).toBe('2020-01-02');
  });

  it('handles quoted and date-only values', () => {
    expect(lastmodFromFrontmatter("date: '2021-05-05'")).toBe('2021-05-05');
    expect(lastmodFromFrontmatter('date: 2021-05-05')).toBe('2021-05-05');
  });

  it('returns null when no date is present', () => {
    expect(lastmodFromFrontmatter('title: Something')).toBeNull();
  });
});

const postPage = (article: string, chrome = '') =>
  `<body>${chrome}<article class="blog-post">${article}</article><footer>${chrome}</footer></body>`;

describe('POST_ARTICLE_TAG', () => {
  // Guards the one coupling the image sitemap cannot detect at runtime: if the
  // post template stops emitting this exact tag, every post silently reports
  // zero images and the sitemap shrinks without any build or CI step failing.
  it('is still the wrapper the post template emits', () => {
    const template = readFileSync(new URL('../pages/[...slug].astro', import.meta.url), 'utf8');
    expect(template).toContain(POST_ARTICLE_TAG);
  });
});

describe('extractPostImageUrls', () => {
  it('returns the post images in document order', () => {
    const html = postPage(
      '<img src="/_astro/featured.aaa_1.webp" alt="F"><section><img src="/_astro/diagram.bbb_2.webp" alt="D"></section>',
    );
    expect(extractPostImageUrls(html)).toEqual(['/_astro/featured.aaa_1.webp', '/_astro/diagram.bbb_2.webp']);
  });

  it('ignores chrome images outside the post article, such as the Bio avatar', () => {
    const html = postPage(
      '<img src="/_astro/diagram.bbb_2.webp" alt="D">',
      '<img src="/_astro/avatar.ccc_3.webp" alt="A">',
    );
    expect(extractPostImageUrls(html)).toEqual(['/_astro/diagram.bbb_2.webp']);
  });

  it('collapses repeats, which is what content-deduplicated source files produce', () => {
    const html = postPage('<img src="/_astro/same.ddd_4.webp"><img src="/_astro/same.ddd_4.webp">');
    expect(extractPostImageUrls(html)).toEqual(['/_astro/same.ddd_4.webp']);
  });

  it('reads src regardless of the attributes preceding it', () => {
    const html = postPage('<img alt="A" loading="lazy" decoding="async" src="/_astro/late.eee_5.webp" width="10">');
    expect(extractPostImageUrls(html)).toEqual(['/_astro/late.eee_5.webp']);
  });

  it('returns nothing for a page that is not a post', () => {
    expect(extractPostImageUrls('<body><main><img src="/_astro/hero.fff_6.webp"></main></body>')).toEqual([]);
  });
});

describe('buildImageSitemap', () => {
  it('nests every image under the page it appears on', () => {
    const xml = buildImageSitemap(
      [{ pathname: '/post/', images: ['/_astro/a.webp', '/_astro/b.webp'] }],
      'https://dawidrylko.com',
    );
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain('<loc>https://dawidrylko.com/post/</loc>');
    expect(xml).toContain('<image:image><image:loc>https://dawidrylko.com/_astro/a.webp</image:loc></image:image>');
    expect(xml).toContain('<image:image><image:loc>https://dawidrylko.com/_astro/b.webp</image:loc></image:image>');
  });

  it('omits pages that carry no images', () => {
    const xml = buildImageSitemap(
      [
        { pathname: '/text-only/', images: [] },
        { pathname: '/illustrated/', images: ['/_astro/a.webp'] },
      ],
      'https://dawidrylko.com',
    );
    expect(xml).not.toContain('/text-only/');
    expect(xml).toContain('/illustrated/');
  });

  it('escapes XML metacharacters in URLs', () => {
    const xml = buildImageSitemap([{ pathname: '/p/', images: ['/_astro/a.webp?w=1&h=2'] }], 'https://dawidrylko.com');
    expect(xml).toContain('<image:loc>https://dawidrylko.com/_astro/a.webp?w=1&amp;h=2</image:loc>');
  });

  it('stays well-formed when nothing has images', () => {
    const xml = buildImageSitemap([], 'https://dawidrylko.com');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});
