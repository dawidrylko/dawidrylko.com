/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GatsbyNode } from 'gatsby';

import path from 'path';
import fs from 'fs';
import { createFilePath } from 'gatsby-source-filesystem';

const blogPost = path.resolve(`./src/templates/blog-post.tsx`);

export const sourceNodes: GatsbyNode['sourceNodes'] = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;
  const filesDir = path.resolve('./static/files');

  if (!fs.existsSync(filesDir)) {
    console.warn(`Files directory not found: ${filesDir}`);
    return;
  }

  const getAllFiles = (dir: string, baseDir: string): Array<{ filePath: string; relativePath: string }> => {
    const results: Array<{ filePath: string; relativePath: string }> = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results.push(...getAllFiles(fullPath, baseDir));
      } else if (entry.isFile()) {
        const relativePath = path.relative(baseDir, fullPath);
        results.push({ filePath: fullPath, relativePath });
      }
    });

    return results;
  };

  const allFiles = getAllFiles(filesDir, filesDir);

  allFiles.forEach(({ filePath, relativePath }) => {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(fileName).slice(1);
    const nameWithoutExt = path.basename(fileName, path.extname(fileName));

    const node = {
      id: createNodeId(`static-file-${relativePath}`),
      parent: null,
      children: [],
      internal: {
        type: 'StaticFile',
        contentDigest: createContentDigest({ relativePath, size: stats.size }),
      },
      name: nameWithoutExt,
      extension,
      publicURL: `/files/${relativePath.replace(/\\/g, '/')}`,
      size: stats.size,
      relativePath: relativePath.replace(/\\/g, '/'),
    };

    createNode(node);
  });
};

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }: any) => {
  const { createPage, createRedirect } = actions;

  createRedirect({
    fromPath: '/resume',
    toPath: '/bio/',
    isPermanent: true,
    redirectInBrowser: true,
  });

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
  `);
};
