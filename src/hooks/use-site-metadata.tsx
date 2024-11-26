import { graphql, useStaticQuery } from 'gatsby';

type SiteMetadata = {
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
  siteAuthor: {
    name: string;
    email: string;
    jobTitle: string;
  };
  siteSocial: {
    name: string;
    url: string;
  }[];
  menu: {
    name: string;
    url: string;
  }[];
};

export const useSiteMetadata = (): SiteMetadata => {
  const data = useStaticQuery(graphql`
    query SiteMetadata {
      site {
        siteMetadata {
          siteUrl
          siteTitle
          siteDescription
          siteAuthor {
            name
            email
            jobTitle
          }
          siteSocial {
            name
            url
          }
          menu {
            name
            url
          }
        }
      }
    }
  `);

  return data.site.siteMetadata;
};
