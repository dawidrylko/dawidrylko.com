import React from 'react';
import { PageProps, Link, graphql, HeadFC } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';

type MetadataItem = {
  key: string;
  value: string;
};

type DataProps = {
  site: {
    siteMetadata: {
      title: string;
      description: string;
    };
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
  siteMetadata,
  buildTime,
}: DataProps['site']) => [
  { key: 'Title', value: siteMetadata.title },
  { key: 'Description', value: siteMetadata.description },
  { key: 'Build time', value: buildTime },
];

const Metadata: React.FC<PageProps<DataProps>> = ({ data, location }) => (
  <Layout title="Metadata" location={location}>
    <Table data={createMetadataArray(data.site)} />
    <Link to="/">Go back to the homepage</Link>
  </Layout>
);

export const Head: HeadFC<DataProps> = () => <Seo title="Metadata" />;

export default Metadata;

export const query = graphql`
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
