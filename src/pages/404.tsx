import React from 'react';
import { PageProps, Link, graphql, HeadFC } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Title = 'Nie znaleziono strony';

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  const { siteTitle } = useSiteMetadata();

  return (
    <Layout location={location} title={siteTitle}>
      <h1>{Title}</h1>
      <p>Tej strony brakuje, ponieważ wyskoczyłem na hot-doga... 🌭</p>
      <StaticImage
        src="../images/hot-dog.jpg"
        alt="Zdjęcie przedstawiające pomnik uśmiechniętego hot-doga."
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
    description="Nie ma nic ciekawego na tej stronie, tym bardziej jej opisu."
  />
);

export default NotFoundPage;
