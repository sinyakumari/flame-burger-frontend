import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
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
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/orders/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading || !stats) {
    return <div className="container-fluid mt-4">Loading stats...</div>;
  }

  // Format dynamic data for charts
  const revenueLabels = stats.weeklyRevenue.map(item => item._id ? item._id.split("-").slice(1).join("/") : "Unknown");
  const revenueValues = stats.weeklyRevenue.map(item => item.total);

  const revenueData = {
    labels: revenueLabels.length > 0 ? revenueLabels : ["No Data"],
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueValues.length > 0 ? revenueValues : [0],
        backgroundColor: "rgba(220, 53, 69, 0.6)",
      },
    ],
  };

  const ordersData = {
    labels: ["Pending", "Completed", "Cancelled"],
    datasets: [
      {
        data: stats.ordersData,
        backgroundColor: ["#ffc107", "#28a745", "#dc3545"],
      },
    ],
  };

  const userGrowthLabels = stats.userGrowth.map(item => {
    if (!item._id) return "Unknown";
    const [year, month] = item._id.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'short' }) + " '" + year.slice(2);
  });
  const userGrowthValues = stats.userGrowth.map(item => item.total);

  const usersData = {
    labels: userGrowthLabels.length > 0 ? userGrowthLabels : ["No Data"],
    datasets: [
      {
        label: "New Users",
        data: userGrowthValues.length > 0 ? userGrowthValues : [0],
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
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Total Revenue</h6>
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Total Users</h6>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Menu Items</h6>
            <h3>{stats.totalMenuItems}</h3>
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