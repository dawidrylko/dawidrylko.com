// JSON-LD date properties that Google validates as DateTime. A bare
// 'YYYY-MM-DD' passes JSON parsing and schema.org, but Search Console reports
// it on ProfilePage as an invalid datetime value, so the build gate requires a
// time and an explicit timezone on every one of them.
export const JSONLD_DATE_PROPS = ['dateCreated', 'dateModified', 'datePublished'];

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// Date.parse rolls a day off the calendar over ('02-30' becomes March 2), so the
// date part is compared against its own UTC round trip to reject it.
export function isIsoDateTime(value) {
  if (typeof value !== 'string' || !ISO_DATETIME.test(value)) return false;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return false;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  const calendar = new Date(Date.UTC(y, m - 1, d));
  return calendar.getUTCFullYear() === y && calendar.getUTCMonth() === m - 1 && calendar.getUTCDate() === d;
}

// One message per date property on the node that is not a full datetime.
export function jsonLdDateViolations(node) {
  return JSONLD_DATE_PROPS.filter(prop => prop in node && !isIsoDateTime(node[prop])).map(
    prop => `${prop} '${node[prop]}' is not an ISO 8601 datetime with a timezone`,
  );
}
