import { test, expect, type Page } from '@playwright/test';

// The `## Źródła` section is rewritten at build time by src/lib/remark-sources.ts.
// The post below writes it as a bullet list with three links, so it covers both
// the list conversion and the citation export.
const POST_WITH_SOURCES = '/przesylanie-adresow-do-google-za-pomoca-indexing-api-i-github-actions/';
// `.md` posts are rendered through the content layer's data store rather than
// the MDX integration, so one of each guards both paths.
const MD_POST_WITH_SOURCES = '/zakres-zmiennych-hoisting-co-warto-wiedziec/';
const POST_WITHOUT_SOURCES = '/flexbox-layout-czesc-1-parent-container/';

const blogPosting = async (page: Page) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map(block => JSON.parse(block)).find(data => data['@type'] === 'BlogPosting');
};

test('the sources section renders as an ordered list with zrodlo-N anchors', async ({ page }) => {
  await page.goto(POST_WITH_SOURCES);
  const items = page.locator('h2#źródła + ol > li');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toHaveAttribute('id', 'zrodlo-1');
  await expect(items.nth(2)).toHaveAttribute('id', 'zrodlo-3');
  await expect(page.locator('h2#źródła + ul')).toHaveCount(0);
  await expect(items.locator('a[rel~="nofollow"]')).toHaveCount(0);
});

test('BlogPosting JSON-LD cites the sources as CreativeWork', async ({ page }) => {
  await page.goto(POST_WITH_SOURCES);
  const article = await blogPosting(page);
  expect(article.citation).toHaveLength(3);
  expect(article.citation[0]).toEqual({
    '@type': 'CreativeWork',
    name: 'Indexing API Quickstart | Google Search Central | Google for Developers',
    url: 'https://developers.google.com/search/apis/indexing-api/v3/quickstart',
  });
});

test('a Markdown (.md) post gets the same list and citation', async ({ page }) => {
  await page.goto(MD_POST_WITH_SOURCES);
  await expect(page.locator('h2#źródła + ol > li')).toHaveCount(5);
  await expect(page.locator('#zrodlo-5')).toHaveCount(1);
  const article = await blogPosting(page);
  expect(article.citation).toHaveLength(5);
});

test('a post without a sources section carries no citation', async ({ page }) => {
  await page.goto(POST_WITHOUT_SOURCES);
  const article = await blogPosting(page);
  expect(article).toBeTruthy();
  expect(article).not.toHaveProperty('citation');
});
