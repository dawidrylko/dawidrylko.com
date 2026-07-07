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
    description:
      'Dawid Ryłko is a Software Engineer with over 10 years of experience, specialising in end-to-end digital solutions. He designs scalable, secure, and resilient systems by combining frontend and backend development with infrastructure automation, AI integration, DevOps, and cybersecurity. Known for his strategic thinking and problem-solving skills, Dawid helps organisations build robust technologies that align with business goals and deliver long-term value.',
    url: `${SITE_METADATA.url}/`,
    jobTitle: SITE_METADATA.author.jobTitle,
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
        name: 'Proget',
        url: 'https://proget.pl/',
      },
    ],
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'University of Bielsko-Biala' },
      { '@type': 'CollegeOrUniversity', name: 'The Silesian University of Technology' },
    ],
    knowsAbout: [
      'end-to-end digital solutions',
      'software architecture',
      'system scalability',
      'resilient systems',
      'system optimization',
      'frontend development',
      'backend development',
      'clean code',
      'infrastructure automation',
      'DevOps',
      'AI integration',
      'cutting-edge software',
      'cybersecurity',
      'strategic thinking',
      'problem-solving',
      'sharing knowledge',
      'TypeScript',
      'JavaScript',
      'Python',
      'Node.js',
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
