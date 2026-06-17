import type { GatsbyBrowser } from 'gatsby';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { reportWebVitalsToGA } from './src/constants/gtag';

import '@fontsource-variable/montserrat';
import '@fontsource/merriweather';

import './src/styles/normalize.css';
import './src/styles/main.css';
import 'prismjs/themes/prism.css';
import 'katex/dist/katex.min.css';

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  onCLS(reportWebVitalsToGA);
  onFCP(reportWebVitalsToGA);
  onINP(reportWebVitalsToGA);
  onLCP(reportWebVitalsToGA);
  onTTFB(reportWebVitalsToGA);
};
