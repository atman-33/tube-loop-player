import { Link } from 'react-router';
import { ThemeToggle } from '~/components/theme-toggle';
import { UserMenu } from './user-menu';

const Header = () => {
  return (
    <header className="mb-4 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <img
          src="/favicons/android-chrome-192x192.png"
          alt="TubeLoopPlayer logo"
          className="mr-2 w-8 h-8"
        />
        <h1 className="font-bold text-base md:text-2xl">TubeLoopPlayer</h1>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
