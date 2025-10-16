import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, CollectionPage } from 'schema-dts';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';
import { useStructuredData } from '../hooks/use-structured-data';

type FileNode = {
  name: string;
  extension: string;
  publicURL: string;
  size: number;
};

type DataType = {
  allStaticFile: {
    nodes: FileNode[];
  };
};

type ParsedFileName = {
  topic: string;
  order: number;
  title: string;
  language: string;
  fullName: string;
};

type FileAction = 'download' | 'open';

type FileConfig = {
  icon: string;
  type: string;
  action: FileAction;
  hidden: boolean;
};

const FILE_CONFIG: Record<string, FileConfig[]> = {
  pdf: [
    { icon: '↗️', type: 'PDF', action: 'open', hidden: false },
    { icon: '📄', type: 'PDF', action: 'download', hidden: false },
  ],
  key: [{ icon: '🎨', type: 'Keynote', action: 'download', hidden: true }],
  ppt: [{ icon: '📊', type: 'PowerPoint', action: 'download', hidden: true }],
  pptx: [{ icon: '📊', type: 'PowerPoint', action: 'download', hidden: true }],
};

const parseFileName = (fileName: string): ParsedFileName | null => {
  const parts = fileName.split('_');

  if (parts.length < 4) {
    return null;
  }

  const topic = parts[0];
  const order = parseInt(parts[1], 10);
  const language = parts[parts.length - 1].toLowerCase();
  const title = parts.slice(2, -1).join('_');

  return {
    topic,
    order,
    title,
    language: language.toUpperCase(),
    fullName: fileName,
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const groupFilesByIdentity = (files: FileNode[]): Map<string, FileNode[]> => {
  return files.reduce((map, file) => {
    const parsed = parseFileName(file.name);
    if (!parsed) {
      return map;
    }
    const groupKey = `${parsed.topic}_${String(parsed.order).padStart(2, '0')}_${parsed.title}`;
    map.set(groupKey, [...(map.get(groupKey) || []), file]);
    return map;
  }, new Map<string, FileNode[]>());
};

const getFileMetadata = (extension: string): FileConfig[] => {
  const config = FILE_CONFIG[extension.toLowerCase()];
  return config || [{ icon: '📎', type: extension.toUpperCase(), action: 'download', hidden: false }];
};

const createPresentationsArray = ({ allStaticFile: { nodes } }: DataType, showHidden: boolean) => {
  const groupedFiles = groupFilesByIdentity(nodes);

  const sortedEntries = Array.from(groupedFiles.entries()).sort(([keyA], [keyB]) => {
    const filesA = groupedFiles.get(keyA);
    const filesB = groupedFiles.get(keyB);

    if (!filesA || !filesB) {
      return 0;
    }

    const parsedA = parseFileName(filesA[0].name);
    const parsedB = parseFileName(filesB[0].name);

    if (!parsedA || !parsedB) {
      return 0;
    }

    if (parsedA.topic !== parsedB.topic) {
      return parsedA.topic.localeCompare(parsedB.topic);
    }

    return parsedA.order - parsedB.order;
  });

  let index = 1;

  return sortedEntries.map(([, files]) => {
    const parsed = parseFileName(files[0].name);
    if (!parsed) {
      return [];
    }

    const pdfFile = files.find(f => f.extension.toLowerCase() === 'pdf');
    const sizeSource = pdfFile || files[0];

    const downloadLinks = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {files
          .sort((a, b) => {
            const orderKeys = Object.keys(FILE_CONFIG);
            const indexA = orderKeys.indexOf(a.extension.toLowerCase());
            const indexB = orderKeys.indexOf(b.extension.toLowerCase());
            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
          })
          .flatMap(file => {
            const configs = getFileMetadata(file.extension);
            const downloadName = `${parsed.title} - Dawid Ryłko - dawidrylko.com.${file.extension}`;

            return configs
              .filter(config => !config.hidden || showHidden)
              .map((config, index) => {
                const linkProps =
                  config.action === 'open'
                    ? {
                        href: file.publicURL,
                        target: '_blank' as const,
                        rel: 'noopener noreferrer',
                        'aria-label': `Open ${parsed.title} ${config.type} in new tab`,
                        title: `Open ${config.type} in new tab (${formatFileSize(file.size)})`,
                      }
                    : {
                        href: file.publicURL,
                        download: downloadName,
                        'aria-label': `Download ${parsed.title} as ${config.type}`,
                        title: `Download ${config.type} (${formatFileSize(file.size)})`,
                      };

                return (
                  <a key={`${file.publicURL}-${index}`} {...linkProps}>
                    {config.icon}
                  </a>
                );
              });
          })}
      </div>
    );

    return [
      (index++).toString(),
      parsed.topic.toUpperCase(),
      parsed.title,
      parsed.language,
      formatFileSize(sizeSource.size),
      downloadLinks,
    ];
  });
};

const PAGE_METADATA = {
  title: 'Files',
  description:
    'Browse and download technical presentations, slides, and educational materials by Dawid Ryłko. Access professionally crafted resources covering software development, Node.js, TypeScript, and modern web technologies—available in multiple formats and languages.',
  keywords: [
    'technical presentations',
    'software development slides',
    'Node.js presentations',
    'TypeScript materials',
    'web development resources',
    'programming slides',
    'educational materials',
    'tech conference presentations',
  ],
};

const PresentationsPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  const [showHidden, setShowHidden] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === '.') {
        e.preventDefault();
        setShowHidden(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        name: 'Technical Presentations',
        description:
          'Educational materials and technical presentations covering software development, programming languages, and web technologies.',
      },
      {
        '@type': 'Thing',
        name: 'Educational Resources',
        description: 'Professional learning materials for developers and technology enthusiasts.',
      },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: 'Presentation Files',
      description: 'Collection of downloadable technical presentations and educational materials',
      numberOfItems: groupFilesByIdentity(data.allStaticFile.nodes).size,
    },
  };

  return (
    <Layout location={location} breadcrumbTitle={PAGE_METADATA.title}>
      <JsonLd<CollectionPage> item={structuredData} />
      <header>
        <h1>{PAGE_METADATA.title}</h1>
      </header>
      <main>
        <section aria-labelledby="presentations-heading">
          <h2 id="presentations-heading">Presentations</h2>
          <Table
            data={createPresentationsArray(data, showHidden)}
            header={['#', 'Topic', 'Title', 'Lang', 'Size', 'Download']}
            widthConfig={['5%', '20%', '20%', '10%', '15%', '30%']}
          />
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={PAGE_METADATA.title} description={PAGE_METADATA.description} />;

export default PresentationsPage;

export const query = graphql`
  {
    allStaticFile {
      nodes {
        name
        extension
        publicURL
        size
      }
    }
  }
`;
