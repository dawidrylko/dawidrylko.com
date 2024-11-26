import type { ReactNode } from 'react';

import * as React from 'react';
import { Link } from 'gatsby';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import Menu from './menu';

type LayoutProps = {
  location: Location;
  children: ReactNode;
};

declare const __PATH_PREFIX__: string;

const Layout: React.FC<LayoutProps> = ({ location, children }) => {
  const { siteUrl, siteAuthor } = useSiteMetadata();
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  const fakeTitle = '68 97 119 105 100 32 82 121 108 107 111';
  let header;

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{fakeTitle}</Link>
      </h1>
    );
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {fakeTitle}
      </Link>
    );
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <div className="header">
        <header>{header}</header>
        <Menu />
      </div>
      <main>{children}</main>
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
