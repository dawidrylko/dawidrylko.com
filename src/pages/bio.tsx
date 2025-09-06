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

const title = 'Bio';
const description =
  'Get to know Dawid Ryłko beyond the code - professional experience, favorite quotes, and the philosophy behind the work. Discover how technology meets emotion, intuition, and meaningful moments in software development.';

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
  figcaption: `Photo by Dawid Ryłko. Taken on September 7, 2017, in Malia, Greece.`,
};

const BioPage: React.FC<PageProps> = ({ location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: WithContext<Person> } as { person: any };
  const { siteAuthor } = useSiteMetadata();

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
    about: {
      '@type': 'CreativeWork',
      name: 'Favourite Quote',
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
      description: 'Download a comprehensive overview of my experience and skills in PDF format.',
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
    <Layout location={location} breadcrumbTitle={title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="summary">
          <p>
            I&apos;m <strong>Dawid Ryłko</strong> - a Software Engineer and expert in designing scalable, secure, and
            resilient digital systems. I&nbsp;specialise in delivering <strong>end-to-end solutions</strong> that span
            intuitive frontend development, backend services, infrastructure automation, AI integration, and
            cybersecurity.
          </p>
          <p>
            My work blends deep technical knowledge with strategic thinking to create systems that are robust,
            future-proof, and aligned with business goals. I&nbsp;focus on long-term value, performance, and
            maintainability - helping organisations turn complexity into clarity through technology.
          </p>
        </section>
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
            For a comprehensive overview of my experience and skills, please download the full version of my CV in PDF
            format.
          </p>
          <ul>
            <li>
              <a href="/resume-en.pdf" download="Dawid_Rylko.pdf" title="Download Full CV (English)">
                Download CV (PDF) in English 🇬🇧
              </a>
            </li>
            <li>
              <a href="/resume-pl.pdf" download="Dawid_Rylko.pdf" title="Download Full CV (Polish)">
                Download CV (PDF) in Polish 🇵🇱
              </a>
            </li>
          </ul>
        </section>
        <section id="personal-intro">
          <h2>Personal Note</h2>
          <p>
            The quote and photo below reflect how I&nbsp;think. Technology isn&apos;t just code. It&apos;s also emotion,
            intuition, and fleeting moments.
          </p>
        </section>
        <section id="quote">
          <h2>Favourite Quote</h2>
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
        <section id="contact">
          <h2>Contact</h2>
          <p>If you have any questions or would like to get in touch, feel free to contact me via email.</p>
          <a href={`mailto:${siteAuthor.email}`} title="Email Me">
            Email Me
          </a>
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description={description} />;

export default BioPage;
