import { SITE_METADATA } from './site-metadata';

export const STRUCTURED_DATA = {
  person: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_METADATA.author.name,
    description:
      'An experienced Software Engineer specializing in robust, scalable solutions. Skilled in software architecture, system optimization, and problem-solving.',
    url: `${SITE_METADATA.url}/`,
    jobTitle: SITE_METADATA.author.jobTitle,
    knowsAbout: [
      'problem-solving',
      'software architecture',
      'system optimization',
      'cutting-edge software',
      'clean code',
      'sharing knowledge',
      'frontend development',
      'TypeScript',
      'JavaScript',
      'Python',
    ],
    email: SITE_METADATA.author.email,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Email',
      email: SITE_METADATA.author.email,
    },
    sameAs: SITE_METADATA.social.map(social => social.url),
  },
};
