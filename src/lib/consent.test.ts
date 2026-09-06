import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONSENT_STORAGE_KEY, ANALYTICS_COOKIE_EXPIRES_SECONDS, createDecision } from './consent-model';
import { GTAG } from '../data/gtag';

// The three-pass consent audit at module level: before any decision, after a
// refusal and after an acceptance. e2e/consent.spec.ts runs the same three
// passes in a real browser against the built site; this covers the branches
// that decide what the browser is asked to do.
//
// A single measurement before consent proves nothing on its own: an empty
// cookie jar looks identical whether the gate works or the site has no
// analytics at all. Only the three states together tell them apart.

type GtagCall = unknown[];

interface Harness {
  calls: GtagCall[];
  injected: string[];
  cookieWrites: string[];
  store: Map<string, string>;
}

/**
 * Minimal browser stand-in covering exactly what the module touches.
 *
 * `withStub: false` models a development build, where the layout emits no
 * Consent Mode snippet and so nothing defines window.gtag.
 */
const setupBrowser = ({ withStub = true, cookies = '' } = {}): Harness => {
  const harness: Harness = { calls: [], injected: [], cookieWrites: [], store: new Map() };

  const documentStub = {
    createElement: () => ({
      set src(value: string) {
        harness.injected.push(value);
      },
      async: false,
    }),
    head: { appendChild: () => undefined },
    get cookie() {
      return cookies;
    },
    set cookie(value: string) {
      harness.cookieWrites.push(value);
    },
  };

  const windowStub: Record<string, unknown> = {
    location: { hostname: 'dawidrylko.com' },
    localStorage: {
      getItem: (key: string) => harness.store.get(key) ?? null,
      setItem: (key: string, value: string) => void harness.store.set(key, value),
    },
    document: documentStub,
  };

  if (withStub) {
    windowStub.gtag = (...args: GtagCall) => void harness.calls.push(args);
  }

  vi.stubGlobal('window', windowStub);
  vi.stubGlobal('document', documentStub);
  return harness;
};

/** Imported fresh each time: the module keeps consent state in closure. */
const loadModule = async () => {
  vi.resetModules();
  return import('./consent');
};

const consentUpdates = (harness: Harness) =>
  harness.calls
    .filter(call => call[0] === 'consent' && call[1] === 'update')
    .map(call => call[2] as Record<string, string>);

