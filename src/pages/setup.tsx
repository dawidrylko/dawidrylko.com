import type { HeadFC, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage, CollectionPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useStructuredData } from '../hooks/use-structured-data';

type SetupItem = [type: string, name: string, link?: string, details?: string];

const hardwareSetup: SetupItem[] = [
  [
    'Computer',
    'Mac mini 2024, Apple M4, 16 GB RAM, 256 GB SSD, Gigabit Ethernet',
    'https://www.ceneo.pl/175355357#crid=774126&pid=29997',
  ],
  ['Dock', 'RayCue ALL-in-One Charger Dock For Mac Mini M4'],
  [
    'Monitor',
    'iiyama G-Master GCB3481WQSU-B1, 34″ UWQHD, 180 Hz',
    'https://www.ceneo.pl/173264024#crid=774128&pid=29997',
  ],
  ['Mouse', 'Logitech MX Master 3S', 'https://www.ceneo.pl/134359846#crid=774131&pid=29997', 'Graphite'],
  ['Keyboard', 'NuPhy Air75', void 0, 'Gateron G Pro Red switches'],
  ['Microphone', 'Novox NC-1', void 0, 'USB-B connection, pop filter'],
  ['Light Bar', 'Xiaomi Mi Computer Monitor Light Bar', 'https://www.ceneo.pl/103206620#crid=774129&pid=29997'],
  ['KVM Switch', 'UGREEN DP 1.4 KVM Switch, 8K@60 Hz'],
  ['Cable', 'UGREEN USB-C ↔ DisplayPort 1.4, 32.4 Gbps, 8K@60 Hz', void 0, '2 pcs, 1 m each'],
  ['Cable', 'Thunderbolt 5 USB-C ↔ USB-C, 80 Gbps, 240 W PD, 16K@30 Hz', void 0, '2 pcs, 1 m'],
  ['Desk Frame', 'Silver Monkey EDF-180', 'https://www.ceneo.pl/174808555#crid=774135&pid=29997', 'White'],
  ['Desktop', 'Oak Rustic Desktop', void 0, '100 × 60 × 3 cm'],
  ['NAS', 'Synology DiskStation DS423+', 'https://www.ceneo.pl/149801785#crid=774138&pid=29997'],
  [
    'Storage',
    'WD Red Plus, 4 TB, HDD, SATA III, 5400 RPM',
    'https://www.ceneo.pl/143972868#crid=774140&pid=29997',
    'Data, 2 pcs',
  ],
  ['Storage', 'WD Red SN700, 500 GB, M.2 NVMe', 'https://www.ceneo.pl/119197771#crid=774139&pid=29997', 'Cache, 2 pcs'],
  ['Printer', 'Brother HL-L2352DW'],
];

const guitarSetup: SetupItem[] = [
  ['Guitar', 'Takamine GD51CE-NAT', 'https://www.ceneo.pl/26674392#crid=777442&pid=29997', 'Natural, high gloss'],
  ['Case', 'Gator 6 & 12-String Dreadnought Case', void 0, 'Black'],
  ['Amplifier', 'NUX AC-25', 'https://www.ceneo.pl/123440796#crid=777443&pid=29997', '280 × 218 × 220 mm'],
  ['Cable', 'Fender Del. Cable Angle Plug 4,5m TN', 'https://www.ceneo.pl/85130757#crid=777445&pid=29997', '4.5 m'],
  ['Strap', 'Minotaur Suede Guitar Strap Camel', void 0, 'Caramel, Length adjustable 105 - 150 cm'],
  ['Capo', 'Shubb C1', 'https://www.ceneo.pl/119647588#crid=777444&pid=29997'],
];

const image = {
  alt: `Home office workspace featuring a Computer: Mac mini 2024 (Apple M4, 16 GB RAM, 256 GB SSD) mounted in a RayCue ALL-in-One Charger Dock for Mac mini M4, connected to an iiyama G-Master GCB3481WQSU-B1 34″ UWQHD 180 Hz Monitor with a Xiaomi Mi Computer Monitor Light Bar. On the desk are a NuPhy Air75 Keyboard with Gateron G Pro Red switches, a Logitech MX Master 3S Mouse (Graphite), and a Novox NC-1 USB microphone on a stand. The setup includes a UGREEN DP 1.4 KVM Switch, UGREEN USB-C to DisplayPort 1.4 cables, Thunderbolt 5 USB-C cables, and is placed on an Oak Rustic Desktop mounted on a Silver Monkey EDF-180 desk frame. Part of the workspace ecosystem includes a Synology DiskStation DS423+ NAS with WD Red Plus and WD Red SN700 storage, and a Brother HL-L2352DW printer.`,
  figcaption: `Photo by Dawid Ryłko, taken on January 3, 2026.`,
};

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

const PAGE_METADATA = {
  title: 'Setup',
  description:
    "Discover Dawid Ryłko's professional hardware setup and creative toolkit. From a development workstation built for performance and scalability—featuring Mac mini M4, RayCue ALL-in-One Charger Dock for Mac mini M4, ultrawide monitor, and enterprise-grade NAS storage—to a complete acoustic guitar setup for musical expression.",
  keywords: [
    'developer workstation',
    'Mac mini M4',
    'development setup',
    'programming hardware',
    'NAS storage',
    'guitar equipment',
    'acoustic guitar setup',
    'tech setup',
    'software engineer workspace',
  ],
};

const SetupPage: React.FC<PageProps> = ({ location }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { person } = useStructuredData() as { person: any };

  const structuredData: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: PAGE_METADATA.title,
    headline: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    author: person,
    keywords: PAGE_METADATA.keywords.join(', '),
    about: [
      {
        '@type': 'Thing',
        name: 'Hardware Setup',
        description:
          'Professional development workstation featuring Mac mini M4, ultrawide monitor, ergonomic peripherals, and enterprise-grade network storage for scalable software engineering.',
      },
      {
        '@type': 'Thing',
        name: 'Guitar Setup',
        description:
          'Complete acoustic guitar equipment including Takamine GD51CE-NAT with NUX amplifier for musical performance and creative expression.',
      },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: 'Equipment Collection',
      description: 'Professional hardware and music equipment setup',
      numberOfItems: hardwareSetup.length + guitarSetup.length,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
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
        <figure style={{ margin: '0' }}>
          <StaticImage src="../images/hardware-setup.jpg" alt={image.alt} placeholder="blurred" layout="fullWidth" />
          <figcaption>{image.figcaption}</figcaption>
        </figure>

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

export const Head: HeadFC = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;

export default SetupPage;
