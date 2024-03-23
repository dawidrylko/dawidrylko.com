import React from 'react';
import { PageProps, Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Title = 'Bio';

const BioPage: React.FC<PageProps> = ({ location }) => {
  const { siteTitle } = useSiteMetadata();

  return (
    <Layout location={location} title={siteTitle}>
      <h1>{Title}</h1>
      <Bio />
      <StaticImage
        src="../images/motto.jpg"
        alt="Zdjęcie, którym znajduje się graffiti, przedstawiające czarno-biały wizerunek Charlie Chaplina oraz zawierające cytat: 'A day without laughter is a day wasted'."
        placeholder="blurred"
        layout="fullWidth"
      />
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
    description="Wszystko trzeba wymyślać od nowa, ponieważ dni nie mogą przepadać w przeszłości, wypełnione jedynie pejzażem, nieruchomą, niezmienną materią, która w końcu strząśnie nas ze swojego cielska, strzepnie jak te wszystkie drobne incydenty, te twarze oraz istnienia nie dłuższe niż jedno spojrzenie."
  />
);

export default BioPage;
