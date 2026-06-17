import * as React from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { SITE_METADATA } from '../constants/site-metadata';

type SeoProps = {
  lang?: string;
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  article?: boolean;
  noIndex?: boolean;
  children?: React.ReactNode;
};

// Square brand icon emitted by gatsby-plugin-manifest; used as the OG/Twitter
// fallback when a page does not provide its own image.
const DEFAULT_OG_IMAGE = '/icons/icon-512x512.png';

// og:locale expects an `xx_XX` value, while we keep simple two-letter langs.
const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  pl: 'pl_PL',
};

const Seo: React.FC<SeoProps> = ({ lang, title, description, pathname, image, article, noIndex, children }) => {
  const { siteUrl, siteTitle, siteDescription, siteSocial, siteAuthor } = useSiteMetadata();

  const metaLang = lang ?? SITE_METADATA.lang;
  const metaDescription = description || siteDescription;
  const metaTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | ${siteAuthor.jobTitle}`;

  const twitterUrl = siteSocial.find(({ name }) => name === 'Twitter')?.url ?? '';
  const twitterHandle = twitterUrl ? `@${twitterUrl.replace(/\/$/, '').split('/').pop()}` : '';

  const baseUrl = siteUrl.replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}${pathname ?? ''}`;
  const imageUrl = `${baseUrl}${image ?? DEFAULT_OG_IMAGE}`;

  return (
    <>
      <html lang={metaLang} />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />

      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={metaTitle} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={OG_LOCALES[metaLang] ?? metaLang} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {children}
    </>
  );
};

export default Seo;
