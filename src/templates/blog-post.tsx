import * as React from 'react';
import { Link, graphql, PageProps, HeadProps } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { JsonLd } from 'react-schemaorg';
import { BlogPosting } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import ErrorBoundary from '../components/error-boundary';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { STRUCTURED_DATA } from '../constants/structured-data';
import type { StructuredData } from '../types';

type PostNode = {
  frontmatter: {
    title: string;
    description?: string;
    dateFormatted?: string;
    dateOriginal?: string;
    featuredImg?: {
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData;
      };
    };
    featuredImgAlt?: string;
  };
  fields: {
    slug: string;
  };
};

type Data = {
  mdx: PostNode;
  previous: PostNode;
  next: PostNode;
};

const BlogPostTemplate: React.FC<PageProps<Data>> = ({ data, location, children }) => {
  const { siteAuthor } = useSiteMetadata();
  const { person } = STRUCTURED_DATA;
  const { previous, next, mdx: post } = data;

  const img = getImage(post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData || null);

  const structuredData: StructuredData<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.description || '',
    datePublished: post.frontmatter.dateOriginal,
    author: person,
    inLanguage: 'pl',
    image: img
      ? {
          '@type': 'ImageObject',
          url: post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData?.images?.fallback?.src || '',
          description: post.frontmatter.featuredImgAlt || '',
        }
      : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': location.href,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={post.frontmatter.title}>
      <JsonLd<BlogPosting> item={structuredData} />
      <article className="blog-post">
        <header>
          <h1>{post.frontmatter.title}</h1>
          <small>
            <span>{post.frontmatter.dateFormatted}</span>
            &nbsp;|&nbsp;
            <span>
              <Link to="/bio/">{siteAuthor?.name}</Link>
            </span>
          </small>
        </header>
        {img && <GatsbyImage image={img} alt={post.frontmatter.featuredImgAlt || ''} />}
        <ErrorBoundary fallback={<p>Nie udało się wyświetlić tej części treści.</p>}>
          <section>{children}</section>
        </ErrorBoundary>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
};

export const Head: React.FC<HeadProps<Data>> = ({ data: { mdx: post }, location }) => (
  <Seo
    lang="pl"
    title={post.frontmatter.title}
    description={post.frontmatter.description || ''}
    pathname={location.pathname}
    image={post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData?.images?.fallback?.src}
    article
  />
);

export default BlogPostTemplate;

export const blogPageQuery = graphql`
  query BlogPostBySlug($id: String!, $previousPostId: String, $nextPostId: String) {
    mdx(id: { eq: $id }) {
      id
      frontmatter {
        title
        description
        dateOriginal: date
        dateFormatted: date(formatString: "DD MMMM YYYY", locale: "pl")
        featuredImg {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH)
          }
        }
        featuredImgAlt
      }
    }
    previous: mdx(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: mdx(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
