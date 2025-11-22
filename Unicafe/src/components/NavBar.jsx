import { useState } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-linear-to-r from-amber-900 to-amber-800 shadow-lg fixed w-full z-50 top-0">
      <div className="w-full mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-amber-600 p-2 rounded-full group-hover:bg-amber-500 transition-colors duration-300">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              UniCafé
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-10">
              <Link
                to="/"
                className="text-amber-100 hover:text-white transition-colors duration-300 font-medium text-base"
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="text-amber-100 hover:text-white transition-colors duration-300 font-medium text-base"
              >
                Menu
              </Link>
              <Link
                to="/about"
                className="text-amber-100 hover:text-white transition-colors duration-300 font-medium text-base"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-amber-100 hover:text-white transition-colors duration-300 font-medium text-base"
              >
                Contact
              </Link>
            </nav>

            {/* Cart Icon */}
            <button className="relative p-3 text-amber-100 hover:text-white transition-colors duration-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                0
              </span>
            </button>

            {/* Order Now Button */}
            <Link to="/order" className="order-now-btn">
              Order Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-amber-900 border-t border-amber-700">
          <div className="px-6 pt-4 pb-6 space-y-3">
            <Link
              to="/"
              className="block px-4 py-4 text-amber-100 hover:bg-amber-800 rounded-lg transition-colors duration-300 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="block px-4 py-4 text-amber-100 hover:bg-amber-800 rounded-lg transition-colors duration-300 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/about"
              className="block px-4 py-4 text-amber-100 hover:bg-amber-800 rounded-lg transition-colors duration-300 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-4 text-amber-100 hover:bg-amber-800 rounded-lg transition-colors duration-300 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/order"
              className="block px-4 py-4 bg-amber-600 text-white rounded-lg font-semibold text-center hover:bg-amber-500 transition-colors duration-300 mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Order Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
