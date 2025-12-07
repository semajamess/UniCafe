import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Footer() {
  const [storeSettings, setStoreSettings] = useState({
    store_name: "UniCafe",
    store_email: "hello@unicafe.com",
    store_phone: "+63 123 456 7890",
    store_address: "123 Main Street, Downtown District",
  });

  // Fetch and auto-sync store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/customer/settings"
        );
        if (response.ok) {
          const data = await response.json();
          setStoreSettings({
            store_name: data.store_name || "UniCafe",
            store_email: data.store_email || "hello@unicafe.com",
            store_phone: data.store_phone || "+63 123 456 7890",
            store_address:
              data.store_address || "123 Main Street, Downtown District",
          });
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };

    fetchStoreSettings();

    // Sync on window focus
    const handleFocus = () => {
      fetchStoreSettings();
    };

    // Sync every 15 seconds
    const interval = setInterval(fetchStoreSettings, 15000);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold">
                {storeSettings.store_name}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Your favorite campus cafe serving quality coffee, delicious food,
              and creating memorable moments.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  {storeSettings.store_address}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amber-500" />
                <span className="text-gray-400 text-sm">
                  {storeSettings.store_phone}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-500" />
                <span className="text-gray-400 text-sm">
                  {storeSettings.store_email}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-gray-400">Monday - Friday</p>
                  <p className="text-white font-medium">7:00 AM - 8:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-gray-400">Saturday - Sunday</p>
                  <p className="text-white font-medium">8:00 AM - 6:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {storeSettings.store_name}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
