import * as React from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { SITE_METADATA } from '../constants/site-metadata';

type SeoProps = {
  lang?: string;
  title?: string;
  description?: string;
  noIndex?: void | boolean;
  children?: React.ReactNode;
};

const Seo: React.FC<SeoProps> = ({ lang, title, description, noIndex, children }) => {
  const { siteTitle, siteDescription, siteSocial } = useSiteMetadata();

  const metaDescription = description || siteDescription;
  const metaTitle = [title, siteTitle].filter(Boolean).join(' | ');
  const twitterHandle = siteSocial.find(({ name }) => name === 'Twitter')?.url ?? '';

  return (
    <>
      <html lang={lang ?? SITE_METADATA.lang} />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />

      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {children}
    </>
  );
};

export default Seo;
