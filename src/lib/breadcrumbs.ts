import type { NavLink } from '../types';

export type Crumb = { name: string; title: string; url: string; isActive: boolean };

export interface BuildCrumbsOptions {
  // Current page pathname, e.g. '/tags/devops/'.
  pathname: string;
  // Label for the active (last) crumb — the page's own title.
  customTitle: string;
  // Site menu, used to map a path segment to its human label (e.g. blog → Blog 🇵🇱).
  menu: NavLink[];
  // Extra ancestor crumbs (e.g. Blog for a post at /slug/). A parent whose URL
  // coincides with a real path segment supplies that segment's label instead of
  // being added as a separate, duplicate crumb.
  parents?: NavLink[];
}

// Strip the trailing slash so '/tags/' and '/tags' compare equal. The root '/'
// is left intact.
const normalizeUrl = (url: string): string => (url.length > 1 ? url.replace(/\/+$/, '') : url);

// Fallback label for a path segment with no menu/parent match: 'foo-bar' → 'Foo Bar'.
const titleCase = (segment: string): string => segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// Builds the breadcrumb trail from the current pathname. Known menu segments and
// injected parents provide friendly labels; the active page uses customTitle.
export function buildCrumbs({ pathname, customTitle, menu, parents = [] }: BuildCrumbsOptions): Crumb[] {
  const crumbs: Crumb[] = [{ name: '🏠', title: 'Home', url: '/', isActive: pathname === '/' }];

  if (pathname === '/') {
    return crumbs;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Menu labels keyed by their single path segment, e.g. { blog: 'Blog 🇵🇱' }.
  const pathMap = menu.reduce<Record<string, string>>((acc, item) => {
    acc[item.url.replace(/\//g, '')] = item.name;
    return acc;
  }, {});

  // URLs that actually appear in the current path. A parent matching one of these
  // labels its segment rather than adding a separate crumb — otherwise
  // /tags/devops/ would render both the injected "Tagi" and the path-derived "Tags".
  const pathUrls = new Set<string>();
  let walked = '';
  for (const segment of segments) {
    walked += '/' + segment;
    pathUrls.add(normalizeUrl(walked + '/'));
  }

  const parentByUrl = new Map(parents.map(parent => [normalizeUrl(parent.url), parent]));

  // Inject only the parents that are NOT part of the path (e.g. Blog for a post
  // at /slug/), right after Home and in order.
  for (const parent of parents) {
    if (!pathUrls.has(normalizeUrl(parent.url))) {
      crumbs.push({ name: parent.name, title: parent.name, url: parent.url, isActive: false });
    }
  }

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += '/' + segment;
    // Trailing slash keeps crumb hrefs canonical under trailingSlash: 'always'.
    const url = `${currentPath}/`;
    const isLast = index === segments.length - 1;
    if (isLast) {
      crumbs.push({ name: customTitle, title: customTitle, url, isActive: true });
    } else {
      const name = parentByUrl.get(normalizeUrl(url))?.name || pathMap[segment] || titleCase(segment);
      crumbs.push({ name, title: name, url, isActive: false });
    }
  });

  return crumbs;
}
