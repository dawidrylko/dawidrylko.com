import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false });

// React island that renders a single Mermaid diagram client-side. Mirrors the
// per-instance, error-tolerant approach the Gatsby component adopted (roadmap #1):
// each instance renders its own SVG and falls back to the source on parse errors.
export default function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const id = `mermaid-${useId().replace(/[:]/g, '')}`;

  useEffect(() => {
    let active = true;
    mermaid
      .render(id, chart)
      .then(result => active && setSvg(result.svg))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre role="img" aria-label="Mermaid diagram source">
        {chart}
      </pre>
    );
  }

  // svg is produced by mermaid from trusted, author-controlled diagram source.
  return <div role="img" aria-label="Mermaid diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
