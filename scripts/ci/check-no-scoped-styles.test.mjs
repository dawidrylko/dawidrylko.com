import { describe, expect, it } from 'vitest';
import { findScopedStyleViolations } from './check-no-scoped-styles.mjs';

describe('findScopedStyleViolations', () => {
  it('returns no violations when no file has a <style> block', () => {
    const files = [
      { path: 'src/pages/index.astro', content: '<h1>Hi</h1>' },
      { path: 'src/components/Seo.astro', content: '---\nconst x = 1;\n---\n<meta />' },
    ];
    expect(findScopedStyleViolations(files)).toEqual([]);
  });

  it('flags a plain <style> block', () => {
    const files = [{ path: 'src/pages/index.astro', content: '<div></div>\n<style>\n.a{color:red}\n</style>' }];
    expect(findScopedStyleViolations(files)).toEqual(['src/pages/index.astro']);
  });

  it('flags <style> tags carrying attributes (is:global, define:vars)', () => {
    const files = [
      { path: 'a.astro', content: '<style is:global>\n.a{}\n</style>' },
      { path: 'b.astro', content: '<style define:vars={{ c: "red" }}>\n.b{}\n</style>' },
    ];
    expect(findScopedStyleViolations(files)).toEqual(['a.astro', 'b.astro']);
  });

  it('is case-insensitive', () => {
    const files = [{ path: 'a.astro', content: '<STYLE>\n.a{}\n</STYLE>' }];
    expect(findScopedStyleViolations(files)).toEqual(['a.astro']);
  });

  it('does not flag the word "style" outside a tag (e.g. inline style attribute references)', () => {
    const files = [{ path: 'a.astro', content: '<p>Discusses the style of the prose.</p>' }];
    expect(findScopedStyleViolations(files)).toEqual([]);
  });
});
