/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GatsbyNode } from 'gatsby';

import path from 'path';
import { createFilePath } from 'gatsby-source-filesystem';
import { STRUCTURED_DATA } from './src/constants/structured-data';

const blogPost = path.resolve(`./src/templates/blog-post.tsx`);

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }: any) => {
  const { createPage } = actions;
  const result = await graphql(`
    query AllMdx {
      allMdx(sort: { frontmatter: { date: ASC } }, limit: 1000) {
        nodes {
          id
          fields {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(`There was an error loading your blog posts`, result.errors);
    return;
  }

  const posts: any[] = result.data.allMdx.nodes;

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id;
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id;

      createPage({
        path: post.fields.slug,
        component: `${blogPost}?__contentFilePath=${post.internal.contentFilePath}`,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      });
    });
  }
};

export const onCreateNode: GatsbyNode['onCreateNode'] = ({ node, actions, getNode }) => {
  if (node.internal.type !== `Mdx`) {
    return;
  }

  const { createNodeField } = actions;
  const filePath = createFilePath({ node, getNode });
  const slugValue = filePath.replace(/.*--/, '/');

  createNodeField({
    name: `slug`,
    node,
    value: slugValue,
  });
};

// https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/
// https://www.gatsbyjs.com/docs/how-to/local-development/graphql-typegen/
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  actions.createTypes(`#graphql
    type Site {
      siteMetadata: SiteMetadata!
    }

    type SiteMetadata {
      title: String!
    }

    type StructuredDataNode implements Node {
      structuredData: JSON
    }
  `);
};

export const sourceNodes: GatsbyNode['sourceNodes'] = ({ actions, createContentDigest }) => {
  const { createNode } = actions;

  createNode({
    id: 'structured-data-node',
    parent: null,
    children: [],
    internal: {
      type: 'StructuredDataNode',
      contentDigest: createContentDigest(STRUCTURED_DATA),
    },
    structuredData: STRUCTURED_DATA,
  });
};
