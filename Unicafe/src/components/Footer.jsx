import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white relative overflow-hidden mt-20">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-24 2xl:px-32 py-20 relative z-10">
        <div
          className="max-w-[1600px] mx-auto lg:pl-12"
          style={{ paddingLeft: window.innerWidth >= 1024 ? "80px" : "0" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 xl:gap-16 mb-16">
            {/* Brand Section - Enhanced */}
            <div
              className="lg:col-span-1 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start"
              style={{ paddingLeft: window.innerWidth >= 1024 ? "10px" : "0" }}
            >
              <Link to="/" className="inline-block group mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-50 bg-clip-text text-transparent">
                      UniCafé
                    </span>
                    <div className="h-0.5 bg-gradient-to-r from-amber-500 to-transparent mt-1"></div>
                  </div>
                </div>
              </Link>

              <p className="text-amber-100/90 text-sm leading-relaxed max-w-xs">
                Brewing happiness one cup at a time. Your favorite coffee
                destination for quality beverages and warm moments.
              </p>

              <div className="flex items-center space-x-2 text-amber-200/80 text-xs pt-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Premium Quality Assured</span>
              </div>
            </div>

            {/* Quick Links - Enhanced */}
            <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h3 className="text-lg font-bold mb-6 text-amber-50 relative inline-block">
                Quick Links
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-linear-to-r from-amber-500 to-amber-600 rounded-full"></span>
              </h3>
              <ul className="space-y-3">
                {[
                  { to: "/", label: "Home" },
                  { to: "/menu", label: "Menu" },
                  { to: "/about", label: "About Us" },
                  { to: "/contact", label: "Contact" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-amber-100/80 hover:text-amber-50 transition-all duration-300 text-sm flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-amber-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opening Hours - Enhanced */}
            <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h3 className="text-lg font-bold mb-6 text-amber-50 relative inline-block">
                Opening Hours
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-linear-to-r from-amber-500 to-amber-600 rounded-full"></span>
              </h3>
              <ul className="space-y-3">
                {[
                  { day: "Monday - Friday", hours: "7AM - 8PM" },
                  { day: "Saturday", hours: "8AM - 9PM" },
                  { day: "Sunday", hours: "8AM - 7PM" },
                ].map((schedule, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-amber-800/30 text-sm"
                  >
                    <span className="text-amber-100/80">{schedule.day}</span>
                    <span
                      className="font-semibold text-amber-300 bg-amber-900/30 px-3 py-1 rounded-full text-xs"
                      style={{ transform: "translateX(15px)" }}
                    >
                      {schedule.hours}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg max-w-xs w-full">
                <p className="text-xs text-amber-200/70 flex items-center justify-center lg:justify-start">
                  <svg
                    className="w-4 h-4 mr-2 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Open all public holidays
                </p>
              </div>
            </div>

            {/* Contact Info - Enhanced */}
            <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h3 className="text-lg font-bold mb-6 text-amber-50 relative inline-block">
                Get In Touch
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-linear-to-r from-amber-500 to-amber-600 rounded-full"></span>
              </h3>
              <ul className="space-y-4 w-full max-w-xs">
                <li className="flex items-start space-x-3 group">
                  <div className="bg-amber-800/40 p-2 rounded-lg group-hover:bg-amber-700/50 transition-colors duration-300">
                    <svg
                      className="w-5 h-5 text-amber-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-amber-100/80 text-sm leading-relaxed">
                    123 Coffee Street, University District
                  </span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="bg-amber-800/40 p-2 rounded-lg group-hover:bg-amber-700/50 transition-colors duration-300">
                    <svg
                      className="w-5 h-5 text-amber-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <a
                    href="tel:5551234567"
                    className="text-amber-100/80 hover:text-amber-300 text-sm transition-colors duration-300"
                  >
                    (555) 123-4567
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="bg-amber-800/40 p-2 rounded-lg group-hover:bg-amber-700/50 transition-colors duration-300">
                    <svg
                      className="w-5 h-5 text-amber-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <a
                    href="mailto:hello@unicafe.com"
                    className="text-amber-100/80 hover:text-amber-300 text-sm transition-colors duration-300"
                  >
                    hello@unicafe.com
                  </a>
                </li>
              </ul>

              {/* Social Media - Enhanced */}
              <div className="pt-4 space-y-4 w-full max-w-xs flex flex-col items-center lg:items-start">
                <p className="text-xs text-amber-200/60 mb-3 font-medium uppercase tracking-wider">
                  Follow Us
                </p>
                <div className="flex space-x-3 justify-center lg:justify-start">
                  {[
                    {
                      name: "Facebook",
                      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                    },
                    {
                      name: "Pinterest",
                      path: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.443.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z",
                    },
                    {
                      name: "Instagram",
                      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                    },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      aria-label={social.name}
                      className="bg-amber-800/40 hover:bg-linear-to-br hover:from-amber-600 hover:to-amber-700 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-amber-900/50 group"
                    >
                      <svg
                        className="w-5 h-5 text-amber-300 group-hover:text-white transition-colors duration-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d={social.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="max-w-[1600px] mx-auto">
          <div className="border-t border-amber-800/30 pt-10">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <p className="text-amber-200/70 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                &copy; {new Date().getFullYear()} UniCafé. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-amber-200/70">
                <a
                  href="#"
                  className="hover:text-amber-300 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                <span className="text-amber-700">•</span>
                <a
                  href="#"
                  className="hover:text-amber-300 transition-colors duration-300"
                >
                  Terms of Service
                </a>
                <span className="text-amber-700">•</span>
                <a
                  href="#"
                  className="hover:text-amber-300 transition-colors duration-300"
                >
                  Cookie Policy
                </a>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-amber-800/20">
              <p className="text-xs text-amber-300/50 flex items-center justify-center space-x-2">
                <span>Crafted with</span>
                <svg
                  className="w-4 h-4 text-red-500 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>and</span>
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
