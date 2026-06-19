import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { reportWebVitalsToGA } from '../data/gtag';

// Client-side Core Web Vitals reporting, ported from Gatsby's gatsby-browser
// onClientEntry. reportWebVitalsToGA is a no-op until the GA4 gtag is present.
onCLS(reportWebVitalsToGA);
onFCP(reportWebVitalsToGA);
onINP(reportWebVitalsToGA);
onLCP(reportWebVitalsToGA);
onTTFB(reportWebVitalsToGA);
