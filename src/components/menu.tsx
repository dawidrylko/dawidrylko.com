import * as React from 'react';
import { Link } from 'gatsby';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Menu: React.FC = () => {
  const { menu } = useSiteMetadata();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
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
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
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
