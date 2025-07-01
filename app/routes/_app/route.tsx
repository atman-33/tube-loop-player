import { Outlet } from 'react-router';
import Footer from '~/routes/_app/components/footer';
import Header from './components/header';

const AppLayout = () => {
  return (
    <>
      <div className="container mx-auto p-4">
        <Header />
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default AppLayout;
