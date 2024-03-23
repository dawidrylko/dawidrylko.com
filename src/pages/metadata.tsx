import React from 'react';
import { PageProps, Link, graphql, HeadFC } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

type MetadataItem = {
  key: string;
  value: string;
};

type DataType = {
  nonBlogPages: { pageCount: number; pagePaths: string[] };
  blogPosts: { postCount: number; postPaths: { fields: { slug: string } }[] };
  site: { buildTime: string };
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

const createMetadataArray = (
  {
    nonBlogPages: { pageCount },
    blogPosts: { postCount },
    site: { buildTime },
  }: DataType,
  siteMetadata,
) => [
  { key: 'Title', value: siteMetadata.siteTitle },
  { key: 'Description', value: siteMetadata.siteDescription },
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

const Title = 'Metadata 🤖';

const MetadataPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  const siteMetadata = useSiteMetadata();

  return (
    <Layout location={location} title={siteMetadata.siteTitle}>
      <h1>{Title}</h1>
      <Table data={createMetadataArray(data, siteMetadata)} />
      <h2>Pages</h2>
      <Table data={createNonBlogPagesArray(data)} />
      <h2>Blog posts</h2>
      <Table data={createBlogPostsArray(data)} />
      <hr />
      <Link to="/" className="static-link">
        Wróć na stronę główną
      </Link>
    </Layout>
  );
};

export const Head = () => (
  <Seo
    title={Title}
    description="Ta strona jest do użytku wewnętrznego. Jeżeli już tu trafiłeś to musisz się bardzo nudzić."
  />
);

export default MetadataPage;

export const query = graphql`
  {
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
    site {
      buildTime(formatString: "YYYY-MM-DD HH:mm:ss")
    }
  }
`;
