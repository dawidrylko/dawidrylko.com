import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { WithContext, CollectionPage } from 'schema-dts';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Table from '../components/table';

type FileNode = {
  name: string;
  extension: string;
  publicURL: string;
  size: number;
  birthTime: string;
  modifiedTime: string;
};

type DataType = {
  allFile: {
    nodes: FileNode[];
  };
};

const LANGUAGE_PATTERN = /[_-](pl|en)$/i;
const DEFAULT_LANGUAGE = 'EN';
const FILE_CONFIG: Record<string, { icon: string; type: string }> = {
  key: { icon: '🎨', type: 'Keynote' },
  pdf: { icon: '📄', type: 'PDF' },
  ppt: { icon: '📊', type: 'PowerPoint' },
  pptx: { icon: '📊', type: 'PowerPoint' },
};

const detectLanguage = (fileName: string): string => {
  const match = fileName.match(LANGUAGE_PATTERN);
  return match ? match[1].toUpperCase() : DEFAULT_LANGUAGE;
};

const removeLanguageSuffix = (fileName: string): string => fileName.replace(LANGUAGE_PATTERN, '');

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (dateString: string): string => new Date(dateString).toISOString().split('T')[0];

const groupFilesByName = (files: FileNode[]): Map<string, FileNode[]> => {
  return files.reduce((map, file) => {
    const cleanName = removeLanguageSuffix(file.name);
    map.set(cleanName, [...(map.get(cleanName) || []), file]);
    return map;
  }, new Map<string, FileNode[]>());
};

const getFileMetadata = (extension: string) => {
  const config = FILE_CONFIG[extension.toLowerCase()];
  return config || { icon: '�', type: extension.toUpperCase() };
};

const createPresentationsArray = ({ allFile: { nodes } }: DataType) => {
  const groupedFiles = groupFilesByName(nodes);
  let index = 1;

  return Array.from(groupedFiles.entries()).map(([cleanName, files]) => {
    const language = detectLanguage(files[0].name);
    const dateSource = files.find(f => f.extension.toLowerCase() === 'key') || files[0];
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    const downloadLinks = (
      <>
        {files
          .sort((a, b) => {
            const orderKeys = Object.keys(FILE_CONFIG);
            const indexA = orderKeys.indexOf(a.extension.toLowerCase());
            const indexB = orderKeys.indexOf(b.extension.toLowerCase());
            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
          })
          .map(file => {
            const { icon, type } = getFileMetadata(file.extension);
            const fullName = `${cleanName}.${file.extension}`;

            return (
              <a
                key={file.publicURL}
                href={file.publicURL}
                download={fullName}
                aria-label={`Download ${cleanName} as ${type} format`}
                title={`Download ${type} (${formatFileSize(file.size)})`}
                style={{ marginRight: '0.5rem' }}
              >
                {icon}
              </a>
            );
          })}
      </>
    );

    return [
      (index++).toString(),
      cleanName,
      language,
      formatFileSize(totalSize),
      formatDate(dateSource.birthTime),
      formatDate(dateSource.modifiedTime),
      downloadLinks,
    ];
  });
};

const title = 'Presentations';
const description = 'Collection of presentations and materials available for download.';

const PresentationsPage: React.FC<PageProps<DataType>> = ({ data, location }) => {
  const structuredData: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: `${location.origin}${location.pathname}`,
  };

  return (
    <Layout location={location} breadcrumbTitle={title}>
      <JsonLd<CollectionPage> item={structuredData} />
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <section aria-labelledby="presentations-heading">
          <h2 id="presentations-heading">Available Files</h2>
          <Table
            data={createPresentationsArray(data)}
            header={['#', 'File Name', 'Language', 'Size', 'Created', 'Modified', 'Download']}
            widthConfig={['5%', '30%', '10%', '10%', '15%', '15%', '15%']}
          />
        </section>
      </main>
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description={description} />;

export default PresentationsPage;

export const query = graphql`
  {
    allFile(filter: { sourceInstanceName: { eq: "presentations" } }, sort: { modifiedTime: DESC }) {
      nodes {
        name
        extension
        publicURL
        size
        birthTime
        modifiedTime
      }
    }
  }
`;
