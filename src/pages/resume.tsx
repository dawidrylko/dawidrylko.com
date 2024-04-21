import type { HeadFC, PageProps } from 'gatsby';

import * as React from 'react';

import Layout from '../components/layout';
import ReturnLink from '../components/return-link';
import Seo from '../components/seo';
import Table from '../components/table';
import Bio from '../components/bio';

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
      <Bio />
      <h2>Summary</h2>
      <p>
        Hello, I'm Dawid Ryłko, a seasoned developer with a wealth of experience spanning several years. My professional
        journey has been fueled by a passion for optimization and a knack for unconventional solutions. Beyond coding, I
        am an avid enthusiast of movies and games.
      </p>
      <p>
        In the dynamic realm of technology, I am unwaveringly dedicated to self-improvement and staying abreast of the
        latest innovations. My commitment to excellence is the cornerstone of my approach to software development.
      </p>
      <h2>Experience</h2>
      <Table data={experience} />
      <h2>Education</h2>
      <Table data={education} />
      <hr />
      <a href="/resume.pdf" download>
        Download Full Résumé
      </a>
      <hr />
      <ReturnLink />
    </Layout>
  );
};

export const Head: HeadFC = () => <Seo title={title} description="Dawid Ryłko's résumé" noIndex />;

export default ResumePage;
