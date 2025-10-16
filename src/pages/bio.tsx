import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { Person, WebPage, WithContext } from 'schema-dts';
import type { PageProps, HeadFC } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

const PAGE_METADATA = {
  title: 'About',
  description:
    'Meet Dawid Ryłko—a Software Engineer with 10+ years of experience building scalable, secure, and resilient systems. Learn about his professional journey, technical expertise in full-stack development, AI integration, cybersecurity, educational background, and philosophy behind creating meaningful technology.',
  keywords: [
    'Dawid Ryłko',
    'Software Engineer',
    'full-stack developer',
    'system architecture',
    'AI integration',
    'cybersecurity expert',
    'scalable systems',
    'technology leadership',
    'software craftsmanship',
  ],
};

const experience = [
  ['Silesian Solutions', 'Self-employed', 'Oct 2015 - Present', 'https://silesiansolutions.com'],
  ['Proget', 'Team Leader, Senior Frontend Developer', 'Oct 2017 - Present', 'https://proget.pl'],
  ['Actaware', 'Lead Mobile Developer', 'Mar 2022 - May 2024', 'https://actaware.com'],
  ['DaVinci Studio', 'Frontend Developer', 'Dec 2015 - Sep 2017', 'https://www.davinci-studio.com'],
  ['Wholesaler (local company)', 'IT Specialist - Programmer', 'Aug 2013 - Oct 2015'],
];

const education = [
  [
    'University of Bielsko-Biala',
    'Master of Science in Engineering (MSc Eng)',
    'Computer Science - Information and Communication Technologies',
  ],
  [
    'The Silesian University of Technology',
    'Bachelor of Engineering (BEng)',
    'Computer Science - Internet and Computer Systems',
  ],
];

const citations = [
  {
    authorName: 'Andrzej Stasiuk',
    citation: 'Jadąc do Babadag',
    text: 'Wszystko trzeba wymyślać od nowa, ponieważ dni nie mogą przepadać w przeszłości, wypełnione jedynie pejzażem, nieruchomą, niezmienną materią, która w końcu strząśnie nas ze swojego cielska, strzepnie jak te wszystkie drobne incydenty, te twarze oraz istnienia nie dłuższe niż jedno spojrzenie.',
  },
  {
    authorName: 'Andrzej Stasiuk',
    citation: 'On the Road to Babadag',
    text: 'Everything must be invented anew, because days cannot vanish into the past filled merely with landscape, with motionless, unchanging matter, which will finally shake us off its body, flick us away like all those minor incidents, those faces and existences lasting no longer than a single glance.',
    extraDetails: [
      {
        type: 'translation',
        note: 'Translated by ChatGPT.',
      },
    ],
  },
];

const image = {
  alt: `Graffiti on a utility box featuring a black-and-white image of Charlie Chaplin with the quote: 'A day without laughter is a day wasted'.`,
  figcaption: `Photo by Dawid Ryłko, taken on September 7, 2017, in Malia, Greece.`,
};

