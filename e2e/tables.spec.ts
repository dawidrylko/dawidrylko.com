import { test, expect } from '@playwright/test';

// Every listing on the site renders through RecordTable.astro, so they all share
// one shape: links only in the last column, details on a full-width row under
// their record, and the same labels everywhere.
const ROUTES = ['/files/', '/setup/', '/publications/', '/metadata/'];

for (const route of ROUTES) {
  test(`${route} tables follow the shared record shape`, async ({ page }) => {
    await page.goto(route);
    const tables = page.locator('table.record-table');
    expect(await tables.count()).toBeGreaterThan(0);

    for (const table of await tables.all()) {
      const headers = await table.locator('thead th').allTextContents();
      expect(headers.at(-1)).toBe('Links');

      await expect(table.locator('td:not(.record-links) a')).toHaveCount(0);
      for (const value of await table.locator('.record-row td').allTextContents()) {
        expect(value.trim()).not.toBe('');
      }
      for (const cell of await table.locator('.record-row td.record-links').all()) {
        const links = await cell.locator('a.record-link').count();
        if (links === 0) await expect(cell).toHaveText('—');
      }

      for (const cell of await table.locator('.record-details-row td').all()) {
        await expect(cell).toHaveAttribute('colspan', String(headers.length));
        await expect(cell.locator('summary')).toHaveText(/^Details of .+/);
        await expect(cell.locator('summary .visually-hidden')).toHaveCount(1);
      }

      const overflow = await table.evaluate(element => {
        const scroll = element.parentElement as HTMLElement;
        return scroll.scrollWidth - scroll.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);

      const caption = await table.locator('caption').textContent();
      const numbered = route === '/metadata/' && ['Pages', 'Blog posts'].includes(caption?.trim() ?? '');
      expect(headers[0] === '#').toBe(numbered);
    }
  });
}
