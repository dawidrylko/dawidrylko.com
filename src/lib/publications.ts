import { z } from 'astro/zod';
import { SITE_METADATA } from '../data/site-metadata';
import { LINK_ICONS, type RecordLink } from './record-table';

export const PUBLICATIONS_PATH = '/publications/';

export const PUBLICATION_TYPES = [
  'journal-article',
  'conference-paper',
  'preprint',
  'book-chapter',
  'thesis',
  'software',
  'dataset',
] as const;

export const PUBLICATION_STATUSES = ['published', 'accepted', 'preprint', 'under-review'] as const;

export const STATUS_LABELS: Record<(typeof PUBLICATION_STATUSES)[number], string> = {
  published: 'Published',
  accepted: 'Accepted',
  preprint: 'Preprint',
  'under-review': 'Under review',
};

const httpsUrl = z
  .string()
  .refine(value => URL.canParse(value) && new URL(value).protocol === 'https:', { message: 'must be an https URL' });

const isCalendarDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const UNICODE_SCRIPTS = /[\u00B2\u00B3\u00B9\u2070-\u209F]/;

// An id becomes a page anchor, so it must not collide with a section of the page.
const RESERVED_IDS = new Set(['papers', 'research-software', 'research-interests', 'oeis']);

export const publicationSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'must be a kebab-case slug' })
      .refine(value => !RESERVED_IDS.has(value), { message: 'collides with a section anchor of the page' })
      .refine(value => !value.startsWith('oeis-'), { message: 'oeis- anchors belong to the OEIS table' }),
    title: z.string().trim().min(1),
    authors: z
      .array(
        z
          .object({
            name: z.string().trim().min(1),
            orcid: z
              .string()
              .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/)
              .optional(),
          })
          .strict(),
      )
      .min(1),
    year: z.number().int().min(1900).max(2100),
    date: z.string().refine(isCalendarDate, { message: 'must be a YYYY-MM-DD date' }).optional(),
    venue: z.string().trim().min(1).optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/, { message: 'must be a bare DOI, without the https://doi.org/ prefix' })
      .optional(),
    abstract: z
      .string()
      .trim()
      .min(1)
      .refine(value => !UNICODE_SCRIPTS.test(value), {
        message: 'write exponents and indices with <sup> and <sub>: script characters fall back to mixed fonts',
      })
      .optional(),
    keywords: z.array(z.string().trim().min(1)).min(1).optional(),
    url: httpsUrl.optional(),
    pdfUrl: httpsUrl.optional(),
    pdfPreviewUrl: httpsUrl.optional(),
    codeUrl: httpsUrl.optional(),
    archiveUrl: httpsUrl.optional(),
    license: z
      .object({ name: z.string().trim().min(1), url: httpsUrl })
      .strict()
      .optional(),
    publicationType: z.enum(PUBLICATION_TYPES),
    status: z.enum(PUBLICATION_STATUSES),
  })
  .strict()
  .refine(data => !data.date || data.date.startsWith(String(data.year)), {
    message: 'date must fall in year',
    path: ['date'],
  })
  .refine(data => (data.publicationType === 'preprint') === (data.status === 'preprint'), {
    message: 'publicationType preprint and status preprint go together',
    path: ['status'],
  })
  .refine(data => data.status === 'under-review' || Boolean(data.doi || data.url), {
    message: 'a public record needs a doi or a url',
    path: ['doi'],
  });

export type Publication = z.infer<typeof publicationSchema>;

export const publicationsSchema = z.array(publicationSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  list.forEach(({ id }, index) => {
    if (seen.has(id)) ctx.addIssue({ code: 'custom', message: `duplicate id '${id}'`, path: [index, 'id'] });
    seen.add(id);
  });
});

export const doiUrl = (doi: string): string => `https://doi.org/${doi}`;

export const orcidUrl = (orcid: string): string => `https://orcid.org/${orcid}`;

export const publicationLandingUrl = ({ doi, url }: Publication): string | undefined =>
  url ?? (doi ? doiUrl(doi) : undefined);

export const publicationAnchorUrl = ({ id }: Publication): string => `${SITE_METADATA.url}${PUBLICATIONS_PATH}#${id}`;

const dateKey = ({ date, year }: Publication): string => date ?? String(year);

export function sortPublications(list: Publication[]): Publication[] {
  return [...list].sort((a, b) => dateKey(b).localeCompare(dateKey(a)) || a.id.localeCompare(b.id));
}

