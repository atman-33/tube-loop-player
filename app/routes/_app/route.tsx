import { Outlet } from 'react-router';
import { Toaster } from '~/components/ui/sonner';
import Footer from '~/routes/_app/components/footer';
import type { Route } from './+types/route';
import Header from './components/header';
import { usePlaylistSync } from '~/hooks/use-playlist-sync';
import { DataConflictModal } from '~/components/data-conflict-modal';
import { getAuth } from '~/lib/auth/auth.server';

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  const contactEmail = context.cloudflare.env.CONTACT_EMAIL;
  const baseURL = context.cloudflare.env.BETTER_AUTH_URL;

  return {
    contactEmail,
    baseURL,
    user: session?.user,
  };
};

const AppLayout = ({ loaderData }: Route.ComponentProps) => {
  const { contactEmail } = loaderData;

  // Initialize playlist sync
  const { conflictData, resolveConflict, cancelConflictResolution } = usePlaylistSync();

  return (
    <>
      <div className="container mx-auto p-4">
        <Header />
        <Outlet />
      </div>
      <Footer contactEmail={contactEmail ?? ''} />
      <Toaster />

      {/* Data Conflict Resolution Modal */}
      {conflictData && (
        <DataConflictModal
          isOpen={true}
          localData={conflictData.local}
          cloudData={conflictData.cloud}
          onResolve={resolveConflict}
          onCancel={cancelConflictResolution}
        />
      )}
    </>
  );
};

export default AppLayout;
