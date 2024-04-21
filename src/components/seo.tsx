import * as React from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';

type SeoProps = {
  title?: string;
  description?: string;
  noIndex?: void | boolean;
  children?: React.ReactNode;
};

const Seo: React.FC<SeoProps> = ({ title, description, noIndex, children }) => {
  const { siteTitle, siteDescription, siteSocial } = useSiteMetadata();

  const metaDescription = description || siteDescription;
  const metaTitle = [title, siteTitle].filter(Boolean).join(' | ');
  const twitterHandle = siteSocial.find(({ name }) => name === 'twitter')?.url ?? '';

  return (
    <>
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
