import React from 'react';
import { Link, graphql, PageProps, HeadFC } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';

interface PostNode {
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
  excerpt?: string;
}

type SiteMetadata = {
  title: string;
  author?: {
    name: string;
  };
};

type DataType = {
  site: {
    siteMetadata?: SiteMetadata;
  };
  allMarkdownRemark: {
    nodes: PostNode[];
  };
};

const BlogIndex: React.FC<PageProps<DataType>> = ({ data, location }) => {
  const siteTitle =
    data.site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';
  const posts = data.allMarkdownRemark.nodes;

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <p>Nie znaleziono wpisów.</p>
        <Bio />
      </Layout>
    );
  }

  return (
    <Layout location={location} title={siteTitle}>
      <ol className="posts">
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug;
          const img = getImage(
            post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData ||
              null,
          );

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
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
                        <span itemProp="name">
                          {data.site.siteMetadata?.author?.name}
                        </span>
                      </Link>
                    </span>
                  </small>
                </header>
                <section>
                  {img && (
                    <GatsbyImage
                      itemProp="image"
                      image={img}
                      alt={post.frontmatter.featuredImgAlt || ''}
                    />
                  )}
                  <p
                    dangerouslySetInnerHTML={{
                      __html:
                        post.frontmatter.description || post.excerpt || '',
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          );
        })}
      </ol>
      <hr />
      <Bio />
    </Layout>
  );
};

export default BlogIndex;

export const Head: HeadFC<DataType> = () => <Seo title="Home" />;

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        author {
          name
        }
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { draft: { ne: true }, homePage: { ne: false } } }
    ) {
      nodes {
        excerpt
        fields {
          slug
        }
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
    }
  }
`;
