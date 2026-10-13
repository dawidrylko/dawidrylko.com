import type { FC } from 'react';
import { Component, useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import mermaid from 'mermaid';

// React island ported from the Gatsby src/components/mermaid-diagram.tsx:
// per-instance rendering via mermaid.render, single initialization with
// startOnLoad disabled, OS dark-theme detection and an error fallback.

interface MermaidProps {
  chart: string;
  ariaLabel?: string;
}

let mermaidInitialized = false;

const initializeMermaid = (): void => {
  if (mermaidInitialized) {
    return;
  }

  const prefersDark =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;

  mermaid.initialize({
    startOnLoad: false,
    theme: prefersDark ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'inherit',
    themeCSS: SITE_THEME_CSS,
  });
  mermaidInitialized = true;
};

// Inline SVG inherits the page's custom properties, so the diagram follows the
// site palette (and its dark variant) instead of Mermaid's built-in colours.
const SITE_THEME_CSS = `
  [data-look].node rect, [data-look].node polygon, [data-look].node circle { fill: var(--color-background); stroke: var(--color-primary); stroke-width: 1.5px; rx: 6px; filter: none; }
  [data-look].cluster rect { fill: color-mix(in srgb, var(--color-accent) 40%, transparent); stroke: var(--color-text-light); stroke-width: 1.5px; rx: 10px; filter: none; }
  .nodeLabel, .edgeLabel, .cluster-label { color: var(--color-text); }
  .cluster-label .nodeLabel { color: var(--color-heading); font-weight: 600; }
  .flowchart-link { stroke: var(--color-text-light); }
  .marker { fill: var(--color-text-light); stroke: var(--color-text-light); }
  .edgeLabel, .edgeLabel p, .labelBkg { background-color: var(--color-background); }
  .edgeLabel rect { fill: var(--color-background); }
  .edgeLabel small { color: var(--color-text-light); }
`;

// Every edge gets a twin path drawn on top of it. The twin is invisible until
// page CSS animates it (see .edge-flow in main.css), which shows current
// flowing along the edge in the direction of its arrow.
const addEdgeFlows = (svg: string): string => {
  // HTML parsing, not XML: Mermaid's HTML labels carry void tags such as <br>.
  const template = document.createElement('template');
  template.innerHTML = svg;
  template.content.querySelectorAll('path.flowchart-link').forEach(edge => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'edge-flow');
    group.setAttribute('data-id', edge.getAttribute('data-id') ?? '');
    group.setAttribute('aria-hidden', 'true');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('class', 'edge-flow-line');
    line.setAttribute('d', edge.getAttribute('d') ?? '');
    group.appendChild(line);
    edge.after(group);
  });
  return template.innerHTML;
};

const Fallback: FC<{ chart: string; ariaLabel: string }> = ({ chart, ariaLabel }) => (
  <pre className="mermaid-diagram-fallback" role="img" aria-label={ariaLabel}>
    {chart.replace(/^---\n[\s\S]*?\n---\n/, '')}
  </pre>
);

const MermaidInner: FC<Required<MermaidProps>> = ({ chart, ariaLabel }) => {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    setSvg(null);

    const renderChart = async (): Promise<void> => {
      try {
        initializeMermaid();
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(addEdgeFlows(renderedSvg));
        }
      } catch {
        document.getElementById(id)?.remove();
        document.getElementById(`d${id}`)?.remove();
        if (!cancelled) {
          setHasError(true);
        }
      }
    };

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (hasError) {
    return <Fallback chart={chart} ariaLabel={ariaLabel} />;
  }

  if (!svg) {
    // Server-rendered even under client:visible, so the reserved height is
    // present on first paint and the content below does not jump when the
    // island hydrates and swaps in the SVG.
    return (
      <div className="mermaid-diagram-skeleton" role="status" aria-label={`${ariaLabel} – loading`} aria-busy="true" />
    );
  }

  return (
    <div className="mermaid-diagram" role="img" aria-label={ariaLabel} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class ErrorBoundary extends Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const Mermaid: FC<MermaidProps> = ({ chart, ariaLabel = 'Diagram' }) => (
  <ErrorBoundary fallback={<Fallback chart={chart} ariaLabel={ariaLabel} />}>
    <MermaidInner chart={chart} ariaLabel={ariaLabel} />
  </ErrorBoundary>
);

export default Mermaid;
