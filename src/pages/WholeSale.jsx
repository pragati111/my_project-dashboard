import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line perfectionist/sort-imports

import WholesalerRegistration from 'src/sections/blog/view/WholeSaler';


// ----------------------------------------------------------------------

export default function WholeSalePage() {
  return (
    <>
      <Helmet>
        <title>WholeSaler  </title>
      </Helmet>

      <WholesalerRegistration />
    </>
  );
}
