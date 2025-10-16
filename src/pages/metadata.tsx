import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, CollectionPage } from 'schema-dts';
import { graphql, Link } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useStructuredData } from '../hooks/use-structured-data';

type DataType = {
  nonBlogPages: { pageCount: number; pagePaths: string[] };
  blogPosts: { postCount: number; postPaths: { fields: { slug: string } }[] };
  site: {
    siteMetadata: { siteTitle: string; siteDescription: string };
    buildTime: string;
  };
};

const createMetadataArray = ({
  nonBlogPages: { pageCount },
  blogPosts: { postCount },
  site: {
    buildTime,
    siteMetadata: { siteTitle, siteDescription },
  },
}: DataType) => [
  ['Title', siteTitle],
  ['Description', siteDescription],
  ['Build time', buildTime],
  ['Pages', pageCount.toString()],
  ['Blog posts', postCount.toString()],
];

const createNonBlogPagesArray = ({ nonBlogPages: { pagePaths } }: DataType) =>
  pagePaths.map((path, index) => [
    (index + 1).toString(),
    <Link key={path} to={path}>
      {path}
    </Link>,
  ]);

const createBlogPostsArray = ({ blogPosts: { postPaths } }: DataType) =>
  postPaths
    .map(({ fields: { slug } }) => slug)
    .map((path, index) => [
      (index + 1).toString(),
      <Link key={path} to={path}>
        {path}
      </Link>,
    ]);

const PAGE_METADATA = {
  title: 'Metadata',
  description:
    'Technical metadata and comprehensive site statistics for dawidrylko.com. View build information, content inventory, page structure, and blog post directory—complete transparency into website architecture and content organization.',
  keywords: [
    'site metadata',
    'website statistics',
    'build information',
    'site structure',
    'content inventory',
    'blog directory',
    'technical details',
    'website architecture',
  ],
};

const MetadataPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: PAGE_METADATA.title,
    headline: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    author: person,
    keywords: PAGE_METADATA.keywords.join(', '),
    about: [
      {
        '@type': 'Thing',
        name: 'Site Information',
        description: 'Technical metadata including build time, content statistics, and website configuration details.',
      },
      {
        '@type': 'Thing',
        name: 'Content Structure',
        description: 'Complete inventory of static pages and blog posts with navigation paths.',
      },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: 'Site Content Inventory',
      description: 'Complete list of all pages and blog posts on the website',
      numberOfItems: data.nonBlogPages.pageCount + data.blogPosts.postCount,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<CollectionPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <main>
        <section id="site-info" aria-label="Site Information">
          <h2>Site Information</h2>
          <Table data={createMetadataArray(data)} header={['Property', 'Value']} widthConfig={['30%', '70%']} />
        </section>
        <section id="pages" aria-label="Pages">
          <h2>Pages</h2>
          <Table data={createNonBlogPagesArray(data)} header={['#', 'Path']} widthConfig={['10%', '90%']} />
        </section>
        <section id="blog-posts" aria-label="Blog Posts">
          <h2>Blog Posts</h2>
          <Table data={createBlogPostsArray(data)} header={['#', 'Path']} widthConfig={['10%', '90%']} />
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;

export default MetadataPage;

export const query = graphql`
  {
    site {
      siteMetadata {
        siteTitle
        siteDescription
      }
      buildTime(formatString: "YYYY-MM-DD HH:mm:ss")
    }
    nonBlogPages: allSitePage(filter: { component: { regex: "/^(?!.*templates/blog-post).*$/" } }) {
      pageCount: totalCount
      pagePaths: distinct(field: { path: SELECT })
    }
    blogPosts: allMdx(sort: { frontmatter: { date: DESC } }) {
      postCount: totalCount
      postPaths: nodes {
        fields {
          slug
        }
      }
    }
  }
`;
