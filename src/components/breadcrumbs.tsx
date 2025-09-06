import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { BreadcrumbList, WithContext } from 'schema-dts';
import { Link } from 'gatsby';
import { useSiteMetadata } from '../hooks/use-site-metadata';

type BreadcrumbItem = {
  name: string;
  title: string;
  url: string;
  isActive?: boolean;
};

type BreadcrumbsProps = {
  location: Location;
  customTitle: string;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ location, customTitle }) => {
  const { siteUrl, menu } = useSiteMetadata();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({
      name: '🏠',
      title: 'Home',
      url: '/',
      isActive: location.pathname === '/',
    });

    if (location.pathname === '/') {
      return breadcrumbs;
    }

    const menuPathMap = menu.reduce(
      (acc, item) => {
        const path = item.url.replace('/', '');
        acc[path] = item.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    const pathMap = { ...menuPathMap };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const isLast = index === pathSegments.length - 1;

      if (isLast) {
        breadcrumbs.push({
          name: customTitle,
          title: customTitle,
          url: currentPath,
          isActive: true,
        });
      } else {
        const name = pathMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        breadcrumbs.push({
          name,
          title: name,
          url: currentPath,
          isActive: false,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  const structuredData: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: {
        '@type': 'WebPage',
        '@id': `${siteUrl}${item.url}`,
      },
    })),
  };

  return (
    <>
      <JsonLd<BreadcrumbList> item={structuredData} />
      <hr />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {breadcrumbs.map((item, index) => (
            <li key={item.url} className={item.isActive ? 'active' : ''}>
              {item.isActive ? (
                <span aria-current="page" title={item.title}>
                  {item.name}
                </span>
              ) : (
                <Link to={item.url} title={item.title}>
                  {item.name}
                </Link>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="separator" aria-hidden="true">
                  {' '}
                  /{' '}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
