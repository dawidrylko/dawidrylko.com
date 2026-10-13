import type { FC } from 'react';

// Mermaid's edge id: L_<from>_<to>_<n>.
export const EDGE_ID = /^L_(.+?)_(.+)_\d+$/;

// Without the rendered diagram the tooltips are gone too, so their full text is
// listed under the chart source.
export const Fallback: FC<{ chart: string; ariaLabel: string; edgeDetails?: Record<string, string> }> = ({
  chart,
  ariaLabel,
  edgeDetails = {},
}) => {
  const details = Object.entries(edgeDetails);
  return (
    <>
      <pre className="mermaid-diagram-fallback" role="img" aria-label={ariaLabel}>
        {chart.replace(/^---\n[\s\S]*?\n---\n/, '')}
      </pre>
      {details.length > 0 && (
        <ul className="mermaid-diagram-details">
          {details.map(([id, text]) => {
            const [, from = id, to = ''] = EDGE_ID.exec(id) ?? [];
            return <li key={id}>{to ? `${from} to ${to}: ${text}` : text}</li>;
          })}
        </ul>
      )}
    </>
  );
};
