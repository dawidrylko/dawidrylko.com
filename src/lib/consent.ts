/**
 * Browser side of the consent gate: the effects the model in
 * `consent-model.ts` decides on.
 *
 * Nothing here runs on the server, and nothing reaches Google until a decision
 * grants it. Before consent the page has made no request to googletagmanager.com
 * at all — the loader is injected here, not shipped in the HTML — which is a
 * stronger position than Consent Mode's cookieless pings.
 */

import { GTAG } from '../data/gtag';
import {
  ANALYTICS_COOKIE_EXPIRES_SECONDS,
  CONSENT_STORAGE_KEY,
  consentSignals,
  createDecision,
  expiredAnalyticsCookies,
  parseStoredConsent,
  type ConsentDecision,
} from './consent-model';

let analyticsActive = false;
let loaderInjected = false;
let appliedAnalytics: boolean | null = null;

/**
 * Whether measurement is currently allowed to send anything.
 *
 * The Core Web Vitals island asks before reporting: `window.gtag` exists from
 * first paint (the Consent Mode defaults define it), so its presence says
 * nothing about consent.
 */
export const isAnalyticsActive = (): boolean => analyticsActive;

/** The decision on record, or null when the visitor still has to be asked. */
export const readStoredConsent = (): ConsentDecision | null => {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    const decision = parseStoredConsent(raw);

    // An entry we refuse to honour is dropped rather than left lying around, so
    // the 13 months the cookie policy declares for it is true to the letter.
    if (raw && !decision) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    }

    return decision;
  } catch {
    // Storage can be blocked outright (private mode, "block site data"). The
    // banner then shows on every visit, which is the fail-closed outcome.
    return null;
  }
};

const storeConsent = (decision: ConsentDecision): void => {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
  } catch {
    // A decision we cannot remember still applies to this page view.
  }
};

const setGaDisableFlag = (disabled: boolean): void => {
  (window as unknown as Record<string, unknown>)[`ga-disable-${GTAG}`] = disabled;
};

const clearAnalyticsCookies = (): void => {
  for (const assignment of expiredAnalyticsCookies(document.cookie, window.location.hostname)) {
    document.cookie = assignment;
  }
};

const loadAnalytics = (): void => {
  // The gtag stub is defined by the Consent Mode snippet, which the layout
  // emits in production builds only. Its absence therefore means a development
  // build, and refusing to inject the loader there keeps local page views out
  // of the property. It is also the fail-closed answer if the snippet was ever
  // blocked: no stub to configure, no loader.
  if (loaderInjected || typeof window.gtag !== 'function') {
    return;
  }
  loaderInjected = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG}`;
  document.head.appendChild(script);

  // Queued on dataLayer and processed once the loader arrives — the ordering of
  // the canonical Google snippet, where config precedes the async script.
  window.gtag?.('js', new Date());
  window.gtag?.('config', GTAG, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: ANALYTICS_COOKIE_EXPIRES_SECONDS,
    // Anchors the expiry to the moment consent was given instead of sliding it
    // forward on every visit. With the default (true) a frequent visitor's
    // cookies would outlive the consent record that authorised them, which is
    // the one state this whole module exists to make unreachable.
    //
    // The cost is real and deliberate: a client id now expires 13 months after
    // consent no matter how often someone visits, so a regular reader is
    // counted as a new user once a year. There is no lawful way around it. An
    // analytics cookie may not outlive the consent behind it, so do not set
    // this back to true to make the returning-user numbers look better.
    cookie_update: false,
    cookie_flags: 'SameSite=Lax;Secure',
    // Pins the cookies to this exact host. GA4's `auto` writes them on the
    // registrable domain, where any future subdomain would share them.
    cookie_domain: window.location.hostname,
  });
};

/**
 * Put a decision into effect.
 *
 * The `consent update` answers every type the defaults declared, refusals
 * included — leaving one unresolved makes gtag.js hold every hit back.
 */
export const applyConsent = (decision: ConsentDecision): void => {
  // Idempotent, so the head-time boot and the island can both call it without
  // issuing the same consent update twice.
  if (appliedAnalytics === decision.analytics) {
    return;
  }
  appliedAnalytics = decision.analytics;

  window.gtag?.('consent', 'update', consentSignals(decision.analytics));

  if (decision.analytics) {
    analyticsActive = true;
    setGaDisableFlag(false);
    loadAnalytics();
    return;
  }

  analyticsActive = false;
  setGaDisableFlag(true);
  clearAnalyticsCookies();
};

/**
 * Apply the decision already on record, if there is one.
 *
 * Called from the document head rather than from the banner island, because a
 * returning visitor who consented long ago should be measured from the start of
 * the page view. Waiting for React to hydrate would silently drop the earliest
 * Core Web Vitals on every one of their visits.
 */
export const applyStoredConsent = (): ConsentDecision | null => {
  const stored = readStoredConsent();

  if (stored) {
    applyConsent(stored);
    return stored;
  }

  // No usable decision on record, so nothing on this device is authorised.
  // Sweeping here rather than waiting for an answer covers two cases: a
  // decision that has aged past its 13 months, and cookies written by an
  // earlier version of this site that measured without asking at all.
  clearAnalyticsCookies();

  return null;
};

/** Record a fresh answer and apply it. */
export const decideConsent = (analytics: boolean): ConsentDecision => {
  const decision = createDecision(analytics);
  storeConsent(decision);
  applyConsent(decision);
  return decision;
};
