import { describe, it, expect } from 'vitest';
import {
  ANALYTICS_COOKIE_EXPIRES_SECONDS,
  CONSENT_DEFAULTS,
  CONSENT_MAX_AGE_MS,
  CONSENT_VERSION,
  consentSignals,
  cookieDomainsFor,
  createDecision,
  expiredAnalyticsCookies,
  parseStoredConsent,
} from './consent-model';

/** Chrome has capped cookie lifetimes here since M104 (RFC 6265bis). */
const BROWSER_CAP_SECONDS = 34_560_000;

describe('retention constants', () => {
  it('keeps the analytics cookies under the 400-day browser cap', () => {
    expect(ANALYTICS_COOKIE_EXPIRES_SECONDS).toBeLessThanOrEqual(BROWSER_CAP_SECONDS);
  });

  it('never lets the consent record expire before the cookies it authorises', () => {
    expect(CONSENT_MAX_AGE_MS).toBeGreaterThanOrEqual(ANALYTICS_COOKIE_EXPIRES_SECONDS * 1000);
  });
});

describe('consentSignals', () => {
  it('answers every consent type declared in the defaults', () => {
    for (const granted of [true, false]) {
      expect(Object.keys(consentSignals(granted)).sort()).toEqual(Object.keys(CONSENT_DEFAULTS).sort());
    }
  });

  it('denies every advertising type regardless of the analytics answer', () => {
    for (const granted of [true, false]) {
      const signals = consentSignals(granted);
      expect(signals.ad_storage).toBe('denied');
      expect(signals.ad_user_data).toBe('denied');
      expect(signals.ad_personalization).toBe('denied');
      expect(signals.personalization_storage).toBe('denied');
    }
  });

  it('mirrors the analytics decision and nothing else', () => {
    expect(consentSignals(true).analytics_storage).toBe('granted');
    expect(consentSignals(false).analytics_storage).toBe('denied');
  });

  it('starts from a default state that grants no measurement', () => {
    expect(CONSENT_DEFAULTS.analytics_storage).toBe('denied');
  });
});

describe('parseStoredConsent', () => {
  const now = Date.parse('2026-09-06T12:00:00.000Z');
  const stored = (decision: unknown) => JSON.stringify(decision);

  it('reads back a decision written by createDecision', () => {
    const decision = createDecision(true, new Date(now));
    expect(parseStoredConsent(stored(decision), now)).toEqual(decision);
  });

  it('returns null when nothing is stored', () => {
    expect(parseStoredConsent(null, now)).toBeNull();
    expect(parseStoredConsent('', now)).toBeNull();
  });

  it.each([
    ['malformed JSON', 'not json'],
    ['a JSON primitive', '"granted"'],
    ['null', 'null'],
    ['a missing analytics flag', stored({ timestamp: '2026-09-01T00:00:00.000Z', version: CONSENT_VERSION })],
    ['a non-boolean analytics flag', stored({ analytics: 'yes', timestamp: '2026-09-01T00:00:00.000Z', version: 1 })],
    ['an unparseable timestamp', stored({ analytics: true, timestamp: 'yesterday', version: CONSENT_VERSION })],
    ['an older version', stored({ analytics: true, timestamp: '2026-09-01T00:00:00.000Z', version: 0 })],
  ])('treats %s as no decision at all', (_label, raw) => {
    expect(parseStoredConsent(raw, now)).toBeNull();
  });

  it('expires a decision older than the retention period', () => {
    const decision = createDecision(true, new Date(now - CONSENT_MAX_AGE_MS - 1));
    expect(parseStoredConsent(stored(decision), now)).toBeNull();
  });

  it('keeps a decision that is exactly at the retention limit', () => {
    const decision = createDecision(true, new Date(now - CONSENT_MAX_AGE_MS));
    expect(parseStoredConsent(stored(decision), now)).not.toBeNull();
  });

  it('preserves a refusal instead of re-asking', () => {
    const decision = createDecision(false, new Date(now));
    expect(parseStoredConsent(stored(decision), now)?.analytics).toBe(false);
  });
});

describe('cookieDomainsFor', () => {
  it('covers the host and every registrable parent, with and without a leading dot', () => {
    expect(cookieDomainsFor('dawidrylko.com')).toEqual([undefined, 'dawidrylko.com', '.dawidrylko.com']);
  });

  it('walks up a subdomain chain so an auto-scoped cookie is reachable', () => {
    expect(cookieDomainsFor('www.dawidrylko.com')).toEqual([
      undefined,
      'www.dawidrylko.com',
      '.www.dawidrylko.com',
      'dawidrylko.com',
      '.dawidrylko.com',
    ]);
  });

  it('handles a single-label host such as localhost', () => {
    expect(cookieDomainsFor('localhost')).toEqual([undefined]);
  });
});

describe('expiredAnalyticsCookies', () => {
  it('targets the analytics cookies and leaves everything else alone', () => {
    const assignments = expiredAnalyticsCookies('_ga=GA1.1; _ga_1SKESWY49E=GS1.1; theme=dark', 'dawidrylko.com');
    expect(assignments.every(entry => entry.startsWith('_ga'))).toBe(true);
    expect(assignments.some(entry => entry.startsWith('_ga='))).toBe(true);
    expect(assignments.some(entry => entry.startsWith('_ga_1SKESWY49E='))).toBe(true);
    expect(assignments.some(entry => entry.includes('theme'))).toBe(false);
  });

  it('expires each cookie on every candidate domain', () => {
    const assignments = expiredAnalyticsCookies('_ga=GA1.1', 'dawidrylko.com');
    expect(assignments).toHaveLength(cookieDomainsFor('dawidrylko.com').length);
    expect(assignments.every(entry => entry.includes('expires=Thu, 01 Jan 1970 00:00:00 GMT'))).toBe(true);
    expect(assignments.every(entry => entry.includes('path=/'))).toBe(true);
    expect(assignments.some(entry => entry.includes('domain=.dawidrylko.com'))).toBe(true);
  });

  it('returns nothing when no analytics cookie is present', () => {
    expect(expiredAnalyticsCookies('theme=dark', 'dawidrylko.com')).toEqual([]);
    expect(expiredAnalyticsCookies('', 'dawidrylko.com')).toEqual([]);
  });
});
