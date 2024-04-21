import type { GatsbyConfig } from 'gatsby';
import { GTAG } from './src/constants/gtag';
import { SITE_METADATA } from './src/constants/site-metadata';

const config: GatsbyConfig = {
  siteMetadata: {
    siteUrl: SITE_METADATA.url,
    siteTitle: SITE_METADATA.title,
    siteDescription: SITE_METADATA.description,
    siteAuthor: SITE_METADATA.author,
    siteSocial: SITE_METADATA.social,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: `${SITE_METADATA.title} - dawidrylko.com`,
        short_name: SITE_METADATA.title,
        start_url: '/',
        background_color: '#ffffff',
        display: 'minimal-ui',
        icon: 'src/images/logo.jpg',
      },
    },
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [GTAG],
      },
    },
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: SITE_METADATA.url,
        stripQueryString: true,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: 'content/pl',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: 'src/images',
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: ['.mdx', '.md'],
        gatsbyRemarkPlugins: [
          `gatsby-remark-prismjs`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-katex`,
            options: {
              // Add any KaTeX options from https://github.com/KaTeX/KaTeX/blob/master/docs/options.md here
              strict: `ignore`,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `#graphql
          {
            site {
              siteMetadata {
                title: siteTitle
                description: siteDescription
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            query: `#graphql
              {
                posts: allMdx(
                  sort: { frontmatter: { date: DESC } }
                ) {
                  nodes {
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      description
                      date
                    }
                    excerpt
                  }
                }
              }
            `,
            serialize: ({ query: { site, posts } }: any) =>
              posts.nodes
                .sort(
                  (a: any, b: any) => Date.parse(b.date) - Date.parse(a.date),
                )
                .map((node: any) => {
                  const url = `${site.siteMetadata.siteUrl}${node.fields.slug}`;
                  const description =
                    node.frontmatter.description || node.excerpt;
                  const content = `<p>${description}</p><div style='margin-top: 50px; font-style: italic;'><strong><a href='${url}'>Keep reading</a>.</strong></div><br /> <br />`;
                  return {
                    title: node.frontmatter.title,
                    description,
                    url,
                    guid: url,
                    author: SITE_METADATA.author,
                    date: node.frontmatter.date,
                    custom_elements: [{ 'content:encoded': content }],
                  };
                }),
            output: '/rss.xml',
            title: SITE_METADATA.title,
            language: SITE_METADATA.lang,
            image_url: 'src/images/logo.jpg',
          },
        ],
      },
    },
  ],
};

export default config;
