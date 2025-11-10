import type { PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useStructuredData } from '../hooks/use-structured-data';

const PAGE_METADATA = {
  title: 'Home',
  description:
    'Dawid Ryłko - Software Engineer specializing in scalable, secure, and resilient systems. Explore articles on software engineering, system architecture, and emerging technologies. Available for collaboration on meaningful technology projects.',
  keywords: [
    'Dawid Ryłko',
    'Software Engineer',
    'scalable systems',
    'secure systems',
    'system architecture',
    'software engineering',
    'technology blog',
    'full-stack development',
  ],
};

const BlogIndex: React.FC<PageProps> = ({ location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_METADATA.title,
    headline: 'Dawid Ryłko - Software Engineer',
    description: PAGE_METADATA.description,
    keywords: PAGE_METADATA.keywords.join(', '),
    author: person,
    about: {
      '@type': 'Thing',
      name: 'Software Engineering',
      description:
        'Designing and building scalable, secure, and future-proof systems that address real-world challenges',
    },
    mainEntity: person,
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>Hi, I&apos;m Dawid Ryłko</h1>
      </header>
      <main>
        <section>
          <p>
            I&apos;m a <strong>Software Engineer</strong> passionate about designing and building{' '}
            <strong>scalable, secure, and future-proof systems</strong> that address real-world challenges and drive
            meaningful impact.
          </p>
          <p>
            Discover my <a href="/blog/">latest articles</a> on software engineering, system architecture, and emerging
            technologies, or learn more <a href="/bio/">about my journey</a> and professional background.
          </p>
          <p>
            Interested in working together? <a href="/contact/">Get in touch</a> and let&apos;s create technology that
            lasts.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
