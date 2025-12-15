import { Outlet } from 'react-router';
import type { ReactElement } from 'react';
import { Toaster } from '~/components/ui/sonner';
import Footer from '~/routes/_app/components/footer';
import type { Route } from './+types/route';
import Header from './components/header';
import { usePlaylistSync } from '~/hooks/use-playlist-sync';
import { usePinnedSongsSync } from '~/hooks/use-pinned-songs-sync';
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

const AppLayout = ({ loaderData }: Route.ComponentProps): ReactElement => {
  const { contactEmail } = loaderData;

  // Initialize playlist sync
  const playlistSync = usePlaylistSync();
  const { conflictData, resolveConflict, cancelConflictResolution, isSynced: playlistSynced } = playlistSync;
  
  // Initialize pinned songs sync (wait for playlist sync to complete)
  usePinnedSongsSync(playlistSynced);

  return (
    <>
      <div className="mx-auto p-2 md:px-8 md:py-4">
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
          diff={conflictData.diff}
          onResolve={resolveConflict}
          onCancel={cancelConflictResolution}
        />
      )}
    </>
  );
};

export default AppLayout;
