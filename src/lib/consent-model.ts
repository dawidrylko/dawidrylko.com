/**
 * Framework-free consent model: the rules that decide what may be stored on a
 * visitor's device, with no DOM and no gtag involved.
 *
 * Poland has no analytics exemption. Art. 399 of the Prawo komunikacji
 * elektronicznej requires prior consent for *any* read or write on the device
 * beyond what the service itself needs, so the measurement layer stays off
 * until the visitor answers, and the answer itself is the only thing stored
 * before then.
 */

/**
 * Lifetime of the GA4 cookies, in seconds (395 days ≈ 13 months).
 *
 * Under the 400-day ceiling browsers have enforced since Chrome M104
 * (RFC 6265bis), so the period the legal documents declare is one the browser
 * can actually honour — unlike GA4's own two-year default, which is silently
 * truncated. `scripts/ci/check-consent-contract.mjs` mirrors this constant
 * against both cookie policies.
 */
export const ANALYTICS_COOKIE_EXPIRES_SECONDS = 34_128_000;

/**
 * How long a stored decision stays valid.
 *
 * Derived from the cookie lifetime rather than written out again: a consent
 * record that expired first would leave `_ga` on the device with nothing left
 * on record to justify it. Deriving it makes that state unreachable.
 */
export const CONSENT_MAX_AGE_MS = ANALYTICS_COOKIE_EXPIRES_SECONDS * 1000;

/** Bumping this re-asks everyone, e.g. when a new category appears. */
export const CONSENT_VERSION = 1;

/** localStorage key holding the decision. */
export const CONSENT_STORAGE_KEY = 'cookieConsent';

/** Event that reopens the banner from the footer link. */
export const CONSENT_SETTINGS_EVENT = 'open-cookie-settings';

export interface ConsentDecision {
  /** The only optional category: GA4 measurement. */
  analytics: boolean;
  /** ISO timestamp of the moment the visitor decided. */
  timestamp: string;
  version: number;
}

export type ConsentSignal = 'granted' | 'denied';

/**
 * Consent Mode v2 state before the visitor answers.
 *
 * `functionality_storage` and `security_storage` cover what the service needs
 * to work at all; every measurement and advertising signal starts denied.
 */
export const CONSENT_DEFAULTS = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  personalization_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
} as const satisfies Record<string, ConsentSignal>;

export type ConsentType = keyof typeof CONSENT_DEFAULTS;

/**
 * The `consent update` payload for a decision.
 *
 * Every type declared in `CONSENT_DEFAULTS` is answered here, including the
 * advertising ones this site never uses. In Consent Mode v2 an unanswered type
 * is not a refusal: gtag.js queues every hit — measurement included — waiting
 * for a resolution that never arrives, and the silence is indistinguishable
 * from a site with no traffic. Denying explicitly is what releases the queue.
 */
export const consentSignals = (analyticsGranted: boolean): Record<ConsentType, ConsentSignal> => ({
  ...CONSENT_DEFAULTS,
  analytics_storage: analyticsGranted ? 'granted' : 'denied',
});

/** A fresh decision, ready to be stored. */
export const createDecision = (analytics: boolean, now: Date = new Date()): ConsentDecision => ({
  analytics,
  timestamp: now.toISOString(),
  version: CONSENT_VERSION,
});

/**
 * Read a stored decision back, or null when there is nothing usable.
 *
 * Null means "ask again": absent, malformed, written by an older version, or
 * older than `CONSENT_MAX_AGE_MS`. Anything unparseable is treated as absent
 * rather than as consent, so a corrupted entry can never enable measurement.
 */
export const parseStoredConsent = (raw: string | null, nowMs: number = Date.now()): ConsentDecision | null => {
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const { analytics, timestamp, version } = parsed as Partial<ConsentDecision>;
  if (typeof analytics !== 'boolean' || typeof timestamp !== 'string' || version !== CONSENT_VERSION) {
    return null;
  }

  const decidedAt = Date.parse(timestamp);
  if (Number.isNaN(decidedAt) || nowMs - decidedAt > CONSENT_MAX_AGE_MS) {
    return null;
  }

  return { analytics, timestamp, version };
};

/** GA4's own cookies: `_ga` plus the per-stream `_ga_<id>`. */
const ANALYTICS_COOKIE = /^_ga(_.+)?$/;

/**
 * Every domain a `_ga` cookie could have been written to, widest last.
 *
 * GA4's `cookie_domain: auto` resolves to the registrable domain, so a cookie
 * set on `.dawidrylko.com` cannot be cleared by an expiry written for the exact
 * hostname. Withdrawal has to sweep the whole suffix chain.
 */
export const cookieDomainsFor = (hostname: string): (string | undefined)[] => {
  const labels = hostname.split('.');
  const domains: (string | undefined)[] = [undefined];

  for (let index = 0; index <= labels.length - 2; index++) {
    const domain = labels.slice(index).join('.');
    domains.push(domain, `.${domain}`);
  }

  return domains;
};

/**
 * `document.cookie` assignments that delete the analytics cookies.
 *
 * Art. 7(3) GDPR makes withdrawal as easy as consent, and the cookie policy
 * promises the files leave the device immediately rather than waiting out their
 * declared period — so refusal has to erase, not merely stop measuring.
 */
export const expiredAnalyticsCookies = (cookieString: string, hostname: string): string[] => {
  const names = cookieString
    .split(';')
    .map(entry => entry.split('=')[0].trim())
    .filter(name => ANALYTICS_COOKIE.test(name));

  return [...new Set(names)].flatMap(name =>
    cookieDomainsFor(hostname).map(domain =>
      [`${name}=`, 'expires=Thu, 01 Jan 1970 00:00:00 GMT', 'path=/', domain ? `domain=${domain}` : '']
        .filter(Boolean)
        .join('; '),
    ),
  );
};
