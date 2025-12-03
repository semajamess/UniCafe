import { Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./front-end/Login";
import Dashboard from "./front-end/Dashboard";
import POS from "./front-end/POS";
import Products from "./front-end/Products";
import Orders from "./front-end/Orders";
import Payments from "./front-end/Payments";
import Customers from "./front-end/Customers";
import Settings from "./front-end/Settings";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for development

  return (
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      
      {isAuthenticated ? (
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;
