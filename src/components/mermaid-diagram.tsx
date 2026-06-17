import type { FC } from 'react';
import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';
import ErrorBoundary from './error-boundary';

interface MermaidDiagramProps {
  chart: string;
  ariaLabel?: string;
}

let mermaidInitialized = false;

// Initialize mermaid a single time with startOnLoad disabled — every diagram
// is rendered explicitly per instance via mermaid.render, so the global
// contentLoaded scan must never run.
const initializeMermaid = (): void => {
  if (mermaidInitialized) {
    return;
  }

  // Diagrams render to SVG with inline styles, so CSS cannot recolor them.
  // Pick mermaid's built-in dark theme up front to match the OS preference.
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

const MermaidDiagramInner: FC<Required<MermaidDiagramProps>> = ({ chart, ariaLabel }) => {
  // Unique, DOM-safe id per instance so mermaid-generated class names and
  // element ids never collide between diagrams on the same page.
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
        // Mermaid may leave an orphaned node behind when parsing fails.
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
    return null;
  }

  return (
    <div className="mermaid-diagram" role="img" aria-label={ariaLabel} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

const MermaidDiagram: FC<MermaidDiagramProps> = ({ chart, ariaLabel = 'Diagram' }) => (
  <ErrorBoundary fallback={<Fallback chart={chart} ariaLabel={ariaLabel} />}>
    <MermaidDiagramInner chart={chart} ariaLabel={ariaLabel} />
  </ErrorBoundary>
);

export default MermaidDiagram;
