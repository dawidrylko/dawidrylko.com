import { describe, it, expect } from 'vitest';
import { postSlug, lastmodFromFrontmatter } from './sitemap';

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
