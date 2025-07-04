import { Link } from 'react-router';
import { siteConfig } from '~/config/site-config';

type FooterProps = {
  contactEmail: string;
};

const Footer = ({ contactEmail }: FooterProps) => {
  const handleContactClick = () => {
    if (contactEmail) {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  return (
    <footer className="mt-8 border-t py-8 text-center text-muted-foreground text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center md:space-x-8 space-y-2 md:space-y-0">
          <Link
            to="/"
            className="hover:underline hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/privacy-terms"
            className="hover:underline hover:text-foreground transition-colors"
          >
            Privacy & Terms
          </Link>
          <button
            type="button"
            onClick={handleContactClick}
            className="bg-transparent p-0 hover:underline hover:text-foreground transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>
        <p className="mt-6">
          Made with {'<3'} by{' '}
          <a
            href={siteConfig.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            Atman
          </a>
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} TubeLoopPlayer. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
