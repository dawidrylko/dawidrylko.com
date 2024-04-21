import type { HeadFC, PageProps } from 'gatsby';

import * as React from 'react';

import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';
import Table from '../components/table';

const experience = [
  ['Silesian Solutions', 'Founder', 'Oct 2015 - Present'],
  ['Proget', 'Team Leader, Senior Frontend Developer', 'Oct 2017 - Present'],
  ['Lead Mobile Developer', 'Actaware', 'Mar 2022 - Present'],
  ['DaVinci Studio', 'Frontend Developer', 'Dec 2015 - Sep 2017'],
  ['Wholesaler (local company)', 'IT specialist - Programmer', 'Aug 2013 - Oct 2015'],
];

const education = [['The Silesian University of Technology', "Bachelor's degree, Information Technology"]];

const title = 'Résumé 📄';

const ResumePage: React.FC<PageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <h1>{title}</h1>
      <h2>Experience</h2>
      <Table data={experience} />
      <h2>Education</h2>
      <Table data={education} />
      <hr />
      <ReturnLink />
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description="Dawid Ryłko's résumé" noIndex />;

export default ResumePage;
