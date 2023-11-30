import React from 'react';
import { Link, graphql } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

const Title = 'Nie znaleziono strony';

const NotFoundPage = function ({ data, location }) {
  const siteTitle =
    data.site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

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

export const Head = function () {
  return (
    <Seo
      title={Title}
      description="Nie ma nic ciekawego na tej stronie, tym bardziej jej opisu."
    />
  );
};

export default NotFoundPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
