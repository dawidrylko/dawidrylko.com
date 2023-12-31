import React from 'react';
import { PageProps, Link, graphql, HeadFC } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';

type MetadataItem = {
  key: string;
  value: string;
};

type SiteMetadata = {
  title: string;
  description: string;
};

type Site = {
  siteMetadata: SiteMetadata;
  buildTime: string;
};

type DataType = {
  site: Site;
  nonBlogPages: { pageCount: number; pagePaths: string[] };
  blogPosts: { postCount: number; postPaths: string[] };
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
  site: { siteMetadata, buildTime },
  nonBlogPages: { pageCount },
  blogPosts: { postCount },
}: DataType) => [
  { key: 'Title', value: siteMetadata.title },
  { key: 'Description', value: siteMetadata.description },
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
  postPaths.map((path, index) => ({
    key: (index + 1).toString(),
    value: path,
  }));

const Title = 'Metadata 🤖';

const MetadataPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  const siteTitle =
    data.site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

  return (
    <Layout location={location} title={siteTitle}>
      <h1>{Title}</h1>
      <Table data={createMetadataArray(data)} />
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

export const Head: HeadFC<DataType> = () => (
  <Seo
    title={Title}
    description="Ta strona jest do użytku wewnętrznego. Jeżeli już tu trafiłeś to musisz się bardzo nudzić."
  />
);

export default MetadataPage;

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        description
      }
      buildTime(formatString: "YYYY-MM-DD hh:mm a z")
    }
    nonBlogPages: allSitePage(
      filter: { component: { regex: "/^(?!.*templates/blog-post).*$/" } }
    ) {
      pageCount: totalCount
      pagePaths: distinct(field: path)
    }
    blogPosts: allMarkdownRemark {
      postCount: totalCount
      postPaths: distinct(field: fields___slug)
    }
  }
`;
