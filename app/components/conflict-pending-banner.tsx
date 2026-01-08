import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/hooks/use-auth';

interface ConflictPendingBannerProps {
  isVisible: boolean;
}

export const ConflictPendingBanner = ({
  isVisible,
}: ConflictPendingBannerProps) => {
  const { signOut } = useAuth();

  if (!isVisible) return null;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="sticky top-0 z-40 bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 px-4 py-2 md:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-300 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-900 dark:text-yellow-50">
              Data conflict pending
            </p>
            <p className="text-yellow-700 dark:text-yellow-100 hidden md:block">
              Your changes are not synced to cloud. Please log out and log back
              in to resolve the conflict.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 border-yellow-300 text-yellow-900 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-100 dark:hover:bg-yellow-800 dark:hover:text-yellow-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log Out to </span>Resolve
        </Button>
      </div>
    </div>
  );
};
