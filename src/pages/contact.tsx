import type { PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

const title = 'Contact';
const description =
  'Contact Dawid Ryłko - Software Engineer specializing in full-stack development, system architecture, AI integration, DevOps, and cybersecurity. Get in touch for meaningful collaborations on scalable, secure digital solutions.';

const ContactPage: React.FC<PageProps> = ({ location }) => {
  const { siteAuthor, siteSocial } = useSiteMetadata();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
    mainEntity: person,
  };

  return (
    <Layout location={location} breadcrumbTitle={title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <p>
          Got an idea, challenge or project in mind? Let&apos;s talk. I&apos;m always open to meaningful collaborations
          that involve thoughtful tech and long-term vision.
        </p>
        <p>
          I&nbsp;work across the full stack - from sleek frontends and robust backend systems to infrastructure
          automation, AI-powered features and cybersecurity. I&nbsp;care deeply about building software that&apos;s
          scalable, secure and designed to last.
        </p>
        <p>
          My work often focuses on system architecture, developer experience and performance optimisation. Whether
          you&apos;re starting from scratch or improving an existing system, I&nbsp;bring a pragmatic, strategic
          approach to every project.
        </p>
        <p>
          If that sounds like what you need - drop me a line. I&nbsp;usually reply within 24 hours on business days.
        </p>

        <p>
          The best way to reach me is via email:&nbsp;
          <a href={`mailto:${siteAuthor?.email}`} title="Email me">
            <strong>{siteAuthor?.email}</strong>
          </a>
        </p>
        <p>You can also connect with me here:</p>
        <ul>
          {siteSocial
            .filter(({ name }) => ['GitHub', 'Twitter', 'Linkedin'].includes(name))
            .map(({ name, url, follow }) => (
              <li key={name}>
                <a href={url} target="_blank" rel={follow ? 'noopener noreferrer' : 'noopener noreferrer nofollow'}>
                  {name}
                </a>
              </li>
            ))}
        </ul>
        <p>I typically reply within 24 hours on business days. Let&apos;s build something meaningful together.</p>
      </main>
    </Layout>
  );
};

export default ContactPage;

export const Head = () => <Seo title={title} description={description} />;
