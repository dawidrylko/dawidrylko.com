import type { GatsbySSR } from 'gatsby';
import { SITE_METADATA } from './src/constants/site-metadata';

export const onRenderBody: GatsbySSR['onRenderBody'] = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: SITE_METADATA.lang });
};
