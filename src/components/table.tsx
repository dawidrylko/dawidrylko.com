import * as React from 'react';

type TableProps = {
  data: string[][];
  header?: string[];
  widthConfig?: string[];
  tableSchema?: string;
  rowSchema?: string;
  cellSchema?: string;
};

const Table: React.FC<TableProps> = ({ data, header, widthConfig, tableSchema, rowSchema, cellSchema }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': tableSchema || 'ItemList',
    itemListElement: data.map((row, rowIndex) => ({
      '@type': rowSchema || 'ListItem',
      position: rowIndex + 1,
      item: {
        '@type': 'ItemList',
        itemListElement: row.map((cell, cellIndex) => ({
          '@type': cellSchema || 'ListItem',
          position: cellIndex + 1,
          name: cell,
        })),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <table>
        {header && (
          <thead>
            <tr>
              {header.map((item, index) => (
                <th key={index}>{item}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} width={widthConfig?.[cellIndex]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Table;
