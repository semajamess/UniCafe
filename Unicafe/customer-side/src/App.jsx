import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";

import Homepage from "./pages/Homepage";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/ReceiptPage";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ProfileSelection from "./pages/ProfileSelection";
import { useAuth } from "./context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/login", { state: { from: location.pathname } });
      }, 1500);
    }
    // If authenticated but no profile image (normal registration), force avatar selection
    else if (!loading && isAuthenticated && user && !user.profile_image && !user.google_id) {
      setShowAvatarModal(true);
      setTimeout(() => {
        setShowAvatarModal(false);
        navigate("/profile-selection", { state: { required: true } });
      }, 2000);
    }
  }, [isAuthenticated, loading, user, location, navigate]);

  if (loading) return null;
  
  if (!isAuthenticated) {
    return showModal ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Please sign up first!</h2>
          <p className="text-gray-600">
            You must be logged in to access the menu.
          </p>
        </div>
      </div>
    ) : null;
  }

  // Block menu access if no avatar selected (normal registration only)
  if (isAuthenticated && user && !user.profile_image && !user.google_id) {
    return showAvatarModal ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Choose Your Avatar</h2>
          <p className="text-gray-600">
            Please select a profile picture before accessing the menu.
          </p>
        </div>
      </div>
    ) : null;
  }
  
  return children;
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on very first load (when sessionStorage is empty)
    const hasShownSplash = sessionStorage.getItem('splashShown');
    if (!hasShownSplash) {
      sessionStorage.setItem('splashShown', 'true');
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/profile-selection"
                    element={<ProfileSelection />}
                  />
                  <Route
                    path="/menu"
                    element={
                      <ProtectedRoute>
                        <Menu />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route
                    path="/order-confirmation"
                    element={<OrderConfirmation />}
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  {/* Redirect unknown routes to homepage */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
