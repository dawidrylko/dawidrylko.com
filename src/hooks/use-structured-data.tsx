import { graphql, useStaticQuery } from 'gatsby';
import { STRUCTURED_DATA } from '../constants/structured-data';

export const useStructuredData = (): typeof STRUCTURED_DATA => {
  const data = useStaticQuery(graphql`
    query StructuredData {
      structuredDataNode {
        structuredData
      }
    }
  `);

  return data.structuredDataNode.structuredData;
};
