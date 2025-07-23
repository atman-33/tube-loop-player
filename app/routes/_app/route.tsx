import { Outlet } from 'react-router';
import { Toaster } from '~/components/ui/sonner';
import Footer from '~/routes/_app/components/footer';
import type { Route } from './+types/route';
import Header from './components/header';
import { usePlaylistSync } from '~/hooks/use-playlist-sync';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const contactEmail = context.cloudflare.env.CONTACT_EMAIL;
  return { contactEmail };
};

const AppLayout = ({ loaderData }: Route.ComponentProps) => {
  const { contactEmail } = loaderData;

  // Initialize playlist sync
  usePlaylistSync();

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
