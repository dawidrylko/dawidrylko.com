import { test, expect, type Page } from '@playwright/test';

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
// left edge while blog posts were fine). The `.capabilities` card grid is
// excluded: it is a marker-less layout grid (list-style: none) by design, not a
// prose list, so it has no gutter to guard.
for (const route of ['/bio/', '/contact/']) {
  test(`${route} content list keeps room for its bullet markers`, async ({ page }) => {
    await page.goto(route);
    const list = page.locator('main section ul:not(.capabilities)').first();
    await expect(list).toBeVisible();
    const paddingLeft = await list.evaluate(el => Number.parseFloat(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeGreaterThan(0);
  });
}

test('share row keeps its divider close to the controls', async ({ page }) => {
  await page.goto('/blog/');
  const href = await page.locator('#blog-posts .post-list-item h2 a').first().getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href as string);

  const share = page.locator('article.blog-post .share');
  const firstLink = share.locator('.share-link').first();
  await expect(share).toBeVisible();
  await expect(firstLink).toBeVisible();

  // The top rule sits at the box edge; tight padding keeps it hugging the
  // controls (the breadcrumb-style pairing), unlike the wide gap that opens
  // the share row away from the section above it.
  const shareBox = await share.boundingBox();
  const linkBox = await firstLink.boundingBox();
  expect(shareBox).not.toBeNull();
  expect(linkBox).not.toBeNull();

  const dividerGap = (linkBox?.y ?? 0) - (shareBox?.y ?? 0);
  // Divider hugs the buttons (padding-top is --spacing-2 = 8px); guard against a
  // regression back to the loose --spacing-6 (24px) that pushed it far away.
  expect(dividerGap).toBeLessThanOrEqual(12);

  // It must still be clearly set apart from the tags above it.
  const marginTop = await share.evaluate(el => Number.parseFloat(getComputedStyle(el).marginTop));
  expect(marginTop).toBeGreaterThan(12);
});

test('post-footer divider hugs the share row above it', async ({ page }) => {
  await page.goto('/blog/');
  const href = await page.locator('#blog-posts .post-list-item h2 a').first().getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href as string);

  const following = page.locator('.related, .blog-post-nav').first();
  await expect(following).toBeVisible();

  // The rule sits at the box edge, so margin-top is the gap above it (to the
  // share row) and padding-top the gap below (to the section heading). The rule
  // hugs the share row — a tight margin (--spacing-2 = 8px) — and opens its gap
  // below, so it reads as closing the share block instead of floating midway
  // between the two sections.
  const { marginTop, paddingTop } = await following.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      marginTop: Number.parseFloat(style.marginTop),
      paddingTop: Number.parseFloat(style.paddingTop),
    };
  });
  expect(marginTop).toBeLessThanOrEqual(12);
  expect(paddingTop).toBeGreaterThan(marginTop);
});

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

const renderSetupDiagram = async (page: Page) => {
  await page.goto('/setup/');
  await page.locator('#diagram').scrollIntoViewIfNeeded();
  await expect(page.locator('#diagram .mermaid-diagram svg')).toBeVisible({ timeout: 20000 });
  return page.locator('#diagram .mermaid-diagram svg');
};

test('setup diagram animates current along every edge', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const edges = await svg.locator('path.flowchart-link').count();
  expect(edges).toBeGreaterThan(0);
  await expect(svg.locator('.edge-flow')).toHaveCount(edges);
  const animation = await svg
    .locator('.edge-flow[data-id^="L_KVM_Monitor"] .edge-flow-line')
    .first()
    .evaluate(el => getComputedStyle(el).animationName);
  expect(animation).toBe('edge-current');
});

test('setup diagram keeps still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const svg = await renderSetupDiagram(page);
  const styles = await svg
    .locator('.edge-flow-line')
    .evaluateAll(els => els.map(el => [getComputedStyle(el).animationName, getComputedStyle(el).opacity]));
  expect(styles.length).toBeGreaterThan(0);
  expect(styles.filter(([name, opacity]) => name !== 'none' || opacity !== '0')).toEqual([]);
  const [, , width, height] = ((await svg.getAttribute('viewBox')) ?? '').split(' ').map(Number);
  expect(width).toBeLessThan(2000);
  expect(height).toBeLessThan(2000);
});

