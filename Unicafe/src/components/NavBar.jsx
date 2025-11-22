import React from "react";

const NavBar = ({
  activePage = "Home",
  onLoginClick = () => {},
  brandNameBold = "BOMBOMBINI",
  brandNameItalic = "gusini",
  links = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "About us", path: "/about" },
  ],
}) => {
  return (
    <nav className="w-full bg-[#425A4F] px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side - Logo and Brand */}
        <div className="flex items-center space-x-3">
          {/* Icon Placeholder */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>

          {/* Brand Name */}
          <div className="flex items-baseline space-x-1">
            <span className="font-bold text-white text-xl tracking-wide">
              {brandNameBold}
            </span>
            <span className="italic text-orange-300 text-xl font-light">
              {brandNameItalic}
            </span>
          </div>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className={`px-6 py-2 rounded transition-all duration-200 ${
                activePage === link.name
                  ? "bg-[#2d3f36] text-white font-medium"
                  : "text-white hover:bg-[#36493d]"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Side - Login Button */}
        <div className="flex items-center">
          <button
            onClick={onLoginClick}
            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center ml-4">
          <button className="text-white focus:outline-none">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Hidden by default */}
      <div className="md:hidden mt-4 pb-2 hidden">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.path}
            className={`block px-4 py-2 rounded mb-1 ${
              activePage === link.name
                ? "bg-[#2d3f36] text-white font-medium"
                : "text-white hover:bg-[#36493d]"
            }`}
          >
            {link.name}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
