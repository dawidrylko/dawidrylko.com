import { test, expect, type Page } from '@playwright/test';
import { GTAG } from '../src/data/gtag';

// The three-pass consent audit, in a real browser against the built site.
//
// One measurement is not enough to judge a consent gate: an empty cookie jar
// before consent looks exactly like a site with no analytics at all. The three
// states have to be compared. What leaves without being asked (this is where
// art. 399 PKE is actually breached), what a refusal really blocks, and what an
// acceptance really writes, under the names the browser reports rather than the
// names the configuration implies.
//
// Fetching gtag.js proves nothing by itself: the loader downloads happily even
// when every command it receives is ignored. The decisive signal is the `_ga`
// cookie, which only appears once GA4 has processed `config`.

const SESSION_COOKIE = `_ga_${GTAG.replace(/^G-/, '')}`;
const LOADER = 'googletagmanager.com/gtag/js';

/**
 * Blocks the measurement transport while leaving the loader reachable.
 *
 * gtag.js writes its cookies client side during `config`, so the cookie
 * evidence survives, but no page view from CI reaches the live property.
 */
const blockMeasurementTransport = async (page: Page) => {
  await page.route(/google-analytics\.com|analytics\.google\.com/, route => route.abort());
};

/** Every request the page made to the tag loader. */
const trackLoaderRequests = (page: Page): string[] => {
  const requests: string[] = [];
  page.on('request', request => {
    if (request.url().includes(LOADER)) requests.push(request.url());
  });
  return requests;
};

const analyticsCookies = async (page: Page) =>
  (await page.context().cookies()).filter(cookie => /^_ga(_.+)?$/.test(cookie.name)).map(cookie => cookie.name);

const banner = (page: Page) => page.locator('.cookie-consent');

