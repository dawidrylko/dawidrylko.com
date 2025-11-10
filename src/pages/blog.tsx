import type { PageProps } from 'gatsby';

import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { Person, Blog, WithContext } from 'schema-dts';
import { Link, graphql } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData, StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

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
            gatsbyImageData: IGatsbyImageData;
          };
        };
        featuredImgAlt: string;
      };
      excerpt: string;
    }[];
  };
};

const PAGE_METADATA = {
  title: 'Blog 🇵🇱',
  description:
    'Artykuły i wpisy na blogu Dawida Ryłko o programowaniu, technologiach, architekturze systemów i rozwoju oprogramowania. Praktyczne porady, spostrzeżenia ze świata IT i nowoczesne podejście do tworzenia aplikacji webowych.',
  keywords: [
    'blog programistyczny',
    'artykuły IT',
    'rozwój oprogramowania',
    'architektura systemów',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'frontend development',
    'backend development',
  ],
};

const BlogIndex: React.FC<PageProps<DataProps>> = ({ data, location }) => {
  const { siteAuthor } = useSiteMetadata();
  const { person } = useStructuredData() as { person: WithContext<Person> };
  const posts = data?.allMdx.nodes;

  if (posts.length === 0) {
    return (
      <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
        <p>Nie znaleziono wpisów.</p>
      </Layout>
    );
  }

  const structuredData: WithContext<Blog> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: PAGE_METADATA.title,
    headline: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    keywords: PAGE_METADATA.keywords.join(', '),
    author: person,
    inLanguage: 'pl',
    blogPost: posts.map(post => {
      const img = getImage(post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData || null);

      return {
        '@type': 'BlogPosting',
        headline: post.frontmatter.title,
        description: post.frontmatter.description || post.excerpt,
        datePublished: post.frontmatter.dateOriginal,
        author: {
          '@type': 'Person',
          name: siteAuthor?.name,
        },
        image: img
          ? {
              '@type': 'ImageObject',
              url: post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData?.images?.fallback?.src || '',
              description: post.frontmatter.featuredImgAlt || '',
            }
          : undefined,
        url: `${location.origin}${post.fields.slug}`,
      };
    }),
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<Blog> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <div className="rss">
        <StaticImage src="../images/rss.svg" alt="Ikona RSS" placeholder="blurred" width={20} height={20} />
        <a href="/rss.xml" type="application/rss+xml">
          Subskrybuj kanał RSS
        </a>
      </div>
      <ol className="posts">
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug;
          const description = post.frontmatter.description || post.excerpt;
          const img = getImage(post.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData || null);

          return (
            <li key={post.fields.slug}>
              <article className="post-list-item">
                <header>
                  <h2>
                    <Link to={post.fields.slug}>{title}</Link>
                  </h2>
                  <small>
                    <span>{post.frontmatter.dateFormatted}</span>
                    &nbsp;|&nbsp;
                    <span>
                      <Link to="/bio/">{siteAuthor?.name}</Link>
                    </span>
                  </small>
                </header>
                <section>
                  {img && <GatsbyImage image={img} alt={post.frontmatter.featuredImgAlt || ''} />}
                  <p
                    dangerouslySetInnerHTML={{
                      __html: description || '',
                    }}
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

export const Head = () => <Seo lang="pl" title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;

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
