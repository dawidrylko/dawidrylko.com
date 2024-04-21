import type { PageProps, HeadFC } from 'gatsby';

import * as React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';

const title = 'Bio';

const BioPage: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <h1>{title}</h1>
      <Bio />
      <StaticImage
        src="../images/motto.jpg"
        alt="Zdjęcie, którym znajduje się graffiti, przedstawiające czarno-biały wizerunek Charlie Chaplina oraz zawierające cytat: 'A day without laughter is a day wasted'."
        placeholder="blurred"
        layout="fullWidth"
      />
      <hr />
      <ReturnLink />
    </Layout>
  );
};

export const Head: HeadFC = () => (
  <Seo
    title={title}
    description="Wszystko trzeba wymyślać od nowa, ponieważ dni nie mogą przepadać w przeszłości, wypełnione jedynie pejzażem, nieruchomą, niezmienną materią, która w końcu strząśnie nas ze swojego cielska, strzepnie jak te wszystkie drobne incydenty, te twarze oraz istnienia nie dłuższe niż jedno spojrzenie."
  />
);

export default BioPage;
