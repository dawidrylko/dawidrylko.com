import { graphql, useStaticQuery } from 'gatsby';

type SiteAuthor = {
  name: string;
};

type Social = {
  name: string;
  url: string;
};

type Props = {
  site: {
    siteMetadata: {
      siteUrl: string;
      siteTitle: string;
      siteDescription: string;
      siteAuthor: SiteAuthor;
      siteSocial: Social[];
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
