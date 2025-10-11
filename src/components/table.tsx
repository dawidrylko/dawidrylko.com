import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { ItemList, WithContext } from 'schema-dts';

type TableProps = {
  data: (string | React.ReactNode)[][];
  header?: string[];
  widthConfig?: string[];
  ariaLabel?: string;
};

const Table: React.FC<TableProps> = ({ data, header, widthConfig, ariaLabel }) => {
  const structuredData: WithContext<ItemList> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: data.map((row, rowIndex) => ({
      '@type': 'ListItem',
      position: rowIndex + 1,
      item: {
        '@type': 'ItemList',
        itemListElement: row.map((cell, cellIndex) => ({
          '@type': 'ListItem',
          position: cellIndex + 1,
          name: typeof cell === 'string' ? cell : `Item ${cellIndex + 1}`,
        })),
      },
    })),
  };

  return (
    <>
      <JsonLd<ItemList> item={structuredData} />
      <table role="table" aria-label={ariaLabel}>
        {header && (
          <thead>
            <tr role="row">
              {header.map((item, index) => (
                <th key={index} scope="col" role="columnheader">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} role="row">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} width={widthConfig?.[cellIndex]} role="cell">
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
