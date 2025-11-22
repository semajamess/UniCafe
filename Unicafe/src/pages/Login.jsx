import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password, rememberMe });
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#F5EFE7]">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F5EFE7] relative items-center justify-center p-12">
        <div className="max-w-md text-center z-10">
          {/* Coffee Icon */}
          <div className="mb-8 flex justify-center">
            <svg
              className="w-32 h-32 text-[#C77A3C]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2 21h18v-2H2v2zm2-10h10V9H4v2zm12-5H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H4V8h12v8zm4-8v6c0 1.1-.9 2-2 2h-1.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5H18c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1h-.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5H18c1.1 0 2 .9 2 2z" />
            </svg>
          </div>

          {/* Decorative Coffee Leaves */}
          <div className="absolute top-12 left-12">
            <svg
              className="w-16 h-16 text-[#C77A3C] opacity-70"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>

          {/* Coffee Cup Illustration */}
          <div className="mb-8 relative">
            <div className="w-64 h-64 mx-auto relative">
              {/* Coffee cup */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-40 bg-white rounded-full shadow-xl relative">
                  {/* Cup rim */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-60 h-8 bg-white rounded-full border-4 border-gray-200"></div>
                  {/* Coffee surface with latte art */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-52 h-32 bg-[#8B6F47] rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-[#C9A882] opacity-80"></div>
                      <div className="absolute w-24 h-24 rounded-full bg-[#8B6F47] opacity-60"></div>
                      <div className="absolute w-16 h-16 rounded-full bg-[#C9A882] opacity-70"></div>
                      <div className="absolute w-8 h-8 rounded-full bg-[#8B6F47]"></div>
                    </div>
                  </div>
                  {/* Handle */}
                  <div className="absolute right-0 top-1/2 transform translate-x-8 -translate-y-1/2 w-16 h-20 border-8 border-white rounded-r-full"></div>
                </div>
              </div>
              {/* Saucer */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-72 h-8 bg-white rounded-full shadow-lg border-4 border-gray-100"></div>
              {/* Cinnamon sticks */}
              <div className="absolute bottom-10 right-12 w-2 h-16 bg-[#8B4513] rounded-full transform rotate-45"></div>
              <div className="absolute bottom-10 right-16 w-2 h-16 bg-[#8B4513] rounded-full transform rotate-30"></div>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Long day ahead?
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Find the best coffee
            <br />
            to accompany your days.
          </p>
        </div>

        {/* Curved SVG Divider */}
        <div className="absolute right-0 top-0 bottom-0 w-32 overflow-hidden">
          <svg
            className="absolute right-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,0 Q50,50 0,100 L100,100 L100,0 Z" fill="#3D5A52" />
          </svg>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#3D5A52] flex items-center justify-center p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-xl space-y-10">
          {/* Logo Icon */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <svg
              className="w-12 h-12 text-[#D89056]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>

          {/* Login Header */}
          <div className="flex items-center justify-center mb-16">
            <svg
              className="w-10 h-10 text-[#D89056] mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
            <h2 className="text-5xl font-bold text-white">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Email Input */}
            <div className="space-y-3">
              <label className="block text-white text-base font-medium">
                Email or username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or username"
                  className="w-full px-12 py-4 text-lg text-center bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D89056]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <label className="block text-white text-base font-medium">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-12 py-4 text-lg text-center bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D89056]"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-6 mt-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 text-[#D89056] bg-white border-gray-300 rounded focus:ring-[#D89056] focus:ring-2"
                />
                <span className="ml-3 text-white text-base">Remember me</span>
              </label>
              <a href="#" className="text-[#D89056] text-base hover:underline">
                forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#D89056] text-white text-lg font-semibold py-4 mt-10 rounded-lg hover:bg-[#C77A3C] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D89056] focus:ring-offset-2 focus:ring-offset-[#3D5A52]"
            >
              Log in
            </button>

            {/* Divider */}
            <div className="flex items-center my-12 py-4">
              <div className="flex-1 border-t border-gray-500"></div>
              <span className="px-4 text-white text-base">or with</span>
              <div className="flex-1 border-t border-gray-500"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-6 justify-center py-2 mt-8">
              {/* Google Button */}
              <button
                type="button"
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                className="w-16 h-16 bg-[#1877F2] rounded-full flex items-center justify-center hover:bg-[#166FE5] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>

            {/* Create Account Link */}
            <div className="text-center mt-12 pt-8">
              <span className="text-white text-base">New to Bombombini? </span>
              <a
                href="#"
                className="text-[#D89056] text-base font-semibold hover:underline"
              >
                Create Account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
