import type { PageProps } from 'gatsby';
import * as React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';

const BlogIndex: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location} breadcrumbTitle="Home">
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
            Discover my <a href="/blog">latest articles</a> on software engineering, system architecture, and emerging
            technologies, or learn more <a href="/bio">about my journey</a> and professional background.
          </p>
          <p>
            Interested in working together? <a href="/contact">Get in touch</a> and let&apos;s create technology that
            lasts.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
