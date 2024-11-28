import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

const experience = [
  ['Silesian Solutions', 'Self-employed', 'Oct 2015 - Present', 'https://silesiansolutions.com'],
  ['Proget', 'Team Leader, Senior Frontend Developer', 'Oct 2017 - Present', 'https://proget.pl'],
  ['Actaware', 'Lead Mobile Developer', 'Mar 2022 - May 2024', 'https://actaware.com'],
  ['DaVinci Studio', 'Frontend Developer', 'Dec 2015 - Sep 2017', 'https://www.davinci-studio.com'],
  ['Wholesaler (local company)', 'IT Specialist - Programmer', 'Aug 2013 - Oct 2015'],
];

const education = [
  ['University of Bielsko-Biala', "Master's degree, Information Technology"],
  ['The Silesian University of Technology', "Bachelor's degree, Information Technology"],
];

const title = 'Résumé 📄';

const ResumePage: React.FC<PageProps> = ({ location }) => {
  const { siteAuthor } = useSiteMetadata();
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
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
    <Layout location={location}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="summary">
          <h2>Summary</h2>
          <p>
            Hello, I'm <strong>Dawid Ryłko</strong>, an experienced Software Engineer with a comprehensive skill set
            spanning software architecture, system optimisation, and problem-solving. I specialise in designing robust,
            scalable solutions and thrive on turning complex challenges into streamlined, efficient systems. My approach
            blends technical precision with creativity, always aiming to deliver results that meet both business and
            user needs.
          </p>
          <p>
            Beyond technology, I'm passionate about the creative synergy between film, gaming, and cutting-edge
            software, which often inspires my work.
          </p>
          <p>
            In a fast-evolving tech landscape, I am committed to continuous learning and embracing the latest
            advancements to stay ahead. Let's connect and explore opportunities to shape the future of technology
            together!
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
          <Table data={education} header={['Institution', 'Degree']} widthConfig={['50%', '50%']} />
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

export const Head: HeadFC = () => <Seo title={title} description="Dawid Ryłko's Résumé" />;

export default ResumePage;
