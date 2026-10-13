import type { FC, FocusEvent, PointerEvent } from 'react';
import { Component, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import mermaid from 'mermaid';
import { EDGE_ID, Fallback } from './MermaidFallback';

// React island ported from the Gatsby src/components/mermaid-diagram.tsx:
// per-instance rendering via mermaid.render, single initialization with
// startOnLoad disabled, OS dark-theme detection and an error fallback.

interface MermaidProps {
  chart: string;
  ariaLabel?: string;
  // Full text per edge, keyed by Mermaid's edge id (L_<from>_<to>_<n>), shown
  // as a tooltip when the edge is hovered or focused.
  edgeDetails?: Record<string, string>;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_ID = /-flowchart-(.+)-\d+$/;

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

// Every edge gets two twins drawn on top of it: a line page CSS animates (see
// .edge-flow in main.css) to show current flowing along the arrow, and a wide
// transparent hit area for hover and focus. Nodes become focusable so the
// highlight that shows a device's cables also works from the keyboard.
const enhanceSvg = (svg: string, edgeDetails: Record<string, string>): string => {
  // HTML parsing, not XML: Mermaid's HTML labels carry void tags such as <br>.
  const template = document.createElement('template');
  template.innerHTML = svg;
  const labels = new Map<string, string>();
  template.content.querySelectorAll('g.node').forEach(node => {
    const name = NODE_ID.exec(node.id)?.[1];
    if (!name) {
      return;
    }
    const label = node.textContent?.trim() || name;
    labels.set(name, label);
    node.setAttribute('data-node', name);
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', label);
  });
  template.content.querySelectorAll('path.flowchart-link').forEach(edge => {
    const id = edge.getAttribute('data-id') ?? '';
    const d = edge.getAttribute('d') ?? '';

    const flow = document.createElementNS(SVG_NS, 'g');
    flow.setAttribute('class', 'edge-flow');
    flow.setAttribute('data-id', id);
    flow.setAttribute('aria-hidden', 'true');
    const line = document.createElementNS(SVG_NS, 'path');
    line.setAttribute('class', 'edge-flow-line');
    line.setAttribute('d', d);
    flow.appendChild(line);

    const hit = document.createElementNS(SVG_NS, 'path');
    hit.setAttribute('class', 'edge-hit');
    hit.setAttribute('d', d);
    hit.setAttribute('data-edge', id);
    const detail = edgeDetails[id];
    if (detail) {
      const [, from = '', to = ''] = EDGE_ID.exec(id) ?? [];
      hit.setAttribute('tabindex', '0');
      hit.setAttribute('role', 'img');
      hit.setAttribute('aria-label', `${labels.get(from) ?? from} to ${labels.get(to) ?? to}: ${detail}`);
    } else {
      hit.setAttribute('aria-hidden', 'true');
    }

    edge.after(flow, hit);
  });
  return template.innerHTML;
};

type Active = { node: string } | { edge: string };

// Marks the edges, labels and nodes tied to the hovered or focused element so
// CSS can light them up and dim the rest of the diagram.
const applyActive = (root: HTMLElement, active: Active | null): void => {
  root.classList.toggle('has-active', active !== null);
  const related = new Set<string>();
  const nodes = new Set<string>();
  root.querySelectorAll<SVGElement>('path.flowchart-link').forEach(edge => {
    const id = edge.dataset.id ?? '';
    const [, from, to] = EDGE_ID.exec(id) ?? [];
    const hit = active && ('edge' in active ? active.edge === id : active.node === from || active.node === to);
    if (hit) {
      related.add(id);
      nodes.add(from);
      nodes.add(to);
    }
  });
  root.querySelectorAll<SVGElement>('[data-id]').forEach(el => {
    el.classList.toggle('is-related', related.has(el.dataset.id ?? ''));
  });
  root.querySelectorAll<SVGElement>('[data-node]').forEach(el => {
    el.classList.toggle('is-related', nodes.has(el.dataset.node ?? ''));
  });
};

const MermaidInner: FC<Required<MermaidProps>> = ({ chart, ariaLabel, edgeDetails }) => {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; below: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    setSvg(null);

    const renderChart = async (): Promise<void> => {
      try {
        initializeMermaid();
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(enhanceSvg(renderedSvg, edgeDetails));
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
  }, [chart, id, edgeDetails]);

  useEffect(() => {
    if (!tooltip) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        dismissedRef.current = true;
        setTooltip(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tooltip]);

  if (hasError) {
    return <Fallback chart={chart} ariaLabel={ariaLabel} edgeDetails={edgeDetails} />;
  }

  if (!svg) {
    // Server-rendered even under client:visible, so the reserved height is
    // present on first paint and the content below does not jump when the
    // island hydrates and swaps in the SVG.
    return (
      <div className="mermaid-diagram-skeleton" role="status" aria-label={`${ariaLabel} – loading`} aria-busy="true" />
    );
  }

  const deactivate = (): void => {
    if (rootRef.current) {
      applyActive(rootRef.current, null);
    }
    setTooltip(null);
  };

  const activate = (target: EventTarget, point?: { x: number; y: number }): void => {
    const root = rootRef.current;
    if (!root || (target instanceof Element && target.closest('.mermaid-diagram-tooltip'))) {
      return;
    }
    const el =
      target instanceof Element ? target.closest<SVGElement>('[data-node], [data-edge], g.label[data-id]') : null;
    if (!el) {
      deactivate();
      return;
    }
    dismissedRef.current = false;
    const edge = el.dataset.edge ?? (el.matches('g.label') ? el.dataset.id : undefined);
    applyActive(root, edge ? { edge } : { node: el.dataset.node ?? '' });
    const text = edge ? edgeDetails[edge] : undefined;
    if (!text) {
      setTooltip(null);
      return;
    }
    const box = root.getBoundingClientRect();
    const anchor =
      point ??
      (() => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })();
    // Keep the tooltip inside the scroll box: flip it below the pointer near the
    // top edge and hold it clear of the left and right edges.
    const half = Math.min(144, root.clientWidth / 2);
    const x = anchor.x - box.left + root.scrollLeft;
    const y = anchor.y - box.top;
    setTooltip({
      text,
      x: Math.min(Math.max(x, root.scrollLeft + half), root.scrollLeft + root.clientWidth - half),
      y,
      below: y < 110,
    });
  };

  return (
    <div
      ref={rootRef}
      className="mermaid-diagram"
      role="group"
      aria-label={ariaLabel}
      onPointerOver={(event: PointerEvent) => activate(event.target, { x: event.clientX, y: event.clientY })}
      onPointerLeave={() => {
        const focused = document.activeElement;
        if (focused && rootRef.current?.contains(focused) && !dismissedRef.current) {
          activate(focused);
        } else {
          deactivate();
        }
      }}
      onFocus={(event: FocusEvent) => activate(event.target)}
      onBlur={deactivate}
    >
      <div className="mermaid-diagram-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
      {tooltip && (
        <div
          className={`mermaid-diagram-tooltip${tooltip.below ? ' is-below' : ''}`}
          role="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
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

const NO_DETAILS: Record<string, string> = {};

const Mermaid: FC<MermaidProps> = ({ chart, ariaLabel = 'Diagram', edgeDetails = NO_DETAILS }) => (
  <ErrorBoundary fallback={<Fallback chart={chart} ariaLabel={ariaLabel} edgeDetails={edgeDetails} />}>
    <MermaidInner chart={chart} ariaLabel={ariaLabel} edgeDetails={edgeDetails} />
  </ErrorBoundary>
);

export default Mermaid;
