/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GatsbyConfig } from 'gatsby';
import { GTAG } from './src/constants/gtag';
import { SITE_METADATA } from './src/constants/site-metadata';

const config: GatsbyConfig = {
  siteMetadata: {
    siteUrl: `${SITE_METADATA.url}/`,
    siteTitle: SITE_METADATA.title,
    siteDescription: SITE_METADATA.description.en,
    siteAuthor: SITE_METADATA.author,
    siteSocial: SITE_METADATA.social,
    menu: SITE_METADATA.menu,
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
        siteUrl: `${SITE_METADATA.url}/`,
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
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'files',
        path: 'static/files',
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
                      tags
                      featuredImg {
                        childImageSharp {
                          gatsbyImageData(width: 1200, height: 630)
                        }
                      }
                    }
                    excerpt
                  }
                }
              }
            `,
            serialize: ({ query: { site, posts } }: any) => {
              const getImageMimeType = (src: string): string => {
                const extension = src.split('.').pop()?.toLowerCase();
                switch (extension) {
                  case 'jpg':
                  case 'jpeg':
                    return 'image/jpeg';
                  case 'png':
                    return 'image/png';
                  case 'webp':
                    return 'image/webp';
                  case 'gif':
                    return 'image/gif';
                  default:
                    return 'image/jpeg';
                }
              };

              return posts.nodes.map((node: any) => {
                const url = `${site.siteMetadata.siteUrl}${node.fields.slug}`;
                const description = node.frontmatter.description || node.excerpt;
                const content = `<p>${description}</p><div style='margin-top: 50px; font-style: italic;'><strong><a href='${url}'>Czytaj dalej</a>.</strong></div><br /> <br />`;
                const categories = node.frontmatter.tags || [];
                const enclosure = node.frontmatter.featuredImg?.childImageSharp?.gatsbyImageData
                  ? {
                      url: `${site.siteMetadata.siteUrl}${node.frontmatter.featuredImg.childImageSharp.gatsbyImageData.images.fallback.src}`,
                      type: getImageMimeType(
                        node.frontmatter.featuredImg.childImageSharp.gatsbyImageData.images.fallback.src,
                      ),
                      length: '0',
                    }
                  : void 0;

                const rssItem: any = {
                  title: node.frontmatter.title,
                  description,
                  url,
                  guid: url,
                  author: `${SITE_METADATA.author.email} (${SITE_METADATA.author.name})`,
                  date: node.frontmatter.date,
                  custom_elements: [{ 'content:encoded': content }],
                };

                if (categories.length > 0) {
                  rssItem.categories = categories;
                }

                if (enclosure) {
                  rssItem.enclosure = enclosure;
                }

                return rssItem;
              });
            },
            output: '/rss.xml',
            title: SITE_METADATA.title,
            description: SITE_METADATA.description.pl,
            link: SITE_METADATA.url,
            language: 'pl',
            copyright: `Copyright © ${new Date().getFullYear()}, ${SITE_METADATA.author.name}`,
            managingEditor: `${SITE_METADATA.author.email} (${SITE_METADATA.author.name})`,
            webMaster: `${SITE_METADATA.author.email} (${SITE_METADATA.author.name})`,
            generator: `${SITE_METADATA.title} RSS Feed`,
            docs: 'https://www.rssboard.org/rss-specification',
            ttl: 60,
            image_url: `${SITE_METADATA.url}/icons/icon-144x144.png`,
            image_title: SITE_METADATA.title,
            image_link: SITE_METADATA.url,
            image_description: `Logo dla ${SITE_METADATA.title}`,
            custom_namespaces: {
              content: 'http://purl.org/rss/1.0/modules/content/',
              atom: 'http://www.w3.org/2005/Atom',
              dc: 'http://purl.org/dc/elements/1.1/',
            },
            custom_elements: [
              {
                'atom:link': {
                  _attr: {
                    href: `${SITE_METADATA.url}/rss.xml`,
                    rel: 'self',
                    type: 'application/rss+xml',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

export default config;
