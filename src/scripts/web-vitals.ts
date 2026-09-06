import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { reportWebVitalsToGA } from '../data/gtag';
import { isAnalyticsActive } from '../lib/consent';
import type { Metric } from 'web-vitals';

// Client-side Core Web Vitals reporting, ported from Gatsby's gatsby-browser
// onClientEntry. Consent is checked at report time, not at import time: the
// Consent Mode defaults define window.gtag from first paint, so its presence
// proves nothing. A metric measured before the visitor answers is dropped
// rather than queued, so nothing about the visit reaches Google retroactively
// if consent is granted later in the page view.
const report = (metric: Metric): void => {
  if (isAnalyticsActive()) {
    reportWebVitalsToGA(metric);
  }
};

onCLS(report);
onFCP(report);
onINP(report);
onLCP(report);
onTTFB(report);
