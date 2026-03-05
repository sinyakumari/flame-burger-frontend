import { NavLink, Outlet } from "react-router-dom";
import "../styles/admin.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">🔥 Admin</div>

        <NavLink to="/admin" end className="admin-link">
          Dashboard
        </NavLink>

        <NavLink to="/admin/menu" className="admin-link">
          Manage Menu
        </NavLink>

        <NavLink to="/admin/orders" className="admin-link">
          Orders
        </NavLink>

        <button className="btn-fill">Logout</button>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;