import "../styles/admin.css";

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="admin-title">Admin Dashboard</h1>

      <p className="admin-subtitle">
        Welcome Admin 👋 Manage your restaurant system from here.
      </p>

      {/* Stats Cards */}
      <div className="admin-cards">
        <div className="admin-card">
          <h3>Total Orders</h3>
          <h2>124</h2>
        </div>

        <div className="admin-card">
          <h3>Total Revenue</h3>
          <h2>$2,430</h2>
        </div>

        <div className="admin-card">
          <h3>Total Users</h3>
          <h2>89</h2>
        </div>

        <div className="admin-card">
          <h3>Menu Items</h3>
          <h2>36</h2>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;