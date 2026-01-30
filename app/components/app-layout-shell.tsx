import type { ReactElement, ReactNode } from 'react';
import { Toaster } from '~/components/ui/sonner';
import { DataConflictModal } from '~/components/data-conflict-modal';
import { ConflictPendingBanner } from '~/components/conflict-pending-banner';
import { usePlaylistSync } from '~/hooks/use-playlist-sync';
import { usePinnedSongsSync } from '~/hooks/use-pinned-songs-sync';
import Footer from '~/routes/_app/components/footer';
import Header from '~/routes/_app/components/header';

interface AppLayoutShellProps {
  children: ReactNode;
  contactEmail?: string | null;
}

const AppLayoutShell = ({ children, contactEmail }: AppLayoutShellProps): ReactElement => {
  // Initialize playlist sync
  const playlistSync = usePlaylistSync();
  const {
    conflictData,
    resolveConflict,
    decideLater,
    isSynced: playlistSynced,
    isConflictPending,
  } = playlistSync;

  // Initialize pinned songs sync (wait for playlist sync to complete)
  usePinnedSongsSync(playlistSynced);

  return (
    <>
      <ConflictPendingBanner isVisible={isConflictPending} />
      <div className="mx-auto p-2 md:px-8 md:py-4">
        <Header />
        {children}
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
          onDecideLater={decideLater}
        />
      )}
    </>
  );
};

export default AppLayoutShell;
