import type { HeadFC, PageProps } from 'gatsby';

import * as React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';

type MetadataItem = {
  key: string;
  value: string;
};

type DataType = {
  nonBlogPages: { pageCount: number; pagePaths: string[] };
  blogPosts: { postCount: number; postPaths: { fields: { slug: string } }[] };
  site: {
    siteMetadata: { siteTitle: string; siteDescription: string };
    buildTime: string;
  };
};

const Table: React.FC<{ data: MetadataItem[] }> = ({ data }) => (
  <table>
    <tbody>
      {data.map((item, index) => (
        <tr key={index}>
          <td>{item.key}</td>
          <td>{item.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const createMetadataArray = ({
  nonBlogPages: { pageCount },
  blogPosts: { postCount },
  site: {
    buildTime,
    siteMetadata: { siteTitle, siteDescription },
  },
}: DataType) => [
  { key: 'Title', value: siteTitle },
  { key: 'Description', value: siteDescription },
  { key: 'Build time', value: buildTime },
  { key: 'Pages', value: pageCount.toString() },
  { key: 'Blog posts', value: postCount.toString() },
];

const createNonBlogPagesArray = ({ nonBlogPages: { pagePaths } }: DataType) =>
  pagePaths.map((path, index) => ({
    key: (index + 1).toString(),
    value: path,
  }));

const createBlogPostsArray = ({ blogPosts: { postPaths } }: DataType) =>
  postPaths
    .map(({ fields: { slug } }) => slug)
    .map((path, index) => ({
      key: (index + 1).toString(),
      value: path,
    }));

const title = 'Metadata 🤖';

const MetadataPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  return (
    <Layout location={location}>
      <h1>{title}</h1>
      <Table data={createMetadataArray(data)} />
      <h2>Pages</h2>
      <Table data={createNonBlogPagesArray(data)} />
      <h2>Blog posts</h2>
      <Table data={createBlogPostsArray(data)} />
      <hr />
      <ReturnLink />
    </Layout>
  );
};

export const Head: HeadFC = () => (
  <Seo
    title={title}
    description="Ta strona jest do użytku wewnętrznego. Jeżeli już tu trafiłeś to musisz się bardzo nudzić."
  />
);

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
    nonBlogPages: allSitePage(
      filter: { component: { regex: "/^(?!.*templates/blog-post).*$/" } }
    ) {
      pageCount: totalCount
      pagePaths: distinct(field: { path: SELECT })
    }
    blogPosts: allMdx(sort: { frontmatter: { date: ASC } }) {
      postCount: totalCount
      postPaths: nodes {
        fields {
          slug
        }
      }
    }
  }
`;
