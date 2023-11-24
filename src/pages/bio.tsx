import React from 'react';
import { PageProps, Link, graphql, HeadFC } from 'gatsby';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';

type DataProps = {
  site: {
    siteMetadata: {
      title: string;
      description: string;
    };
  };
};

const Title = 'Bio';
const Metadata: React.FC<PageProps<DataProps>> = ({ data, location }) => {
  const siteTitle =
    data.site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

  return (
    <Layout location={location} title={siteTitle}>
      <h1>{Title}</h1>
      <Bio />
      <Link to="/">Wróć na stronę główną</Link>
    </Layout>
  );
};

export const Head: HeadFC<DataProps> = () => (
  <Seo
    title={Title}
    description="Wszystko trzeba wymyślać od nowa, ponieważ dni nie mogą przepadać w przeszłości, wypełnione jedynie pejzażem, nieruchomą, niezmienną materią, która w końcu strząśnie nas ze swojego cielska, strzepnie jak te wszystkie drobne incydenty, te twarze oraz istnienia nie dłuższe niż jedno spojrzenie."
  />
);

export default Metadata;

export const query = graphql`
  {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`;
