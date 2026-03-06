import { NavLink, Outlet } from "react-router-dom";
import "../styles/admin.css";

const AdminLayout = () => {
  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">🔥 Flame Admin</div>

        <NavLink to="/admin" end className="admin-link">
          Dashboard
        </NavLink>

        <NavLink to="/admin/menu" className="admin-link">
          Manage Menu
        </NavLink>

        <NavLink to="/admin/orders" className="admin-link">
          Orders
        </NavLink>

        <NavLink to="/admin/coupons" className="admin-link">
          Coupons
        </NavLink>

        <button className="admin-logout-btn mt-auto">
          Logout
        </button>
      </div>

      {/* Content Area */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h4>Admin Panel</h4>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;