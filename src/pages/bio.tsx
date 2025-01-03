import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { Person, WebPage, WithContext } from 'schema-dts';
import type { PageProps, HeadFC } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useStructuredData } from '../hooks/use-structured-data';

const title = 'Bio 🥷';

const citations = [
  {
    authorName: 'Andrzej Stasiuk',
    citation: 'Jadąc do Babadag',
    text: 'Wszystko trzeba wymyślać od nowa, ponieważ dni nie mogą przepadać w przeszłości, wypełnione jedynie pejzażem, nieruchomą, niezmienną materią, która w końcu strząśnie nas ze swojego cielska, strzepnie jak te wszystkie drobne incydenty, te twarze oraz istnienia nie dłuższe niż jedno spojrzenie.',
  },
  {
    authorName: 'Andrzej Stasiuk',
    citation: 'On the Road to Babadag',
    text: 'Everything must be invented anew, for days cannot vanish into the past, filled only with landscapes, with still, unchanging matter that will eventually shake us off its vast body, brushing us aside like all those fleeting incidents, those faces, those existences no longer than a single glance.',
    extraDetails: [
      {
        type: 'translation',
        url: 'https://chatgpt.com/share/6777b0af-4574-8009-a644-1be940b1f63d',
        note: 'Translated by ChatGPT.',
      },
    ],
  },
];

const image = {
  alt: `Graffiti on a utility box featuring a black-and-white image of Charlie Chaplin with the quote: 'A day without laughter is a day wasted'.`,
  figcaption: `Photo by Dawid Ryłko. Taken on September 7, 2017, in Malia, Greece.`,
};

const BioPage: React.FC<PageProps> = ({ location }) => {
  const { person } = useStructuredData() as { person: WithContext<Person> };
  const { siteAuthor } = useSiteMetadata();

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
    about: {
      '@type': 'CreativeWork',
      name: 'Favourite Quote',
      citation: citations.map(({ authorName, citation, text }) => ({
        '@type': 'Quotation',
        text,
        author: {
          '@type': 'Person',
          name: authorName,
        },
        citation,
      })),
    },
    mainEntity: person,
  };

  return (
    <Layout location={location}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="personal-intro">
          <h2>About Me</h2>
          <p>
            Writing about myself? Nah, that&apos;s not really my thing 😎. But check out the quote and picture below 📸
            - they&apos;re like my personal motto. They capture me better than I ever could! ✨
          </p>
        </section>
        <section id="quote">
          <h2>Favourite Quote</h2>
          {citations.map(({ authorName, citation, text }, index) => (
            <blockquote key={index}>
              {text}
              <br />
              <cite>
                — {authorName}, {citation}
              </cite>
              {citations[index].extraDetails?.map(({ type, url, note }) => (
                <React.Fragment key={type}>
                  <br />
                  <small>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {note}
                    </a>
                  </small>
                </React.Fragment>
              ))}
            </blockquote>
          ))}
        </section>
        <figure style={{ margin: '0' }}>
          <StaticImage src="../images/motto.jpg" alt={image.alt} placeholder="blurred" layout="fullWidth" />
          <figcaption>{image.figcaption}</figcaption>
        </figure>
        <section id="contact">
          <h2>Contact</h2>
          <p>If you have any questions or would like to get in touch, feel free to contact me via email.</p>
          <a href={`mailto:${siteAuthor.email}`} title="Email Me">
            Email Me
          </a>
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description={citations[1].text} />;

export default BioPage;
