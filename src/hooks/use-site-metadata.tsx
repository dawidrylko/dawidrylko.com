import { graphql, useStaticQuery } from 'gatsby';

type Props = {
  site: {
    siteMetadata: {
      siteUrl: string;
      siteTitle: string;
      siteDescription: string;
      siteAuthor: {
        name: string;
      };
      siteSocial: {
        name: string;
        url: string;
      }[];
    };
  };
};

export const useSiteMetadata = () => {
  const data = useStaticQuery<Props>(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
          siteTitle
          siteDescription
          siteAuthor {
            name
          }
          siteSocial {
            name
            url
          }
        }
      }
    }
  `);

  return data.site.siteMetadata;
};
