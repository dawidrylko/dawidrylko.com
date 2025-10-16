import * as React from 'react';

type TableProps = {
  data: (string | React.ReactNode)[][];
  header?: string[];
  widthConfig?: string[];
  ariaLabel?: string;
};

const Table: React.FC<TableProps> = ({ data, header, widthConfig, ariaLabel }) => {
  return (
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
  );
};

export default Table;
