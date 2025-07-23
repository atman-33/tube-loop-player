import { LogIn, LogOut, User, Cloud, CloudOff } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { UserAvatar } from '~/components/user-avatar';
import { useAuth } from '~/hooks/use-auth';
import { usePlaylistSync } from '~/hooks/use-playlist-sync';

export function UserMenu() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { isSynced } = usePlaylistSync();

  if (!isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
            <span className="ml-2">Sign In</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className='cursor-pointer' onClick={() => signIn('google')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with Google
          </DropdownMenuItem>
          {/* not use GitHub sign in */}
          {/* <DropdownMenuItem onClick={() => signIn('github')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <UserAvatar user={user!} size="sm" />
          <span className="hidden sm:inline">{user!.name}</span>
          {isSynced ? (
            <Cloud className="h-3 w-3 text-green-500" />
          ) : (
            <CloudOff className="h-3 w-3 text-orange-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{user!.name}</div>
          <div className="text-muted-foreground text-xs">{user!.email}</div>
          <div className="flex items-center gap-1 mt-1">
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
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer' onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}