import { test, expect } from '@playwright/test';

// Core static routes that must always render with a title, a single visible H1
// and a canonical link (the SEO chrome the build contract also guards).
const ROUTES = ['/', '/blog/', '/bio/', '/contact/', '/setup/', '/metadata/', '/files/'];

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
