import { SITE_METADATA } from './site-metadata';

export const STRUCTURED_DATA = {
  person: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_METADATA.author.name,
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
          'CyberKatalog.pl is a curated Polish directory of cybersecurity companies, promoting digital safety, privacy, and open knowledge. Dawid plays a professional role in enhancing the platform—leading feature development, performance optimization, and content quality—to elevate standards and visibility within Poland’s cybersecurity sector.',
      },
    ],
    knowsAbout: [
      // Software Engineering & Architecture
      'end-to-end digital solutions',
      'software architecture',
      'system scalability',
      'resilient systems',
      'system optimization',

      // Frontend & Backend Development
      'frontend development',
      'backend development',
      'clean code',

      // DevOps & Automation
      'infrastructure automation',
      'DevOps',

      // Artificial Intelligence & Emerging Tech
      'AI integration',
      'cutting-edge software',

      // Security
      'cybersecurity',

      // Mindset & Soft Skills
      'strategic thinking',
      'problem-solving',
      'sharing knowledge',

      // Technologies & Programming Languages
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
