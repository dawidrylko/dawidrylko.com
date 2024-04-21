import type { HeadFC, PageProps } from 'gatsby';

import * as React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';

const title = 'Nie znaleziono strony';

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <h1>{title}</h1>
      <p>Tej strony brakuje, ponieważ wyskoczyłem na hot-doga... 🌭</p>
      <StaticImage
        src="../images/hot-dog.jpg"
        alt="Zdjęcie przedstawiające pomnik uśmiechniętego hot-doga."
        placeholder="blurred"
        layout="fullWidth"
      />
      <hr />
      <ReturnLink />
    </Layout>
  );
};

export const Head: HeadFC = () => (
  <Seo title={title} description="Nie ma nic ciekawego na tej stronie, tym bardziej jej opisu." />
);

export default NotFoundPage;
