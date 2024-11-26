import * as React from 'react';

const Table: React.FC<{
  data: string[][];
  tableSchema?: string;
  rowSchema?: string;
  cellSchema?: string;
}> = ({ data, tableSchema, rowSchema, cellSchema }) => (
  <table vocab="http://schema.org" typeof={tableSchema}>
    <tbody>
      {data.map((row, rowIndex) => (
        <tr key={rowIndex} typeof={rowSchema}>
          {row.map((cell, cellIndex) => (
            <td key={cellIndex} property={cellSchema}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
