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

const createMetadataArray = ({ siteMetadata, buildTime }: DataType['site']) => [
  { key: 'Title', value: siteMetadata.title },
  { key: 'Description', value: siteMetadata.description },
  { key: 'Build time', value: buildTime },
];

const Title = 'Metadata 🤖';

const MetadataPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  const siteTitle =
    data.site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

  return (
    <Layout location={location} title={siteTitle}>
      <h1>{Title}</h1>
      <Table data={createMetadataArray(data.site)} />
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
  }
`;
