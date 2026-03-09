import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import AdminLayout from "./components/adminLayout";
import AdminRoute from "./components/adminRoute";

import Home from "./pages/Home";
import Menu from "./pages/MenuPage";
import About from "./pages/AboutPage";
import Contact from "./pages/Contact";
import BookingPage from "./pages/BookingPage";
import OrderSummaryPage from "./pages/orderSummaryPage";
import AuthPage from "./pages/authPage";
import NotFoundPage from "./pages/notFoundPage";

import AdminDashboard from "./pages/adminDashboard";
import AdminCategoriesPage from "./pages/adminCategoriesPage"; // ✅ NEW
import AdminMenuPage from "./pages/adminMenuPage";
import AdminOrdersPage from "./pages/adminOrdersPage";
import AdminCouponsPage from "./pages/adminCouponsPage";
import AdminProfilePage from "./pages/AdminProfilePage";


import { useTheme } from "./context/themeContext";
import "./App.css";

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Routes>

      {/* ================= USER PAGES ================= */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="checkout" element={<OrderSummaryPage />} />
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
     <Route path="menu" element={<AdminCategoriesPage />} />
      <Route path="menu/:categoryTitle" element={<AdminMenuPage/>} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* ================= AUTH ================= */}
      <Route path="/login" element={<AuthPage />} />

      {/* ================= 404 ================= */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}

export default App;