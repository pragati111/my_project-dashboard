import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line perfectionist/sort-imports

import ComplaintView from 'src/sections/blog/view/Complain';


// ----------------------------------------------------------------------

export default function Complain() {
  return (
    <>
      <Helmet>
        <title>Coupan  </title>
      </Helmet>

      <ComplaintView />
    </>
  );
}
