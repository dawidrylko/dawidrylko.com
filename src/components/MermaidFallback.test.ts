import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Fallback } from './MermaidFallback';

const chart = '---\nconfig:\n  flowchart:\n    curve: linear\n---\ngraph TD\n  A --> B\n';

describe('Mermaid Fallback', () => {
  it('drops the front matter from the chart source', () => {
    const html = renderToStaticMarkup(createElement(Fallback, { chart, ariaLabel: 'Diagram' }));
    expect(html).not.toContain('curve: linear');
    expect(html).toContain('graph TD');
  });

  it('lists the full text of every edge detail, since the tooltips are gone', () => {
    const html = renderToStaticMarkup(
      createElement(Fallback, {
        chart,
        ariaLabel: 'Diagram',
        edgeDetails: { L_Hub_KVM_2: 'Thunderbolt 5, 80 Gbps' },
      }),
    );
    expect(html).toContain('<li>Hub to KVM: Thunderbolt 5, 80 Gbps</li>');
  });

  it('renders no list when there are no details', () => {
    const html = renderToStaticMarkup(createElement(Fallback, { chart, ariaLabel: 'Diagram' }));
    expect(html).not.toContain('<ul');
  });
});
