/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    siteUrl: `https://dawidrylko.com/`,
    title: `Dawid Ryłko`,
    description: `Dawid Ryłko. Moja osobista strona internetowa i blog. 68 97 119 105 100 32 82 121 108 107 111`,
    author: {
      name: `Dawid Ryłko`,
    },
    social: [
      {
        name: `github`,
        url: `https://github.com/dawidrylko`,
      },
      {
        name: `twitter`,
        url: `https://twitter.com/dawidrylko`,
      },
      {
        name: `linkedin`,
        url: `https://www.linkedin.com/in/dawidrylko`,
      },
    ],
  },
  plugins: [
    `gatsby-plugin-eslint`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/content/blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
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
          `gatsby-remark-prismjs`,
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
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return {
                  ...node.frontmatter,
                  description: node.excerpt,
                  date: node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ 'content:encoded': node.html }],
                };
              });
            },
            query: `{
              allMarkdownRemark(
                sort: { frontmatter: { date: DESC } }
                filter: { frontmatter: { draft: { ne: true } } }
              ) {
                nodes {
                  excerpt
                  html
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    date
                  }
                }
              }
            }`,
            output: `/rss.xml`,
            title: `Dawid Ryłko blog RSS Feed`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Dawid Ryłko - dawidrylko.com`,
        short_name: `Dawid Ryłko`,
        start_url: `/`,
        background_color: `#ffffff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/logo.jpg`, // This path is relative to the root of the site.
      },
    },
  ],
};