test('setup diagram draws nodes in the site palette, not the Mermaid theme', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const [stroke, primary] = await svg
    .locator('.node rect')
    .first()
    .evaluate(el => {
      const probe = document.createElement('div');
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
      document.body.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return [getComputedStyle(el).stroke, resolved];
    });
  expect(stroke).toBe(primary);
});

test('setup diagram places the primary station left of the secondary one', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const primary = await svg.locator('[id$="-PrimaryStation"]').boundingBox();
  const secondary = await svg.locator('[id$="-SecondaryStation"]').boundingBox();
  expect(primary).not.toBeNull();
  expect(secondary).not.toBeNull();
  expect(primary?.x ?? 0).toBeLessThan(secondary?.x ?? 0);
});

test('setup diagram puts the light bar first so its cable crosses no peripheral link', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const xs = await Promise.all(
    ['Lightbar', 'Mouse', 'Keyboard', 'Microphone'].map(async name => {
      const box = await svg.locator(`[id*="flowchart-${name}-"]`).boundingBox();
      expect(box).not.toBeNull();
      return box?.x ?? 0;
    }),
  );
  expect(xs[0]).toBeLessThan(Math.min(...xs.slice(1)));
});

test('setup diagram alternates the two stations through the KVM', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const animationOf = (selector: string) =>
    svg.locator(selector).evaluateAll(els => [...new Set(els.map(el => getComputedStyle(el).animationName))]);
  expect(await animationOf('.edge-flow[data-id^="L_Computer_KVM"]')).toEqual(['kvm-primary']);
  expect(await animationOf('.edge-flow[data-id^="L_Hub_KVM"]')).toEqual(['kvm-secondary']);
  expect(await animationOf('[id$="-PrimaryStation"] > rect')).toEqual(['kvm-primary-frame']);
  expect(await animationOf('[id$="-SecondaryStation"] > rect')).toEqual(['kvm-secondary-frame']);
});

test('setup diagram keeps cable labels short and shows the full spec on focus', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const labels = await svg.locator('.edgeLabel').allTextContents();
  expect(labels.filter(text => text.includes('Gbps'))).toEqual([]);
  await expect(svg.locator('.edge-hit[aria-label]')).toHaveCount(12);
  await expect(svg.locator('.edge-hit[data-edge="L_Hub_KVM_2"]')).toHaveAttribute('aria-label', /^Hub to KVM: /);
  await svg.locator('.edge-hit[data-edge="L_Computer_KVM_2"]').focus();
  await expect(page.locator('#diagram .mermaid-diagram-tooltip')).toContainText('80 Gbps');
  await page.keyboard.press('Escape');
  await expect(page.locator('#diagram .mermaid-diagram-tooltip')).toHaveCount(0);
});

test('setup diagram labels every cable as connector pair over what it carries', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  const labels = await svg.locator('g.edgeLabel').evaluateAll(els =>
    els.map(el => {
      const carries = el.querySelector('small')?.textContent ?? '';
      const connectors = (el.textContent ?? '').replace(carries, '').trim();
      const id = el.querySelector('[data-id]')?.getAttribute('data-id') ?? '';
      const height = Math.round(el.querySelector('p')?.getBoundingClientRect().height ?? 0);
      return { id, connectors, carries, height };
    }),
  );
  expect(labels).toHaveLength(12);
  expect(labels).toHaveLength(await svg.locator('path.flowchart-link').count());
  const end = '(USB-[ABC]|DisplayPort)';
  const off = labels.filter(
    ({ connectors, carries }) =>
      !new RegExp(`^(${end}|Wireless) ↔ ${end}$`).test(connectors) ||
      !['Video', 'Data', 'Audio', 'Power', 'Video + data'].includes(carries),
  );
  expect(off).toEqual([]);
  expect(new Set(labels.map(({ height }) => height)).size).toBe(1);
  for (const { id, connectors } of labels) {
    const hit = (await svg.locator(`.edge-hit[data-edge="${id}"]`).getAttribute('aria-label')) ?? '';
    expect(hit.slice(hit.indexOf(': ') + 2), id).toMatch(new RegExp(`^${connectors}`));
  }
});

