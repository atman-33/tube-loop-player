import { Outlet } from 'react-router';
import { Toaster } from '~/components/ui/sonner';
import { useAdToaster } from '~/hooks/use-ad-toaster';
import Footer from '~/routes/_app/components/footer';
import type { Route } from './+types/route';
import Header from './components/header';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const contactEmail = context.cloudflare.env.CONTACT_EMAIL;
  return { contactEmail };
};

const AppLayout = ({ loaderData }: Route.ComponentProps) => {
  const { contactEmail } = loaderData;
  useAdToaster(); // Call the custom hook here
  return (
    <>
      <div className="container mx-auto p-4">
        <Header />
        <Outlet />
      </div>
      <Footer contactEmail={contactEmail ?? ''} />
      <Toaster />
    </>
  );
};

export default AppLayout;
