import { test, expect } from '@playwright/test';

// Core static routes that must always render with a title, a single visible H1
// and a canonical link (the SEO chrome the build contract also guards).
const ROUTES = ['/', '/blog/', '/about/', '/contact/', '/setup/', '/metadata/', '/files/', '/publications/'];

test('home lists the three latest blog posts', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#latest-posts li a');
  await expect(links).toHaveCount(3);
  await page.goto('/blog/');
  const newest = await page.locator('#blog-posts .post-list-item h2 a').first().getAttribute('href');
  await page.goto('/');
  await expect(links.first()).toHaveAttribute('href', newest as string);
});

test('publication tables keep tokens whole and render exponents as markup', async ({ page }) => {
  await page.goto('/publications/');
  await expect(page.locator('.publication-cell').first()).toHaveCSS('hyphens', 'manual');
  await expect(page.locator('#dimer-entropy-kings-graph .record-details sup')).toHaveCount(2);
  await expect(page.locator('main h2')).toHaveText(['Research interests', 'Papers', 'Research software']);
  for (const value of await page.locator('.publications-table td').allTextContents()) {
    expect(value.trim()).not.toBe('');
  }
  const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
  const works = graphs
    .flatMap(text => JSON.parse(text)['@graph'] ?? [])
    .filter(
      (node: { '@id': string }) => node['@id'].includes('/publications/#') && !node['@id'].endsWith('#breadcrumb'),
    );
  expect(works.length).toBeGreaterThan(0);
  for (const { '@id': id } of works) {
    await expect(page.locator(`tr#${id.split('#')[1]}`)).toHaveCount(1);
  }
  await expect(page.getByRole('link', { name: '0009-0008-6307-9015' })).toHaveCount(1);
  const opens = page.locator('#dimer-entropy-kings-graph .file-link[target="_blank"]');
  const downloads = page.locator('#dimer-entropy-kings-graph .file-link[download]');
  await expect(opens).toHaveCount(1);
  await expect(downloads).toHaveCount(1);
  await expect(opens).toHaveAttribute('href', /\/preview\//);
  await expect(downloads).toHaveAttribute('href', /\/files\//);
});

test('files table keeps description, topic and keywords under details', async ({ page }) => {
  await page.goto('/files/');
  await expect(page.locator('.presentations-table th')).toHaveText([
    '#',
    'Title',
    'Lang',
    'Size',
    'Download',
    'Article',
  ]);
  const details = page.locator('.presentations-table .record-details').first();
  await expect(details.locator('summary')).toHaveText('Details');
  await expect(details).toContainText('Topic:');
  await expect(details).toContainText('Keywords:');
});

for (const route of ROUTES) {
  test(`${route} renders core SEO chrome`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('h1').first()).toBeVisible();

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /^https:\/\/dawidrylko\.com\//);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });
}

test('a blog post page renders and links back to the blog', async ({ page }) => {
  await page.goto('/blog/');
  const firstPost = page.locator('#blog-posts .post-list-item h2 a').first();
  const href = await firstPost.getAttribute('href');
  expect(href).toBeTruthy();

  const response = await page.goto(href as string);
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('article.blog-post h1')).toBeVisible();
  await expect(page.locator('.breadcrumbs a', { hasText: 'Blog' })).toBeVisible();
});

test('unknown route serves the 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page-please/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Page Not Found');

  // The noindex 404 must not advertise a canonical: it would point at a non-200
  // URL, which SEO audits flag.
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test('dark mode applies the dark background token', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // --color-background under prefers-color-scheme: dark is #1a1f27.
  expect(background).toBe('rgb(26, 31, 39)');
});

test('memoization demo hydrates without a React mismatch', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/memoizacja-harry-potter-i-myslodsiewnia/');
  const log = page.locator('.harry-potter-log-container');
  await log.scrollIntoViewIfNeeded();
  // A click that reaches the log proves React took over the server-rendered HTML.
  await expect(async () => {
    await page.getByRole('button', { name: "T. M. Riddle's Diary" }).click();
    await expect(log).toContainText('Extracting memories', { timeout: 500 });
  }).toPass();
  await expect(page.locator('.harry-potter-log-time').first()).toHaveText(/^\[\d{2}:\d{2}:\d{2}\.\d{3}\]$/);
  expect(errors).toEqual([]);
});

test('clearing the demo log keeps a running extraction marked as running', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto('/memoizacja-harry-potter-i-myslodsiewnia/');
  const log = page.locator('.harry-potter-log-container');
  await log.scrollIntoViewIfNeeded();
  const diary = page.getByRole('button', { name: "T. M. Riddle's Diary" });
  await expect(async () => {
    await diary.click();
    await expect(log).toContainText('Extracting memories', { timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: /Clear/ }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: "Slytherin's Locket" }).click();
  await expect(log).toContainText('Myrtle Warren', { timeout: 10_000 });
  await expect(page.locator('.harry-potter-loading-spinner')).toHaveCount(1);
});

test('inline code is not hyphenated', async ({ page }) => {
  await page.goto('/memoizacja-harry-potter-i-myslodsiewnia/');
  await expect(page.locator('main p code').first()).toHaveCSS('hyphens', 'none');
});
