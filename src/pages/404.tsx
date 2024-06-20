import type { HeadFC, PageProps } from 'gatsby';

import * as React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';

const title = 'Page Not Found';

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="hot-dog">
          <p>This page is missing because I went out for a hot dog... 🌭</p>
          <figure style={{ margin: 0 }}>
            <StaticImage
              src="../images/hot-dog.jpg"
              alt="Statue of a smiling hot dog character with arms, legs, and a face, sitting on a rock."
              placeholder="blurred"
              layout="fullWidth"
            />
            <figcaption>Photo by Dawid Ryłko. Taken on September 8, 2017, in Crete, Greece.</figcaption>
          </figure>
        </section>
      </main>
      <footer>
        <hr />
        <ReturnLink />
      </footer>
    </Layout>
  );
};

export const Head: HeadFC = () => (
  <Seo lang="en" title={title} description="There is nothing interesting on this page, not even a description." />
);

export default NotFoundPage;
