import * as React from 'react';
import { JsonLd } from 'react-schemaorg';
import { ItemList, ListItem, WithContext } from 'schema-dts';

type TableProps = {
  data: (string | React.ReactNode)[][];
  header?: string[];
  widthConfig?: string[];
  tableSchema?: ItemList['@type'];
  rowSchema?: ListItem['@type'];
  cellSchema?: ListItem['@type'];
};

const Table: React.FC<TableProps> = ({ data, header, widthConfig, tableSchema, rowSchema, cellSchema }) => {
  const structuredData: WithContext<ItemList> = {
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
          name: typeof cell === 'string' ? cell : `Item ${cellIndex + 1}`,
        })),
      },
    })),
  };

  return (
    <>
      <JsonLd<ItemList> item={structuredData} />
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
