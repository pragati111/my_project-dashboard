import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line perfectionist/sort-imports
import CouponView from 'src/sections/blog/view/blog-view';


// ----------------------------------------------------------------------

export default function CoupanPage() {
  return (
    <>
      <Helmet>
        <title>Coupan  </title>
      </Helmet>

      <CouponView />
    </>
  );
}
