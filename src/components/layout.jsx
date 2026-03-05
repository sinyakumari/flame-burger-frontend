import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./cartDrawer";

const Layout = () => {
  return (
    <>
      {/* Top Navigation */}
      <Navbar />

      {/* Global Cart Drawer */}
      <CartDrawer />

      {/* Page Content Will Render Here */}
      <main style={{ minHeight: "80vh" }}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Layout;