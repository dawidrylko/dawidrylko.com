// Shared types reused across pages and components, so the same shape is not
// re-declared in each file.

// Per-page SEO metadata. `keywords` feed JSON-LD; title/description also drive
// the <Seo> meta tags via the layout.
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
}

// A labelled link, used for breadcrumb ancestors and navigation entries.
export interface NavLink {
  name: string;
  url: string;
}
