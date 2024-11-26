import * as React from 'react';
import { Link } from 'gatsby';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Menu: React.FC = () => {
  const { menu } = useSiteMetadata();

  return (
    <nav vocab="http://schema.org" typeof="SiteNavigationElement" className="menu">
      <ul>
        {menu.map(item => (
          <li key={item.url} typeof="ListItem">
            <Link to={item.url} property="url" typeof="WebPage">
              <span property="name">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
