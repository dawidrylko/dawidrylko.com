import type { PageProps } from 'gatsby';

import * as React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const BlogIndex: React.FC<PageProps> = ({ location }) => {
  const { siteAuthor } = useSiteMetadata();

  return (
    <Layout location={location}>
      <div vocab="http://schema.org" typeof="Person">
        <p>
          Hi there! I'm <span property="name">Dawid Ryłko</span>, a <span property="jobTitle">Software Engineer</span>{' '}
          and <span property="jobTitle">Frontend Architect</span> with a passion for{' '}
          <span property="knowsAbout">clean code</span>, <span property="knowsAbout">problem-solving</span>, and{' '}
          <span property="knowsAbout">sharing knowledge</span> along the way.
        </p>
        <p>
          Stay updated with my latest thoughts and ideas on the{' '}
          <a href="/blog" property="url" typeof="Blog">
            blog
          </a>
          . To learn more about my journey and background, visit the{' '}
          <a href="/bio" property="url" typeof="CreativeWork">
            about page
          </a>
          . You can also find me sharing projects and code on{' '}
          <a href="https://github.com/dawidrylko" property="sameAs">
            GitHub
          </a>
          , discussing ideas on{' '}
          <a href="https://twitter.com/dawidrylko" property="sameAs">
            Twitter
          </a>
          , or connecting professionally on{' '}
          <a href="https://www.linkedin.com/in/dawidrylko" property="sameAs">
            LinkedIn
          </a>
          . Explore my{' '}
          <a href="https://dawid.dev" property="url" typeof="CreativeWork">
            digital persona
          </a>{' '}
          — a space for experiments and tech insights.
        </p>
        <p property="description">
          My goal is to inspire and empower others through code, sharing practical solutions and insights into modern
          development practices. Thanks for visiting — let's build something great together!
        </p>
        <p>
          If you'd like to collaborate or just say hi, feel free to{' '}
          <a href={`mailto:${siteAuthor?.email}`} property="email">
            send me an email
          </a>
          .
        </p>
      </div>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
