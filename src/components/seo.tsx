import React, { ReactNode } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

type Social = {
  name: string;
  url: string;
};

type SiteMetadata = {
  title: string;
  description: string;
  social: Social[];
};

type Site = {
  siteMetadata: SiteMetadata;
};

type StaticQueryData = {
  site: Site;
};

type Props = {
  description?: string;
  title?: string;
  children?: ReactNode;
};

const Seo: React.FC<Props> = ({ description, title, children }) => {
  const { site }: StaticQueryData = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          social {
            name
            url
          }
        }
      }
    }
  `);

  const metaDescription = description || site.siteMetadata?.description;
  const metaTitle = [title, site.siteMetadata?.title]
    .filter(Boolean)
    .join(' | ');
  const twitterHandle =
    site.siteMetadata?.social?.find(({ name }) => name === 'twitter')?.url ||
    '';

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

      {children}
    </>
  );
};

export default Seo;