const isSoftwareOrData = ({ publicationType }: Publication): boolean =>
  publicationType === 'software' || publicationType === 'dataset';

export function groupPublications(list: Publication[]): { papers: Publication[]; software: Publication[] } {
  const sorted = sortPublications(list);
  return { papers: sorted.filter(item => !isSoftwareOrData(item)), software: sorted.filter(isSoftwareOrData) };
}

// Plain text keeps an exponent readable: 10<sup>-16</sup> must not become 10-16.
export const abstractText = (abstract: string): string =>
  abstract.replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<\/?sub>/g, '');

export function abstractHtml(abstract: string): string {
  return abstract
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?)(sub|sup)&gt;/g, '<$1$2>');
}

// The record page (landing URL or DOI) comes first, then the files: the same
// icons and order as every other table on the site.
export function publicationLinks(publication: Publication): RecordLink[] {
  const { title, pdfUrl, pdfPreviewUrl, codeUrl, archiveUrl } = publication;
  const landingUrl = publicationLandingUrl(publication);
  return [
    ...(landingUrl
      ? [
          {
            kind: 'external' as const,
            icon: LINK_ICONS.external,
            href: landingUrl,
            label: `Open the record of ${title}`,
            follow: true,
          },
        ]
      : []),
    ...(pdfPreviewUrl
      ? [{ kind: 'open' as const, icon: LINK_ICONS.open, href: pdfPreviewUrl, label: `Open ${title} PDF in new tab` }]
      : []),
    ...(pdfUrl
      ? [{ kind: 'download' as const, icon: LINK_ICONS.pdf, href: pdfUrl, label: `Download ${title} as PDF` }]
      : []),
    ...(codeUrl
      ? [
          {
            kind: 'open' as const,
            icon: LINK_ICONS.open,
            href: codeUrl,
            label: `Open source code of ${title} in new tab`,
          },
        ]
      : []),
    ...(archiveUrl
      ? [{ kind: 'download' as const, icon: LINK_ICONS.archive, href: archiveUrl, label: `Download ${title} as ZIP` }]
      : []),
  ];
}

const SCHEMA_TYPES: Partial<Record<Publication['publicationType'], string>> = {
  software: 'SoftwareSourceCode',
  dataset: 'Dataset',
};

function venueNode({ publicationType, venue }: Publication): Record<string, unknown> {
  if (!venue) return {};
  if (publicationType === 'journal-article') return { isPartOf: { '@type': 'Periodical', name: venue } };
  if (publicationType === 'preprint' || isSoftwareOrData({ publicationType } as Publication)) {
    return { publisher: { '@type': 'Organization', name: venue } };
  }
  return { isPartOf: { '@type': 'CreativeWork', name: venue } };
}

// A work under review is not a public scholarly record yet, so it gets no node.
export function publicationJsonLd(publication: Publication): Record<string, unknown> | null {
  if (publication.status === 'under-review') return null;
  const { title, authors, date, year, doi, abstract, keywords, pdfUrl, codeUrl, license, status } = publication;
  return {
    '@type': SCHEMA_TYPES[publication.publicationType] ?? 'ScholarlyArticle',
    '@id': publicationAnchorUrl(publication),
    name: title,
    headline: title,
    author: authors.map(({ name, orcid }) =>
      orcid === SITE_METADATA.orcid.id
        ? { '@id': `${SITE_METADATA.url}/#person` }
        : { '@type': 'Person', name, ...(orcid ? { sameAs: orcidUrl(orcid) } : {}) },
    ),
    // Search Console rejects a bare date, so a day-precise date becomes a datetime
    // and a year-only record states just its copyright year.
    ...(date ? { datePublished: `${date}T00:00:00Z` } : {}),
    copyrightYear: year,
    creativeWorkStatus: STATUS_LABELS[status],
    url: publicationLandingUrl(publication),
    ...(doi
      ? {
          sameAs: doiUrl(doi),
          identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: doi, url: doiUrl(doi) },
        }
      : {}),
    ...(abstract ? { abstract: abstractText(abstract) } : {}),
    ...(keywords ? { keywords: keywords.join(', ') } : {}),
    ...(pdfUrl ? { encoding: { '@type': 'MediaObject', contentUrl: pdfUrl, encodingFormat: 'application/pdf' } } : {}),
    ...(codeUrl && publication.publicationType === 'software' ? { codeRepository: codeUrl } : {}),
    ...(license ? { license: license.url } : {}),
    ...venueNode(publication),
  };
}
