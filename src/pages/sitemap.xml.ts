import type { APIRoute } from 'astro';

// Conventional /sitemap.xml entry point. @astrojs/sitemap emits the canonical
// index as /sitemap-index.xml (the one declared in robots.txt) plus the
// /sitemap-0.xml url set. Some crawlers and SEO audit tools probe the
// conventional /sitemap.xml path instead; this thin sitemap index answers them
// with valid XML — not an HTML meta-refresh redirect, which a strict XML parser
// would reject — pointing at the same generated url set.
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://dawidrylko.com')).origin;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${origin}/sitemap-0.xml</loc></sitemap>
</sitemapindex>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
