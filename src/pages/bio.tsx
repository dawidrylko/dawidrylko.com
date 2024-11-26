import type { PageProps, HeadFC } from 'gatsby';

import * as React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';
import { SITE_METADATA } from '../constants/site-metadata';

const title = 'Bio';

const BioPage: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <header vocab="http://schema.org" typeof="WebPage">
        <h1 property="headline">{title}</h1>
        <Bio />
      </header>
      <main>
        <section id="personal-intro" property="about">
          <p>
            Writing about myself? Nah, that's not really my thing 😎. But check out the quote and picture below 📸 -
            they're like my personal motto. They capture me better than I ever could! ✨
          </p>
        </section>
        <section id="quote" typeof="CreativeWork">
          <h2>Favourite Quote</h2>
          <blockquote property="citation">
            Wszystko trzeba wymyślać od nowa, ponieważ dni nie mogą przepadać w przeszłości, wypełnione jedynie
            pejzażem, nieruchomą, niezmienną materią, która w końcu strząśnie nas ze swojego cielska, strzepnie jak te
            wszystkie drobne incydenty, te twarze oraz istnienia nie dłuższe niż jedno spojrzenie.
            <br />
            <cite>
              — Andrzej Stasiuk, <i>Jadąc do Babadag</i>
            </cite>
          </blockquote>
          <blockquote property="citation">
            Everything must be invented anew, because days cannot vanish into the past, filled only with landscapes, the
            motionless, unchanging matter that will eventually shake us off its body, brush us away like all those small
            incidents, those faces and existences no longer than a single glance.
            <br />
            <cite>
              — Andrzej Stasiuk, <i>On the Road to Babadag</i>
            </cite>
            <br />
            <small>
              <a
                href="https://chatgpt.com/share/527def35-a739-4d85-9b66-078f677c1abf"
                target="_blank"
                rel="noopener noreferrer"
                property="url"
              >
                Translated by ChatGPT.
              </a>
            </small>
          </blockquote>
        </section>
        <figure style={{ margin: '0' }} vocab="http://schema.org" typeof="ImageObject">
          <StaticImage
            src="../images/motto.jpg"
            alt="Graffiti on a utility box featuring a black-and-white image of Charlie Chaplin with the quote: 'A day without laughter is a day wasted'."
            placeholder="blurred"
            layout="fullWidth"
            property="image"
          />
          <figcaption property="description">
            Photo by Dawid Ryłko. Taken on September 7, 2017, in Malia, Greece.
          </figcaption>
        </figure>
        <section id="contact" typeof="ContactPoint">
          <h2>Contact</h2>
          <p property="description">
            If you have any questions or would like to get in touch, feel free to contact me via email.
          </p>
          <a href={`mailto:${SITE_METADATA.author.email}`} property="email" title="Email Me">
            Email Me
          </a>
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
  <Seo
    lang="en"
    title={title}
    description="Everything needs to be invented anew, because days cannot vanish into the past, filled only with landscape, with motionless, unchanging matter that will eventually shake us off its body, shrugging us off like all those minor incidents, those faces, and existences no longer than a single glance."
  />
);

export default BioPage;
