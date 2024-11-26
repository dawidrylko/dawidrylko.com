import type { PageProps } from 'gatsby';

import * as React from 'react';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';

const BlogIndex: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <Bio />
    </Layout>
  );
};

export default BlogIndex;

export const Head = () => <Seo />;
