import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// axe-core scan per page — deeper than the design-token contrast audit: catches
// ARIA, landmark, label and structural issues in the rendered DOM.
const ROUTES = ['/', '/blog/', '/bio/', '/contact/', '/setup/', '/metadata/', '/files/'];

for (const route of ROUTES) {
  test(`${route} has no detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
