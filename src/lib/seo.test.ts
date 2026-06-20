import { describe, it, expect } from 'vitest';
import { SITE_METADATA } from '../data/site-metadata';
import {
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  resolveMetaTitle,
  resolveMetaDescription,
  isWithinTitleLimit,
  isWithinDescriptionLimit,
} from './seo';

describe('resolveMetaTitle', () => {
  it('renders a page title as "Title | Site"', () => {
    expect(resolveMetaTitle('About')).toBe(`About | ${SITE_METADATA.title}`);
  });

  it('falls back to the brand title plus the short tagline when no title is given', () => {
    expect(resolveMetaTitle()).toBe(`${SITE_METADATA.title} | ${SITE_METADATA.titleTagline}`);
  });

  it('keeps the homepage (tagline) title within the SEO limit', () => {
    expect(isWithinTitleLimit(resolveMetaTitle())).toBe(true);
  });
});

describe('resolveMetaDescription', () => {
  it('returns the page description when provided', () => {
    expect(resolveMetaDescription('Custom page description')).toBe('Custom page description');
  });

  it('falls back to the site description when none is provided', () => {
    expect(resolveMetaDescription()).toBe(SITE_METADATA.description.en);
    expect(resolveMetaDescription('')).toBe(SITE_METADATA.description.en);
  });

  it('keeps the fallback site descriptions within the SEO limit and free of the ASCII easter egg', () => {
    for (const description of Object.values(SITE_METADATA.description)) {
      expect(isWithinDescriptionLimit(description)).toBe(true);
      // The decimal-ASCII header easter egg must not leak into search snippets.
      expect(description).not.toMatch(/\b68 97 119\b/);
    }
  });
});

describe('length guards', () => {
  it('flags values at and beyond the boundaries', () => {
    expect(isWithinTitleLimit('a'.repeat(TITLE_MAX_LENGTH))).toBe(true);
    expect(isWithinTitleLimit('a'.repeat(TITLE_MAX_LENGTH + 1))).toBe(false);
    expect(isWithinDescriptionLimit('a'.repeat(DESCRIPTION_MAX_LENGTH))).toBe(true);
    expect(isWithinDescriptionLimit('a'.repeat(DESCRIPTION_MAX_LENGTH + 1))).toBe(false);
  });
});
