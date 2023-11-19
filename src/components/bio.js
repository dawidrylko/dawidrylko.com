/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

const Bio = function () {
  const { site } = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            name
            url
          }
        }
      }
    }
  `);

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = site.siteMetadata?.author;
  const social = site.siteMetadata?.social || [];

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={['auto', 'webp', 'avif']}
        src="../images/avatar.jpeg"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <p>
          <strong>{author.name}</strong> {author?.summary || null}
          <br />
          {social.map(({ name, url }, index) => (
            <React.Fragment key={name}>
              <a href={url} target="_blank" rel="noreferrer">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </a>
              {index < social.length - 1 && ' | '}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
};

export default Bio;
