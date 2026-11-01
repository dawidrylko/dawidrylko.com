// JSON-LD date properties that Google validates as DateTime. A bare
// 'YYYY-MM-DD' passes JSON parsing and schema.org, but Search Console reports
// it on ProfilePage as an invalid datetime value, so the build gate requires a
// time and an explicit timezone on every one of them.
export const JSONLD_DATE_PROPS = ['dateCreated', 'dateModified', 'datePublished'];

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export function isIsoDateTime(value) {
  return typeof value === 'string' && ISO_DATETIME.test(value) && !Number.isNaN(Date.parse(value));
}

// One message per date property on the node that is not a full datetime.
export function jsonLdDateViolations(node) {
  return JSONLD_DATE_PROPS.filter(prop => prop in node && !isIsoDateTime(node[prop])).map(
    prop => `${prop} '${node[prop]}' is not an ISO 8601 datetime with a timezone`,
  );
}
