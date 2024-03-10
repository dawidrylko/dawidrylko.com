import React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';

type PostNode = {
  frontmatter: {
    title: string;
    description?: string;
    dateFormatted?: string;
    dateOriginal?: string;
    featuredImg?: {
      childImageSharp?: {
        gatsbyImageData: IGatsbyImageData;
      };
    };
    featuredImgAlt?: string;
  };
  fields: {
    slug: string;
  };
};

type SiteMetadata = {
  title: string;
  description?: string;
  siteUrl?: string;
  image?: string;
  social?: {
    twitter?: string;
  };
  author: {
    name: string;
  };
};

type Data = {
  site: {
    siteMetadata?: SiteMetadata;
  };
  mdx: PostNode;
  previous: PostNode;
  next: PostNode;
};

const BlogPostTemplate: React.FC<PageProps<Data>> = ({ data, location, children }) => {
  const { previous, next, site, mdx: post } = data;
  const siteTitle =
    site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

  const img = getImage(
    post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData || null,
  );

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <small>
            <span
              itemProp="datePublished"
              content={post.frontmatter.dateOriginal}
            >
              {post.frontmatter.dateFormatted}
            </span>
            &nbsp;|&nbsp;
            <span
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <Link itemProp="url" to="/bio">
                <span itemProp="name">{site.siteMetadata?.author?.name}</span>
              </Link>
            </span>
          </small>
        </header>
        {img && (
          <GatsbyImage
            itemProp="image"
            image={img}
            alt={post.frontmatter.featuredImgAlt || ''}
          />
        )}
        <section
          dangerouslySetInnerHTML={children}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Bio />
        </footer>
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

export const Head = function ({ data: { mdx: post } }) {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || ''}
    />
  );
};

export default BlogPostTemplate;

export const blogPageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
        author {
          name
        }
      }
    }
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
