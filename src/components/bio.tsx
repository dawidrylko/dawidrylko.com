import * as React from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Bio: React.FC = () => {
  const { siteAuthor, siteSocial } = useSiteMetadata();

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
      {siteAuthor?.name && (
        <p>
          <strong>{siteAuthor.name}</strong>
          <br />
          {siteSocial.map(({ name, url }, index) => (
            <React.Fragment key={name}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
              {index < siteSocial.length - 1 && ' | '}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
};

export default Bio;
