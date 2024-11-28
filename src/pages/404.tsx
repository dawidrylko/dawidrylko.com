import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WebPage, WithContext } from 'schema-dts';
import type { HeadFC, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import imgSource from '../images/hot-dog.jpg';

const title = 'Page Not Found';
const description = 'This page is missing because I went out for a hot dog... 🌭';

const hotDogImage = {
  alt: 'Statue of a smiling hot dog character with arms, legs, and a face, sitting on a rock.',
  caption: 'Photo by Dawid Ryłko. Taken on September 8, 2017, in Crete, Greece.',
};

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  const { siteUrl } = useSiteMetadata();

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
    mainEntity: {
      '@type': 'CreativeWork',
      description,
      image: {
        '@type': 'ImageObject',
        contentUrl: `${siteUrl}${imgSource}`,
        description: hotDogImage.caption,
      },
    },
  };

  return (
    <Layout location={location}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="hot-dog">
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
  <Seo title={title} description="There is nothing interesting on this page, not even a description." noIndex />
);

export default NotFoundPage;
