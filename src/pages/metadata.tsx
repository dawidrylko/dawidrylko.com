import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { graphql, Link } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';

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

const title = 'Metadata';
const description =
  'Technical metadata and site statistics for dawidrylko.com, including build details, page counts, and structure overview.';

const MetadataPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  return (
    <Layout location={location} breadcrumbTitle={title}>
      <header>
        <h1>{title}</h1>
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

export const Head: HeadFC = () => <Seo title={title} description={description} />;

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
