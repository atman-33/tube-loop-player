import { LogOut, Cloud, CloudOff } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { UserAvatar } from '~/components/user-avatar';
import { useAuth } from '~/hooks/use-auth';
import { usePlaylistSync } from '~/hooks/use-playlist-sync';

export function UserMenu() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { isSynced } = usePlaylistSync();

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn('google')}
        className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border-0 overflow-hidden"
      >
        {/* Background noise effect like ad-banner */}
        <div
          className="absolute inset-0 opacity-10 -z-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
        <span className="text-xs font-semibold">Sign in with Google</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* User Info Display */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent/20">
        <UserAvatar user={user!} size="sm" />
        <div className="hidden sm:flex flex-col">
          <span className="text-sm font-medium leading-none">{user!.name}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {isSynced ? (
              <>
                <Cloud className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Syncing...</span>
              </>
            )}
          </div>
        </div>
        {/* Mobile sync indicator */}
        <div className="sm:hidden">
          {isSynced ? (
            <Cloud className="h-3 w-3 text-green-500" />
          ) : (
            <CloudOff className="h-3 w-3 text-orange-500" />
          )}
        </div>
      </div>

      {/* Simple Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800"
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}