import { SITE_METADATA } from '../data/site-metadata';

// Search engines truncate titles and descriptions in results; values past these
// limits get cut in SERPs and are flagged by SEO audits (Ahrefs "title too
// long" / "meta description too long"). Enforced on the pages we control by the
// unit tests next to this file and by helpers/ci/check-seo-lengths.mjs on the
// rendered output.
export const TITLE_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 160;

const siteTitle = SITE_METADATA.title;
const siteDescription = SITE_METADATA.description.en;

/**
 * The document <title> / og:title text for a page. Pages pass their own short
 * title (rendered as "Title | Site"); the homepage passes none and falls back
 * to the brand title plus the short tagline, keeping it under TITLE_MAX_LENGTH.
 */
export function resolveMetaTitle(title?: string): string {
  return title ? `${title} | ${siteTitle}` : `${siteTitle} | ${SITE_METADATA.titleTagline}`;
}

/** The meta description for a page, falling back to the site description. */
export function resolveMetaDescription(description?: string): string {
  return description || siteDescription;
}

export const isWithinTitleLimit = (value: string): boolean => value.length <= TITLE_MAX_LENGTH;
export const isWithinDescriptionLimit = (value: string): boolean => value.length <= DESCRIPTION_MAX_LENGTH;
