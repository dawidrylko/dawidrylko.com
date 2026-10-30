import { test, expect } from '@playwright/test';

// Blog pagination: /blog/ is page 1, /blog/2/ … carry the rest. The pager marks
// the current page and exposes prev/next, and every page lists posts.
test('blog pagination renders page 2 and marks it current', async ({ page }) => {
  const response = await page.goto('/blog/2/');
  expect(response?.ok()).toBeTruthy();

  await expect(page.locator('#blog-posts .post-list-item').first()).toBeVisible();

  const current = page.locator('.pagination .is-current');
  await expect(current).toHaveText('2');

  // Page 2 must offer a way back to page 1 (the bare /blog/ URL).
  await expect(page.locator('.pagination a[rel="prev"]')).toBeVisible();
});

test('pagination links move between pages', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('.pagination .is-current')).toHaveText('1');

  await page.locator('.pagination a[rel="next"]').click();
  await expect(page).toHaveURL(/\/blog\/2\/$/);
  await expect(page.locator('.pagination .is-current')).toHaveText('2');
});

// Legacy URLs must keep landing on the about page (meta-refresh stubs): the
// Gatsby-era /resume and /bio, the about page's address until it moved.
for (const legacy of ['/resume/', '/bio/']) {
  test(`${legacy} redirects to /about/`, async ({ page }) => {
    await page.goto(legacy);
    await page.waitForURL(/\/about\/$/);
    await expect(page.locator('h1')).toBeVisible();
  });
}
