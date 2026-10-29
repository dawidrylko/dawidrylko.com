import { describe, expect, it } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkSources, { SOURCES_FRONTMATTER_KEY, toCitation } from './remark-sources';

const render = async (markdown: string) => {
  const processor = await createMarkdownProcessor({ remarkPlugins: [remarkSources], syntaxHighlight: false });
  const { code, metadata } = await processor.render(markdown, { frontmatter: {} });
  return { html: code, sources: metadata.frontmatter[SOURCES_FRONTMATTER_KEY] };
};

describe('remarkSources', () => {
  it('renders an unordered sources list as an ordered list with stable anchors', async () => {
    const { html } = await render(
      [
        'Body.',
        '',
        '## Źródła',
        '',
        '- [MDN, "let"](https://developer.mozilla.org/let)',
        '- [Git Book](https://git-scm.com/book)',
      ].join('\n'),
    );
    expect(html).toContain('<ol>');
    expect(html).not.toContain('<ul>');
    expect(html).toContain('<li id="zrodlo-1"><a href="https://developer.mozilla.org/let">');
    expect(html).toContain('<li id="zrodlo-2"><a href="https://git-scm.com/book">');
    expect(html).not.toContain('nofollow');
  });

  it('collects sources, naming link-led items by the link and prose-led items by the whole text', async () => {
    const { sources } = await render(
      [
        '## Źródła:',
        '',
        '1. [wit-ai/microphone](https://github.com/wit-ai/microphone) - dedykowana biblioteka.',
        '1. Richard Kenyon (2003), "An introduction to the dimer model", [arXiv:math/0310326](https://arxiv.org/abs/math/0310326).',
        '1. [CSS `@media` | Can I use](https://caniuse.com/media)',
        '1. **[Bold Title](https://bold.example)** opis',
        '1. Książka bez linku.',
      ].join('\n'),
    );
    expect(sources).toEqual([
      { name: 'wit-ai/microphone', url: 'https://github.com/wit-ai/microphone' },
      {
        name: 'Richard Kenyon (2003), “An introduction to the dimer model”, arXiv:math/0310326',
        url: 'https://arxiv.org/abs/math/0310326',
      },
      { name: 'CSS @media | Can I use', url: 'https://caniuse.com/media' },
      { name: 'Bold Title', url: 'https://bold.example' },
    ]);
  });

  it('leaves posts without a sources section untouched', async () => {
    const { html, sources } = await render(['## Wstęp', '', '- [a](https://a.example)'].join('\n'));
    expect(html).toContain('<ul>');
    expect(html).not.toContain('zrodlo-');
    expect(sources).toBeUndefined();
  });

  it('ignores a list that does not directly follow the heading', async () => {
    const { sources } = await render(['## Źródła', '', 'Wstęp.', '', '- [a](https://a.example)'].join('\n'));
    expect(sources).toBeUndefined();
  });
});

describe('toCitation', () => {
  it('maps sources to schema.org CreativeWork nodes', () => {
    expect(toCitation([{ name: 'Git Book', url: 'https://git-scm.com/book' }])).toEqual([
      { '@type': 'CreativeWork', name: 'Git Book', url: 'https://git-scm.com/book' },
    ]);
  });

  it('returns undefined when there are no sources, so the key is omitted', () => {
    expect(toCitation(undefined)).toBeUndefined();
    expect(toCitation([])).toBeUndefined();
    expect(toCitation('not a list')).toBeUndefined();
  });
});
