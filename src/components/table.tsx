import type { FC, ReactNode } from 'react';

type TableProps = {
  data: (string | ReactNode)[][];
  header?: string[];
  widthConfig?: string[];
  ariaLabel?: string;
};

const Table: FC<TableProps> = ({ data, header, widthConfig, ariaLabel }) => {
  return (
    <table aria-label={ariaLabel}>
      {header && (
        <thead>
          <tr>
            {header.map((item, index) => (
              <th key={index} scope="col">
                {item}
              </th>
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
  );
};

export default Table;
