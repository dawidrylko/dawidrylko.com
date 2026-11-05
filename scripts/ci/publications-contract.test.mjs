import { describe, it, expect } from 'vitest';
import { publicationsViolations } from './publications-contract.mjs';

const PAGE = 'https://dawidrylko.com/publications/';
const person = {
  '@type': 'Person',
  '@id': 'https://dawidrylko.com/#person',
  name: 'Dawid Ryłko',
  sameAs: ['https://orcid.org/0009-0008-6307-9015'],
};
const record = { id: 'paper', doi: '10.1/a', publicationType: 'preprint', status: 'preprint' };
const node = { '@type': 'ScholarlyArticle', '@id': `${PAGE}#paper`, identifier: { value: '10.1/a' } };

describe('publicationsViolations', () => {
  it('passes when records and nodes agree', () => {
    expect(publicationsViolations([record], [person, node])).toEqual([]);
  });

  it('passes an empty list', () => {
    expect(publicationsViolations([], [person])).toEqual([]);
  });

  it('reports a record with no node', () => {
    expect(publicationsViolations([record], [person])).toEqual(['paper: expected one JSON-LD node, found 0']);
  });

  it('reports a node with no record', () => {
    expect(publicationsViolations([], [person, node])).toEqual([`${PAGE}#paper: JSON-LD node has no public record`]);
  });

  it('reports a node for a work under review', () => {
    const problems = publicationsViolations([{ ...record, status: 'under-review' }], [person, node]);
    expect(problems).toEqual([`${PAGE}#paper: JSON-LD node has no public record`]);
  });

  it('reports software typed as a ScholarlyArticle', () => {
    const problems = publicationsViolations([{ ...record, publicationType: 'software' }], [person, node]);
    expect(problems).toEqual(['paper: node type is not SoftwareSourceCode']);
  });

  it('reports a missing DOI', () => {
    const problems = publicationsViolations([record], [person, { ...node, identifier: undefined }]);
    expect(problems).toEqual(['paper: DOI is missing']);
  });

  it('reports a Person without the ORCID', () => {
    const problems = publicationsViolations([], [{ ...person, sameAs: ['https://github.com/x'] }]);
    expect(problems).toEqual(['canonical Person is missing the ORCID sameAs']);
  });
});
