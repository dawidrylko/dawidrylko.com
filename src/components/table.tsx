import * as React from 'react';

const Table: React.FC<{
  data: string[][];
  header?: string[];
  widthConfig?: string[];
  tableSchema?: string;
  rowSchema?: string;
  cellSchema?: string;
}> = ({ data, header, widthConfig, tableSchema, rowSchema, cellSchema }) => (
  <table vocab="http://schema.org" typeof={tableSchema}>
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
        <tr key={rowIndex} typeof={rowSchema}>
          {row.map((cell, cellIndex) => (
            <td key={cellIndex} property={cellSchema} width={widthConfig?.[cellIndex]}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
