import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WebPage, WithContext } from 'schema-dts';
import type { HeadFC, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

const title = 'Page Not Found';
const description = 'The page you are looking for does not exist. Maybe it went out for a hot dog... 🌭';

const hotDogImage = {
  alt: 'Statue of a smiling hot dog character with arms, legs, and a face, sitting on a rock.',
  caption: 'Photo by Dawid Ryłko, taken on September 8, 2017, in Crete, Greece.',
};

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
    mainEntity: {
      '@type': 'CreativeWork',
      description,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="hot-dog" aria-label="Page not found message with hot dog image">
          <p>{description}</p>
          <figure style={{ margin: 0 }}>
            <StaticImage src="../images/hot-dog.jpg" alt={hotDogImage.alt} placeholder="blurred" layout="fullWidth" />
            <figcaption>{hotDogImage.caption}</figcaption>
          </figure>
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => (
  <Seo title={title} description="This is a 404 page. It seems the page you were looking for does not exist." noIndex />
);

export default NotFoundPage;
