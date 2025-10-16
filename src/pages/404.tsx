import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WebPage, WithContext } from 'schema-dts';
import type { HeadFC, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

const PAGE_METADATA = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist. Maybe it went out for a hot dog... 🌭',
};

const hotDogImage = {
  alt: 'Statue of a smiling hot dog character with arms, legs, and a face, sitting on a rock.',
  caption: 'Photo by Dawid Ryłko, taken on September 8, 2017, in Crete, Greece.',
};

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_METADATA.title,
    headline: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    mainEntity: {
      '@type': 'CreativeWork',
      name: '404 Error',
      description: PAGE_METADATA.description,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <main>
        <section id="hot-dog" aria-label="Page not found message with hot dog image">
          <p>{PAGE_METADATA.description}</p>
          <figure style={{ margin: 0 }}>
            <StaticImage src="../images/hot-dog.jpg" alt={hotDogImage.alt} placeholder="blurred" layout="fullWidth" />
            <figcaption>{hotDogImage.caption}</figcaption>
          </figure>
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} noIndex />;

export default NotFoundPage;
