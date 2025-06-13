import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { Person, WithContext } from 'schema-dts';
import { StaticImage } from 'gatsby-plugin-image';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

const Bio: React.FC = () => {
  const { siteAuthor, siteSocial } = useSiteMetadata();
  const { person } = useStructuredData() as { person: WithContext<Person> };

  return (
    <div className="bio">
      <JsonLd<Person> item={person} />
      <StaticImage
        className="avatar"
        layout="fixed"
        formats={['auto', 'webp', 'avif']}
        src="../images/avatar.jpeg"
        width={60}
        height={60}
        quality={95}
        alt="Profile picture"
      />
      {siteAuthor?.name && (
        <div>
          <p className="name">{siteAuthor.name}</p>
          {siteAuthor.jobTitle && <p className="job-title">{siteAuthor.jobTitle}</p>}
          <ul>
            {siteAuthor.email && (
              <li>
                <a href={`mailto:${siteAuthor.email}`}>Email</a>
              </li>
            )}
            {siteSocial.map(({ name, url, follow }) => (
              <li key={name}>
                <a href={url} target="_blank" rel={follow ? 'noopener noreferrer' : 'noopener noreferrer nofollow'}>
                  {name}
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
