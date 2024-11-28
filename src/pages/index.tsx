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
        Hi there! I'm <strong>Dawid Ryłko</strong>, a Software Engineer and Frontend Architect with a passion for clean
        code, problem-solving, and sharing knowledge along the way.
      </p>
      <p>
        Stay updated with my latest thoughts and ideas on the <a href="/blog">blog</a>. To learn more about my journey
        and background, visit the <a href="/bio">about page</a>. You can also find me sharing projects and code on{' '}
        <a href="https://github.com/dawidrylko" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        , discussing ideas on{' '}
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
        — a space for experiments and tech insights.
      </p>
      <p>
        If you'd like to collaborate or just say hi, feel free to{' '}
        <a href={`mailto:${siteAuthor?.email}`}>send me an email</a>.
      </p>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
