import "../styles/admin.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {

  const revenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [400, 600, 800, 750, 900, 1200, 1500],
        backgroundColor: "rgba(220, 53, 69, 0.6)",
      },
    ],
  };

  const ordersData = {
    labels: ["Pending", "Completed", "Cancelled"],
    datasets: [
      {
        data: [12, 40, 5],
        backgroundColor: ["#ffc107", "#28a745", "#dc3545"],
      },
    ],
  };

  const usersData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "New Users",
        data: [10, 25, 40, 30, 55],
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.3)",
      },
    ],
  };

  return (
    <div className="container-fluid mt-4">

      <h2 className="mb-4">🔥 Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Total Orders</h6>
            <h3>124</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Total Revenue</h6>
            <h3>$2,430</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Total Users</h6>
            <h3>89</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Menu Items</h6>
            <h3>36</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4">

        <div className="col-lg-6">
          <div className="card p-3 shadow-sm">
            <h5>Weekly Revenue</h5>
            <Bar data={revenueData} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card p-3 shadow-sm">
            <h5>User Growth</h5>
            <Line data={usersData} />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card p-3 shadow-sm">
            <h5>Order Status</h5>
            <Doughnut data={ordersData} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;