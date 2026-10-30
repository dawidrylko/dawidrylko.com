import { SITE_METADATA } from './site-metadata';
import avatar from '../assets/avatar.jpeg';

// Ported from the Gatsby site (src/constants/structured-data.ts). The schema-dts
// typing is dropped here (not a dependency of the Astro project); the shape is
// emitted verbatim as JSON-LD.
export const STRUCTURED_DATA = {
  person: {
    '@type': 'Person',
    '@id': `${SITE_METADATA.url}/#person`,
    name: SITE_METADATA.author.name,
    givenName: 'Dawid',
    familyName: 'Ryłko',
    alternateName: ['Dawid Rylko', 'dawidrylko'],
    description:
      'Dawid Ryłko designs system architecture and owns its security. He has worked in IT for a long time, across the whole stack: frontend interfaces, backend services, infrastructure automation, AI integration and cybersecurity. He weighs technical decisions against business goals and the cost of running a system for years.',
    url: `${SITE_METADATA.url}/`,
    // Only the role here: cybersecurity is listed in knowsAbout, while the visible
    // subtitle keeps the full jobTitle.
    jobTitle: 'Solution Architect',
    image: {
      '@type': 'ImageObject',
      url: new URL(avatar.src, SITE_METADATA.url).href,
      width: avatar.width,
      height: avatar.height,
    },
    worksFor: [
      {
        '@type': 'Organization',
        '@id': 'https://silesiansolutions.com/#organization',
        name: 'Silesian Solutions',
        url: 'https://silesiansolutions.com/',
        description:
          'Software development & consulting company delivering scalable, secure and resilient digital solutions tailored to business needs.',
      },
      {
        '@type': 'Organization',
        name: 'Cyber Katalog',
        url: 'https://cyberkatalog.pl/',
        description: 'Cybersecurity-focused project run under Silesian Solutions.',
        parentOrganization: { '@id': 'https://silesiansolutions.com/#organization' },
      },
      {
        '@type': 'Organization',
        name: 'Proget',
        url: 'https://proget.pl/',
      },
    ],
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'University of Bielsko-Biala' },
      { '@type': 'CollegeOrUniversity', name: 'The Silesian University of Technology' },
    ],
    knowsAbout: [
      'system architecture',
      'software architecture',
      'cybersecurity',
      'threat modelling',
      'security reviews',
      'full-stack development',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'Python',
      'Angular',
      'Ionic',
      'micro frontends',
      'CI/CD',
      'cloud infrastructure',
      'DevOps',
      'AI agents',
      'Model Context Protocol',
    ],
    email: SITE_METADATA.author.email,
    sameAs: SITE_METADATA.social.map(social => social.url),
  },
  // Site-wide WebSite node emitted on every page by the layout. SearchAction
  // describes the real, shareable `?q=` blog search URL; publisher links to the
  // canonical Person by @id instead of duplicating the full entity.
  website: {
    '@type': 'WebSite',
    '@id': `${SITE_METADATA.url}/#website`,
    url: `${SITE_METADATA.url}/`,
    name: SITE_METADATA.title,
    alternateName: 'dawidrylko.com',
    description: SITE_METADATA.description.en,
    inLanguage: ['en', 'pl'],
    publisher: { '@id': `${SITE_METADATA.url}/#person` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_METADATA.url}/blog/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  personReference: { '@id': `${SITE_METADATA.url}/#person` },
};
