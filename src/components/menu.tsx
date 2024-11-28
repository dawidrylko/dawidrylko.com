import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { SiteNavigationElement, WithContext } from 'schema-dts';
import { Link } from 'gatsby';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Menu: React.FC = () => {
  const { menu, siteUrl } = useSiteMetadata();

  const structuredData: WithContext<SiteNavigationElement> = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl,
    },
    about: menu.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        url: item.url,
        name: item.name,
      },
    })),
  };

  return (
    <>
      <JsonLd<SiteNavigationElement> item={structuredData} />
      <nav className="menu">
        <ul>
          {menu.map(item => (
            <li key={item.url}>
              <Link to={item.url}>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Menu;
