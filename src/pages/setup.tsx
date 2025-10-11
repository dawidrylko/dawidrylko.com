import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useStructuredData } from '../hooks/use-structured-data';

type SetupItem = [type: string, name: string, link: string | null, details?: string];

const hardwareSetup: SetupItem[] = [
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
  ['Printer', 'Brother HL-L2352DW', null, ''],
];

const guitarSetup: SetupItem[] = [
  ['Guitar', 'Takamine GD51CE-NAT', 'https://www.ceneo.pl/26674392#crid=777442&pid=29997', 'Natural, high gloss'],
  ['Case', 'Gator 6 & 12-String Dreadnought Case', null, 'Black'],
  ['Amplifier', 'NUX AC-25', 'https://www.ceneo.pl/123440796#crid=777443&pid=29997', '280 × 218 × 220 mm'],
  ['Cable', 'Fender Del. Cable Angle Plug 4,5m TN', 'https://www.ceneo.pl/85130757#crid=777445&pid=29997', '4.5 m'],
  ['Strap', 'Minotaur Suede Guitar Strap Camel', null, 'Caramel, Length adjustable 105 - 150 cm'],
  ['Capo', 'Shubb C1', 'https://www.ceneo.pl/119647588#crid=777444&pid=29997', ''],
];

const transformSetupData = (data: SetupItem[]): (string | React.ReactNode)[][] => {
  return data.map(([type, name, link, details]) => {
    const linkElement = link ? (
      <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} on external site`}>
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
  });
};

const title = 'Setup';
const description =
  "Explore Dawid Ryłko's complete hardware and music setup: development workstation optimized for productivity and scalability, plus guitar equipment for creative expression and musical performance.";

const SetupPage: React.FC<PageProps> = ({ location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    headline: title,
    description: description,
    mainEntity: {
      ...person,
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Hardware Setup',
        description: 'Professional development workstation with premium peripherals and storage solutions',
      },
      {
        '@type': 'Thing',
        name: 'Guitar Setup',
        description: 'Acoustic guitar equipment for live performance and practice',
      },
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2'],
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section id="hardware" aria-labelledby="hardware-heading">
          <h2 id="hardware-heading">Hardware Setup</h2>
          <Table
            data={transformSetupData(hardwareSetup)}
            header={['Type', 'Full Name']}
            widthConfig={['30%', '70%']}
            ariaLabel="Hardware and development equipment specifications"
          />
        </section>

        <section id="guitar" aria-labelledby="guitar-heading">
          <h2 id="guitar-heading">Guitar Setup</h2>
          <Table
            data={transformSetupData(guitarSetup)}
            header={['Type', 'Full Name']}
            widthConfig={['30%', '70%']}
            ariaLabel="Guitar and music equipment specifications"
          />
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description={description} />;

export default SetupPage;