test('setup diagram shows the full spec when the cable label is hovered', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  await svg.locator('g.label[data-id="L_Secondary_Hub_0"]').hover();
  await expect(page.locator('#diagram .mermaid-diagram-tooltip')).toContainText('0.5 m extension');
  const related = await svg
    .locator('path.flowchart-link.is-related')
    .evaluateAll(els => els.map(el => el.getAttribute('data-id')));
  expect(related).toEqual(['L_Secondary_Hub_0']);
});

test('setup diagram tooltip stays open when the pointer moves onto it', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  await svg.locator('g.label[data-id="L_Computer_KVM_2"]').hover();
  const tooltip = page.locator('#diagram .mermaid-diagram-tooltip');
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toContainText('80 Gbps');
});

test('setup diagram tooltip stays closed after Escape when the pointer leaves', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  // Pointer inside the diagram but over no device or cable, so only leaving
  // the box can fire, not a hover on whatever the closed tooltip uncovers.
  const frame = await page.locator('#diagram .mermaid-diagram').boundingBox();
  await page.mouse.move((frame?.x ?? 0) + 3, (frame?.y ?? 0) + 3);
  await svg.locator('.edge-hit[data-edge="L_Computer_KVM_2"]').focus();
  const tooltip = page.locator('#diagram .mermaid-diagram-tooltip');
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await page.mouse.move(5, 5);
  await expect(tooltip).toHaveCount(0);
});

test('setup diagram lights up a device cables on hover and dims the rest', async ({ page }) => {
  const svg = await renderSetupDiagram(page);
  await svg.locator('[data-node="Computer"]').hover();
  await expect(page.locator('#diagram .mermaid-diagram')).toHaveClass(/has-active/);
  const related = await svg
    .locator('path.flowchart-link.is-related')
    .evaluateAll(els => els.map(el => el.getAttribute('data-id')).sort());
  expect(related).toEqual(['L_Computer_KVM_0', 'L_Computer_KVM_2', 'L_Dock_Computer_0']);
  // The dim fades in over 0.2s, so let the assertion retry until it settles.
  await expect(svg.locator('path.flowchart-link[data-id="L_Hub_KVM_0"]')).toHaveCSS('opacity', '0.25');
  await expect(svg.locator('[data-node="Computer"] g.label')).toHaveCSS('opacity', '1');
  await expect(svg.locator('[data-node="Computer"]')).toHaveCSS('opacity', '1');
});

test('setup diagram scrolls inside its box on a phone instead of shrinking', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const svg = await renderSetupDiagram(page);
  const box = await svg.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(600);
  const overflow = await page.evaluate(() => {
    const diagram = document.querySelector('#diagram .mermaid-diagram') as HTMLElement;
    return {
      page: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      diagram: diagram.scrollWidth > diagram.clientWidth,
    };
  });
  expect(overflow).toEqual({ page: false, diagram: true });
  const frame = await page.locator('#diagram .mermaid-diagram').boundingBox();
  expect(box?.x ?? 0).toBeGreaterThanOrEqual((frame?.x ?? 0) - 1);
});

test('setup page has no aria-labelledby pointing at a missing element', async ({ page }) => {
  await page.goto('/setup/');
  const dangling = await page
    .locator('[aria-labelledby]')
    .evaluateAll(els =>
      els
        .flatMap(el => (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean))
        .filter(id => !document.getElementById(id)),
    );
  expect(dangling).toEqual([]);
});

for (const path of ['/bio/', '/cookie-policy/']) {
  test(`outbound links on ${path} carry no whitespace around their text`, async ({ page }) => {
    await page.goto(path);
    const texts = await page.locator('a[target="_blank"]').evaluateAll(els => els.map(el => el.textContent ?? ''));
    expect(texts.length).toBeGreaterThan(0);
    expect(texts.filter(text => text !== text.trim())).toEqual([]);
  });
}
