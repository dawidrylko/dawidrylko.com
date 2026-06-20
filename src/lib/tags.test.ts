import { describe, it, expect, beforeEach } from 'vitest';
import { __setEntries, type MockPost } from '../../test/mocks/astro-content';
import { slugifyTag, getTags } from './tags';

const post = (id: string, date: string, tags: string[]): MockPost => ({ id, data: { date: new Date(date), tags } });

describe('slugifyTag', () => {
  it('lowercases and keeps simple tags', () => {
    expect(slugifyTag('JavaScript')).toBe('javascript');
    expect(slugifyTag('css')).toBe('css');
  });

  it('collapses dots and spaces into single hyphens', () => {
    expect(slugifyTag('Node.js')).toBe('node-js');
    expect(slugifyTag('frontend development')).toBe('frontend-development');
    expect(slugifyTag('shopping   manager')).toBe('shopping-manager');
  });

  it('strips Polish diacritics (including ł)', () => {
    expect(slugifyTag('Łódź')).toBe('lodz');
    expect(slugifyTag('Zażółć')).toBe('zazolc');
  });

  it('trims leading and trailing separators', () => {
    expect(slugifyTag('C++')).toBe('c');
    expect(slugifyTag('.NET')).toBe('net');
  });
});

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
