import { describe, it, expect } from 'vitest';
import { relatedPosts } from './related-posts';

const post = (id: string, date: string, tags: string[]) => ({ id, data: { date: new Date(date), tags } });

const current = post('current', '2025-01-01', ['js', 'astro']);

describe('relatedPosts', () => {
  it('ranks by shared tag count, then by date (newest first)', () => {
    const candidates = [
      post('one-shared-old', '2020-01-01', ['js']),
      post('two-shared', '2019-01-01', ['js', 'astro']),
      post('one-shared-new', '2024-01-01', ['astro']),
    ];
    const result = relatedPosts(current, candidates).map(p => p.id);
    expect(result).toEqual(['two-shared', 'one-shared-new', 'one-shared-old']);
  });

  it('excludes the current post and posts with no shared tags', () => {
    const candidates = [current, post('unrelated', '2025-01-01', ['python']), post('related', '2025-01-01', ['js'])];
    const result = relatedPosts(current, candidates).map(p => p.id);
    expect(result).toEqual(['related']);
  });

  it('caps the result at the requested limit', () => {
    const candidates = [
      post('a', '2025-01-01', ['js']),
      post('b', '2025-01-02', ['js']),
      post('c', '2025-01-03', ['js']),
      post('d', '2025-01-04', ['js']),
    ];
    expect(relatedPosts(current, candidates, 2)).toHaveLength(2);
  });

  it('returns an empty array when nothing is related', () => {
    expect(relatedPosts(current, [post('x', '2025-01-01', ['go'])])).toEqual([]);
  });
});
