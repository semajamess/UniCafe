import { useState, useEffect } from "react";
import { Save, User, Lock, Store, CheckCircle, XCircle } from "lucide-react";

const API_URL = "http://localhost:3000/api";

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: "UniCafé",
    email: "lukegabriel.arrieta@wvsu.edu.ph",
    phone: "+1 234 567 8900",
    address: "123 Coffee Street, University District",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/cafe/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          storeName: data.store_name || "UniCafé",
          email: data.store_email || "lukegabriel.arrieta@wvsu.edu.ph",
          phone: data.store_phone || "+1 234 567 8900",
          address:
            data.store_address || "123 Coffee Street, University District",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      3000
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/cafe/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear the storeSettings cache so footer/header will fetch fresh data
        localStorage.removeItem("storeSettings");
        showNotification("success", "Settings saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showNotification("error", error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-[100] flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your cafe and account settings
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Store Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Store className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Store Information
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                readOnly
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                readOnly
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                readOnly
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <textarea
                rows="3"
                value={settings.address}
                readOnly
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed resize-none"
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