describe('consent gate', () => {
  beforeEach(() => vi.unstubAllGlobals());

  describe('pass 1: before any decision', () => {
    it('has nothing on record and reports analytics as inactive', async () => {
      setupBrowser();
      const consent = await loadModule();

      expect(consent.readStoredConsent()).toBeNull();
      expect(consent.isAnalyticsActive()).toBe(false);
    });

    it('loads no analytics script and issues no consent update', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();
      consent.readStoredConsent();

      expect(harness.injected).toEqual([]);
      expect(harness.calls).toEqual([]);
    });
  });

  describe('pass 2: after a refusal', () => {
    it('loads no analytics script', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(false);

      expect(harness.injected).toEqual([]);
      expect(consent.isAnalyticsActive()).toBe(false);
    });

    it('answers every consent type with a denial', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(false);

      const [update] = consentUpdates(harness);
      expect(update.analytics_storage).toBe('denied');
      expect(update.ad_storage).toBe('denied');
      expect(update.ad_user_data).toBe('denied');
      expect(update.ad_personalization).toBe('denied');
    });

    it('erases analytics cookies already on the device', async () => {
      const harness = setupBrowser({ cookies: `_ga=GA1.1; _ga_${GTAG.replace(/^G-/, '')}=GS1.1` });
      const consent = await loadModule();

      consent.decideConsent(false);

      expect(harness.cookieWrites.length).toBeGreaterThan(0);
      expect(harness.cookieWrites.every(write => write.includes('expires=Thu, 01 Jan 1970'))).toBe(true);
      expect(harness.cookieWrites.some(write => write.startsWith('_ga='))).toBe(true);
    });

    it('sets the GA opt-out flag', async () => {
      setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(false);

      expect((window as unknown as Record<string, unknown>)[`ga-disable-${GTAG}`]).toBe(true);
    });

    it('remembers the refusal so the banner does not return', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(false);

      expect(JSON.parse(harness.store.get(CONSENT_STORAGE_KEY) as string).analytics).toBe(false);
      expect(consent.readStoredConsent()?.analytics).toBe(false);
    });
  });

  describe('pass 3: after an acceptance', () => {
    it('injects the loader for the configured measurement ID', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(true);

      expect(harness.injected).toEqual([`https://www.googletagmanager.com/gtag/js?id=${GTAG}`]);
      expect(consent.isAnalyticsActive()).toBe(true);
    });

    it('grants analytics while still denying every advertising type', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(true);

      const [update] = consentUpdates(harness);
      expect(update.analytics_storage).toBe('granted');
      expect(update.ad_storage).toBe('denied');
      expect(update.ad_user_data).toBe('denied');
      expect(update.ad_personalization).toBe('denied');
    });

    it('configures GA4 with the declared cookie lifetime and this host only', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(true);

      const config = harness.calls.find(call => call[0] === 'config');
      expect(config?.[1]).toBe(GTAG);
      expect(config?.[2]).toMatchObject({
        cookie_expires: ANALYTICS_COOKIE_EXPIRES_SECONDS,
        cookie_domain: 'dawidrylko.com',
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    });

    it('orders the consent update before the config call', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(true);

      const updateAt = harness.calls.findIndex(call => call[0] === 'consent');
      const configAt = harness.calls.findIndex(call => call[0] === 'config');
      expect(updateAt).toBeGreaterThanOrEqual(0);
      expect(updateAt).toBeLessThan(configAt);
    });

    it('injects the loader only once across repeated decisions', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      consent.decideConsent(true);
      consent.applyConsent(createDecision(true));

      expect(harness.injected).toHaveLength(1);
    });
  });

  describe('returning visits', () => {
    it('re-applies a stored acceptance without asking again', async () => {
      const harness = setupBrowser();
      harness.store.set(CONSENT_STORAGE_KEY, JSON.stringify(createDecision(true)));
      const consent = await loadModule();

      expect(consent.applyStoredConsent()?.analytics).toBe(true);

      expect(harness.injected).toHaveLength(1);
      expect(consent.isAnalyticsActive()).toBe(true);
    });

    it('does nothing when there is no decision on record', async () => {
      const harness = setupBrowser();
      const consent = await loadModule();

      expect(consent.applyStoredConsent()).toBeNull();
      expect(harness.calls).toEqual([]);
      expect(harness.injected).toEqual([]);
    });

    it('issues one consent update when head boot and island both apply it', async () => {
      const harness = setupBrowser();
      harness.store.set(CONSENT_STORAGE_KEY, JSON.stringify(createDecision(true)));
      const consent = await loadModule();

      // consent-boot.ts runs from the head, the island repeats it on mount.
      consent.applyStoredConsent();
      consent.applyStoredConsent();

      expect(consentUpdates(harness)).toHaveLength(1);
      expect(harness.injected).toHaveLength(1);
    });

    it('still switches state when the decision actually changes', async () => {
      const harness = setupBrowser();
      harness.store.set(CONSENT_STORAGE_KEY, JSON.stringify(createDecision(true)));
      const consent = await loadModule();

      consent.applyStoredConsent();
      consent.decideConsent(false);

      expect(consentUpdates(harness)).toHaveLength(2);
      expect(consentUpdates(harness)[1].analytics_storage).toBe('denied');
      expect(consent.isAnalyticsActive()).toBe(false);
    });

    it('treats a storage failure as no decision rather than as consent', async () => {
      setupBrowser();
      (window as unknown as { localStorage: { getItem: () => string } }).localStorage.getItem = () => {
        throw new Error('storage blocked');
      };
      const consent = await loadModule();

      expect(consent.readStoredConsent()).toBeNull();
      expect(consent.isAnalyticsActive()).toBe(false);
    });
  });

  describe('development builds', () => {
    it('loads nothing when no Consent Mode stub is present', async () => {
      const harness = setupBrowser({ withStub: false });
      const consent = await loadModule();

      consent.decideConsent(true);

      expect(harness.injected).toEqual([]);
    });
  });
});
