import React, { ReactNode } from 'react';
import { Link } from 'gatsby';

type LayoutProps = {
  location: Location;
  title: string;
  children: ReactNode;
};

declare const __PATH_PREFIX__: string;

const Layout: React.FC<LayoutProps> = ({ location, title, children }) => {
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
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        Copyright © {new Date().getFullYear()} {title}
      </footer>
    </div>
  );
};

export default Layout;
