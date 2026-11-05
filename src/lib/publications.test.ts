import { describe, it, expect } from 'vitest';
import data from '../data/publications.json';
import {
  abstractHtml,
  abstractText,
  groupPublications,
  publicationLinks,
  publicationJsonLd,
  publicationSchema,
  publicationsSchema,
  sortPublications,
  type Publication,
} from './publications';

const base: Publication = {
  id: 'a-paper',
  title: 'A paper',
  authors: [{ name: 'Dawid Ryłko', orcid: '0009-0008-6307-9015' }],
  year: 2026,
  doi: '10.5281/zenodo.1',
  publicationType: 'preprint',
  status: 'preprint',
};

const rejects = (patch: Record<string, unknown>) =>
  expect(publicationSchema.safeParse({ ...base, ...patch }).success).toBe(false);

describe('publication data', () => {
  it('validates the shipped records', () => {
    expect(publicationsSchema.safeParse(data).success).toBe(true);
  });

  it('accepts an empty list', () => {
    expect(publicationsSchema.parse([])).toEqual([]);
  });

  it('rejects duplicate ids', () => {
    expect(publicationsSchema.safeParse([base, base]).success).toBe(false);
  });
});

describe('publicationSchema', () => {
  it('accepts a minimal record', () => {
    expect(publicationSchema.safeParse(base).success).toBe(true);
  });

  it.each([
    ['a non-slug id', { id: 'A Paper' }],
    ['no authors', { authors: [] }],
    ['a prefixed DOI', { doi: 'https://doi.org/10.5281/zenodo.1' }],
    ['a date outside the year', { date: '2025-01-01' }],
    ['an impossible date', { date: '2026-02-30' }],
    ['a plain http url', { url: 'http://example.com/' }],
    ['an unknown status', { status: 'submitted' }],
    ['an unknown field', { citations: 10 }],
    ['an id taken by a page section', { id: 'papers' }],
    ['a preprint marked published', { status: 'published' }],
    ['a journal article marked preprint', { publicationType: 'journal-article' }],
    ['an empty keyword list', { keywords: [] }],
    ['Unicode superscripts in an abstract', { abstract: 'error 6·10⁻¹⁶' }],
    ['Unicode subscripts in an abstract', { abstract: 'rate λ₂' }],
    ['a public record with no doi or url', { doi: undefined }],
  ])('rejects %s', (_, patch) => rejects(patch));

  it('allows an under-review record with no public link', () => {
    expect(
      publicationSchema.safeParse({
        ...base,
        doi: undefined,
        publicationType: 'journal-article',
        status: 'under-review',
      }).success,
    ).toBe(true);
  });
});

describe('ordering and grouping', () => {
  it('sorts newest first, then by id', () => {
    const list = [
      { ...base, id: 'old', year: 2024 },
      { ...base, id: 'b', title: 'B', date: '2026-10-27' },
      { ...base, id: 'a', title: 'A', date: '2026-10-27' },
    ];
    expect(sortPublications(list).map(({ id }) => id)).toEqual(['a', 'b', 'old']);
  });

  it('separates software and datasets from papers', () => {
    const list = [
      base,
      { ...base, id: 'code', publicationType: 'software' as const, status: 'published' as const },
      { ...base, id: 'set', publicationType: 'dataset' as const, status: 'published' as const },
    ];
    const { papers, software } = groupPublications(list);
    expect(papers.map(({ id }) => id)).toEqual(['a-paper']);
    expect(software.map(({ id }) => id)).toEqual(['code', 'set']);
  });
});

