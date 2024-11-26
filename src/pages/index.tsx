import type { PageProps } from 'gatsby';

import * as React from 'react';
import { Link, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

type DataProps = {
  allMdx: {
    nodes: {
      fields: {
        slug: string;
      };
      frontmatter: {
        title: string;
        description: string;
        dateOriginal: string;
        dateFormatted: string;
        featuredImg: {
          childImageSharp: {
            gatsbyImageData: any;
          };
        };
        featuredImgAlt: string;
      };
      excerpt: string;
    }[];
  };
};

const BlogIndex: React.FC<PageProps<DataProps>> = ({ data, location }) => {
  const { siteAuthor } = useSiteMetadata();
  const posts = data?.allMdx.nodes;

  if (posts.length === 0) {
    return (
      <Layout location={location}>
        <p>Nie znaleziono wpisów.</p>
        <Bio />
      </Layout>
    );
  }

  return (
    <Layout location={location}>
      <Bio />
      <hr />
      <ol className="posts">
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug;
          const description = post.frontmatter.description || post.excerpt;
          const img = getImage(post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData || null);

          return (
            <li key={post.fields.slug}>
              <article className="post-list-item" itemScope itemType="http://schema.org/Article">
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                  <small>
                    <span itemProp="datePublished" content={post.frontmatter.dateOriginal}>
                      {post.frontmatter.dateFormatted}
                    </span>
                    &nbsp;|&nbsp;
                    <span itemProp="author" itemScope itemType="https://schema.org/Person">
                      <Link itemProp="url" to="/bio">
                        <span itemProp="name">{siteAuthor?.name}</span>
                      </Link>
                    </span>
                  </small>
                </header>
                <section>
                  {img && <GatsbyImage itemProp="image" image={img} alt={post.frontmatter.featuredImgAlt || ''} />}
                  <p
                    dangerouslySetInnerHTML={{
                      __html: description || '',
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          );
        })}
      </ol>
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;

export const query = graphql`
  {
    allMdx(sort: { frontmatter: { date: DESC } }) {
      nodes {
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
        excerpt
      }
    }
  }
`;
