import { test, expect } from '@playwright/test';

// The tag index lists every tag and links to its archive; each archive lists the
// tagged posts. Post-page tag chips point at these archives (crawlable, unlike
// the JS-only blog search), so the index → archive → post path must hold.
test('tag index links to an archive that lists posts', async ({ page }) => {
  await page.goto('/tags/');
  await expect(page.locator('h1')).toHaveText('Tagi');

  const firstTag = page.locator('.tag-cloud a.tag').first();
  const href = await firstTag.getAttribute('href');
  expect(href).toMatch(/^\/tags\/[^/]+\/$/);

  const response = await page.goto(href as string);
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h1')).toContainText('#');
  await expect(page.locator('.posts .post-list-item').first()).toBeVisible();
});

test('a post tag chip leads to the matching tag archive', async ({ page }) => {
  await page.goto('/blog/');
  const firstPost = page.locator('#blog-posts .post-list-item h2 a').first();
  await page.goto((await firstPost.getAttribute('href')) as string);

  const tagChip = page.locator('article.blog-post .tags a.tag').first();
  const href = await tagChip.getAttribute('href');
  expect(href).toMatch(/^\/tags\/[^/]+\/$/);

  const response = await page.goto(href as string);
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('.posts .post-list-item').first()).toBeVisible();
});