describe('publicationLinks', () => {
  const hrefs = { pdfUrl: 'https://x.test/a.pdf', pdfPreviewUrl: 'https://x.test/preview/a.pdf' };

  it('gives a paper one link that opens and one that downloads', () => {
    expect(publicationLinks({ ...base, ...hrefs }).map(({ action, href }) => [action, href])).toEqual([
      ['open', hrefs.pdfPreviewUrl],
      ['download', hrefs.pdfUrl],
    ]);
  });

  it('gives software its repository and archive', () => {
    const links = publicationLinks({ ...base, codeUrl: 'https://x.test/r', archiveUrl: 'https://x.test/a.zip' });
    expect(links.map(({ action, icon }) => [action, icon])).toEqual([
      ['open', '↗️'],
      ['download', '📦'],
    ]);
  });

  it('names the work in every label, because an icon alone says nothing', () => {
    for (const { label } of publicationLinks({ ...base, ...hrefs })) expect(label).toContain(base.title);
  });

  it('returns nothing for a record with no files', () => {
    expect(publicationLinks(base)).toEqual([]);
  });
});

describe('abstract markup', () => {
  it('keeps only subscripts and superscripts and escapes everything else', () => {
    expect(abstractHtml('λ<sub>2q</sub> 10<sup>−16</sup> <b>x</b> & y')).toBe(
      'λ<sub>2q</sub> 10<sup>−16</sup> &lt;b&gt;x&lt;/b&gt; &amp; y',
    );
  });

  it('flattens markup for plain-text consumers without losing an exponent', () => {
    expect(abstractText('log λ<sub>2q</sub> ± 6·10<sup>−16</sup>')).toBe('log λ2q ± 6·10^−16');
  });
});

describe('publicationJsonLd', () => {
  it('describes a preprint as a ScholarlyArticle linked to the site author', () => {
    const node = publicationJsonLd({ ...base, date: '2026-10-27', venue: 'Zenodo' });
    expect(node).toMatchObject({
      '@type': 'ScholarlyArticle',
      '@id': 'https://dawidrylko.com/publications/#a-paper',
      author: [{ '@id': 'https://dawidrylko.com/#person' }],
      datePublished: '2026-10-27T00:00:00Z',
      creativeWorkStatus: 'Preprint',
      sameAs: 'https://doi.org/10.5281/zenodo.1',
      publisher: { '@type': 'Organization', name: 'Zenodo' },
    });
  });

  it('never emits a bare date', () => {
    expect(publicationJsonLd(base)).not.toHaveProperty('datePublished');
  });

  it('describes co-authors by name and ORCID', () => {
    const node = publicationJsonLd({
      ...base,
      authors: [{ name: 'Ada Lovelace', orcid: '0000-0000-0000-0001' }, { name: 'Alan Turing' }],
    });
    expect(node?.author).toEqual([
      { '@type': 'Person', name: 'Ada Lovelace', sameAs: 'https://orcid.org/0000-0000-0000-0001' },
      { '@type': 'Person', name: 'Alan Turing' },
    ]);
  });

  it('places a journal in isPartOf', () => {
    const node = publicationJsonLd({
      ...base,
      venue: 'Journal X',
      publicationType: 'journal-article',
      status: 'published',
    });
    expect(node?.isPartOf).toEqual({ '@type': 'Periodical', name: 'Journal X' });
  });

  it('does not call software a ScholarlyArticle', () => {
    const node = publicationJsonLd({ ...base, publicationType: 'software', status: 'published' });
    expect(node?.['@type']).toBe('SoftwareSourceCode');
  });

  it('states a code repository only on software', () => {
    const codeUrl = 'https://github.com/x/y';
    expect(publicationJsonLd({ ...base, codeUrl })).not.toHaveProperty('codeRepository');
    expect(publicationJsonLd({ ...base, codeUrl, publicationType: 'software', status: 'published' })).toHaveProperty(
      'codeRepository',
      codeUrl,
    );
  });

  it('emits nothing for a work under review', () => {
    expect(publicationJsonLd({ ...base, status: 'under-review' })).toBeNull();
  });

  it('omits every field the record does not have', () => {
    const node = publicationJsonLd({ ...base, doi: undefined, url: 'https://example.com/paper' });
    for (const key of ['abstract', 'keywords', 'encoding', 'codeRepository', 'license', 'sameAs', 'identifier']) {
      expect(node).not.toHaveProperty(key);
    }
  });
});
