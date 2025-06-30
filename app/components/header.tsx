import { Link } from 'react-router';

const Header = () => {
  return (
    <header className="mb-4">
      <Link to="/" className="flex items-center">
        <img
          src="/favicons/favicon-32x32.png"
          alt="TubeLoopPlayer logo"
          className="mr-2"
        />
        <h1 className="font-bold text-2xl">TubeLoopPlayer</h1>
      </Link>
    </header>
  );
};

export default Header;
