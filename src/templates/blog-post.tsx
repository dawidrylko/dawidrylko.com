import * as React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage, BlogPosting, Person } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

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
  const { person } = useStructuredData() as { person: WithContext<Person> };
  const { previous, next, mdx: post } = data;

  const img = getImage(post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData || null);

  const structuredData: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.description || '',
    datePublished: post.frontmatter.dateOriginal,
    author: person,
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
    <Layout location={location}>
      <JsonLd<BlogPosting> item={structuredData} />
      <article className="blog-post">
        <header>
          <h1>{post.frontmatter.title}</h1>
          <small>
            <span>{post.frontmatter.dateFormatted}</span>
            &nbsp;|&nbsp;
            <span>
              <Link to="/bio">{siteAuthor?.name}</Link>
            </span>
          </small>
        </header>
        {img && <GatsbyImage image={img} alt={post.frontmatter.featuredImgAlt || ''} />}
        <section>{children}</section>
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

export const Head = function ({ data: { mdx: post } }: any) {
  return <Seo lang="pl" title={post.frontmatter.title} description={post.frontmatter.description || ''} />;
};

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
