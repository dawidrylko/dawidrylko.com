import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

type Social = {
  name: string;
  url: string;
};

type SiteMetadata = {
  author?: {
    name: string;
  };
  social?: Social[];
};

type Data = {
  site: {
    siteMetadata?: SiteMetadata;
  };
};

const Bio: React.FC = () => {
  const { site } = useStaticQuery<Data>(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
          }
          social {
            name
            url
          }
        }
      }
    }
  `);

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
          <strong>{author.name}</strong>
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
