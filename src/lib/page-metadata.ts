import { STRUCTURED_DATA } from '../data/structured-data';

// Factory for the schema.org JSON-LD emitted by static pages. Every page used to
// hand-roll the same `@context`/`@type`/name/headline/description/keywords/author
// envelope; this centralises it so only the page-specific parts (about,
// mainEntity, potentialAction…) are passed in via `extra`.
const { person } = STRUCTURED_DATA;

type PageSchemaType = 'WebPage' | 'CollectionPage' | 'ProfilePage';

interface PageSchemaInput {
  type?: PageSchemaType;
  title: string;
  description: string;
  // Defaults to `title` when omitted (most pages reuse the title as headline).
  headline?: string;
  keywords?: string[];
  // The author Person is attached by default; pages without an author (e.g. 404)
  // opt out.
  withAuthor?: boolean;
  // Page-specific schema fields merged onto the envelope (about, mainEntity, …).
  extra?: Record<string, unknown>;
}

export function createPageSchema({
  type = 'WebPage',
  title,
  description,
  headline,
  keywords,
  withAuthor = true,
  extra = {},
}: PageSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    headline: headline ?? title,
    description,
    ...(keywords ? { keywords: keywords.join(', ') } : {}),
    ...(withAuthor ? { author: person } : {}),
    ...extra,
  };
}
