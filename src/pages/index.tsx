import type { PageProps } from 'gatsby';

import * as React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const BlogIndex: React.FC<PageProps> = ({ location }) => {
  const { siteAuthor } = useSiteMetadata();

  return (
    <Layout location={location} breadcrumbTitle="Home">
      <section>
        <p>
          Hi there! I&apos;m <strong>Dawid Ryłko</strong>, a <strong>Software Engineer</strong> and expert in{' '}
          <strong>scalable, secure, and resilient system design</strong>. With <time>over a decade of experience</time>{' '}
          in the <strong>IT industry</strong>, I&nbsp;specialise in crafting{' '}
          <a href="https://silesiansolutions.com/" target="_blank" rel="noopener noreferrer">
            <strong>end-to-end digital solutions</strong>
          </a>{' '}
          - from intuitive <strong>frontend interfaces</strong> and high-performance <strong>backend services</strong>{' '}
          to <strong>infrastructure automation</strong>, <strong>AI integration</strong>, and{' '}
          <a href="https://cyberkatalog.pl/" target="_blank" rel="noopener noreferrer nofollow">
            <strong>cybersecurity</strong>
          </a>
          .
        </p>
        <p>
          My mission is to deliver <strong>technology that makes sense</strong> - reliable,{' '}
          <strong>future-proof systems</strong> that solve real problems and support long-term{' '}
          <strong>business goals</strong>. I&nbsp;blend deep <strong>technical expertise</strong> with{' '}
          <strong>strategic thinking</strong> to build solutions that are not only <strong>robust</strong>, but{' '}
          <strong>meaningful</strong>.
        </p>{' '}
        <p>
          Stay updated with my latest thoughts and ideas on the <a href="/blog">blog</a>. To learn more about my journey
          and background, visit the <a href="/bio">about page</a>. You can also find me sharing projects and code on{' '}
          <a href="https://github.com/dawidrylko" target="_blank" rel="noopener noreferrer nofollow">
            GitHub
          </a>
          , exchanging ideas on{' '}
          <a href="https://twitter.com/dawidrylko" target="_blank" rel="noopener noreferrer nofollow">
            Twitter
          </a>
          , or connecting professionally on{' '}
          <a href="https://www.linkedin.com/in/dawidrylko" target="_blank" rel="noopener noreferrer nofollow">
            LinkedIn
          </a>
          . Explore my{' '}
          <a href="https://dawid.dev" target="_blank" rel="noopener noreferrer">
            digital persona
          </a>{' '}
          - a space for experimentation and tech insights.
        </p>
        <address>
          <p>
            If you&apos;d like to collaborate or just say hi, feel free to{' '}
            <a href={`mailto:${siteAuthor?.email}`} title="Email me">
              send me an email
            </a>
            .
          </p>
        </address>
      </section>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
