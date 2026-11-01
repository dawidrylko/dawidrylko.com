import { describe, expect, it } from 'vitest';
import { isIsoDateTime, jsonLdDateViolations } from './jsonld-dates.mjs';

describe('isIsoDateTime', () => {
  it('accepts a datetime with a UTC or offset timezone', () => {
    expect(isIsoDateTime('2026-10-30T00:00:00.000Z')).toBe(true);
    expect(isIsoDateTime('2026-10-30T12:34:00+01:00')).toBe(true);
  });

  it('rejects a bare date, a datetime without a timezone and non-strings', () => {
    expect(isIsoDateTime('2026-10-30')).toBe(false);
    expect(isIsoDateTime('2026-10-30T12:34:00')).toBe(false);
    expect(isIsoDateTime('2026-13-45T00:00:00Z')).toBe(false);
    expect(isIsoDateTime(undefined)).toBe(false);
  });
});

describe('jsonLdDateViolations', () => {
  it('flags the ProfilePage shape Search Console rejected', () => {
    expect(jsonLdDateViolations({ '@type': 'ProfilePage', dateModified: '2026-10-30' })).toEqual([
      "dateModified '2026-10-30' is not an ISO 8601 datetime with a timezone",
    ]);
  });

  it('passes nodes with full datetimes or no date properties', () => {
    expect(jsonLdDateViolations({ datePublished: '2026-10-30T00:00:00.000Z' })).toEqual([]);
    expect(jsonLdDateViolations({ '@type': 'Person' })).toEqual([]);
  });
});
