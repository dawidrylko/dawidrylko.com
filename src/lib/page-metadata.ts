import { STRUCTURED_DATA } from '../data/structured-data';
import { SITE_METADATA } from '../data/site-metadata';
import { toISODate } from './date';

// Factory for the schema.org JSON-LD emitted by static pages. Every page used to
// hand-roll the same `@context`/`@type`/name/headline/description/keywords/author
// envelope; this centralises it so only the page-specific parts (about,
// mainEntity, potentialAction…) are passed in via `extra`.
const { personReference, website } = STRUCTURED_DATA;

type PageSchemaType = 'WebPage' | 'CollectionPage' | 'ProfilePage' | 'ContactPage';

interface PageSchemaInput {
  type?: PageSchemaType;
  title: string;
  pathname: string;
  description: string;
  // Defaults to `title` when omitted (most pages reuse the title as headline).
  headline?: string;
  keywords?: string[];
  // The author Person is attached by default; pages without an author (e.g. 404)
  // opt out.
  withAuthor?: boolean;
  // Typed as a Date so it always serialises to a full ISO 8601 datetime: Google's
  // ProfilePage rich result rejects a bare 'YYYY-MM-DD' as an invalid datetime.
  dateModified?: Date;
  // Page-specific schema fields merged onto the envelope (about, mainEntity, …).
  extra?: Record<string, unknown>;
}

export function createPageSchema({
  type = 'WebPage',
  title,
  pathname,
  description,
  headline,
  keywords,
  withAuthor = true,
  dateModified,
  extra = {},
}: PageSchemaInput) {
  const url = new URL(pathname, `${SITE_METADATA.url}/`).href;
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    headline: headline ?? title,
    description,
    ...(keywords ? { keywords: keywords.join(', ') } : {}),
    isPartOf: { '@id': website['@id'] },
    ...(withAuthor ? { author: personReference } : {}),
    ...(dateModified ? { dateModified: toISODate(dateModified) } : {}),
    ...extra,
  };
}
