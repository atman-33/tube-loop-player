import { Outlet } from 'react-router';
import Footer from '~/components/footer';

const AppLayout = () => {
  return (
    <>
      <div className="container mx-auto p-4">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default AppLayout;
