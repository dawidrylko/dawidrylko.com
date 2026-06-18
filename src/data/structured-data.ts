import { SITE_METADATA } from './site-metadata';

// Ported from the Gatsby site (src/constants/structured-data.ts). The schema-dts
// typing is dropped here (not a dependency of the Astro project); the shape is
// emitted verbatim as JSON-LD.
export const STRUCTURED_DATA = {
  person: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_METADATA.author.name,
    givenName: 'Dawid',
    familyName: 'Ryłko',
    description:
      'Dawid Ryłko is a Software Engineer with over 10 years of experience, specialising in end-to-end digital solutions. He designs scalable, secure, and resilient systems by combining frontend and backend development with infrastructure automation, AI integration, DevOps, and cybersecurity. Known for his strategic thinking and problem-solving skills, Dawid helps organisations build robust technologies that align with business goals and deliver long-term value.',
    url: `${SITE_METADATA.url}/`,
    jobTitle: SITE_METADATA.author.jobTitle,
    worksFor: [
      {
        '@type': 'Organization',
        name: 'Silesian Solutions',
        url: 'https://silesiansolutions.com/',
        description:
          'Software development & consulting company delivering scalable, secure and resilient digital solutions tailored to business needs.',
      },
      {
        '@type': 'Organization',
        name: 'Cyber Katalog',
        url: 'https://cyberkatalog.pl/',
        description:
          'CyberKatalog.pl is a curated Polish directory of cybersecurity companies, promoting digital safety, privacy, and open knowledge. Dawid plays a professional role in enhancing the platform-leading feature development, performance optimization, and content quality-to elevate standards and visibility within Poland’s cybersecurity sector.',
      },
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
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Email',
      email: SITE_METADATA.author.email,
    },
    sameAs: SITE_METADATA.social.map(social => social.url),
  },
};
