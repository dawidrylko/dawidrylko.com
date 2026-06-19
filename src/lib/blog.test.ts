import { describe, it, expect, beforeEach } from 'vitest';
import { __setEntries, type MockPost } from '../../test/mocks/astro-content';
import { getBlogPosts, POSTS_PER_PAGE } from './blog';

const post = (id: string, date: string): MockPost => ({ id, data: { date: new Date(date) } });

describe('getBlogPosts', () => {
  beforeEach(() => __setEntries([]));

  it('returns only top-level entries (drops nested secondary pages)', async () => {
    __setEntries([post('first-post', '2025-01-01'), post('first-post/ng-help', '2025-01-02')]);
    const posts = await getBlogPosts();
    expect(posts.map(p => p.id)).toEqual(['first-post']);
  });

  it('sorts posts newest first', async () => {
    __setEntries([post('old', '2024-01-01'), post('new', '2025-06-01'), post('mid', '2024-09-01')]);
    const posts = await getBlogPosts();
    expect(posts.map(p => p.id)).toEqual(['new', 'mid', 'old']);
  });
});

describe('POSTS_PER_PAGE', () => {
  it('is a positive integer', () => {
    expect(Number.isInteger(POSTS_PER_PAGE)).toBe(true);
    expect(POSTS_PER_PAGE).toBeGreaterThan(0);
  });
});
