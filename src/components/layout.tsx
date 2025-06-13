import type { ReactNode } from 'react';

import * as React from 'react';
import { Link } from 'gatsby';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import Bio from './bio';
import Menu from './menu';
import Breadcrumbs from './breadcrumbs';

type LayoutProps = {
  location: Location;
  children: ReactNode;
  breadcrumbTitle: string;
};

declare const __PATH_PREFIX__: string;

const Layout: React.FC<LayoutProps> = ({ location, children, breadcrumbTitle }) => {
  const { siteUrl, siteAuthor } = useSiteMetadata();
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  const fakeTitle = '68 97 119 105 100 32 82 121 108 107 111';

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <div className="header">
        <header>
          <Link className={`header-link-home ${isRootPath ? 'root' : ''}`} to="/">
            {isRootPath ? <h1>{fakeTitle}</h1> : fakeTitle}
          </Link>
        </header>
        <Menu />
      </div>
      <Breadcrumbs location={location} customTitle={breadcrumbTitle} />
      <main>{children}</main>
      <hr />
      <Bio />
      <hr />
      {siteUrl && siteAuthor.name && (
        <footer>
          Copyright © {new Date().getFullYear()} <a href={siteUrl}>{siteAuthor.name}</a>
        </footer>
      )}
    </div>
  );
};

export default Layout;
