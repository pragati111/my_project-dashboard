import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line perfectionist/sort-imports

import TestimonialView from 'src/sections/blog/view/Testimonial';


// ----------------------------------------------------------------------

export default function TestPage() {
  return (
    <>
      <Helmet>
        <title>Coupan  </title>
      </Helmet>

      <TestimonialView />
    </>
  );
}