test.describe('consent gate', () => {
  test.beforeEach(async ({ page }) => {
    await blockMeasurementTransport(page);
  });

  test('pass 1: nothing is stored or loaded before the visitor answers', async ({ page }) => {
    const loaderRequests = trackLoaderRequests(page);

    await page.goto('/');
    await expect(banner(page)).toBeVisible();

    expect(await analyticsCookies(page)).toEqual([]);
    expect(loaderRequests).toEqual([]);

    const stored = await page.evaluate(() => window.localStorage.getItem('cookieConsent'));
    expect(stored).toBeNull();
  });

  test('pass 1: the static HTML never references the tag manager', async ({ page }) => {
    const response = await page.goto('/');
    const html = (await response?.text()) ?? '';

    expect(html).not.toContain('googletagmanager.com');
    expect(html).toContain('dataLayer.push(arguments)');
  });

  test('pass 2: a refusal blocks the loader and is remembered', async ({ page }) => {
    const loaderRequests = trackLoaderRequests(page);

    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Refuse' }).click();

    await expect(banner(page)).toBeHidden();
    expect(loaderRequests).toEqual([]);
    expect(await analyticsCookies(page)).toEqual([]);

    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cookieConsent') ?? 'null'));
    expect(stored).toMatchObject({ analytics: false });
  });

  test('pass 2: the refusal survives a reload without asking again', async ({ page }) => {
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Refuse' }).click();
    await expect(banner(page)).toBeHidden();

    const loaderRequests = trackLoaderRequests(page);
    await page.reload();

    await expect(banner(page)).toBeHidden();
    expect(loaderRequests).toEqual([]);
    expect(await analyticsCookies(page)).toEqual([]);
  });

  test('pass 3: an acceptance loads the tag and writes the declared cookies', async ({ page }) => {
    const loaderRequests = trackLoaderRequests(page);

    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();
    await expect(banner(page)).toBeHidden();

    expect(loaderRequests.length).toBeGreaterThan(0);
    expect(loaderRequests[0]).toContain(GTAG);

    // The decisive signal, and the one the cookie policy names. Polled because
    // gtag.js writes the cookies once the async loader has run.
    await expect.poll(() => analyticsCookies(page)).toEqual(expect.arrayContaining(['_ga', SESSION_COOKIE]));
  });

  test('pass 3: the cookie lifetime matches the declared 13 months', async ({ page }) => {
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();

    await expect.poll(() => analyticsCookies(page)).toContain('_ga');

    const cookies = await page.context().cookies();
    const ga = cookies.find(cookie => cookie.name === '_ga');
    const days = (ga!.expires * 1000 - Date.now()) / 86_400_000;

    // 395 days, declared as 13 months, and under the 400-day browser ceiling.
    expect(days).toBeGreaterThan(390);
    expect(days).toBeLessThanOrEqual(400);
  });

  test('withdrawal is reachable from the footer and erases the cookies', async ({ page }) => {
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();
    await expect.poll(() => analyticsCookies(page)).toContain('_ga');

    await page.getByRole('button', { name: 'Cookie settings' }).click();
    await expect(banner(page)).toBeVisible();
    await banner(page).getByRole('button', { name: 'Refuse' }).click();

    await expect.poll(() => analyticsCookies(page)).toEqual([]);
  });

  test('cookies with no decision behind them are swept on the next visit', async ({ page }) => {
    // The state every visitor is in on the day this ships: _ga written by the
    // previous version of the site, which measured without asking.
    await page.goto('/');
    await page.context().addCookies([
      // Playwright takes either a url or a domain/path pair, never both.
      { name: '_ga', value: 'GA1.1.5.5', domain: 'localhost', path: '/' },
      { name: SESSION_COOKIE, value: 'GS1.1.5', domain: 'localhost', path: '/' },
    ]);
    expect(await analyticsCookies(page)).toEqual(expect.arrayContaining(['_ga', SESSION_COOKIE]));

    await page.reload();

    await expect.poll(() => analyticsCookies(page)).toEqual([]);
    await expect(banner(page)).toBeVisible();
  });

  test('a decision past its 13 months clears its cookies and asks again', async ({ page }) => {
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();
    await expect.poll(() => analyticsCookies(page)).toContain('_ga');

    // Backdate the record past CONSENT_MAX_AGE_MS, leaving the cookies in place.
    await page.evaluate(() => {
      const aged = { analytics: true, timestamp: new Date(Date.now() - 396 * 86400000).toISOString(), version: 1 };
      window.localStorage.setItem('cookieConsent', JSON.stringify(aged));
    });
    await page.reload();

    await expect.poll(() => analyticsCookies(page)).toEqual([]);
    await expect(banner(page)).toBeVisible();
  });

  test('the cookie expiry does not slide forward on a later visit', async ({ page }) => {
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();
    await expect.poll(() => analyticsCookies(page)).toContain('_ga');

    const expiryOf = async () => (await page.context().cookies()).find(cookie => cookie.name === '_ga')?.expires;
    const first = await expiryOf();

    await page.goto('/bio/');
    await page.waitForTimeout(1500);

    // cookie_update: false anchors the lifetime to the moment of consent, so a
    // frequent visitor's cookies can never outlive the record behind them.
    expect(await expiryOf()).toBe(first);
  });

  test('the banner speaks the language of the page it sits on', async ({ page }) => {
    await page.goto('/');
    await expect(banner(page).getByRole('button', { name: 'Accept' })).toBeVisible();

    await page.evaluate(() => window.localStorage.clear());
    await page.goto('/blog/');
    await expect(banner(page).getByRole('button', { name: 'Akceptuję' })).toBeVisible();
    await expect(banner(page).getByRole('button', { name: 'Odrzucam' })).toBeVisible();
  });

  test('both answers sit on the first layer with equal weight', async ({ page }) => {
    await page.goto('/');

    const buttons = banner(page).locator('.cookie-consent-actions button');
    await expect(buttons).toHaveCount(2);

    // Consent is only freely given when refusing is no harder than accepting.
    const [refuse, accept] = await buttons.all();
    const refuseBox = await refuse.boundingBox();
    const acceptBox = await accept.boundingBox();
    expect(Math.abs(refuseBox!.height - acceptBox!.height)).toBeLessThan(2);
    expect(Math.abs(refuseBox!.y - acceptBox!.y)).toBeLessThan(2);
  });

  test('the legal documents are reachable and cross-linked', async ({ page }) => {
    for (const [route, heading] of [
      ['/privacy-policy/', 'Privacy policy'],
      ['/cookie-policy/', 'Cookie policy'],
      ['/polityka-prywatnosci/', 'Polityka prywatności'],
      ['/polityka-cookies/', 'Polityka cookies'],
    ] as const) {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('h1')).toHaveText(heading);
    }
  });
});
