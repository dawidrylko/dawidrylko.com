import React from 'react';
import { Link, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';

import 'katex/dist/katex.min.css';

const BlogPostTemplate = function ({
  data: { previous, next, site, markdownRemark: post },
  location,
}) {
  const siteTitle =
    site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

  const img = getImage(
    post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData,
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
          dangerouslySetInnerHTML={{ __html: post.html }}
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

export const Head = function ({ data: { markdownRemark: post } }) {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
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
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
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
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
