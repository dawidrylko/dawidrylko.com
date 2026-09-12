import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// axe-core scan per page — deeper than the design-token contrast audit: catches
// ARIA, landmark, label and structural issues in the rendered DOM.
const ROUTES = [
  '/',
  '/blog/',
  '/bio/',
  '/contact/',
  '/setup/',
  '/metadata/',
  '/files/',
  '/tags/',
  '/privacy-policy/',
  '/cookie-policy/',
  '/polityka-prywatnosci/',
  '/polityka-cookies/',
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

for (const route of ROUTES) {
  test(`${route} has no detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

// The same scan at phone width, because one rule only bites there: target size
// (SC 2.5.8) measures the rendered boxes, and the chrome that fails it is the
// footer nav, a single well-spaced row on a desktop viewport. It broke once the
// row wrapped and put two rows of 17 px links 20 px apart, which the desktop
// pass above never sees, so the narrow viewport is part of the contract.
test.describe('phone viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const route of ROUTES) {
    test(`${route} has no detectable WCAG A/AA violations on a phone`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);

      // The scan above can clear an undersized target through the spacing
      // exception, which would hide exactly the regression this guards, so the
      // boxes are measured directly as well.
      const boxes = await page
        .locator('.footer-metadata a, .footer-metadata button')
        .evaluateAll(nodes =>
          nodes.map(node => node.getBoundingClientRect()).map(({ width, height }) => ({ width, height })),
        );
      expect(boxes.length).toBeGreaterThan(0);
      for (const box of boxes) {
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    });
  }
});
