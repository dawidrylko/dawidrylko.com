import * as React from 'react';

const Table: React.FC<{ data: string[][] }> = ({ data }) => (
  <table>
    <tbody>
      {data.map((item, index) => (
        <tr key={index}>
          {item.map((cell, index) => (
            <td key={index}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
