import { test, expect } from '@playwright/test';

// Layout regression guards for the footer/list/diagram spacing fixes. These all
// assert computed geometry on the built site so a future CSS change that drops
// the spacing (or the marker padding) fails loudly.

test('footer is separated from the divider above it', async ({ page }) => {
  await page.goto('/');
  const marginTop = await page.locator('.footer').evaluate(el => Number.parseFloat(getComputedStyle(el).marginTop));
  expect(marginTop).toBeGreaterThan(0);
});

test('blog post separates its tag list from the following section', async ({ page }) => {
  await page.goto('/blog/');
  const href = await page.locator('#blog-posts .post-list-item h2 a').first().getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href as string);

  const tags = page.locator('article.blog-post .tags');
  // Related posts and the prev/next nav are mutually exclusive; whichever one
  // renders must sit clearly below the tag list.
  const following = page.locator('.related, .blog-post-nav').first();
  await expect(tags).toBeVisible();
  await expect(following).toBeVisible();

  const tagsBox = await tags.boundingBox();
  const followingBox = await following.boundingBox();
  expect(tagsBox).not.toBeNull();
  expect(followingBox).not.toBeNull();

  const gap = (followingBox?.y ?? 0) - ((tagsBox?.y ?? 0) + (tagsBox?.height ?? 0));
  expect(gap).toBeGreaterThan(8);
});

// The global ul/ol reset strips padding and uses outside markers, which the
// wrapper's overflow-x: hidden would clip. Content sections must re-add the
// gutter so bullets stay on screen (regression: bio/contact lists ran off the
// left edge while blog posts were fine).
for (const route of ['/bio/', '/contact/']) {
  test(`${route} content list keeps room for its bullet markers`, async ({ page }) => {
    await page.goto(route);
    const list = page.locator('main section ul').first();
    await expect(list).toBeVisible();
    const paddingLeft = await list.evaluate(el => Number.parseFloat(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeGreaterThan(0);
  });
}

test('setup page server-renders a sized skeleton so the diagram does not jump', async ({ request }) => {
  const response = await request.get('/setup/');
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  // The Mermaid island is client:visible, but Astro still server-renders the
  // island's initial output, so its loading placeholder is part of the HTML and
  // reserves height before hydration.
  expect(html).toContain('mermaid-diagram-skeleton');
});

test('setup page renders the mermaid diagram once scrolled into view', async ({ page }) => {
  await page.goto('/setup/');
  // client:visible: hydration (and the ~1 MB mermaid bundle) is deferred until
  // the diagram scrolls into the viewport, so bring it into view first.
  await page.locator('#diagram').scrollIntoViewIfNeeded();
  await expect(page.locator('#diagram .mermaid-diagram svg')).toBeVisible({ timeout: 20000 });
});
