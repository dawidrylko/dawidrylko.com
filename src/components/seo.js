/**
 * SEO component that queries for data with
 * Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

const Seo = function ({ description, title, children }) {
  const { site } = useStaticQuery(graphql`
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
