import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  User,
  UserPlus,
  Coffee,
  ArrowRight,
  Phone,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID =
  "381824224850-2h1em90fcn2gn9u3gjqdpg6ckk9tapsd.apps.googleusercontent.com";

const Login = () => {
  const navigate = useNavigate();
  const { login, register, googleLogin, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGoogleWelcomeModal, setShowGoogleWelcomeModal] = useState(false);
  const [needsPhoneModal, setNeedsPhoneModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const googleButtonRef = useRef(null);
  const [justRegistered, setJustRegistered] = useState(false);

  // Redirect logged-in users away from login page
  useEffect(() => {
    if (
      isAuthenticated &&
      !showSuccessModal &&
      !showGoogleWelcomeModal &&
      !justRegistered
    ) {
      navigate("/menu");
    }
  }, [
    isAuthenticated,
    navigate,
    showSuccessModal,
    showGoogleWelcomeModal,
    justRegistered,
  ]);

  useEffect(() => {
    // Only initialize Google Sign-In in Sign In mode.
    if (!isLogin) return;

    // Initialize Google Sign-In when the GSI script is available.
    // The script is loaded async, so poll briefly until `window.google` exists.
    let mounted = true;
    const tryInit = () => {
      if (!mounted) return;
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        // Render icon-only Google button (high-contrast) so only the Google icon is shown
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "filled_black",
          size: "large",
          type: "icon",
          shape: "circle",
        });
        clearInterval(poll);
      }
    };

    const poll = setInterval(tryInit, 200);
    tryInit();

    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, [isLogin]);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError("");

    const result = await googleLogin(response.credential);
    if (result.success) {
      if (result.isNewUser) {
        // Show welcome modal for first-time Google users
        setShowGoogleWelcomeModal(true);
      } else {
        // Existing user - navigate directly
        navigate("/menu");
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleWelcomeClose = () => {
    setShowGoogleWelcomeModal(false);
    navigate("/menu");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setJustRegistered(false); // Clear flag when switching modes
    setFormData({
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validatePhoneNumber = (phone) => {
    // Philippine mobile number format: 09XXXXXXXXX (11 digits starting with 09)
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/menu");
      } else {
        setError(result.error);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (!validatePhoneNumber(formData.phone)) {
        setError("Please enter a valid Philippine mobile number (09XXXXXXXXX)");
        setLoading(false);
        return;
      }

      const { confirmPassword, ...registerData } = formData;

      const result = await register(registerData);
      if (result.success) {
        // Set flag to prevent automatic redirect to menu
        setJustRegistered(true);
        // Show success modal then navigate to profile selection
        setShowSuccessModal(true);
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setJustRegistered(false); // Clear the flag
    // Navigate to profile selection page to choose avatar
    navigate("/profile-selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 pt-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl h-[600px] overflow-hidden relative z-10"
      >
        <div className="flex h-full">
          {/* Branding Side - Always on Left */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-12 flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0">
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <Coffee className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">UniCafe</h1>
                  <p className="text-white/90">Your Campus Coffee Haven</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-5xl font-bold leading-tight">
                  {isLogin ? "Welcome Back!" : "Join UniCafe"}
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  {isLogin
                    ? "Sign in to order your favorite drinks and treats with ease."
                    : "Create an account to enjoy faster checkout and track your orders."}
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">✓</div>
                <div>
                  <h3 className="font-semibold text-lg">Fast Ordering</h3>
                  <p className="text-white/80 text-sm">
                    Quick and easy checkout
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">✓</div>
                <div>
                  <h3 className="font-semibold text-lg">Track Orders</h3>
                  <p className="text-white/80 text-sm">
                    Real-time order updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side - Always on Right */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto max-h-screen">
            <div className={isLogin ? "-mt-4" : "-mt-4"}>
              {/* Mobile Logo */}
              <div
                className={`lg:hidden text-center ${
                  isLogin ? "mb-12" : "mb-6"
                }`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-3">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">UniCafe</h1>
              </div>

              {/* Toggle Tabs - Fixed Position */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                <button
                  type="button"
                  onClick={() => !loading && toggleMode()}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                    isLogin
                      ? "bg-white text-amber-600 shadow-md"
                      : "text-slate-600 hover:text-amber-600"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => !loading && toggleMode()}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                    !isLogin
                      ? "bg-white text-amber-600 shadow-md"
                      : "text-slate-600 hover:text-amber-600"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className={`space-y-4 ${isLogin ? "mt-24" : ""}`}
              >
                {isLogin ? (
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="09XXXXXXXXX"
                          maxLength={11}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Philippine mobile number format
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg mt-8"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      {isLogin ? (
                        <LogIn className="w-5 h-5" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider and Google Login Button (only for Sign In) */}
              {isLogin && (
                <>
                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-slate-200"></div>
                    <span className="px-4 text-sm text-slate-500 font-medium">
                      OR
                    </span>
                    <div className="flex-1 border-t border-slate-200"></div>
                  </div>

                  <div className="flex justify-center">
                    <div
                      ref={googleButtonRef}
                      aria-label="Sign in with Google"
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Registration Modal */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Registration Successful!
            </h2>
            <p className="text-slate-600 mb-6">
              Your account has been created! Let's set up your profile and
              choose an avatar.
            </p>
            <button
              onClick={handleSuccessModalClose}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>Choose Your Avatar</span>
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Google Welcome Modal for First-time Users */}
      <AnimatePresence>
        {showGoogleWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12" viewBox="0 0 24 24">
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
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Welcome to UniCafe!
              </h2>
              <p className="text-slate-600 mb-6">
                You've successfully signed in with Google. Start exploring our
                delicious menu and place your first order!
              </p>
              <button
                onClick={handleGoogleWelcomeClose}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <Coffee className="w-5 h-5" />
                <span>Browse Menu</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
