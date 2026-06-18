import type { Metric } from 'web-vitals';

// Ported from the Gatsby site (src/constants/gtag.tsx).
export const GTAG = 'G-1SKESWY49E';

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params: Record<string, unknown>) => void;
  }
}

// Forwards a Core Web Vitals metric to GA4 as a custom event. CLS is unitless,
// so it is scaled by 1000 to fit GA4's integer-based metric values.
export const reportWebVitalsToGA = (metric: Metric): void => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    non_interaction: true,
  });
};
