import * as React from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Bio: React.FC = () => {
  const { siteAuthor, siteSocial } = useSiteMetadata();

  return (
    <div vocab="http://schema.org" typeof="Person" className="bio">
      <StaticImage
        className="avatar"
        layout="fixed"
        formats={['auto', 'webp', 'avif']}
        src="../images/avatar.jpeg"
        width={60}
        height={60}
        quality={95}
        alt="Profile picture"
        property="image"
      />
      {siteAuthor?.name && (
        <div>
          <p property="name" className="name">
            {siteAuthor.name}
          </p>
          {siteAuthor.jobTitle && (
            <p property="jobTitle" className="job-title">
              {siteAuthor.jobTitle}
            </p>
          )}
          <ul>
            {siteAuthor.email && (
              <li property="contactPoint" typeof="ContactPoint">
                <a href={`mailto:${siteAuthor.email}`} property="email">
                  <span property="contactType">Email</span>
                </a>
              </li>
            )}
            {siteSocial.map(({ name, url }) => (
              <li key={name}>
                <a href={url} property="sameAs" target="_blank" rel="noopener noreferrer">
                  <span property="name">{name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Bio;