const BioPage: React.FC<PageProps> = ({ location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: WithContext<Person> } as { person: any };
  const { siteAuthor } = useSiteMetadata();

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_METADATA.title,
    headline: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    author: person,
    keywords: PAGE_METADATA.keywords.join(', '),
    about: {
      '@type': 'CreativeWork',
      name: 'Favourite Quote',
      description: 'Philosophical quotes that inspire approach to technology and software craftsmanship',
      citation: citations.map(({ authorName, citation, text }) => ({
        '@type': 'Quotation',
        text,
        author: {
          '@type': 'Person',
          name: authorName,
        },
        citation,
      })),
    },
    mainEntity: {
      ...person,
      worksFor: experience.map(([company, , , url]) => ({
        '@type': 'Organization',
        name: company,
        url: url || '',
      })),
      alumniOf: education.map(([institution]) => ({
        '@type': 'EducationalOrganization',
        name: institution,
      })),
    },
    potentialAction: {
      '@type': 'Action',
      name: 'Download My Full CV',
      description: 'Download a detailed overview of Dawid Ryłko’s experience and skills in PDF format.',
      target: [
        {
          '@type': 'EntryPoint',
          urlTemplate: '/resume-en.pdf',
          actionPlatform: 'https://schema.org/DownloadAction',
        },
        {
          '@type': 'EntryPoint',
          urlTemplate: '/resume-pl.pdf',
          actionPlatform: 'https://schema.org/DownloadAction',
        },
      ],
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <main>
        <section id="summary">
          <p>
            Hi, I&apos;m <strong>Dawid Ryłko</strong> - a <strong>Software Engineer</strong> passionate about{' '}
            <strong>scalable, secure, and resilient systems</strong>. With{' '}
            <time>over 10 years of professional experience</time> in the <strong>technology industry</strong>, I
            specialise in designing and delivering{' '}
            <a href="https://silesiansolutions.com/" target="_blank" rel="noopener noreferrer">
              <strong>end-to-end digital solutions</strong>
            </a>
            . From intuitive <strong>frontend experiences</strong> and high-performance <strong>backend systems</strong>{' '}
            to <strong>infrastructure automation</strong>, <strong>AI-driven innovation</strong>, and{' '}
            <a href="https://cyberkatalog.pl/" target="_blank" rel="noopener noreferrer nofollow">
              <strong>cybersecurity</strong>
            </a>
            , I build technology with purpose.
          </p>
          <p>
            My mission is to create <strong>technology that truly matters</strong> - solutions that are{' '}
            <strong>reliable</strong>, <strong>future-proof</strong>, and aligned with <strong>business goals</strong>.
            By combining deep <strong>technical expertise</strong> with <strong>strategic thinking</strong>, I ensure
            every project is not only <strong>robust</strong> but also <strong>meaningful</strong> and sustainable.
          </p>
          <p>
            You can explore my open-source work on{' '}
            <a href="https://github.com/dawidrylko" target="_blank" rel="noopener noreferrer nofollow">
              GitHub
            </a>
            , share ideas with me on{' '}
            <a href="https://twitter.com/dawidrylko" target="_blank" rel="noopener noreferrer nofollow">
              Twitter
            </a>
            , or connect professionally on{' '}
            <a href="https://www.linkedin.com/in/dawidrylko" target="_blank" rel="noopener noreferrer nofollow">
              LinkedIn
            </a>
            . Visit my personal site at{' '}
            <a href="https://dawid.dev" target="_blank" rel="noopener noreferrer">
              dawid.dev
            </a>{' '}
            to see experiments, articles, and insights on technology and software craftsmanship.
          </p>
        </section>
        <section id="philosophy">
          <h2>Philosophy</h2>
          <p>
            <strong>Technology</strong> is more than just <strong>code</strong>. It represents creativity, intuition,
            and the power to shape meaningful experiences. The quote and image below reflect how I view my craft - a
            constant process of reinvention, curiosity, and building with purpose.
          </p>
        </section>
        <section id="quote">
          {citations.map(({ authorName, citation, text }, index) => (
            <blockquote key={index}>
              {text}
              <br />
              <cite>
                - {authorName}, {citation}
              </cite>
              {citations[index].extraDetails?.map(({ type, note }) => (
                <React.Fragment key={type}>
                  <br />
                  <small>{note}</small>
                </React.Fragment>
              ))}
            </blockquote>
          ))}
        </section>
        <figure style={{ margin: '0' }}>
          <StaticImage src="../images/motto.jpg" alt={image.alt} placeholder="blurred" layout="fullWidth" />
          <figcaption>{image.figcaption}</figcaption>
        </figure>
        <section id="experience">
          <h2>Experience</h2>
          <Table
            data={experience.map(([company, position, duration]) => [company, position, duration])}
            header={['Company', 'Position', 'Duration']}
            widthConfig={['35%', '35%', '30%']}
          />
        </section>
        <section id="education">
          <h2>Education</h2>
          <Table
            data={education}
            header={['Institution', 'Degree', 'Field of Study']}
            widthConfig={['35%', '35%', '30%']}
          />
        </section>
        <section id="download">
          <h2>Download My Full CV</h2>
          <p>
            For a detailed overview of my career, experience, and technical skills, download the full version of my CV
            in PDF format below.
          </p>
          <ul>
            <li>
              <a href="/resume-en.pdf" download="Dawid_Rylko_CV_EN.pdf" title="Download Full CV (English)">
                Download CV (English PDF) 🇬🇧
              </a>
            </li>
            <li>
              <a href="/resume-pl.pdf" download="Dawid_Rylko_CV_PL.pdf" title="Download Full CV (Polish)">
                Download CV (Polish PDF) 🇵🇱
              </a>
            </li>
          </ul>
        </section>
        <section id="contact">
          <h2>Get in Touch</h2>
          <p>
            Interested in working together or have any questions?{' '}
            <a href="/contact" title="Contact Dawid Ryłko">
              Visit my contact page
            </a>{' '}
            or{' '}
            <a href={`mailto:${siteAuthor.email}`} title="Send me an email">
              send me an email
            </a>
            . I&apos;m always open to meaningful conversations about technology, software design, and collaboration.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;

export default BioPage;
