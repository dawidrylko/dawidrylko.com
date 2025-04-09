import type { PageProps } from 'gatsby';

import * as React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const BlogIndex: React.FC<PageProps> = ({ location }) => {
  const { siteAuthor } = useSiteMetadata();

  return (
    <Layout location={location}>
      <p>
        Hi there! I&apos;m <strong>Dawid Ryłko</strong>, a Software Engineer and expert in scalable, secure, and
        resilient system design. With over a decade of experience in the IT industry, I specialise in crafting{' '}
        <strong>end-to-end digital solutions</strong> — from intuitive frontend interfaces and high-performance backend
        services to infrastructure automation, AI integration, and cybersecurity.
      </p>
      <p>
        My mission is to deliver technology that makes sense — reliable, future-proof systems that solve real problems
        and support long-term business goals. I blend deep technical expertise with strategic thinking to build
        solutions that are not only robust, but meaningful.
      </p>
      <p>
        Stay updated with my latest thoughts and ideas on the <a href="/blog">blog</a>. To learn more about my journey
        and background, visit the <a href="/bio">about page</a>. You can also find me sharing projects and code on{' '}
        <a href="https://github.com/dawidrylko" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        , exchanging ideas on{' '}
        <a href="https://twitter.com/dawidrylko" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
        , or connecting professionally on{' '}
        <a href="https://www.linkedin.com/in/dawidrylko" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        . Explore my{' '}
        <a href="https://dawid.dev" target="_blank" rel="noopener noreferrer">
          digital persona
        </a>{' '}
        — a space for experimentation and tech insights.
      </p>
      <p>
        If you&apos;d like to collaborate or just say hi, feel free to{' '}
        <a href={`mailto:${siteAuthor?.email}`} title="Email me">
          send me an email
        </a>
        .
      </p>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
