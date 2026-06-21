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
  });
  mermaidInitialized = true;
};

const Fallback: FC<{ chart: string; ariaLabel: string }> = ({ chart, ariaLabel }) => (
  <pre className="mermaid-diagram-fallback" role="img" aria-label={ariaLabel}>
    {chart}
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
          setSvg(renderedSvg);
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
