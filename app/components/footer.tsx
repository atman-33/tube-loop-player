import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="mt-8 border-t py-4 text-center text-gray-500 text-sm">
      <div className="flex justify-center space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/privacy-terms" className="hover:underline">
          Privacy & Terms
        </Link>
        <Link to="#" className="hover:underline">
          Contact
        </Link>
      </div>
      <p className="mt-4">
        &copy; {new Date().getFullYear()} TubeLoopPlayer. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
