// Ported verbatim from the Gatsby site (src/constants/site-metadata.ts) so the
// Astro build produces identical metadata. Plain data, framework-agnostic.
export const SITE_METADATA = {
  lang: 'en',
  url: 'https://dawidrylko.com',
  title: 'Dawid Ryłko',
  // Short tagline used only for the homepage <title> (siteTitle | tagline). It
  // currently repeats author.jobTitle, but the two stay separate fields: this
  // one is bound by the 60-char title budget, jobTitle is not, so a longer
  // headline must never reach <title> by aliasing them.
  titleTagline: 'Solution Architect | Cybersecurity',
  // Fallback meta description for pages without their own. Kept ≤160 chars and
  // free of the decimal-ASCII easter egg (that lives on the /metadata/ page, not
  // in search snippets).
  description: {
    en: 'Personal website and blog of Dawid Ryłko, Solution Architect. Articles on software architecture, security, and engineering practice.',
    pl: 'Osobista strona i blog Dawida Ryłko, architekta rozwiązań. Artykuły o architekturze oprogramowania, bezpieczeństwie i praktyce inżynierskiej.',
  },
  author: {
    name: 'Dawid Ryłko',
    email: 'hello@dawid.dev',
    jobTitle: 'Solution Architect | Cybersecurity',
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
