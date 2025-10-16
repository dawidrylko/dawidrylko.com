import type { PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

const PAGE_METADATA = {
  title: 'Contact',
  description:
    'Get in touch with Dawid Ryłko for software engineering projects, system architecture consulting, and technology collaboration. Available for scalable, secure, and future-proof solutions across the full technology stack—from frontend to backend, cloud infrastructure, AI integration, and cybersecurity.',
  keywords: [
    'contact Dawid Ryłko',
    'software engineering services',
    'system architecture consulting',
    'technology collaboration',
    'full-stack development',
    'cloud infrastructure',
    'AI integration',
    'cybersecurity consulting',
  ],
};

const ContactPage: React.FC<PageProps> = ({ location }) => {
  const { siteAuthor, siteSocial } = useSiteMetadata();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_METADATA.title,
    headline: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    keywords: PAGE_METADATA.keywords.join(', '),
    author: person,
    mainEntity: person,
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <main>
        <section>
          <p>
            Interested in collaborating on <strong>innovative technology projects</strong>? I&apos;m open to working on
            ideas that require a thoughtful approach and a long-term vision. My focus is on creating meaningful,
            reliable solutions that make a real impact.
          </p>
          <p>
            I work across the entire <strong>technology stack</strong> - from user-friendly{' '}
            <strong>frontend interfaces</strong> and robust <strong>backend systems</strong> to{' '}
            <strong>cloud infrastructure</strong>, <strong>AI-driven features</strong>, and advanced{' '}
            <strong>security implementations</strong>. Every solution I build is <strong>scalable</strong>,{' '}
            <strong>maintainable</strong>, and <strong>designed to last</strong>.
          </p>
          <p>
            Whether you&apos;re starting from scratch or improving an existing platform, I bring a{' '}
            <strong>strategic and pragmatic mindset</strong> to ensure your technology supports long-term business
            goals.
          </p>
        </section>
        <section>
          <h2>How to Reach Me</h2>
          <p>
            The best way to get in touch is by email:&nbsp;
            <a href={`mailto:${siteAuthor?.email}`} title="Send email">
              <strong>{siteAuthor?.email}</strong>
            </a>
          </p>
          <p>I usually respond within 24 hours on business days.</p>
        </section>
        <section>
          <h2>Find Me Online</h2>
          <p>Connect with me on professional and developer platforms:</p>
          <ul>
            {siteSocial
              .filter(({ name }) => ['GitHub', 'Twitter', 'Linkedin'].includes(name))
              .map(({ name, url, follow }) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel={follow ? 'noopener noreferrer' : 'noopener noreferrer nofollow'}
                    title={`Find Dawid Ryłko on ${name}`}
                  >
                    {name}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
};

export default ContactPage;

export const Head = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;
