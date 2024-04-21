import * as React from 'react';
import { Link } from 'gatsby';

const ReturnLink: React.FC = () => {
  return (
    <Link to="/" className="static-link">
      Wróć na stronę główną
    </Link>
  );
};

export default ReturnLink;
