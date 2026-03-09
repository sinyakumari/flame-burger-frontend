import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState({ name: "Admin" });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        setAdminUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-wrapper">

      {/* Sidebar */}
      <div className="admin-sidebar">

        <div className="admin-logo">
          🔥 Flame Admin
        </div>

        <div className="admin-nav-links">

          <NavLink to="/admin" end className="admin-link">
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/menu" className="admin-link">
            <span>Manage Menu</span>
          </NavLink>

          <NavLink to="/admin/orders" className="admin-link">
            <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/coupons" className="admin-link">
            <span>Coupons</span>
          </NavLink>

        </div>

        <button className="admin-logout-btn mt-auto" onClick={handleLogout}>
          Logout
        </button>

      </div>

      {/* Main Area */}
      <div className="admin-main">

        {/* Topbar */}
        <div className="admin-topbar">

          <div className="topbar-left">
            <h4 className="admin-panel-title">Admin Panel</h4>
          </div>

          <div className="topbar-right">

            {/* Search Bar */}
            <div className="admin-search">
              <input type="text" placeholder="Search orders, users..." />
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2" fill="none"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
              </svg>
            </div>

            {/* Admin Profile */}
            <div className="profile-btn">

              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.name)}&background=e63946&color=fff`}
                alt={adminUser.name}
              />

              <div className="profile-info">
                <span className="profile-name">{adminUser.name}</span>
                <span className="profile-role">Admin</span>
              </div>

            </div>

          </div>

        </div>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;