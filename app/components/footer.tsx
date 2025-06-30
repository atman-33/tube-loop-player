import { Link } from 'react-router';
import { siteConfig } from '../config/site-config';

const Footer = () => {
  const handleContactClick = () => {
    if (siteConfig.contactEmail) {
      window.location.href = `mailto:${siteConfig.contactEmail}`;
    }
  };

  return (
    <footer className="mt-8 border-t py-4 text-center text-gray-500 text-sm">
      <div className="flex justify-center space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/privacy-terms" className="hover:underline">
          Privacy & Terms
        </Link>
        <button
          type="button"
          onClick={handleContactClick}
          className="bg-transparent p-0 hover:underline"
        >
          Contact
        </button>
      </div>
      <p className="mt-4">Made with {'<3'} by Atman</p>
      <p className="mt-1">
        &copy; {new Date().getFullYear()} TubeLoopPlayer. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
