// Contract between src/data/publications.json and the JSON-LD on /publications/:
// every public record has exactly one node of the right type, and no node exists
// without a record. A work under review stays out of the structured data.
const ORCID_URL = 'https://orcid.org/0009-0008-6307-9015';
const NODE_TYPES = { software: 'SoftwareSourceCode', dataset: 'Dataset' };
const PAGE_URL = 'https://dawidrylko.com/publications/';
const WORK_TYPES = new Set(['ScholarlyArticle', ...Object.values(NODE_TYPES)]);

export function publicationsViolations(records, nodes) {
  const problems = [];
  const works = nodes.filter(node => WORK_TYPES.has(node['@type']));
  const expected = records.filter(({ status }) => status !== 'under-review');

  for (const record of expected) {
    const id = `${PAGE_URL}#${record.id}`;
    const matches = works.filter(node => node['@id'] === id);
    const type = NODE_TYPES[record.publicationType] ?? 'ScholarlyArticle';
    if (matches.length !== 1) problems.push(`${record.id}: expected one JSON-LD node, found ${matches.length}`);
    else if (matches[0]['@type'] !== type) problems.push(`${record.id}: node type is not ${type}`);
    else if (record.doi && matches[0].identifier?.value !== record.doi) problems.push(`${record.id}: DOI is missing`);
  }

  const known = new Set(expected.map(({ id }) => `${PAGE_URL}#${id}`));
  for (const node of works) {
    if (!known.has(node['@id'])) problems.push(`${node['@id']}: JSON-LD node has no public record`);
  }

  const person = nodes.find(node => node['@type'] === 'Person' && node.name && node['@id']?.endsWith('/#person'));
  if (!person?.sameAs?.includes(ORCID_URL)) problems.push('canonical Person is missing the ORCID sameAs');

  return problems;
}
