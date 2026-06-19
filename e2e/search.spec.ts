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

  test('clicking a tag chip runs a search for that tag', async ({ page }) => {
    await page.goto('/blog/');
    const firstTag = page.locator('#blog-posts .tag').first();
    const tag = await firstTag.getAttribute('data-tag');
    expect(tag).toBeTruthy();

    await firstTag.click();
    await expect(page.locator('#blog-search-input')).toHaveValue(tag as string);
    await expect(page.locator('#blog-search-results')).toBeVisible();
  });
});
