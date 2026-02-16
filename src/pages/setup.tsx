import type { HeadFC, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, WebPage, CollectionPage } from 'schema-dts';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useStructuredData } from '../hooks/use-structured-data';
import MermaidDiagram from '../components/mermaid-diagram';

type SetupItem = [type: string, name: string, link?: string, details?: string];

const desktopSetup: SetupItem[] = [
  [
    'Computer',
    'Mac mini 2024, Apple M4, 16 GB RAM, 256 GB SSD, Gigabit Ethernet',
    'https://www.ceneo.pl/175355357#crid=774126&pid=29997',
  ],
  ['Dock', 'RayCue ALL-in-One Charger Dock For Mac Mini M4'],
  [
    'Monitor',
    'Iiyama G-Master GCB3481WQSU-B1, 34″, 3440×1440 (UWQHD), 180 Hz, USB hub',
    'https://www.ceneo.pl/173264024#crid=774128&pid=29997',
  ],
  ['KVM Switch', 'Ugreen DisplayPort 1.4 KVM Switch, 8K@60 Hz, 2×PC sharing (display, USB peripherals)'],
  ['Hub', 'Ugreen USB-C Hub 7-in-1, DisplayPort 4K@60 Hz, USB-A 3.0, PD 100 W, SD ↔ microSD'],
  ['Mouse', 'Logitech MX Master 3S', 'https://www.ceneo.pl/134359846#crid=774131&pid=29997', 'Graphite'],
  ['Keyboard', 'NuPhy Air75 v1', void 0, 'Gateron G Pro Red switches'],
  ['Microphone', 'Novox NC-1', void 0, 'USB-B, pop filter'],
  ['Light Bar', 'Xiaomi Mi Computer Monitor Light Bar', 'https://www.ceneo.pl/103206620#crid=774129&pid=29997'],
  ['Desk Frame', 'Silver Monkey EDF-180', 'https://www.ceneo.pl/174808555#crid=774135&pid=29997', 'White'],
  ['Desktop', 'Oak Rustic Desktop', void 0, '100 × 60 × 3 cm'],
];

const additionalEquipment: SetupItem[] = [
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
  alt: `Home office workspace featuring a Computer: Mac mini 2024 (Apple M4, 16 GB RAM, 256 GB SSD) mounted in a RayCue ALL-in-One Charger Dock for Mac mini M4, connected to an Iiyama G-Master GCB3481WQSU-B1 34″ UWQHD 180 Hz Monitor with a Xiaomi Mi Computer Monitor Light Bar. On the desk are a NuPhy Air75 Keyboard with Gateron G Pro Red switches, a Logitech MX Master 3S Mouse (Graphite), and a Novox NC-1 USB microphone on a stand. The setup includes a Ugreen DP 1.4 KVM Switch, Ugreen USB-C to DisplayPort 1.4 cables, Thunderbolt 5 USB-C cables, and is placed on an Oak Rustic Desktop mounted on a Silver Monkey EDF-180 desk frame. Part of the workspace ecosystem includes a Synology DiskStation DS423+ NAS with WD Red Plus and WD Red SN700 storage, and a Brother HL-L2352DW printer.`,
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
    "Discover Dawid Ryłko's professional development workstation with segmented hardware stations and connection graph. Includes Mac mini M4 setup, ultrawide monitor, KVM switching, NAS storage and acoustic guitar equipment.",
  keywords: [
    'developer workstation',
    'hardware topology',
    'KVM setup',
    'Mac mini M4',
    'development setup',
    'programming hardware',
    'NAS storage',
    'connection diagram',
    'guitar equipment',
    'acoustic guitar setup',
    'tech setup',
    'software engineer workspace',
  ],
};

const setupDiagram = `graph TD
  subgraph PrimaryStation ["Primary Device Station"]
    Computer
    Dock
    Dock -- "USB-C ↔ USB-C<br/><small>Dock cable</small>" --> Computer
  end

  subgraph SecondaryStation ["Secondary Device Station"]
    Secondary["Secondary Device"]
    Hub
    Secondary -- "USB-C ↔ USB-C<br/><small>Thunderbolt 5, 80 Gbps, PD 240 W, 16K@30 Hz, 0.5 m extension</small>" --> Hub
  end

  KVM

  subgraph Peripherals
    Mouse
    Keyboard
    Microphone
    Lightbar["Light Bar"]
  end

  Monitor

  Computer -- "USB-C ↔ DisplayPort 1.4<br/><small>Ugreen, 32.4 Gbps, 8K@60 Hz, 1 m</small>" --> KVM
  Computer -- "USB-C ↔ USB-C<br/><small>Thunderbolt 5, 80 Gbps, PD 240 W, 16K@30 Hz, 1 m</small>" --> KVM

  Hub -- "DisplayPort ↔ DisplayPort<br/><small>Monitor cable</small>" --> KVM
  Hub -- "USB-C ↔ USB-C<br/><small>Thunderbolt 5, 80 Gbps, PD 240 W, 16K@30 Hz, 0.5 m</small>" --> KVM

  KVM -- "DisplayPort ↔ DisplayPort<br/><small>Monitor cable</small>" --> Monitor
  KVM -- "USB-A ↔ USB-B<br/><small>Monitor cable</small>" --> Monitor

  Mouse -- "USB dongle" --> KVM
  Keyboard -- "USB-C ↔ USB-A<br/><small>Keyboard cable</small>" --> KVM
  Microphone -- "USB-B ↔ USB-C<br/><small>2 m</small>" --> KVM

  Monitor -- "USB-A ↔ USB-C<br/><small>Light Bar cable</small>" --> Lightbar
`;

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
        name: 'Development Workstation',
        description:
          'Segmented hardware setup with device stations, KVM switching, ultrawide monitor and enterprise-grade NAS storage.',
      },
      {
        '@type': 'Thing',
        name: 'Hardware Topology',
        description:
          'Connection graph presenting data, video and power paths between computers, hub, KVM, monitor and peripherals.',
      },
      {
        '@type': 'Thing',
        name: 'Guitar Setup',
        description: 'Acoustic guitar equipment with amplifier and accessories for recording and practice.',
      },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: 'Equipment Collection',
      description: 'Desktop hardware, peripherals, network storage and music equipment',
      numberOfItems: desktopSetup.length + additionalEquipment.length + guitarSetup.length,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<WebPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <main>
        <section id="desktop" aria-labelledby="desktop-heading">
          <h2 id="desktop-heading">Desktop Setup</h2>
          <Table
            data={transformSetupData(desktopSetup)}
            header={['Type', 'Full Name']}
            widthConfig={['30%', '70%']}
            ariaLabel="Desktop hardware and equipment specifications"
          />
        </section>

        <section id="diagram" aria-labelledby="diagram-heading">
          <MermaidDiagram chart={setupDiagram} />
        </section>

        <figure style={{ margin: '0' }}>
          <StaticImage src="../images/hardware-setup.jpg" alt={image.alt} placeholder="blurred" layout="fullWidth" />
          <figcaption>{image.figcaption}</figcaption>
        </figure>

        <section id="additional" aria-labelledby="additional-heading">
          <h2 id="additional-heading">Additional Equipment</h2>
          <Table
            data={transformSetupData(additionalEquipment)}
            header={['Type', 'Full Name']}
            widthConfig={['30%', '70%']}
            ariaLabel="Additional equipment specifications"
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

export const Head: HeadFC = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;

export default SetupPage;
