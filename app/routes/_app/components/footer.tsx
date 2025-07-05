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
            className="hover:underline hover:text-foreground transition-all duration-300 transform hover:scale-105"
          >
            Home
          </Link>
          <Link
            to="/privacy-terms"
            className="hover:underline hover:text-foreground transition-all duration-300 transform hover:scale-105"
          >
            Privacy & Terms
          </Link>
          <button
            type="button"
            onClick={handleContactClick}
            className="bg-transparent p-0 hover:underline hover:text-foreground transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            Contact
          </button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2">
          Made with {'<3'} by Atman
          <a
            href={siteConfig.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-foreground transition-all duration-300 transform hover:scale-110"
            aria-label="Atman on X"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <title>X (formerly Twitter) icon</title>
              <path d="M18.901 1.144h3.68l-8.58 9.873 9.479 11.083h-7.795l-6.398-7.093-7.29 7.093h-3.68l8.948-10.36L0 1.144h8.178l5.242 6.136L18.901 1.144zm-1.161 17.52h1.65L7.989 3.01H6.13l11.609 15.654z" />
            </svg>
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
