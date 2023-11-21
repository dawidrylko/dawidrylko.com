import React from 'react';
import { Link, graphql } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';

const NotFoundPage = function ({ data, location }) {
  const siteTitle =
    data.site.siteMetadata?.title || '68 97 119 105 100 32 82 121 108 107 111';

  return (
    <Layout location={location} title={siteTitle}>
      <h1>Nie znaleziono strony</h1>
      <p>Kiedyś byłem ninja^2, teraz nawet strony brakuje 😔</p>
      <Link to="/">Wróć na stronę główną</Link>
    </Layout>
  );
};

export const Head = function () {
  return (
    <Seo
      title="Nie znaleziono strony 😶"
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
