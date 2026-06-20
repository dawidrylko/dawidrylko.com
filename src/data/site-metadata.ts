// Ported verbatim from the Gatsby site (src/constants/site-metadata.ts) so the
// Astro build produces identical metadata. Plain data, framework-agnostic.
export const SITE_METADATA = {
  lang: 'en',
  url: 'https://dawidrylko.com',
  title: 'Dawid Ryłko',
  // Short tagline used only for the homepage <title> (siteTitle | tagline), kept
  // under the 60-char SEO limit. The full role copy lives in author.jobTitle.
  titleTagline: 'Software Engineer | Scalable, Secure Systems',
  // Fallback meta description for pages without their own. Kept ≤160 chars and
  // free of the decimal-ASCII easter egg (that belongs in the header, not in
  // search snippets).
  description: {
    en: 'Personal website and blog of Dawid Ryłko, Software Engineer—articles and insights on software architecture, scalable systems, and modern web.',
    pl: 'Osobista strona i blog Dawida Ryłko, Software Engineera — artykuły o architekturze systemów, skalowalności i nowoczesnym wytwarzaniu oprogramowania.',
  },
  author: {
    name: 'Dawid Ryłko',
    email: 'hello@dawid.dev',
    jobTitle: 'Software Engineer | Expert in Designing Scalable, Secure and Resilient Systems',
  },
  social: [
    { name: 'Digital Persona', url: 'https://dawid.dev/', follow: true },
    { name: 'GitHub', url: 'https://github.com/dawidrylko', follow: false },
    { name: 'Twitter', url: 'https://twitter.com/dawidrylko', follow: false },
    { name: 'Linkedin', url: 'https://www.linkedin.com/in/dawidrylko', follow: false },
  ],
  menu: [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/bio/' },
    { name: 'Blog 🇵🇱', url: '/blog/' },
    { name: 'Contact', url: '/contact/' },
  ],
};
