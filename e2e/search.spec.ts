import { test, expect } from '@playwright/test';

test.describe('blog search', () => {
  test('reports no results for a nonsense query and restores the list when cleared', async ({ page }) => {
    await page.goto('/blog/');
    const input = page.locator('#blog-search-input');

    await input.fill('zzzzz-nonexistent-term');
    await expect(page.locator('#blog-search-status')).toContainText('Brak wyników');
    await expect(page.locator('#blog-posts')).toBeHidden();

    await input.fill('');
    await expect(page.locator('#blog-posts')).toBeVisible();
  });

  test('keeps a non-breaking space between counts and units in the listing and in search results', async ({ page }) => {
    const meta = /\d\u00A0min czytania \u2022 \d+\u00A0(słowo|słowa|słów)$/;
    await page.goto('/blog/');
    const firstMeta = page.locator('#blog-posts .post-list-item header small > span').last();
    await expect(firstMeta).toHaveText(meta, { useInnerText: true });

    const title = (await page.locator('#blog-posts h2 a').first().textContent()) ?? '';
    await page.locator('#blog-search-input').fill(title.split(' ')[0]);
    const resultMeta = page.locator('#blog-search-results header small > span').last();
    await expect(resultMeta).toHaveText(meta, { useInnerText: true });
  });

  test('clicking a tag chip navigates to its archive page', async ({ page }) => {
    await page.goto('/blog/');
    const firstTag = page.locator('#blog-posts .tag').first();
    await expect(firstTag).toHaveAttribute('href', /^\/tags\/.+\/$/);

    await firstTag.click();
    await expect(page).toHaveURL(/\/tags\/.+\//);
    await expect(page.locator('h1')).toContainText('#');
  });
});
