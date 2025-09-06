import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useStructuredData } from '../hooks/use-structured-data';

const hardwareSetup = [
  [
    'Computer',
    'Mac mini 2024, Apple M4, 16 GB RAM, 256 GB SSD, Gigabit Ethernet',
    'https://www.ceneo.pl/175355357#crid=774126&pid=29997',
  ],
  [
    'Monitor',
    'iiyama G-Master GCB3481WQSU-B1, 34″ UWQHD, 180 Hz',
    'https://www.ceneo.pl/173264024#crid=774128&pid=29997',
  ],
  ['Mouse', 'Logitech MX Master 3S', 'https://www.ceneo.pl/134359846#crid=774131&pid=29997', 'Graphite'],
  ['Keyboard', 'NuPhy Air75', null, 'Gateron G Pro Red switches'],
  ['Microphone', 'Novox NC-1', null, 'USB-B connection'],
  ['Light Bar', 'Xiaomi Mi Computer Monitor Light Bar', 'https://www.ceneo.pl/103206620#crid=774129&pid=29997'],
  ['KVM Switch', 'UGREEN DP 1.4 KVM Switch, 8K@60 Hz', null, ''],
  ['Cable', 'UGREEN USB-C ↔ DisplayPort 1.4, 32.4 Gbps, 8K@60 Hz', null, '2 pcs, 1 m each'],
  ['Cable', 'Thunderbolt 5 USB-C ↔ USB-C, 80 Gbps, 240 W PD, 16K@30 Hz', null, '0.5 m'],
  ['Cable', 'Thunderbolt 5 USB-C ↔ USB-C, 80 Gbps, 240 W PD, 16K@30 Hz', null, '1 m'],
  ['Desk Frame', 'Silver Monkey EDF-180', 'https://www.ceneo.pl/174808555#crid=774135&pid=29997', 'White'],
  ['Desktop', 'Oak Rustic Desktop', null, '100 × 60 × 3 cm'],
  ['NAS', 'Synology DiskStation DS423+', 'https://www.ceneo.pl/149801785#crid=774138&pid=29997', ''],
  [
    'Storage',
    'WD Red Plus, 4 TB, HDD, SATA III, 5400 RPM',
    'https://www.ceneo.pl/143972868#crid=774140&pid=29997',
    'Data, 2 pcs',
  ],
  ['Storage', 'WD Red SN700, 500 GB, M.2 NVMe', 'https://www.ceneo.pl/119197771#crid=774139&pid=29997', 'Cache, 2 pcs'],
];

const title = 'Setup';
const description =
  "Discover Dawid Ryłko's complete computer setup - from Mac mini M4 and ultrawide monitor to NAS storage and cable management. A detailed overview of hardware, peripherals, and tools used for professional software development.";

const SetupPage: React.FC<PageProps> = ({ location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    headline: title,
    mainEntity: {
      ...person,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="hardware">
          <h2>Hardware</h2>
          <Table
            data={hardwareSetup.map(([type, name, link, details]) => {
              const linkElement = link ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              ) : (
                name
              );

              return [
                type,
                <>
                  {linkElement}
                  {details && ` (${details})`}
                </>,
              ];
            })}
            header={['Type', 'Full Name']}
            widthConfig={['30%', '70%']}
          />
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description={description} />;

export default SetupPage;
