import { describe, it, expect, beforeEach } from 'vitest';
import { __setEntries, type MockPost } from '../../test/mocks/astro-content';
import { getTags, postCountLabel, tagCountLabel, describeTagPage, type TagInfo } from './tags';
import { DESCRIPTION_MAX_LENGTH } from './seo';

const post = (id: string, date: string, tags: string[]): MockPost => ({ id, data: { date: new Date(date), tags } });

describe('getTags', () => {
  beforeEach(() => __setEntries([]));

  it('aggregates tags with counts and sorts by frequency then name', async () => {
    __setEntries([
      post('a', '2025-01-01', ['css', 'javascript']),
      post('b', '2025-02-01', ['javascript', 'angular']),
      post('c', '2025-03-01', ['javascript']),
    ]);
    const tags = await getTags();
    expect(tags.map(t => [t.tag, t.count, t.slug])).toEqual([
      ['javascript', 3, 'javascript'],
      ['angular', 1, 'angular'],
      ['css', 1, 'css'],
    ]);
  });

  it('keeps posts newest-first within a tag (getBlogPosts order)', async () => {
    __setEntries([post('old', '2024-01-01', ['go']), post('new', '2025-01-01', ['go'])]);
    const [go] = await getTags();
    expect(go.posts.map(p => p.id)).toEqual(['new', 'old']);
  });

  it('ignores nested secondary pages (via getBlogPosts filter)', async () => {
    __setEntries([post('first', '2025-01-01', ['css']), post('first/ng-help', '2025-01-02', ['css'])]);
    const [css] = await getTags();
    expect(css.count).toBe(1);
  });

  it('throws on a slug collision between two distinct tags', async () => {
    __setEntries([post('a', '2025-01-01', ['C++', 'C#'])]);
    await expect(getTags()).rejects.toThrow(/slug collision/);
  });
});

describe('postCountLabel', () => {
  it('uses the correct Polish plural form', () => {
    expect(postCountLabel(1)).toBe('1 wpis');
    expect(postCountLabel(2)).toBe('2 wpisy');
    expect(postCountLabel(4)).toBe('4 wpisy');
    expect(postCountLabel(5)).toBe('5 wpisów');
    expect(postCountLabel(12)).toBe('12 wpisów');
    expect(postCountLabel(22)).toBe('22 wpisy');
  });
});

describe('tagCountLabel', () => {
  it('uses the correct Polish plural form', () => {
    expect(tagCountLabel(1)).toBe('1 tag');
    expect(tagCountLabel(2)).toBe('2 tagi');
    expect(tagCountLabel(4)).toBe('4 tagi');
    expect(tagCountLabel(5)).toBe('5 tagów');
    expect(tagCountLabel(12)).toBe('12 tagów');
    expect(tagCountLabel(22)).toBe('22 tagi');
  });
});

describe('describeTagPage', () => {
  const tag = (name: string, count: number): TagInfo => ({ tag: name, slug: name, count, posts: [] });

  it('includes the tag name and post count', () => {
    const description = describeTagPage(tag('angular', 7));
    expect(description).toContain('„angular”');
    expect(description).toContain('7 wpisów');
  });

  it('is long enough to clear the "too short" audit yet within the SEO limit', () => {
    const cases: TagInfo[] = [tag('ai', 1), tag('iot', 1), tag('shopping manager', 18), tag('home assistant', 1)];
    for (const t of cases) {
      const length = describeTagPage(t).length;
      expect(length).toBeGreaterThanOrEqual(110);
      expect(length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
    }
  });
});
